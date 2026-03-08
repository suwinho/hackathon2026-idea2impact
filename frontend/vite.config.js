import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api_py': {
        target: 'http://ai-service:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://backend:8080',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})
