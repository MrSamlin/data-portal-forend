import service from '@/utils/axios'

// API路径前缀
const API_PREFIX = '/api';

// 分类相关API
export const categoryApi = {
  // 获取所有分类
  getAllCategories() {
    return service.get(`${API_PREFIX}/categories`)
  },
  
  // 获取顶级分类
  getTopCategories() {
    return service.get(`${API_PREFIX}/categories/top`)
  },
  
  // 搜索分类
  searchCategories(keyword: string) {
    return service.get(`${API_PREFIX}/categories/search?keyword=${keyword}`)
  },
  
  // 获取分类详情
  getCategoryDetail(categoryId: string | number) {
    return service.get(`${API_PREFIX}/categories/${categoryId}`)
  },
  
  // 获取子分类
  getChildCategories(parentId: string | number) {
    return service.get(`${API_PREFIX}/categories/top/children/${parentId}`)
  },
  
  // 新增分类
  addCategory(data: any) {
    return service.post(`${API_PREFIX}/categories`, data)
  },
  
  // 更新分类
  updateCategory(categoryId: string | number, data: any) {
    return service.put(`${API_PREFIX}/categories/${categoryId}`, data)
  },
  
  // 删除分类
  deleteCategory(categoryId: string | number) {
    return service.delete(`${API_PREFIX}/categories/${categoryId}`)
  }
} 