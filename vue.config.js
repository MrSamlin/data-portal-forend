const { defineConfig } = require('@vue/cli-service');
const path = require('path');
const axios = require('axios');

// 获取当前环境
const env = process.env.NODE_ENV || 'development';

// 不同环境的API基础URL
const API_BASE_URL = {
  development: 'http://localhost:7070',
  test: 'http://192.168.126.242:7070',
  production: 'http://192.168.126.242:7070'
};
 
// 指标看板API地址
const DASHBOARD_API_URL = {
  development: 'http://localhost:7070',
  test: 'http://192.168.126.242:7070',
  production: 'http://192.168.126.242:7070'
};

// 创建代理配置
const createProxy = () => {
  const target = API_BASE_URL[env];
  const dashboardTarget = DASHBOARD_API_URL[env];
  
  return {
    '/dataPortal': {
      target,
      changeOrigin: true,
      ws: true,
      secure: false,
      pathRewrite: {
        '^/dataPortal': '/dataPortal' // 保持API路径不变，与proxy.ts保持一致
      },
      // 添加CORS头
      onProxyRes: function(proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Authentication';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      }
    },
    // 添加指标看板API代理
    '/dataPortal/edbapply': {
      target: dashboardTarget,
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/dataPortal/edbapply': '/dw/edbapply' // 将/dataportdataPortalal/edbapply路径重写为/dw/edbapply
      },
      // 添加CORS头
      onProxyRes: function(proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Authentication';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      }
    }
  };
};

module.exports = defineConfig({
  publicPath:  process.env.NODE_ENV==='production'?'./':'/',
  outputDir: 'dist',
  indexPath: 'index.html',
  assetsDir: 'static',
  productionSourceMap: false,
  transpileDependencies: true,
  lintOnSave: false,
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
      devServer.app.get('/dataPortal/*', function(req, res) {
        // 检查当前环境是否为开发环境
        const isDevelopment = process.env.NODE_ENV === 'development';
        const targetUrlObj = `${API_BASE_URL[env]}${req.url}`;
        let targetUrl = targetUrlObj; // 初始化 targetUrl
        if (isDevelopment) {
            targetUrl = targetUrlObj.replace('/dataPortal', '');
        } 
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
      devServer.app.post('/dataPortal/*', function(req, res) {
        
          const isDevelopment = process.env.NODE_ENV === 'development';
          const targetUrlObj = `${API_BASE_URL[env]}${req.url}`;
          console.log('targetUrlObj:',targetUrlObj);
          if (isDevelopment) {
              targetUrl = targetUrlObj.replace('/dataPortal', '');
          } 
          console.log('targetUrl post:',targetUrl);
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
      devServer.app.options('/dataPortal/*', function(req, res) {
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