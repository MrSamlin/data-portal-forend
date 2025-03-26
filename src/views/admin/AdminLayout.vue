<template>
  <div class="admin-layout">
    <el-container>
      <el-header>
        <div class="header-content">
          <h2>数据门户管理系统</h2>
        </div>
      </el-header>
      
      <el-container>
        <el-main>
          <div class="tab-navigation">
            <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
              <el-tab-pane label="主题导航维护" name="categories"></el-tab-pane>
              <el-tab-pane label="深度分析配置" name="analysis"></el-tab-pane>
              <el-tab-pane label="指标配置" name="indicators"></el-tab-pane>
            </el-tabs>
          </div>
          
          <div class="tab-content">
            <router-view></router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 当前激活的标签
const activeTab = ref('categories')

// 处理标签点击事件
const handleTabClick = () => {
  router.push(`/admin/${activeTab.value}`)
}

// 根据当前路由设置激活的标签
const updateActiveTab = () => {
  const path = route.path
  if (path.includes('/admin/categories')) {
    activeTab.value = 'categories'
  } else if (path.includes('/admin/analysis')) {
    activeTab.value = 'analysis'
  } else if (path.includes('/admin/indicators')) {
    activeTab.value = 'indicators'
  } else if (path.includes('/admin/metrics')) {
    activeTab.value = 'metrics'
  }
}

// 监听路由变化
watch(() => route.path, updateActiveTab)

onMounted(() => {
  updateActiveTab()
  
  // 如果访问 /admin 路径，默认重定向到 /admin/categories
  if (route.path === '/admin') {
    router.push('/admin/categories')
  }
})
</script>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;

  .el-header {
    background-image: url('../../assets/bg-header.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    height: 120px !important;
    line-height: 120px;
    color: #fff;
    padding: 0 20px;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
      
      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      }
      
      .user-info {
        display: flex;
        align-items: center;
        
        span {
          margin-right: 10px;
        }
      }
    }
  }
  
  .el-main {
    padding: 0;
    background-color: #f0f2f5;
    
    .tab-navigation {
      background-color: #fff5eb;
      padding: 0 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      .el-tabs {
        margin-bottom: 0;
        
        :deep(.el-tabs__header) {
          border-bottom: none;
          margin: 0;
        }
        
        :deep(.el-tabs__nav) {
          border: none;
          background: transparent;
        }
        
        :deep(.el-tabs__item) {
          height: 40px;
          line-height: 40px;
          color: #ffffff;
          font-weight: bold;
          background-color: #ffb088;
          margin-right: 4px;
          padding: 0 20px;
          border-radius: 4px 4px 0 0;
          transition: all 0.3s;
          border: none;
          
          &.is-active {
            color: #ffffff;
            font-weight: bold;
            background-color: #ff7733;
            border-bottom: none;
          }
          
          &:hover {
            color: #ffffff;
            background-color: #ff8855;
          }
        }
      }
    }
    
    .tab-content {
      padding: 21px;
    }
  }
}
</style>

<style>
/* 全局按钮样式，影响所有admin下的页面 */
.admin-layout .el-button {
  --el-button-bg-color: #ff8c00 !important;
  --el-button-border-color: #ff8c00 !important;
  --el-button-hover-bg-color: #ff7f00 !important;
  --el-button-hover-border-color: #ff7f00 !important;
  --el-button-active-bg-color: #ff7f00 !important;
  --el-button-active-border-color: #ff7f00 !important;
  --el-button-text-color: #ff7f00 !important;
  --el-button-hover-text-color: #ff8c00 !important;
  --el-button-active-text-color: #ffffff !important;
  transition: all 0.3s;
}

.admin-layout .el-button--primary {
  --el-button-bg-color: #ff8c00 !important;
  --el-button-border-color: #ff8c00 !important;
  --el-button-hover-bg-color: #ff7f00 !important;
  --el-button-hover-border-color: #ff7f00 !important;
  --el-button-active-bg-color: #ff7f00 !important;
  --el-button-active-border-color: #ff7f00 !important;
}

.admin-layout .el-button--danger {
  --el-button-bg-color: #ff8c00 !important;
  --el-button-border-color: #ff8c00 !important;
  --el-button-hover-bg-color: #ff7f00 !important;
  --el-button-hover-border-color: #ff7f00 !important;
  --el-button-active-bg-color: #ff7f00 !important;
  --el-button-active-border-color: #ff7f00 !important;
}

.admin-layout .el-button--default {
  --el-button-bg-color: #ff8c00 !important;
  --el-button-border-color: #ff8c00 !important;
  --el-button-text-color: #ffffff !important;
  --el-button-hover-text-color: #ffffff !important;
  --el-button-hover-bg-color: #ff7f00 !important;
  --el-button-hover-border-color: #ff7f00 !important;
}

/* 确保按钮内的文字颜色为白色 */
.admin-layout .el-button span {
  color: #ffffff !important;
}
</style> 