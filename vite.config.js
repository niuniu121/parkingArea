// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 这样你在代码里就可以用 @/xxx 来指向 src/xxx
      '@': path.resolve(__dirname, 'src'),
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // 如果你的后端接口没有 /api 前缀，也可以再加一行：
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
