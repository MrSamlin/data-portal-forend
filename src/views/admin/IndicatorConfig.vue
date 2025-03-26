<template>
  <div class="indicator-config">
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <span>指标配置</span>
          <el-button type="primary" @click="handleAddIndicator">新增指标</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入指标名称搜索"
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
      <el-table :data="indicatorList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="metricsCode" label="指标代码" width="120" />
        <el-table-column prop="metricName" label="指标名称" />
        <el-table-column prop="parentId" label="父节点" width="120" />
        <el-table-column prop="createUser" label="创建人" width="120" />
        <el-table-column prop="updateUser" label="更新人" width="120" />
        <el-table-column prop="createDate" label="创建时间" width="180" />
        <el-table-column prop="updateDate" label="更新时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditIndicator(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDeleteIndicator(scope.row)">删除</el-button>
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

    <!-- 新增/编辑指标对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增指标' : '编辑指标'"
      v-model="dialogVisible"
      width="650px"
    >
      <el-form :model="indicatorForm" label-width="100px" :rules="rules" ref="indicatorFormRef">
        <el-form-item label="指标代码" prop="metricsCode">
          <el-input v-model.number="indicatorForm.metricsCode" placeholder="请输入指标代码" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="指标名称" prop="metricName">
          <el-input v-model="indicatorForm.metricName" placeholder="请输入指标名称" />
        </el-form-item>
        <el-form-item label="父节点" prop="parentId">
          <el-input v-model="indicatorForm.parentId" placeholder="请输入父节点" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitIndicatorForm">确定</el-button>
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

// 指标项接口定义
interface IndicatorItem {
  id: number;
  metricsCode: number;
  metricName: string;
  parentId: number;
  createUser: string;
  updateUser: string;
  createDate: string;
  updateDate: string;
}

// 数据加载状态
const loading = ref(false)
// 指标列表
const indicatorList = ref<IndicatorItem[]>([])

// 搜索关键词
const searchKeyword = ref('')
// 对话框可见性
const dialogVisible = ref(false)
// 对话框类型：add-新增，edit-编辑
const dialogType = ref('add')
// 表单引用
const indicatorFormRef = ref<FormInstance>()

// 分页相关
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(0)
const page = ref(1)
const totalPages = ref(1)

// 指标表单数据
const indicatorForm = reactive<IndicatorItem>({
  id: 0,
  metricsCode: 0,
  metricName: '',
  parentId: 0,
  createUser: '',
  updateUser: '',
  createDate: '',
  updateDate: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  metricsCode: [
    { required: true, message: '请输入指标代码', trigger: 'blur' },
    { type: 'number', message: '指标代码必须为数字', trigger: 'blur' }
  ],
  metricName: [
    { required: true, message: '请输入指标名称', trigger: 'blur' },
    { max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }
  ]
})

// 获取指标列表
const fetchIndicatorList = () => {
  loading.value = true
  console.log('page:', page.value);
  service.post('/api/metrics/list', {
    page: page.value,
    currentPage: currentPage.value,
    size: pageSize.value,
    metricName: searchKeyword.value.trim()
  })
    .then(response => {
      console.log('response:', response);
      if (response.data) {
        indicatorList.value = response.data.data || []
        total.value = response.data.total || 0
        pageSize.value = response.data.pageSize || 10
        totalPages.value = response.data.totalPages || 1
      }
    })
    .catch(error => {
      console.error('获取指标列表失败:', error)
      ElMessage.error('获取指标列表失败')
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索指标
const handleSearch = () => {
  page.value = 1
   currentPage.value = (page.value - 1) * pageSize.value
  fetchIndicatorList()
}

// 新增指标
const handleAddIndicator = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 编辑指标
const handleEditIndicator = (row: IndicatorItem) => {
  dialogType.value = 'edit'
  Object.keys(indicatorForm).forEach(key => {
    if (key in row) {
      indicatorForm[key as keyof IndicatorItem] = row[key as keyof IndicatorItem]
    }
  })
  // 确保表单正确渲染后再显示对话框
  nextTick(() => {
    dialogVisible.value = true
  })
}

// 删除指标
const handleDeleteIndicator = (row: IndicatorItem) => {
  ElMessageBox.confirm(
    `确定要删除指标 "${row.metricName}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    loading.value = true
    service.delete(`/api/metrics/${row.id}`)
      .then(() => {
        ElMessage.success('删除成功')
        fetchIndicatorList() // 重新获取列表数据
      })
      .catch(error => {
        console.error('删除指标失败:', error)
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
const submitIndicatorForm = async () => {
  if (!indicatorFormRef.value) return
  
  await indicatorFormRef.value.validate(async (valid) => {
    if (valid) {
      const formData = { ...indicatorForm }
      
      loading.value = true
      try {
        if (dialogType.value === 'add') {
          // 新增
          const response = await service.post('/api/metrics', formData)
          if (response.data) {
            ElMessage.success('新增成功')
            fetchIndicatorList() // 重新获取列表
          }
        } else {
          // 编辑
          const response = await service.put('/api/metrics', formData)
          if (response.data) {
            ElMessage.success('更新成功')
            fetchIndicatorList() // 重新获取列表
          }
        }
        dialogVisible.value = false
      } catch (error) {
        console.error('提交指标数据失败:', error)
        ElMessage.error('操作失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  if (indicatorFormRef.value) {
    indicatorFormRef.value.resetFields()
  }
  indicatorForm.id = 0
  indicatorForm.metricsCode = 0
  indicatorForm.metricName = ''
  indicatorForm.parentId = 0
  indicatorForm.createUser = ''
  indicatorForm.updateUser = ''
  indicatorForm.createDate = ''
  indicatorForm.updateDate = ''
}

// 处理分页
const handleSizeChange = (size: number) => {
  pageSize.value = size
  page.value = 1
  currentPage.value = (page.value - 1) * pageSize.value
  fetchIndicatorList()
}

const handleCurrentChange = (newPage: number) => {
  page.value = newPage
  currentPage.value = (page.value - 1) * pageSize.value
  fetchIndicatorList()
}

// 页面加载时获取指标列表
onMounted(() => {
  fetchIndicatorList()
})
</script>

<style lang="scss" scoped>
.indicator-config {
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

 