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
          placeholder="请输入关键词搜索分析"
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
        <el-table-column prop="analysisId" label="ID" width="80" />
        <el-table-column prop="analysisName" label="分析名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="dimension" label="分析维度" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
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
        <el-form-item label="分析名称" prop="analysisName">
          <el-input v-model="analysisForm.analysisName" placeholder="请输入分析名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="analysisForm.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="分析维度" prop="dimension">
          <el-select v-model="analysisForm.dimension" placeholder="请选择分析维度">
            <el-option label="销售趋势" value="sales" />
            <el-option label="用户画像" value="user" />
            <el-option label="品类分析" value="category" />
            <el-option label="区域分布" value="region" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据来源" prop="dataSource">
          <el-input v-model="analysisForm.dataSource" placeholder="请输入数据来源" />
        </el-form-item>
        <el-form-item label="关联指标" prop="relatedIndicators">
          <el-select v-model="analysisForm.relatedIndicators" multiple placeholder="请选择关联指标">
            <el-option label="销售额" value="sales" />
            <el-option label="销售量" value="volume" />
            <el-option label="客户数" value="customers" />
            <el-option label="客单价" value="price" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="analysisForm.status" active-value="active" inactive-value="draft" />
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
    analysisId: '1',
    analysisName: '销售趋势分析',
    description: '分析产品销售在不同时间段的趋势变化',
    dimension: '销售趋势',
    updateTime: '2023-12-15 14:30:00',
    status: 'active',
    dataSource: '销售系统',
    relatedIndicators: ['sales', 'volume']
  },
  {
    analysisId: '2',
    analysisName: '用户画像分析',
    description: '分析用户的年龄、性别、地域等特征',
    dimension: '用户画像',
    updateTime: '2023-12-10 09:15:00',
    status: 'draft',
    dataSource: 'CRM系统',
    relatedIndicators: ['customers']
  },
  {
    analysisId: '3',
    analysisName: '区域销售分布',
    description: '分析不同区域的销售情况',
    dimension: '区域分布',
    updateTime: '2023-12-08 16:45:00',
    status: 'active',
    dataSource: '销售系统',
    relatedIndicators: ['sales', 'customers', 'price']
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
  analysisId: '',
  analysisName: '',
  description: '',
  dimension: '',
  dataSource: '',
  relatedIndicators: [],
  status: 'draft'
})

// 表单验证规则
const rules = reactive<FormRules>({
  analysisName: [
    { required: true, message: '请输入分析名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ],
  dimension: [
    { required: true, message: '请选择分析维度', trigger: 'change' }
  ]
})

// 搜索分析
const handleSearch = () => {
  loading.value = true
  // 模拟搜索延迟
  setTimeout(() => {
    if (searchKeyword.value) {
      analysisList.value = analysisList.value.filter(item => 
        item.analysisName.includes(searchKeyword.value) || 
        item.description.includes(searchKeyword.value)
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
    `确定要删除分析 "${row.analysisName}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟删除操作
    setTimeout(() => {
      analysisList.value = analysisList.value.filter(item => item.analysisId !== row.analysisId)
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
        if (dialogType.value === 'add') {
          // 新增
          const newAnalysis = {
            ...analysisForm,
            analysisId: String(analysisList.value.length + 1),
            updateTime: new Date().toLocaleString()
          }
          analysisList.value.unshift(newAnalysis)
          ElMessage.success('新增成功')
        } else {
          // 编辑
          const index = analysisList.value.findIndex(item => item.analysisId === analysisForm.analysisId)
          if (index !== -1) {
            analysisList.value[index] = {
              ...analysisForm,
              updateTime: new Date().toLocaleString()
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
  analysisForm.analysisId = ''
  analysisForm.analysisName = ''
  analysisForm.description = ''
  analysisForm.dimension = ''
  analysisForm.dataSource = ''
  analysisForm.relatedIndicators = []
  analysisForm.status = 'draft'
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
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style> 