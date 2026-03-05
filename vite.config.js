import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        // 指定入口文件，通常是你的背景脚本或内容脚本
        background: 'src/background.js',
        // content: 'src/content.js'
      },
      output: {
        entryFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
        chunkFileNames: `[name].js`,
      }
    }
  },
  esbuild:{
    pure: ['console.log'], // 删除 console.log
    drop: ['debugger'], // 删除 debugger
  },
  plugins: [vue()],
})