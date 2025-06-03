<template>
  <div class="category-management">
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <span>主题导航维护</span>
          <el-button type="primary" @click="handleAddCategory">新增主题</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入关键词搜索主题"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <!-- 数据表格 -->
      <el-table :data="categoryList" style="width: 100%" v-loading="loading">
        <el-table-column prop="categoryId" label="ID" width="80" />
        <el-table-column prop="categoryName" label="主题名称" />
         <el-table-column prop="themeCode" label="行业" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="displayOrder" label="排序" width="80" />


          <el-table-column label="底图" min-width="80">
          <template #default="scope">
            <img 
              v-if="scope.row.icon" 
              :src="`/icon/${scope.row.icon}`" 
              alt="底图" 
              style="width: 50px; height: 50px; object-fit: contain;" 
            />
            <span v-else>无底图</span>
          </template>
     </el-table-column>

     <el-table-column label="图标" min-width="80">
          <template #default="scope">
            <img 
              v-if="scope.row.bannerImage" 
              :src="`/img/${scope.row.bannerImage}`" 
              alt="图标" 
              style="width: 50px; height: 50px; object-fit: contain;" 
            />
            <span v-else>无图标</span>
          </template>
     </el-table-column>

  
        <el-table-column prop="isVisible" label="是否可见" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isVisible === 1 ? 'success' : 'info'">
              {{ scope.row.isVisible === 1 ? '可见' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditCategory(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDeleteCategory(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-wrapper">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            v-model:page-size="pageSize" 
            v-model:current-page="page"
            :page-count="totalPages"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
          <div class="page-info">
            当前第 {{ page }} 页 / 共 {{ totalPages }} 页
          </div>
        </div>
      </div>
    </el-card>

    <!-- 使用新的表单对话框组件 -->
    <CategoryFormDialog
      v-model:visible="categoryDialogVisible"
      :mode="categoryDialogMode"
      :category-data="currentCategoryData"
      @submitted="handleCategorySubmitted"
    />
  </div>
</template>


<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import service from '@/utils/axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { userToken, getToken } from '@/composables/useAuth'
import axios, { isAxiosError } from 'axios'
import type { ElTable } from 'element-plus'
import CategoryFormDialog from '../categoryComponents/CategoryFormDialog.vue'

// 数据加载状态
const loading = ref(false)
// 分类列表
const categoryList = ref([])
// 搜索关键词
const searchKeyword = ref('')
// 对话框可见性
const categoryDialogVisible = ref(false)
// 对话框类型：add-新增，edit-编辑
const categoryDialogMode = ref<'add' | 'edit'>('add')
// 表单引用
const categoryFormRef = ref<FormInstance>();

// 分页相关
const total = ref(0)
const pageSize = ref(10)
const page = ref(1)
const totalPages = ref(1)

// 分类表单数据
const currentCategoryData = ref<any>(null)

// 判断是否为颜色值 (简单判断)
const isColor = (strColor: string) => {
  if (!strColor) return false;
  // 简单判断是否可能是 HEX (#...) 或 rgb/rgba/hsl/hsla
  const s = new Option().style;
  s.color = strColor;
  // 如果浏览器能解析，则认为可能是颜色
  return s.color !== '';
};

// 获取所有顶级分类（主题）
const fetchTopCategories = async () => {
  loading.value = true
  const apiCurrentPage = page.value - 1
  try {   
    const response = await service.post('/cmfwxrobot/categories/list', {
      page: page.value,
      size: pageSize.value,
      currentPage: apiCurrentPage,
      categoryName: searchKeyword.value.trim()
    },{  // 保持 /cmfwxrobot 前缀
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
              'Authentication': userToken.value  
        }
      })
    if (response.data) {
      categoryList.value = response.data.data || []
      total.value = response.data.total || 0
      totalPages.value = response.data.totalPages || 1
    }
  } catch (error) {
    console.error('获取主题列表失败:', error)
    ElMessage.error('获取主题列表失败')
    if (isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data);
    }
    categoryList.value = []
    total.value = 0
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

// 搜索分类
const handleSearch = () => {
  page.value = 1
  fetchTopCategories()
}

// 新增分类
const handleAddCategory = () => {
  categoryDialogMode.value = 'add'
  currentCategoryData.value = null
  categoryDialogVisible.value = true
}

// 编辑分类
const handleEditCategory = (row: any) => {
  categoryDialogMode.value = 'edit'
  currentCategoryData.value = { ...row }
  categoryDialogVisible.value = true
}

// 删除分类
const handleDeleteCategory = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除主题 "${row.categoryName}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await service.delete(`/cmfwxrobot/categories/${row.categoryId}`,{  // 保持 /cmfwxrobot 前缀
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
              'Authentication': userToken.value  
        }
      })
      ElMessage.success('删除成功')
      if (categoryList.value.length === 1 && page.value > 1) {
        page.value--
      }
      fetchTopCategories()
    } catch (error) {
      console.error('删除主题失败:', error)
      ElMessage.error('删除主题失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 处理子组件提交成功事件
const handleCategorySubmitted = () => {
  fetchTopCategories()
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  page.value = 1
  fetchTopCategories()
}

// 处理当前页变化
const handleCurrentChange = (newPage: number) => {
  page.value = newPage
  fetchTopCategories()
}

// 页面加载时获取主题列表
onMounted(() => {
  fetchTopCategories()
})
</script>

<style lang="scss" scoped>
.category-management {
  padding: 20px;
  
  .operation-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .search-area {
    margin-bottom: 20px;
    
    .search-input {
      width: 400px;

      :deep(.el-input-group__append) {
        .el-button {
          background-color: #ff8c00;
          border-color: #ff8c00;
          color: white;
          padding: 8px 20px;
          
          &:hover {
            background-color: #ff9a22;
            border-color: #ff9a22;
          }
          
          &:active {
            background-color: #ff7f00;
            border-color: #ff7f00;
          }
        }
      }
    }
  }
  
  .color-display-block {
    display: inline-block;
    vertical-align: middle;
    border: 1px solid #eee;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;

    .pagination-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .page-info {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>  
 