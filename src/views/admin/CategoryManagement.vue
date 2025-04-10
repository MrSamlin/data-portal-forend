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

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-wrapper">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="10"
            :current-page="page"
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

    <!-- 新增/编辑主题对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增主题' : '编辑主题'"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form :model="categoryForm" label-width="100px" :rules="rules" ref="categoryFormRef">
       <el-form-item label="主题代码" prop="themeCode">
          <div class="theme-code-input">
            <el-input
              v-model="categoryForm.themeCode"
              placeholder="请选择行业 (可多选)"
              :disabled="dialogType === 'edit'"
              readonly
            />
            <el-button
              v-if="dialogType === 'add'"
              type="primary"
              style="margin-left: 10px;"
              @click="openIndustrySelect"
            >
              选择行业
            </el-button>
          </div>
        </el-form-item>
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

    <!-- 修改：行业选择对话框 (原主题选择对话框) -->
    <el-dialog
      title="选择行业"
      v-model="industrySelectVisible"
      width="800px"
    >
      <div class="search-area">
        <el-input
          v-model="industrySearchKeyword"
          placeholder="搜索行业名称"
          class="search-input"
          clearable
          @keyup.enter="searchIndustries"
        >
          <template #append>
            <el-button @click="searchIndustries">搜索</el-button>
          </template>
        </el-input>
      </div>

      <el-table 
      ref="industryTableRef"
      :data="industryList"
       style="width: 100%"
        v-loading="industryLoading"
         @selection-change="handleIndustrySelectionChange">
          <el-table-column type="selection" width="55" /> <!-- 复选框列 -->
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="行业名称" />
          <el-table-column prop="value" label="行业代码" />
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="industryTotal"
          :current-page="industryPage"
          :page-size="industryPageSize"
          @current-change="handleIndustryPageChange"
        />
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="industrySelectVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmIndustrySelection">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import service from '@/utils/axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { userToken, getToken } from '@/composables/useAuth'
import axios, { isAxiosError } from 'axios'
import type { ElTable } from 'element-plus'

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
const categoryFormRef = ref<FormInstance>();

// 分页相关
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(0)
const page = ref(1)
const totalPages = ref(1)

// 分类表单数据
const categoryForm = reactive({
  categoryId: '',
  themeCode: '',
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
  themeCode: [
    { required: true, message: '请选择行业', trigger: 'change' }
  ],
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
    const response = await service.post('/dataPortal/categories/list', {
      page: page.value,
      size: pageSize.value,
      currentPage: currentPage.value,
      categoryName: searchKeyword.value.trim()
    },{  // 保持 /dataPortal 前缀
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
              'Authentication': userToken.value // 使用正确的Authentication值
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
const handleSearch = async () => {
  loading.value = true
   page.value = 1
  currentPage.value =  (page.value - 1) * pageSize.value
  fetchTopCategories()
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
      await service.delete(`/dataPortal/categories/${row.categoryId}`,{  // 保持 /dataPortal 前缀
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
              'Authentication': userToken.value // 使用正确的Authentication值
        }
      })
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
          await service.post('/dataPortal/categories', categoryForm,{  // 保持 /dataPortal 前缀
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
              'Authentication': userToken.value // 使用正确的Authentication值
        }
      })
          ElMessage.success('新增成功')
        } else {
          // 编辑分类
          await service.put(`/dataPortal/categories/${categoryForm.categoryId}`, categoryForm,{  // 保持 /dataPortal 前缀
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
              'Authentication': userToken.value // 使用正确的Authentication值
        }
      })
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchTopCategories()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败，请检查控制台获取详细信息')
        if (isAxiosError(error)) {
             console.error('Axios error details:', error.response?.data);
        }
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
  categoryForm.themeCode = ''
  categoryForm.categoryName = ''
  categoryForm.description = ''
  categoryForm.detailedDescription = ''
  categoryForm.displayOrder = 1
  categoryForm.icon = ''
  categoryForm.bannerImage = ''
  categoryForm.isVisible = 1
  if (industryTableRef.value) {
    industryTableRef.value.clearSelection();
  }
  selectedIndustries.value = []; // 清空存储的选中项
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  page.value = 1
  currentPage.value = (page.value - 1) * pageSize.value
  fetchTopCategories()
}

// 处理当前页变化
const handleCurrentChange = (newPage: number) => {
  page.value = newPage
  currentPage.value = (page.value - 1) * pageSize.value
  fetchTopCategories()
}

// 页面加载时获取主题列表
onMounted(() => {
  fetchTopCategories()
})

// 修改：行业选择对话框 (原主题选择对话框)
const industrySelectVisible = ref(false)
const industrySearchKeyword = ref('')
const industryList = ref([])
const industryLoading = ref(false)
const industryTotal = ref(0)
const industryPageSize = ref(10)
const industryPage = ref(1)
const industryTableRef = ref<InstanceType<typeof ElTable>>(); // 表格引用
const selectedIndustries = ref<any[]>([]); // 存储选中的行业行

// 修改：打开行业选择对话框
const openIndustrySelect = () => {
  industrySelectVisible.value = true;
  industryPage.value = 1;
  industrySearchKeyword.value = '';
  searchIndustries();
}

// 修改：搜索行业
const searchIndustries = async () => {
  industryLoading.value = true;
  const apiCurrentPage = industryPage.value - 1;

  try {
    const response = await service.post('/dataPortal/industryMapper/list', {
      page: industryPage.value,
      size: industryPageSize.value,
      currentPage: apiCurrentPage,
      value: industrySearchKeyword.value.trim()
    },{
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
      });

    console.log("Industry API Response:", response.data);

    if (response.data) {
      industryList.value = response.data.data || [];
      industryTotal.value = response.data.total || 0;
    } else {
       industryList.value = [];
       industryTotal.value = 0;
       console.warn("获取行业列表响应为空或无数据");
    }
  } catch (error) {
    console.error('获取行业列表失败:', error);
    ElMessage.error('获取行业列表失败');
    if (isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data);
    }
    industryList.value = [];
    industryTotal.value = 0;
  } finally {
    industryLoading.value = false;
  }
};

// 修改：选择行业
const selectIndustry = (row: any) => {
  handleIndustrySelectionChange(row);
  industrySelectVisible.value = false;
};

// 修改：处理行业分页变化
const handleIndustryPageChange = (newPage: number) => {
  industryPage.value = newPage;
  searchIndustries();
};

// 处理表格多选变化
const handleIndustrySelectionChange = (selection: any[]) => {
  selectedIndustries.value = selection; // 更新选中的行
};

// 确认行业选择
const confirmIndustrySelection = () => {
  if (selectedIndustries.value.length === 0) {
    ElMessage.warning('请至少选择一个行业');
    return;
  }
  // 提取选中的 value 并用逗号拼接
  categoryForm.themeCode = selectedIndustries.value
    .map(item => item.value)
    .join(',');

  industrySelectVisible.value = false; // 关闭对话框
  // 手动触发验证，让红星提示消失
  categoryFormRef.value?.validateField('themeCode');
};

// 取消行业选择
const cancelIndustrySelection = () => {
  industrySelectVisible.value = false;
  // 清空可能已选中的项，防止干扰下次打开
  selectedIndustries.value = [];
  if (industryTableRef.value) {
     industryTableRef.value.clearSelection();
  }
};
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
  
  .theme-code-input {
    display: flex;
    align-items: center;
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
 