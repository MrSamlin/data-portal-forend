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
            <el-tag :type="Number(scope.row.status) === 1 ? 'success' : 'info'">
              {{ Number(scope.row.status) === 1 ? '已发布' : '未发布' }}
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
          <el-switch v-model="analysisForm.status" :active-value='1' :inactive-value='0' />
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import service from '@/utils/axios'

// 分析项接口定义
interface AnalysisItem {
  id: number;
  analysisDimension: string;
  jumpUrl: string;
  viewCount: number;
  status: number; // 确保这里定义为number类型
  publishDate: string;
  createDate: string;
  updateDate: string;
  createUser: string;
  updateUser: string;
}

// 数据加载状态
const loading = ref(false)
// 分析列表
const analysisList = ref<AnalysisItem[]>([
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
const currentPage = ref(0)
const page = ref(1)
const totalPages = ref(1)

// 分析表单数据
const analysisForm = reactive<AnalysisItem>({
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
     page.value = 1
   currentPage.value = (page.value - 1) * pageSize.value
  fetchAnalysisList()
}


// 获取分析列表
const fetchAnalysisList = () => {
  loading.value = true
  console.log('page:', page.value);
    service.post('/api/deepAnalysis/list', {
      page: currentPage.value,
      currentPage: currentPage.value,
      size: pageSize.value,
       analysisDimension: searchKeyword.value.trim()
    })
      .then(response => {
        if (response.data) {
          // 处理返回的数据
          const list = response.data.data || []
          analysisList.value = list.map((item: any) => ({
            id: item.id,
            analysisDimension: item.analysisDimension,
            jumpUrl: item.jumpUrl,
            viewCount: item.viewCount,
            status: Number(item.status), // 确保转换为数字
            publishDate: item.publishDate,
            createDate: item.createDate || item.createTime,
            updateDate: item.updateDate || item.updateTime,
            createUser: item.createUser || item.user1,
            updateUser: item.updateUser || item.user1
          }))
          // 更新总条数和总页数  
          total.value = response.data.total || 1
          totalPages.value =  response.data.totalPages || 1
        } else {
          analysisList.value = []
          total.value = 0
          totalPages.value = 1
        }
      })
      .catch(error => {
        console.error('获取深度分析列表失败:', error)
        ElMessage.error('获取深度分析列表失败')
        analysisList.value = []
        total.value = 0
        totalPages.value = 1
      })
      .finally(() => {
        loading.value = false
      })
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
      // 确保status字段被转换为数字类型
      if (key === 'status') {
        analysisForm[key] = typeof row[key] === 'string' ? parseInt(row[key]) : row[key]
      } else {
        analysisForm[key] = row[key]
      }
    }
  })
  // 确保表单正确渲染后再显示对话框
  nextTick(() => {
    dialogVisible.value = true
  })
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
    loading.value = true
    service.delete(`/api/deepAnalysis/${row.id}`)
      .then(() => {
        ElMessage.success('删除成功')
        fetchAnalysisList() // 重新获取列表数据
      })
      .catch(error => {
        console.error('删除深度分析失败:', error)
        ElMessage.error('删除失败，请重试')
      })
      .finally(() => {
        loading.value = false
      })
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const submitAnalysisForm = async () => {
  if (!analysisFormRef.value) return
  
  await analysisFormRef.value.validate(async (valid) => {
    if (valid) {
      const formData = { ...analysisForm }
      
      // 确保status是数字类型
      formData.status = Number(formData.status)
      
      // 转换日期格式
      if (!formData.publishDate) {
        formData.publishDate = new Date().toISOString()
      }
      
      loading.value = true
      try {
        if (dialogType.value === 'add') {
          // 新增
          const response = await service.post('/api/deepAnalysis', formData)
          if (response.data) {
            ElMessage.success('新增成功')
            fetchAnalysisList() // 重新获取列表
          }
        } else {
          // 编辑
          const response = await service.put('/api/deepAnalysis', formData)
          if (response.data) {
            ElMessage.success('更新成功')
            fetchAnalysisList() // 重新获取列表
          }
        }
        dialogVisible.value = false
      } catch (error) {
        console.error('提交深度分析数据失败:', error)
        ElMessage.error('操作失败，请重试')
      } finally {
        loading.value = false
      }
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
  page.value = 1
  currentPage.value = (page.value - 1)*pageSize.value
  fetchAnalysisList()
}

const handleCurrentChange = (newPage: number) => {
  page.value = newPage
 currentPage.value = (page.value - 1)*pageSize.value
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
 