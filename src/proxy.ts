// src/proxy.ts
import { Express } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

interface ProxyOptions {
  target: string;
  changeOrigin?: boolean;
  ws?: boolean;
  secure?: boolean;
  pathRewrite?: Record<string, string>;
}

interface ProxyConfig {
  [key: string]: ProxyOptions;
}

// 不同环境的API基础URL
const API_BASE_URL = {
  development: 'http://localhost:8081',
  test: 'http://test-api.example.com',
  production: 'http://prod-api.example.com'
};

// 获取当前环境
const env = process.env.NODE_ENV || 'development';

// 创建代理配置
const createProxy = (env: string): ProxyConfig => {
  const target = API_BASE_URL[env as keyof typeof API_BASE_URL];
  
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

// 导出默认配置
const proxyConfig = createProxy(env);
export default proxyConfig;
module.exports = { default: proxyConfig };