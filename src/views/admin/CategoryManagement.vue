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
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="displayOrder" label="排序" width="80" />
        <el-table-column label="图标" width="100">
          <template #default="scope">
            <el-image 
              v-if="scope.row.icon" 
              :src="scope.row.icon" 
              style="width: 30px; height: 30px"
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
    </el-card>

    <!-- 新增/编辑主题对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增主题' : '编辑主题'"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form :model="categoryForm" label-width="100px" :rules="rules" ref="categoryFormRef">
        <el-form-item label="主题名称" prop="categoryName">
          <el-input v-model="categoryForm.categoryName" placeholder="请输入主题名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="categoryForm.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="详细描述" prop="detailedDescription">
          <el-input v-model="categoryForm.detailedDescription" type="textarea" placeholder="请输入详细描述" />
        </el-form-item>
        <el-form-item label="排序" prop="displayOrder">
          <el-input-number v-model="categoryForm.displayOrder" :min="1" :max="999" />
        </el-form-item>
        <el-form-item label="图标URL" prop="icon">
          <el-input v-model="categoryForm.icon" placeholder="请输入图标URL" />
          <div class="icon-preview" v-if="categoryForm.icon">
            <img :src="categoryForm.icon" alt="图标预览" style="max-width: 50px; max-height: 50px; margin-top: 10px;">
          </div>
        </el-form-item>
        <el-form-item label="Banner图URL" prop="bannerImage">
          <el-input v-model="categoryForm.bannerImage" placeholder="请输入Banner图URL" />
          <div class="banner-preview" v-if="categoryForm.bannerImage">
            <img :src="categoryForm.bannerImage" alt="Banner预览" style="max-width: 200px; max-height: 100px; margin-top: 10px;">
          </div>
        </el-form-item>
        <el-form-item label="是否可见" prop="isVisible">
          <el-switch v-model="categoryForm.isVisible" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCategoryForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { categoryApi } from '@/api/category'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 数据加载状态
const loading = ref(false)
// 分类列表
const categoryList = ref([])
// 搜索关键词
const searchKeyword = ref('')
// 对话框可见性
const dialogVisible = ref(false)
// 对话框类型：add-新增，edit-编辑
const dialogType = ref('add')
// 表单引用
const categoryFormRef = ref<FormInstance>()

// 分类表单数据
const categoryForm = reactive({
  categoryId: '',
  categoryName: '',
  description: '',
  detailedDescription: '',
  displayOrder: 1,
  icon: '',
  bannerImage: '',
  isVisible: 1,
  createdBy: 'admin',
  updatedBy: 'admin'
})

// 表单验证规则
const rules = reactive<FormRules>({
  categoryName: [
    { required: true, message: '请输入主题名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ]
})

// 获取所有顶级分类（主题）
const fetchTopCategories = async () => {
  loading.value = true
  try {
    const response = await categoryApi.getTopCategories()
    categoryList.value = response.data
  } catch (error) {
    console.error('获取主题列表失败:', error)
    ElMessage.error('获取主题列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索分类
const handleSearch = async () => {
  loading.value = true
  try {
    const response = await categoryApi.searchCategories(searchKeyword.value)
    categoryList.value = response.data
  } catch (error) {
    console.error('搜索主题失败:', error)
    ElMessage.error('搜索主题失败')
  } finally {
    loading.value = false
  }
}

// 新增分类
const handleAddCategory = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 编辑分类
const handleEditCategory = (row: any) => {
  dialogType.value = 'edit'
  Object.keys(categoryForm).forEach(key => {
    if (key in row) {
      categoryForm[key] = row[key]
    }
  })
  dialogVisible.value = true
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
      await categoryApi.deleteCategory(row.categoryId)
      ElMessage.success('删除成功')
      fetchTopCategories()
    } catch (error) {
      console.error('删除主题失败:', error)
      ElMessage.error('删除主题失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const submitCategoryForm = async () => {
  if (!categoryFormRef.value) return
  
  await categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          // 新增分类
          await categoryApi.addCategory(categoryForm)
          ElMessage.success('新增成功')
        } else {
          // 编辑分类
          await categoryApi.updateCategory(categoryForm.categoryId, categoryForm)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchTopCategories()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  if (categoryFormRef.value) {
    categoryFormRef.value.resetFields()
  }
  categoryForm.categoryId = ''
  categoryForm.categoryName = ''
  categoryForm.parentId = null
  categoryForm.description = ''
  categoryForm.detailedDescription = ''
  categoryForm.displayOrder = 1
  categoryForm.icon = ''
  categoryForm.bannerImage = ''
  categoryForm.isVisible = 1
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
}
</style> 