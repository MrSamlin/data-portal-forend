const { defineConfig } = require('@vue/cli-service');
const path = require('path');
const axios = require('axios');
const { isDevelopment,isProduction } = require('./src/utils/env.js');
const e = require('express');
// 获取当前环境
isDevelopment ? 'development' : 'production';
 
let env =  process.env.NODE_ENV;

// 不同环境的API基础URL
const API_BASE_URL = {
  development: 'http://localhost:8311',
  test: 'http://192.168.126.242:8311',
  production: 'http://192.168.126.242:8311'
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
    '/cmfwxrobot': {
      target,
      changeOrigin: true,
      ws: true,
      secure: false,
      pathRewrite: {
        '^/cmfwxrobot': '/cmfwxrobot' // 保持API路径不变，与proxy.ts保持一致
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
    '/cmfwxrobot/edbapply': {
      target: dashboardTarget,
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/cmfwxrobot/edbapply': '/dw/edbapply' // 将/dataportdataPortalal/edbapply路径重写为/dw/edbapply
      },
      // 添加CORS头
      onProxyRes: function(proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Authentication';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      }
    },
    // 添加图片查看地址
    '/img': {
      target: target, 
      changeOrigin: true,
      secure: false 
    }
  };
};

module.exports = defineConfig({
  publicPath: isProduction?'./':'./',
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
      devServer.app.get('/cmfwxrobot/*', function(req, res) {
        // 检查当前环境是否为开发环境
        const targetUrlObj = `${API_BASE_URL[env]}${req.url}`;
        let targetUrl = targetUrlObj; // 初始化 targetUrl
        if (isDevelopment) {
            targetUrl = targetUrlObj.replace('/cmfwxrobot', '');
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
              console.error(' get 转发API请求失败:', error.message);
              res.status(500).json({ error: ' get API请求失败' });
            });
      });

        devServer.app.put('/cmfwxrobot/*', function(req, res) {
          const targetUrlObj = `${API_BASE_URL[env]}${req.url}`;
          if (isDevelopment) {
              targetUrl = targetUrlObj.replace('/cmfwxrobot', '');
          } 
        // 将请求体作为数据传递
        let data = '';
        req.on('data', chunk => {
          data += chunk;
        });
        
        req.on('end', () => {
          axios.put(targetUrl, data ? JSON.parse(data) : {}, {
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
              console.error('转发API PUT 请求失败:', error.message);
              res.status(error.response?.status || 500).json(error.response?.data || { error: 'PUT API请求失败' });
            });
        });
      });



      devServer.app.delete('/cmfwxrobot/*', function(req, res) {
        // 检查当前环境是否为开发环境
        console.log('delete请求:',req.url);
        const targetUrlObj = `${API_BASE_URL[env]}${req.url}`;
        let targetUrl = targetUrlObj; // 初始化 targetUrl
        if (isDevelopment) {
            targetUrl = targetUrlObj.replace('/cmfwxrobot', '');
        } 
          // 转发请求到目标服务器
          axios.delete(targetUrl)
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
              console.error('deleteAPI请求失败:', error.message);
              res.status(500).json({ error: 'delete API请求失败' });
            });
      });


      
      // 处理POST请求
      devServer.app.post('/cmfwxrobot/*', function(req, res) {
          const targetUrlObj = `${API_BASE_URL[env]}${req.url}`;
          let targetUrl = targetUrlObj
          if (isDevelopment) {
              targetUrl = targetUrlObj.replace('/cmfwxrobot', '');
          } 
          const incomingContentType = req.headers['content-type'] || '';
        // 将请求体作为数据传递
        let data = '';
        req.on('data', chunk => {
          data += chunk;
        });
        if (incomingContentType.includes('multipart/form-data')) {
          // 对于 multipart/form-data，我们尝试将原始请求流直接传递给 axios
          // 这依赖于 axios 在 Node.js 环境中对可读流 (ReadableStream) 的良好支持
          // 并且后端能够正确处理流式传输的 multipart 数据。
          // 关键是必须传递原始的 Content-Type 头部，因为它包含了 boundary 定义。

          console.log(`[Multipart Forward] Attempting to stream POST to ${targetUrl} with Content-Type: ${incomingContentType}`);

          // 直接将客户端的请求对象 (req，它是一个可读流) 作为 axios 的请求体
          axios.post(targetUrl, req, {
            headers: {
              // 至关重要：传递从客户端请求中获取的原始 Content-Type 头部
              'Content-Type': incomingContentType,
              // 传递其他可能相关的原始头部信息
              // 你可以有选择地传递，或者传递全部 (...req.headers)，但要注意可能引入的问题
              'Authorization': req.headers['authorization'] || undefined, // 如果不存在则不传
              'Authentication': req.headers['authentication'] || undefined,
              // 对于流式传输，Transfer-Encoding 通常是 chunked
              'Transfer-Encoding': 'chunked',
              // 确保 host 头部与目标服务器匹配
              'host': new URL(targetUrl).host
              // 注意: axios 可能会覆盖或添加某些头部。
              // Content-Length 通常由流式传输自动处理或不应手动设置（除非你知道流的总大小）。
            },
            // 允许上传大文件，避免 axios 因默认大小限制而报错
            maxBodyLength: Infinity, 
            maxContentLength: Infinity 
          })
          .then(response => {
            res.set('Access-Control-Allow-Origin', '*');
            // ... 其他CORS头 ...
            res.json(response.data);
          })
          .catch(error => {
            console.error(`[Multipart Forward] POST ${targetUrl} failed:`, 
                          error.message, 
                          error.response ? `Status: ${error.response.status}` : '',
                          error.response ? `Data: ${JSON.stringify(error.response.data)}` : 'No response data');
            res.status(error.response?.status || 500)
               .json(error.response?.data || { error: 'Multipart API request forwarding failed' });
          });

        } else {
          req.on('end', () => {
            const contentType = req.headers['content-type'] || '';
            const isJson = contentType.includes('application/json');
            const postData = isJson ? (data ? JSON.parse(data) : {}) : data;
            // 转发POST请求
            axios.post(targetUrl, postData, {
              headers: {
                'Content-Type': contentType, // 保持前端原始 content-type
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

        }
     
      });
      
      // 处理OPTIONS请求（预检请求）
      devServer.app.options('/cmfwxrobot/*', function(req, res) {
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