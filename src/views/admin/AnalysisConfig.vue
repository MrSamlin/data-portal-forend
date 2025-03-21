<template>
  <div class="analysis-config">
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <span>深度分析配置</span>
          <el-button type="primary" @click="handleAddAnalysis">新增分析</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入分析维度搜索"
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
      <el-table :data="analysisList" style="width: 100%" v-loading="loading">
        <el-table-column prop="analysisDimension" label="分析维度" />
        <el-table-column prop="jumpUrl" label="跳转地址" show-overflow-tooltip />
        <el-table-column prop="viewCount" label="浏览次数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '已发布' : '未发布' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishDate" label="发布日期" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditAnalysis(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDeleteAnalysis(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑分析对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增分析' : '编辑分析'"
      v-model="dialogVisible"
      width="650px"
    >
      <el-form :model="analysisForm" label-width="100px" :rules="rules" ref="analysisFormRef">
        <el-form-item label="分析维度" prop="analysisDimension">
          <el-input v-model="analysisForm.analysisDimension" placeholder="请输入分析维度" />
        </el-form-item>
        <el-form-item label="跳转地址" prop="jumpUrl">
          <el-input v-model="analysisForm.jumpUrl" placeholder="请输入跳转地址" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="analysisForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAnalysisForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 数据加载状态
const loading = ref(false)
// 分析列表
const analysisList = ref([
  {
    id: 1,
    analysisDimension: '销售趋势分析',
    jumpUrl: '/analysis/sales',
    viewCount: 100,
    status: 1,
    publishDate: '2024-01-15 14:30:00',
    createDate: '2024-01-15 14:30:00',
    updateDate: '2024-01-15 14:30:00',
    createUser: 'admin',
    updateUser: 'admin'
  }
])

// 搜索关键词
const searchKeyword = ref('')
// 对话框可见性
const dialogVisible = ref(false)
// 对话框类型：add-新增，edit-编辑
const dialogType = ref('add')
// 表单引用
const analysisFormRef = ref<FormInstance>()

// 分页相关
const total = ref(100)
const pageSize = ref(10)
const currentPage = ref(1)

// 分析表单数据
const analysisForm = reactive({
  id: 0,
  analysisDimension: '',
  jumpUrl: '',
  viewCount: 0,
  status: 0,
  publishDate: '',
  createDate: '',
  updateDate: '',
  createUser: '',
  updateUser: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  analysisDimension: [
    { required: true, message: '请输入分析维度', trigger: 'blur' },
    { max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }
  ],
  jumpUrl: [
    { required: true, message: '请输入跳转地址', trigger: 'blur' },
    { max: 255, message: '长度不能超过 255 个字符', trigger: 'blur' }
  ]
})

// 搜索分析
const handleSearch = () => {
  loading.value = true
  // 模拟搜索延迟
  setTimeout(() => {
    if (searchKeyword.value) {
      analysisList.value = analysisList.value.filter(item => 
        item.analysisDimension.includes(searchKeyword.value)
      )
    } else {
      // 重置为原始数据
      fetchAnalysisList()
    }
    loading.value = false
  }, 300)
}

// 获取分析列表
const fetchAnalysisList = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    // 这里应该调用实际的API
    loading.value = false
  }, 300)
}

// 新增分析
const handleAddAnalysis = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 编辑分析
const handleEditAnalysis = (row: any) => {
  dialogType.value = 'edit'
  Object.keys(analysisForm).forEach(key => {
    if (key in row) {
      analysisForm[key] = row[key]
    }
  })
  dialogVisible.value = true
}

// 删除分析
const handleDeleteAnalysis = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除分析 "${row.analysisDimension}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟删除操作
    setTimeout(() => {
      analysisList.value = analysisList.value.filter(item => item.id !== row.id)
      ElMessage.success('删除成功')
    }, 300)
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const submitAnalysisForm = async () => {
  if (!analysisFormRef.value) return
  
  await analysisFormRef.value.validate(async (valid) => {
    if (valid) {
      // 模拟API调用
      setTimeout(() => {
        const now = new Date().toLocaleString()
        if (dialogType.value === 'add') {
          // 新增
          const newAnalysis = {
            ...analysisForm,
            id: analysisList.value.length + 1,
            viewCount: 0,
            publishDate: now,
            createDate: now,
            updateDate: now,
            createUser: 'admin',
            updateUser: 'admin'
          }
          analysisList.value.unshift(newAnalysis)
          ElMessage.success('新增成功')
        } else {
          // 编辑
          const index = analysisList.value.findIndex(item => item.id === analysisForm.id)
          if (index !== -1) {
            analysisList.value[index] = {
              ...analysisForm,
              updateDate: now,
              updateUser: 'admin'
            }
            ElMessage.success('更新成功')
          }
        }
        dialogVisible.value = false
      }, 300)
    }
  })
}

// 重置表单
const resetForm = () => {
  if (analysisFormRef.value) {
    analysisFormRef.value.resetFields()
  }
  analysisForm.id = 0
  analysisForm.analysisDimension = ''
  analysisForm.jumpUrl = ''
  analysisForm.viewCount = 0
  analysisForm.status = 0
  analysisForm.publishDate = ''
  analysisForm.createDate = ''
  analysisForm.updateDate = ''
  analysisForm.createUser = ''
  analysisForm.updateUser = ''
}

// 处理分页
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchAnalysisList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchAnalysisList()
}

// 页面加载时获取分析列表
onMounted(() => {
  fetchAnalysisList()
})
</script>

<style lang="scss" scoped>
.analysis-config {
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
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style> 