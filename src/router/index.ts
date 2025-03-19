import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 扩展 RouteMeta 接口
declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    requiresAuth?: boolean;
    icon?: string;
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/components/DataPortal.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { title: '后台管理', requiresAuth: false },
    children: [
      {
        path: 'categories',
        name: 'CategoryManagement',
        component: () => import('@/views/admin/CategoryManagement.vue'),
        meta: { title: '主题导航维护', requiresAuth: false }
      },
      {
        path: 'analysis',
        name: 'AnalysisConfig',
        component: () => import('@/views/admin/AnalysisConfig.vue'),
        meta: { title: '深度分析配置', requiresAuth: false }
      },
      {
        path: 'indicators',
        name: 'IndicatorConfig',
        component: () => import('@/views/admin/IndicatorConfig.vue'),
        meta: { title: '指标配置', requiresAuth: false }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫，用于处理需要认证的路由
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '默认标题'
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const isAuthenticated = localStorage.getItem('token')
    if (isAuthenticated) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router