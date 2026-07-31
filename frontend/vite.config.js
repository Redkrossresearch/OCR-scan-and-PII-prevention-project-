import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/upload': 'http://localhost:8000',
      '/ocr': 'http://localhost:8000',
      '/pii': 'http://localhost:8000',
      '/clipboard': 'http://localhost:8000',
      '/email-dlp': 'http://localhost:8000',
      '/policy-alerts': 'http://localhost:8000',
      '/shadow-ai': 'http://localhost:8000',
      '/ueba': 'http://localhost:8000',
      '/usb-control': 'http://localhost:8000',
      '/print-control': 'http://localhost:8000',
      '/file-type': 'http://localhost:8000',
      '/forensic': 'http://localhost:8000',
      '/document': 'http://localhost:8000',
      '/reports': 'http://localhost:8000',
      '/uploads': 'http://localhost:8000',
    },
  },
})
