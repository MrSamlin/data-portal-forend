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
        <el-table-column prop="categoryName" label="所属主题" width="150" />
        <el-table-column prop="metricsCode" label="指标代码" width="120" />
        <el-table-column prop="metricName" label="指标名称" />
        <el-table-column prop="createDate" label="创建时间" width="180" :formatter="formatDate" />
        <el-table-column prop="updateDate" label="更新时间" width="180" :formatter="formatDate" />
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
            :page-size="pageSize"
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
    <IndicatorFormDialog
      v-model:visible="dialogVisible"
      :mode="dialogType"
      :indicator-data="currentIndicatorData"
      @submitted="handleDialogSubmitted"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import service from '@/utils/axios';
import { isAxiosError } from 'axios';
import { userToken } from '@/composables/useAuth'; // Keep if needed for main list/delete API calls

// Import the new dialog component
import IndicatorFormDialog from '../IndicatorComponents/IndicatorFormDialog.vue';

// --- 主列表状态 ---
const loading = ref(false);
const indicatorList = ref<any[]>([]); // Use a specific type if available
const searchKeyword = ref('');
const total = ref(0);
const pageSize = ref(10);
const page = ref(1);
const totalPages = ref(1);

// --- 对话框状态 ---
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const currentIndicatorData = ref<any>(null); // Data to pass for editing


// --- 主列表方法 ---

const fetchIndicatorList = async () => {
  loading.value = true;
  const apiCurrentPage = (page.value - 1) * pageSize.value; // Calculate 0-based page for API if needed
  try {
    const response = await service.post('/dataPortal/metrics/list', {
      page: page.value,
      currentPage: apiCurrentPage, // Adjust param name if needed
      size: pageSize.value,
      metricName: searchKeyword.value.trim()
    }, {
      headers: { 'Authentication': userToken.value }
    });

    if (response.data) {
      indicatorList.value = response.data.data || [];
      total.value = response.data.total || 0;
      totalPages.value = response.data.totalPages || 1;
    } else {
      indicatorList.value = [];
      total.value = 0;
      totalPages.value = 1;
    }
  } catch (error) {
    console.error('获取指标列表失败:', error);
    ElMessage.error('获取指标列表失败');
    if (isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
    indicatorList.value = [];
    total.value = 0;
    totalPages.value = 1;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  page.value = 1;
  fetchIndicatorList();
};

const handleAddIndicator = () => {
  dialogType.value = 'add';
  currentIndicatorData.value = null; // Clear data for add mode
  dialogVisible.value = true;
};

const handleEditIndicator = (row: any) => {
  dialogType.value = 'edit';
  currentIndicatorData.value = { ...row }; // Pass current row data
  dialogVisible.value = true;
};

const handleDeleteIndicator = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除指标 "${row.metricName}" 吗？`,
    '警告', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    loading.value = true; // Consider a separate loading state for delete?
    try {
      await service.delete(`/dataPortal/metrics/${row.id}`, {
        headers: { 'Authentication': userToken.value }
      });
      ElMessage.success('删除成功');
      // Adjust page if last item on page deleted
      if (indicatorList.value.length === 1 && page.value > 1) {
        page.value--;
      }
      fetchIndicatorList(); // Refresh list
    } catch (error) {
      console.error('删除指标失败:', error);
      ElMessage.error('删除失败，请重试');
      if (isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data);
      }
    } finally {
      loading.value = false;
    }
  }).catch(() => {});
};

// 处理对话框提交成功事件
const handleDialogSubmitted = () => {
  fetchIndicatorList(); // Refresh the list when dialog submits successfully
};

// 处理分页
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  page.value = 1;
  fetchIndicatorList();
};

const handleCurrentChange = (newPage: number) => {
  page.value = newPage;
  fetchIndicatorList();
};

// 日期格式化
const formatDate = (row: any, column: any, cellValue: string, index: number) => {
  if (!cellValue) return '';
  try {
    return cellValue.replace('T', ' ').substring(0, 19);
  } catch (e) {
    return cellValue;
  }
};

// 页面加载
onMounted(() => {
  fetchIndicatorList();
});
</script>

<style lang="scss" scoped>
/* Keep original styles for the main page structure (card, search, table, pagination) */
.indicator-config {
  .operation-card { /* ... */ }
  .search-area {
      /* ... existing search styles ... */
       .search-input {
           width: 400px;
            :deep(.el-input-group__append) {
                .el-button {
                   background-color: #ff8c00; border-color: #ff8c00; color: white; padding: 8px 20px;
                   &:hover { background-color: #ff9a22; border-color: #ff9a22; }
                   &:active { background-color: #ff7f00; border-color: #ff7f00; }
                 }
            }
       }
   }
  .pagination-container { /* ... */ }

  /* Table styles */
   :deep(.el-table th.el-table__cell),
   :deep(.el-table td.el-table__cell) {
     padding: 6px 0;
   }
}


</style>