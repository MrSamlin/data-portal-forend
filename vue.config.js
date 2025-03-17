const { defineConfig } = require('@vue/cli-service');
const path = require('path');
const axios = require('axios');

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
  console.log(`Creating proxy for ${env} environment, target: ${target}`);
  
  return {
    '/api': {
      target,
      changeOrigin: true,
      ws: true,
      secure: false,
      pathRewrite: {
        '^/api': '/api' // 保持API路径不变，与proxy.ts保持一致
      },
      // 添加CORS头
      onProxyRes: function(proxyRes, req, res) {
        console.log(`Proxying ${req.method} ${req.url} -> ${target}${req.url}`); // 不再替换路径
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
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
    port: 8084, // 确保端口与您访问的端口一致
    open: true,
    proxy: createProxy(),
    // 添加CORS头
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    },
    // 添加一个中间件，用于处理直接访问的API请求
    onBeforeSetupMiddleware: function(devServer) {
      devServer.app.get('/api/*', function(req, res) {
        // 保持API路径，不替换/api前缀
        const targetUrl = `${API_BASE_URL[env]}${req.url}`;
        console.log(`Direct API request: ${req.url} -> ${targetUrl}`);
        
        // 转发请求到目标服务器
        axios.get(targetUrl)
          .then(response => {
            // 设置CORS头
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.set('Access-Control-Allow-Credentials', 'true');
            
            // 返回数据
            res.json(response.data);
          })
          .catch(error => {
            console.error('转发API请求失败:', error.message);
            res.status(500).json({ error: 'API请求失败' });
          });
      });
    }
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