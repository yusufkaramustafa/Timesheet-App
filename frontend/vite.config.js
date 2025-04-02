import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/auth': {
        target: process.env.VITE_API_URL || 'http://backend:5000',
        changeOrigin: true,
      },
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend:5000',
        changeOrigin: true,
      },
      '/timesheet': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  }
})