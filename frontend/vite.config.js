import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), basicSsl()],
  // sockjs-client references the Node.js global object, which doesn't exist in the
  // browser. Vite doesn't polyfill it by default, so we alias it to globalThis here.
  define: {
    global: 'globalThis',
  },
  server: {
    // Allow other devices on the same LAN to open the development server.
    host: '0.0.0.0',
    port: 5173,
    https: true,
    proxy: {
      '/api': 'http://localhost:8080',
      '/ws': {
        target: 'http://localhost:8080',
        ws: true
      },
      '/uploads': 'http://localhost:8080'
    }
  }
})

