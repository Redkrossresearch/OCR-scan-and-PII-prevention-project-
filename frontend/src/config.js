// Central place for the backend's ORIGIN (scheme + host + port), used only
// for building absolute URLs — e.g. links to protected PDFs — that need to
// work outside the app itself (shared links, downloads opened in a new tab).
//
// Set VITE_API_BASE_URL in frontend/.env to override this. Needed whenever
// the frontend and backend aren't both reachable at "localhost" for the
// person opening the link — e.g. testing on a phone via ngrok, or once the
// project is deployed (Netlify/Render/Railway).
export const API_ORIGIN = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';
