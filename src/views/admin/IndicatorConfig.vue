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
          placeholder="请输入关键词搜索指标"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <!-- 过滤器 -->
      <div class="filter-area">
        <el-select v-model="categoryFilter" placeholder="指标分类" clearable>
          <el-option label="销售指标" value="sales" />
          <el-option label="运营指标" value="operation" />
          <el-option label="财务指标" value="finance" />
          <el-option label="客户指标" value="customer" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态" clearable>
          <el-option label="已启用" value="enabled" />
          <el-option label="已禁用" value="disabled" />
        </el-select>
        <el-button @click="applyFilters">筛选</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>

      <!-- 数据表格 -->
      <el-table :data="indicatorList" style="width: 100%" v-loading="loading">
        <el-table-column prop="indicatorId" label="ID" width="80" />
        <el-table-column prop="indicatorName" label="指标名称" />
        <el-table-column prop="category" label="分类">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.category)">
              {{ getCategoryName(scope.row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="dataSource" label="数据来源" show-overflow-tooltip />
        <el-table-column prop="frequency" label="更新频率" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="'enabled'"
              :inactive-value="'disabled'"
              @change="(val) => handleStatusChange(scope.row, val)"
            />
          </template>
        </el-table-column>
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
        <el-form-item label="指标名称" prop="indicatorName">
          <el-input v-model="indicatorForm.indicatorName" placeholder="请输入指标名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="indicatorForm.category" placeholder="请选择分类">
            <el-option label="销售指标" value="sales" />
            <el-option label="运营指标" value="operation" />
            <el-option label="财务指标" value="finance" />
            <el-option label="客户指标" value="customer" />
          </el-select>
        </el-form-item>
        <el-form-item label="指标代码" prop="code">
          <el-input v-model="indicatorForm.code" placeholder="请输入指标代码" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="indicatorForm.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="指标单位" prop="unit">
          <el-input v-model="indicatorForm.unit" placeholder="请输入指标单位" />
        </el-form-item>
        <el-form-item label="数据来源" prop="dataSource">
          <el-input v-model="indicatorForm.dataSource" placeholder="请输入数据来源" />
        </el-form-item>
        <el-form-item label="更新频率" prop="frequency">
          <el-select v-model="indicatorForm.frequency" placeholder="请选择更新频率">
            <el-option label="实时" value="real-time" />
            <el-option label="每日" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
            <el-option label="每季度" value="quarterly" />
            <el-option label="每年" value="yearly" />
          </el-select>
        </el-form-item>
        <el-form-item label="计算逻辑" prop="calculation">
          <el-input v-model="indicatorForm.calculation" type="textarea" placeholder="请输入计算逻辑" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="indicatorForm.status" active-value="enabled" inactive-value="disabled" />
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
    indicatorId: '1',
    indicatorName: '销售额',
    category: 'sales',
    code: 'SALES_AMOUNT',
    description: '产品销售总金额',
    unit: '元',
    dataSource: '销售系统',
    frequency: '每日',
    calculation: '所有订单金额的总和',
    status: 'enabled'
  },
  {
    indicatorId: '2',
    indicatorName: '客单价',
    category: 'sales',
    code: 'CUSTOMER_PRICE',
    description: '平均每位客户的消费金额',
    unit: '元',
    dataSource: '销售系统',
    frequency: '每日',
    calculation: '销售总额 / 客户数量',
    status: 'enabled'
  },
  {
    indicatorId: '3',
    indicatorName: '新增用户数',
    category: 'customer',
    code: 'NEW_CUSTOMERS',
    description: '新注册的用户数量',
    unit: '人',
    dataSource: '用户系统',
    frequency: '每日',
    calculation: '当日新注册用户数',
    status: 'enabled'
  },
  {
    indicatorId: '4',
    indicatorName: '利润率',
    category: 'finance',
    code: 'PROFIT_RATE',
    description: '净利润占收入的百分比',
    unit: '%',
    dataSource: '财务系统',
    frequency: '每月',
    calculation: '(净利润 / 销售收入) * 100%',
    status: 'disabled'
  },
  {
    indicatorId: '5',
    indicatorName: '页面访问量',
    category: 'operation',
    code: 'PAGE_VIEWS',
    description: '网站或应用的页面访问总量',
    unit: '次',
    dataSource: '日志系统',
    frequency: '实时',
    calculation: '页面加载次数总和',
    status: 'enabled'
  }
])

