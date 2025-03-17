const { defineConfig } = require('@vue/cli-service');
const path = require('path');

// 获取当前环境
const env = process.env.NODE_ENV || 'development';

// 不同环境的API基础URL
const API_BASE_URL = {
  development: 'http://localhost:8081',
  test: 'http://test-api.example.com',
  production: 'http://prod-api.example.com'
};

// 创建代理配置
const createProxy = () => {
  const target = API_BASE_URL[env];
  
  return {
    '/api': {
      target,
      changeOrigin: true,
      ws: true,
      secure: env === 'production', // 生产环境使用HTTPS
      pathRewrite: {
        '^/api': '/api' // 保持API路径不变
      }
    }
  };
};

module.exports = defineConfig({
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false,
  transpileDependencies: true,
  
  devServer: {
    port: 8083,
    open: true,
    proxy: createProxy()
  },
  
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  },
  
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true
        }
      },
      sass: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
}); 