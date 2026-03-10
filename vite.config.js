import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
          store: ['zustand'],
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/admin/api.php': {
        target: 'https://www.yachtcharterinibiza.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
