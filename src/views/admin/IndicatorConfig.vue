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
        <el-table-column prop="metricId" label="指标ID" width="120" />
        <el-table-column prop="metricCategory" label="指标分类" width="120" />
        <el-table-column prop="metricName" label="指标名称" />
        <el-table-column prop="updateDate" label="更新时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditIndicator(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDeleteIndicator(scope.row)">删除</el-button>
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

    <!-- 新增/编辑指标对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增指标' : '编辑指标'"
      v-model="dialogVisible"
      width="650px"
    >
      <el-form :model="indicatorForm" label-width="100px" :rules="rules" ref="indicatorFormRef">
        <el-form-item label="指标ID" prop="metricId">
          <el-input v-model="indicatorForm.metricId" placeholder="请输入指标ID" />
        </el-form-item>
        <el-form-item label="节点ID" prop="nodeId">
          <el-input v-model="indicatorForm.nodeId" placeholder="请输入节点ID" />
        </el-form-item>
        <el-form-item label="指标分类" prop="metricCategory">
          <el-input v-model="indicatorForm.metricCategory" placeholder="请输入指标分类" />
        </el-form-item>
        <el-form-item label="分类ID" prop="categoryId">
          <el-input v-model="indicatorForm.categoryId" placeholder="请输入分类ID" type="number" />
        </el-form-item>
        <el-form-item label="父级ID" prop="parentId">
          <el-input v-model="indicatorForm.parentId" placeholder="请输入父级ID" type="number" />
        </el-form-item>
        <el-form-item label="指标名称" prop="metricName">
          <el-input v-model="indicatorForm.metricName" placeholder="请输入指标名称" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 数据加载状态
const loading = ref(false)
// 指标列表
const indicatorList = ref([
  {
    id: 1,
    metricId: 'M001',
    nodeId: 'N001',
    metricCategory: '销售指标',
    categoryId: 1,
    parentId: 0,
    metricName: '销售额',
    createUser: 'admin',
    updateUser: 'admin',
    createDate: '2024-01-15 14:30:00',
    updateDate: '2024-01-15 14:30:00'
  }
])

// 搜索关键词
const searchKeyword = ref('')
// 对话框可见性
const dialogVisible = ref(false)
// 对话框类型：add-新增，edit-编辑
const dialogType = ref('add')
// 表单引用
const indicatorFormRef = ref<FormInstance>()

// 分页相关
const total = ref(100)
const pageSize = ref(10)
const currentPage = ref(1)

// 指标表单数据
const indicatorForm = reactive({
  id: 0,
  metricId: '',
  nodeId: '',
  metricCategory: '',
  categoryId: 0,
  parentId: 0,
  metricName: '',
  createUser: '',
  updateUser: '',
  createDate: '',
  updateDate: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  metricId: [
    { required: true, message: '请输入指标ID', trigger: 'blur' },
    { max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }
  ],
  nodeId: [
    { required: true, message: '请输入节点ID', trigger: 'blur' },
    { max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }
  ],
  metricCategory: [
    { required: true, message: '请输入指标分类', trigger: 'blur' },
    { max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }
  ],
  metricName: [
    { required: true, message: '请输入指标名称', trigger: 'blur' },
    { max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }
  ]
})

// 搜索指标
const handleSearch = () => {
  loading.value = true
  // 模拟搜索延迟
  setTimeout(() => {
    if (searchKeyword.value) {
      indicatorList.value = indicatorList.value.filter(item => 
        item.metricName.includes(searchKeyword.value) || 
        item.metricId.includes(searchKeyword.value)
      )
    } else {
      // 重置为原始数据
      fetchIndicatorList()
    }
    loading.value = false
  }, 300)
}

// 获取指标列表
const fetchIndicatorList = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    // 这里应该调用实际的API
    loading.value = false
  }, 300)
}

// 新增指标
const handleAddIndicator = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 编辑指标
const handleEditIndicator = (row: any) => {
  dialogType.value = 'edit'
  Object.keys(indicatorForm).forEach(key => {
    if (key in row) {
      indicatorForm[key] = row[key]
    }
  })
  dialogVisible.value = true
}

// 删除指标
const handleDeleteIndicator = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除指标 "${row.metricName}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟删除操作
    setTimeout(() => {
      indicatorList.value = indicatorList.value.filter(item => item.id !== row.id)
      ElMessage.success('删除成功')
    }, 300)
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const submitIndicatorForm = async () => {
  if (!indicatorFormRef.value) return
  
  await indicatorFormRef.value.validate(async (valid) => {
    if (valid) {
      // 模拟API调用
      setTimeout(() => {
        const now = new Date().toLocaleString()
        if (dialogType.value === 'add') {
          // 新增
          const newIndicator = {
            ...indicatorForm,
            id: indicatorList.value.length + 1,
            createDate: now,
            updateDate: now,
            createUser: 'admin',
            updateUser: 'admin'
          }
          indicatorList.value.unshift(newIndicator)
          ElMessage.success('新增成功')
        } else {
          // 编辑
          const index = indicatorList.value.findIndex(item => item.id === indicatorForm.id)
          if (index !== -1) {
            indicatorList.value[index] = {
              ...indicatorForm,
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
  if (indicatorFormRef.value) {
    indicatorFormRef.value.resetFields()
  }
  indicatorForm.id = 0
  indicatorForm.metricId = ''
  indicatorForm.nodeId = ''
  indicatorForm.metricCategory = ''
  indicatorForm.categoryId = 0
  indicatorForm.parentId = 0
  indicatorForm.metricName = ''
  indicatorForm.createUser = ''
  indicatorForm.updateUser = ''
  indicatorForm.createDate = ''
  indicatorForm.updateDate = ''
}

// 处理分页
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchIndicatorList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
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
  }
}
</style> 