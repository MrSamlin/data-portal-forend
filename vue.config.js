const { defineConfig } = require('@vue/cli-service');
const path = require('path');
const axios = require('axios');

// 获取当前环境
const env = process.env.NODE_ENV || 'development';

// 不同环境的API基础URL
const API_BASE_URL = {
  development: 'http://localhost:7070',
  test: 'http://test-api.example.com',
  production: 'http://prod-api.example.com'
};

// 指标看板API地址
const DASHBOARD_API_URL = {
  development: 'https://iadev.cmfchina.com',
  test: 'https://iadev.cmfchina.com',
  production: 'https://iadev.cmfchina.com'
};

// 创建代理配置
const createProxy = () => {
  const target = API_BASE_URL[env];
  const dashboardTarget = DASHBOARD_API_URL[env];
  console.log(`Creating proxy for ${env} environment, target: ${target}`);
  console.log(`Creating dashboard proxy for ${env} environment, target: ${dashboardTarget}`);
  
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
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Authentication';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      }
    },
    // 添加指标看板API代理
    '/api/edbapply': {
      target: dashboardTarget,
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api/edbapply': '/dw/edbapply' // 将/api/edbapply路径重写为/dw/edbapply
      },
      // 添加CORS头
      onProxyRes: function(proxyRes, req, res) {
        console.log(`Proxying edbapply ${req.method} ${req.url} -> ${dashboardTarget}${req.url.replace(/^\/api\/edbapply/, '/dw/edbapply')}`);
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Authentication';
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
      // 处理GET请求
      devServer.app.get('/api/*', function(req, res) {
        // 保持API路径，不替换/api前缀
        const targetUrl = `${API_BASE_URL[env]}${req.url}`;
        console.log(`Direct API GET request: ${req.url} -> ${targetUrl}`);
        
        // 转发请求到目标服务器
        axios.get(targetUrl)
          .then(response => {
            // 设置CORS头
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Authentication');
            res.set('Access-Control-Allow-Credentials', 'true');
            
            // 返回数据
            res.json(response.data);
          })
          .catch(error => {
            console.error('转发API请求失败:', error.message);
            res.status(500).json({ error: 'API请求失败' });
          });
      });
      
      // 处理POST请求
      devServer.app.post('/api/*', function(req, res) {
        const targetUrl = req.url.startsWith('/api/edbapply')
          ? `${DASHBOARD_API_URL[env]}${req.url.replace(/^\/api\/edbapply/, '/dw/edbapply')}`
          : `${API_BASE_URL[env]}${req.url}`;
          
        console.log(`Direct API POST request: ${req.url} -> ${targetUrl}`);
        
        // 将请求体作为数据传递
        let data = '';
        req.on('data', chunk => {
          data += chunk;
        });
        
        req.on('end', () => {
          // 转发POST请求
          axios.post(targetUrl, data ? JSON.parse(data) : {}, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': req.headers['authorization'] || '',
              'Authentication': req.headers['authentication'] || ''
            }
          })
            .then(response => {
              // 设置CORS头
              res.set('Access-Control-Allow-Origin', '*');
              res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
              res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Authentication');
              res.set('Access-Control-Allow-Credentials', 'true');
              
              // 返回数据
              res.json(response.data);
            })
            .catch(error => {
              console.error('转发API POST请求失败:', error.message);
              res.status(error.response?.status || 500).json(error.response?.data || { error: 'API请求失败' });
            });
        });
      });
      
      // 处理OPTIONS请求（预检请求）
      devServer.app.options('/api/*', function(req, res) {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Authentication');
        res.set('Access-Control-Allow-Credentials', 'true');
        res.status(200).end();
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