// 搜索关键词
const searchKeyword = ref('')
// 过滤器
const categoryFilter = ref('')
const statusFilter = ref('')
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
  indicatorId: '',
  indicatorName: '',
  category: '',
  code: '',
  description: '',
  unit: '',
  dataSource: '',
  frequency: '',
  calculation: '',
  status: 'enabled'
})

// 表单验证规则
const rules = reactive<FormRules>({
  indicatorName: [
    { required: true, message: '请输入指标名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  code: [
    { required: true, message: '请输入指标代码', trigger: 'blur' }
  ],
  frequency: [
    { required: true, message: '请选择更新频率', trigger: 'change' }
  ]
})

// 获取标签类型
const getTagType = (category: string) => {
  const types = {
    sales: 'success',
    operation: 'info',
    finance: 'warning',
    customer: 'danger'
  }
  return types[category as keyof typeof types] || 'info'
}

// 获取分类名称
const getCategoryName = (category: string) => {
  const names = {
    sales: '销售指标',
    operation: '运营指标',
    finance: '财务指标',
    customer: '客户指标'
  }
  return names[category as keyof typeof names] || category
}

// 状态变更处理
const handleStatusChange = (row: any, status: string) => {
  ElMessage.success(`指标 "${row.indicatorName}" 状态已${status === 'enabled' ? '启用' : '禁用'}`)
}

// 应用过滤器
const applyFilters = () => {
  loading.value = true
  // 模拟筛选
  setTimeout(() => {
    const originalList = [
      // 这里应该是从API获取的完整列表
      ...indicatorList.value
    ]
    
    let filteredList = originalList
    
    if (categoryFilter.value) {
      filteredList = filteredList.filter(item => item.category === categoryFilter.value)
    }
    
    if (statusFilter.value) {
      filteredList = filteredList.filter(item => item.status === statusFilter.value)
    }
    
    indicatorList.value = filteredList
    loading.value = false
  }, 300)
}

// 重置过滤器
const resetFilters = () => {
  categoryFilter.value = ''
  statusFilter.value = ''
  fetchIndicatorList()
}

// 搜索指标
const handleSearch = () => {
  loading.value = true
  // 模拟搜索延迟
  setTimeout(() => {
    if (searchKeyword.value) {
      indicatorList.value = indicatorList.value.filter(item => 
        item.indicatorName.includes(searchKeyword.value) || 
        item.description.includes(searchKeyword.value) ||
        item.code.includes(searchKeyword.value)
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
    `确定要删除指标 "${row.indicatorName}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟删除操作
    setTimeout(() => {
      indicatorList.value = indicatorList.value.filter(item => item.indicatorId !== row.indicatorId)
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
        if (dialogType.value === 'add') {
          // 新增
          const newIndicator = {
            ...indicatorForm,
            indicatorId: String(indicatorList.value.length + 1)
          }
          indicatorList.value.unshift(newIndicator)
          ElMessage.success('新增成功')
        } else {
          // 编辑
          const index = indicatorList.value.findIndex(item => item.indicatorId === indicatorForm.indicatorId)
          if (index !== -1) {
            indicatorList.value[index] = { ...indicatorForm }
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
  indicatorForm.indicatorId = ''
  indicatorForm.indicatorName = ''
  indicatorForm.category = ''
  indicatorForm.code = ''
  indicatorForm.description = ''
  indicatorForm.unit = ''
  indicatorForm.dataSource = ''
  indicatorForm.frequency = ''
  indicatorForm.calculation = ''
  indicatorForm.status = 'enabled'
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
    }
  }
  
  .filter-area {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    
    .el-select {
      width: 150px;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style> 