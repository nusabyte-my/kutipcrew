import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 4088,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3303',
        changeOrigin: true,
      },
      '/ws': {
        target: process.env.VITE_API_URL ? process.env.VITE_API_URL.replace(/^http/, 'ws') : 'ws://localhost:3303',
        ws: true,
      },
    },
  },
})