// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ alias 设置
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // 本地开发用的后端
        changeOrigin: true,
        secure: false,
        // 如果后端接口没有 /api 前缀，可以加这一行：
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
