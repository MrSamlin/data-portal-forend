import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import proxy from './src/proxy'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: 8083,
      open: true,
      cors: true,
      proxy
    },
    build: {
      // 生产环境配置
      outDir: 'dist',
      assetsDir: 'static',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // 生产环境下移除console
          drop_debugger: mode === 'production' // 生产环境下移除debugger
        }
      },
      rollupOptions: {
        output: {
          // 分包配置
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router'],
            'element-plus': ['element-plus'],
            'ant-design': ['ant-design-vue']
          }
        }
      }
    }
  }
}) 