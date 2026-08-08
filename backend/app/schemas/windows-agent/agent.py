"""
Windows DLP Clipboard Enforcement Agent.
Run on the Windows endpoint. Calls the existing FastAPI backend's
/api/clipboard/check and /api/audit/log — no detection logic duplicated here.
"""
import ctypes
import ctypes.wintypes as wintypes
import hashlib
import logging
import os
import time

import requests
import win32clipboard
import win32con
import win32gui
import win32process

try:
    import psutil
except ImportError:
    psutil = None

from dotenv import load_dotenv
load_dotenv()

API_BASE_URL = os.getenv("DLP_API_BASE_URL", "http://localhost:8000/api")
AGENT_USER = os.getenv("DLP_AGENT_USER") or os.getlogin()
REQUEST_TIMEOUT_SEC = float(os.getenv("DLP_API_TIMEOUT", "3"))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("dlp_clipboard_agent")

WM_CLIPBOARDUPDATE = 0x031D
CLIPBOARD_RETRY_ATTEMPTS = 5
CLIPBOARD_RETRY_DELAY_SEC = 0.05


class ClipboardAccessError(Exception):
    pass


def _open_clipboard_with_retry():
    last_exc = None
    for _ in range(CLIPBOARD_RETRY_ATTEMPTS):
        try:
            win32clipboard.OpenClipboard()
            return
        except Exception as exc:
            last_exc = exc
            time.sleep(CLIPBOARD_RETRY_DELAY_SEC)
    raise ClipboardAccessError(f"Could not open clipboard: {last_exc}")


def read_clipboard_text():
    _open_clipboard_with_retry()
    try:
        if not win32clipboard.IsClipboardFormatAvailable(win32con.CF_UNICODETEXT):
            return None
        return win32clipboard.GetClipboardData(win32con.CF_UNICODETEXT)
    except Exception as exc:
        raise ClipboardAccessError(str(exc)) from exc
    finally:
        try:
            win32clipboard.CloseClipboard()
        except Exception:
            pass


def clear_clipboard_text():
    _open_clipboard_with_retry()
    try:
        win32clipboard.EmptyClipboard()
    except Exception as exc:
        raise ClipboardAccessError(str(exc)) from exc
    finally:
        try:
            win32clipboard.CloseClipboard()
        except Exception:
            pass


def get_source_app():
    try:
        owner_hwnd = win32clipboard.GetClipboardOwner()
        if not owner_hwnd or psutil is None:
            return None
        _, pid = win32process.GetWindowThreadProcessId(owner_hwnd)
        return psutil.Process(pid).name() if pid else None
    except Exception:
        return None


def hash_content(text):
    return hashlib.sha256(text.encode("utf-8", errors="replace")).hexdigest()


def check_with_backend(user, content):
    """Fails safe: any network/server error is treated as BLOCK, never allow."""
    try:
        resp = requests.post(
            f"{API_BASE_URL}/clipboard/check",
            json={"user": user, "content": content},
            timeout=REQUEST_TIMEOUT_SEC,
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as exc:
        logger.warning("Backend detection call failed, failing safe (block): %s", exc)
        return {"blocked": True, "reason": "detection_backend_unreachable_fail_safe"}


def send_audit_log(user, action, details):
    try:
        requests.post(
            f"{API_BASE_URL}/audit/log",
            json={"user": user, "action": action, "details": details},
            timeout=REQUEST_TIMEOUT_SEC,
        )
    except Exception as exc:
        logger.warning("Audit log call failed (non-fatal): %s", exc)


class ClipboardMonitor:
    def __init__(self, on_change):
        self._on_change = on_change
        self._hwnd = None
        self._suppress_next = False

    def _wnd_proc(self, hwnd, msg, wparam, lparam):
        if msg == WM_CLIPBOARDUPDATE:
            self._handle_update()
            return 0
        if msg == win32con.WM_DESTROY:
            win32gui.PostQuitMessage(0)
            return 0
        return win32gui.DefWindowProc(hwnd, msg, wparam, lparam)

    def _create_hidden_window(self):
        wc = win32gui.WNDCLASS()
        wc.lpfnWndProc = self._wnd_proc
        wc.lpszClassName = "DLPClipboardAgentWindow"
        wc.hInstance = win32gui.GetModuleHandle(None)
        try:
            class_atom = win32gui.RegisterClass(wc)
        except Exception:
            class_atom = wc.lpszClassName
        return win32gui.CreateWindowEx(
            0, class_atom, "DLPClipboardAgent", 0, 0, 0, 0, 0,
            win32con.HWND_MESSAGE, 0, wc.hInstance, None,
        )

    def _handle_update(self):
        if self._suppress_next:
            self._suppress_next = False
            return
        try:
            text = read_clipboard_text()
        except ClipboardAccessError as exc:
            logger.warning("Clipboard read failed, failing safe (blocking): %s", exc)
            self.mark_own_write()
            try:
                clear_clipboard_text()
            except ClipboardAccessError:
                logger.error("Clipboard clear failed during fail-safe handling.")
            return
        if not text:
            return
        self._on_change(text, get_source_app())

    def mark_own_write(self):
        self._suppress_next = True

    def start(self):
        self._hwnd = self._create_hidden_window()
        if not ctypes.windll.user32.AddClipboardFormatListener(wintypes.HWND(self._hwnd)):
            raise ClipboardAccessError("AddClipboardFormatListener failed.")
        logger.info("DLP clipboard agent running (hwnd=%s). Watching clipboard...", self._hwnd)
        win32gui.PumpMessages()

    def stop(self):
        if self._hwnd:
            try:
                ctypes.windll.user32.RemoveClipboardFormatListener(wintypes.HWND(self._hwnd))
                win32gui.DestroyWindow(self._hwnd)
            except Exception:
                pass
            self._hwnd = None


def handle_clipboard_change(text, source_app):
    result = check_with_backend(AGENT_USER, text)
    content_hash = hash_content(text)  # only the hash is ever logged, never raw text

    if result.get("blocked"):
        monitor.mark_own_write()
        try:
            clear_clipboard_text()
        except ClipboardAccessError as exc:
            logger.error("Failed to clear sensitive clipboard content: %s", exc)
        logger.warning("BLOCKED copy | user=%s source_app=%s reason=%s hash=%s",
                        AGENT_USER, source_app, result.get("reason"), content_hash)
        send_audit_log(AGENT_USER, "clipboard_blocked",
                        f"source_app={source_app} reason={result.get('reason')} hash={content_hash} len={len(text)}")
    else:
        logger.info("Allowed copy | user=%s source_app=%s", AGENT_USER, source_app)
        send_audit_log(AGENT_USER, "clipboard_allowed",
                        f"source_app={source_app} hash={content_hash} len={len(text)}")


monitor = ClipboardMonitor(on_change=handle_clipboard_change)

if __name__ == "__main__":
    try:
        monitor.start()
    except KeyboardInterrupt:
        pass
    finally:
        monitor.stop()
        logger.info("DLP clipboard agent stopped.")