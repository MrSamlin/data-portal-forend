<template>
  <div class="industry-mapper-management">
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <span>行业字典维护</span>
          <el-button type="primary" @click="handleAddIndustry">新增行业</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入关键词搜索行业名称"
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
      <el-table :data="industryList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="行业名称" />
        <el-table-column prop="value" label="行业代码" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditIndustry(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDeleteIndustry(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
         <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
      </div>
    </el-card>

    <!-- 新增/编辑行业对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增行业' : '编辑行业'"
      v-model="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="industryForm" label-width="100px" :rules="rules" ref="industryFormRef">
        <el-form-item label="行业名称" prop="title">
          <el-input v-model="industryForm.title" placeholder="请输入行业名称" />
        </el-form-item>
        <el-form-item label="行业代码" prop="value">
          <el-input v-model="industryForm.value" placeholder="请输入行业代码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitIndustryForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import service from '@/utils/axios' // 假设 axios 实例已配置好
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { isAxiosError } from 'axios'

// --- 状态变量 ---
const loading = ref(false)
const industryList = ref<any[]>([])
const searchKeyword = ref('')
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const industryFormRef = ref<FormInstance>()
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

// --- 表单数据 ---
const industryForm = reactive({
  id: null as number | null,
  title: '',
  value: ''
})

// --- 表单验证规则 ---
const rules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入行业名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入行业代码', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ]
})

// --- API 函数 ---
const fetchIndustries = async () => {
  loading.value = true
  try {
    // 注意：接口路径和参数名根据您的描述调整
    // 确认后端需要的 currentPage 是 0-based index 还是 offset
    // const apiCurrentPage = page.value - 1; // 0-based index
    const apiCurrentPage = (page.value - 1) * pageSize.value; // offset

    const response = await service.post('/dataPortal/industryMapper/list', {
      page: page.value,
      size: pageSize.value,
      currentPage: apiCurrentPage, // 使用正确的 currentPage 计算方式
      title: searchKeyword.value.trim()
    }) // 沿用 dataPortal 前缀

    if (response.data && Array.isArray(response.data.data)) {
      industryList.value = response.data.data
      total.value = response.data.total || 0
      // 注意：响应体中的 currentPage 和 totalPages 可能需要用来更新分页组件状态，如果后端返回了的话
      // page.value = response.data.currentPage + 1; // 假设后端返回 0-based
      // totalPages.value = response.data.totalPages;
    } else {
       industryList.value = []
       total.value = 0
    }
  } catch (error) {
    console.error('获取行业列表失败:', error)
    ElMessage.error('获取行业列表失败')
     if (isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data);
    }
    industryList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const addIndustry = async (data: Omit<typeof industryForm, 'id'>) => {
  // 注意：接口路径根据您的描述调整
  return service.post('/dataPortal/industryMapper', data)
}

const updateIndustry = async (id: number, data: Omit<typeof industryForm, 'id'>) => {
  // 注意：接口路径根据您的描述调整
  return service.put(`/dataPortal/industryMapper/${id}`, data)
}

const deleteIndustry = async (id: number) => {
  // 注意：接口路径根据您的描述调整
  return service.delete(`/dataPortal/industryMapper/${id}`)
}

// --- 事件处理 ---
const handleSearch = () => {
  page.value = 1 // 搜索时重置到第一页
  fetchIndustries()
}

const handleAddIndustry = () => {
  dialogType.value = 'add'
  // resetForm() // resetForm 会在 dialog 关闭时调用
  dialogVisible.value = true
}

const handleEditIndustry = (row: any) => {
  dialogType.value = 'edit'
  // 深拷贝，避免直接修改列表数据
  Object.assign(industryForm, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

const handleDeleteIndustry = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除行业 "${row.title}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteIndustry(row.id)
      ElMessage.success('删除成功')
      // 如果删除的是最后一页的唯一数据，需要返回前一页
       if (industryList.value.length === 1 && page.value > 1) {
           page.value--;
       }
      fetchIndustries()
    } catch (error) {
      console.error('删除行业失败:', error)
      ElMessage.error('删除行业失败')
      if (isAxiosError(error)) {
          console.error('Axios error details:', error.response?.data);
      }
    }
  }).catch(() => {
    // 取消删除
  })
}

const submitIndustryForm = async () => {
  if (!industryFormRef.value) return

  await industryFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true; // 开始加载状态
      try {
        const dataToSubmit = {
          title: industryForm.title,
          value: industryForm.value
        }
        if (dialogType.value === 'add') {
          await addIndustry(dataToSubmit)
          ElMessage.success('新增成功')
        } else if (industryForm.id !== null) {
          await updateIndustry(industryForm.id, dataToSubmit)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchIndustries() // 刷新列表
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败，请检查控制台获取详细信息')
        if (isAxiosError(error)) {
             console.error('Axios error details:', error.response?.data);
        }
      } finally {
           loading.value = false; // 结束加载状态
      }
    }
  })
}

const resetForm = () => {
  if (industryFormRef.value) {
    industryFormRef.value.resetFields()
  }
  industryForm.id = null
  industryForm.title = ''
  industryForm.value = ''
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  page.value = 1 // 页大小改变时，回到第一页
  fetchIndustries()
}

const handleCurrentChange = (val: number) => {
  page.value = val
  fetchIndustries()
}

// --- 生命周期钩子 ---
onMounted(() => {
  fetchIndustries()
})
</script>

<style lang="scss" scoped>
.industry-mapper-management {
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
      width: 300px; // 可根据需要调整宽度
      
      // --- 新增样式 --- 开始 ---
      :deep(.el-input-group__append) {
        .el-button {
          background-color: #ff8c00;
          border-color: #ff8c00;
          color: white;
          padding: 8px 20px; // 可以根据需要调整内边距
          
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
      // --- 新增样式 --- 结束 ---
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center; // 或者 flex-end
  }
}
</style> 