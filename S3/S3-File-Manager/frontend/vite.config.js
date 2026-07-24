import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/upload': 'http://localhost:3001',
      '/files': 'http://localhost:3001',
      '/download': 'http://localhost:3001',
      '/health': 'http://localhost:3001'
    }
  }
})
