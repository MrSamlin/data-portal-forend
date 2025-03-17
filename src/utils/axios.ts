// src/utils/axios.ts
import axios, { InternalAxiosRequestConfig } from 'axios'

// 获取环境变量
const apiBaseUrl = process.env.VUE_APP_API_URL || '/'

const service = axios.create({
  baseURL: '/',  // 使用相对路径，让代理处理
  timeout: 10000,
  withCredentials: true  // 允许跨域请求携带凭证
})

// 不需要设置 baseURL，让请求走代理
// axios.defaults.baseURL = process.env.NODE_ENV === 'development' 
//   ? 'http://localhost:3001'  // 删除这个
//   : 'http://your-production-url';

// 添加请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 打印环境信息
    console.log('Current ENV:', process.env.NODE_ENV);
    console.log('API Base URL:', apiBaseUrl);
    console.log('Request URL:', config.url);
    
    // 设置通用请求头
    if (config.headers) {
      config.headers['Content-Type'] = 'application/json'
      config.headers['Accept'] = 'application/json'
      
      // 如果有token，添加到请求头
      const token = localStorage.getItem('token')
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
service.interceptors.response.use(
  response => {
    // 打印响应信息
    console.log('Response from:', response.config.url);
    console.log('Response status:', response.status);
    
    // 直接返回数据部分
    return response
  },
  error => {
    // 处理错误
    if (error.response) {
      const status = error.response.status
      
      // 处理401未授权错误
      if (status === 401) {
        localStorage.removeItem('token')
        // 可以在这里添加重定向到登录页的逻辑
      }
      
      // 处理403禁止访问错误
      if (status === 403) {
        console.error('没有权限访问该资源')
      }
      
      // 处理500服务器错误
      if (status >= 500) {
        console.error('服务器错误，请稍后再试')
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查您的网络连接')
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default service