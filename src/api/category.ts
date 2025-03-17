import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:8081/api',
  timeout: 10000
})

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 分类相关API
export const categoryApi = {
  // 获取所有分类
  getAllCategories() {
    return service.get('/categories')
  },
  
  // 获取顶级分类
  getTopCategories() {
    return service.get('/categories/top')
  },
  
  // 搜索分类
  searchCategories(keyword: string) {
    return service.get(`/categories/search?keyword=${keyword}`)
  },
  
  // 获取分类详情
  getCategoryDetail(categoryId: string | number) {
    return service.get(`/categories/${categoryId}`)
  },
  
  // 获取子分类
  getChildCategories(parentId: string | number) {
    return service.get(`/categories/top/children/${parentId}`)
  },
  
  // 新增分类
  addCategory(data: any) {
    return service.post('/categories', data)
  },
  
  // 更新分类
  updateCategory(categoryId: string | number, data: any) {
    return service.put(`/categories/${categoryId}`, data)
  },
  
  // 删除分类
  deleteCategory(categoryId: string | number) {
    return service.delete(`/categories/${categoryId}`)
  }
} 