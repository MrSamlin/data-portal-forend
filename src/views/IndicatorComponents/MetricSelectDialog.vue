<template>
  <el-dialog
    title="选择指标"
    :model-value="visible"
    @update:model-value="closeDialog"
    width="800px"
    destroy-on-close
    @open="handleDialogOpen"
  >
    <div class="search-area">
      <el-input
        v-model="metricSearchKeyword"
        placeholder="搜索指标名称或代码"
        class="search-input"
        clearable
        @keyup.enter="searchMetricsInDialog"
      >
        <template #append>
          <el-button @click="searchMetricsInDialog">搜索</el-button>
        </template>
      </el-input>
    </div>

     <!-- Optional: Indicator for initial selection (if needed for context) -->
     <div v-if="props.initialMetricCode" class="current-selection-indicator">
       <el-alert
         title="当前指标代码"
         type="info" :closable="false" show-icon>
         <template #default>
           <span>{{ props.initialMetricCode }}</span>
           <!-- Maybe add a find button if useful -->
         </template>
       </el-alert>
     </div>

    <el-table
      :data="metricList"
      style="width: 100%; margin-top: 10px;"
      v-loading="metricLoading"
      highlight-current-row
      @current-change="handleMetricRowChange"
      @row-dblclick="handleMetricRowDoubleClick"
      ref="metricTableRef"
    >
      <el-table-column prop="id" label="ID"   />
      <el-table-column prop="metricsCode" label="指标代码"   />
      <el-table-column prop="metricName" label="指标名称" />
      <el-table-column prop="categoryName" label="所属主题"  />
      <!-- Add other relevant columns if needed -->
    </el-table>

    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="metricTotal"
        v-model:current-page="metricPage"
        :page-size="metricPageSize"
        @current-change="handleMetricPageChange"
      />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="confirmMetricSelection">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage, ElTable } from 'element-plus';
import service from '@/utils/axios';
import { isAxiosError } from 'axios';
import { userToken } from '@/composables/useAuth'; // Adjust path if necessary

// --- Props ---
const props = defineProps({
  visible: { type: Boolean, default: false },
  initialMetricCode: { type: String, default: '' } // Pass initial code if needed
});

// --- Emits ---
const emit = defineEmits(['update:visible', 'metricSelected']); // Emit selected metric

// --- State ---
const metricSearchKeyword = ref('');
const metricList = ref<any[]>([]); // Use specific IndicatorItem type if available
const metricLoading = ref(false);
const metricTotal = ref(0);
const metricPage = ref(1);
const metricPageSize = ref(10);
const currentSelectedMetric = ref<any>(null);
const metricTableRef = ref<InstanceType<typeof ElTable>>();

// --- Methods ---

const handleDialogOpen = () => {
  metricSearchKeyword.value = '';
  metricPage.value = 1;
  currentSelectedMetric.value = null;
  fetchMetricsForSelect(); // Fetch initial list
};

const searchMetricsInDialog = () => {
  metricPage.value = 1;
  fetchMetricsForSelect();
};

const handleMetricPageChange = (val: number) => {
  metricPage.value = val;
  fetchMetricsForSelect();
};

const handleMetricRowChange = (currentRow: any) => {
  console.log('handleMetricRowChange',currentRow);
  if (currentRow) {
    currentSelectedMetric.value = currentRow;
  }
};

const handleMetricRowDoubleClick = (row: any) => {
  console.log('handleMetricRowDoubleClick',row);
  if (row) {
    currentSelectedMetric.value = row;
    confirmMetricSelection(); // Double click confirms
  }
};

const confirmMetricSelection = () => {
  console.log('confirmMetricSelection',currentSelectedMetric.value);
  if (currentSelectedMetric.value) {
    emit('metricSelected', currentSelectedMetric.value); // Emit the whole selected object
    closeDialog();
  } else {
    ElMessage.warning('请选择一个指标');
  }
};

// Fetch metrics list for selection dialog
const fetchMetricsForSelect = async () => {

  metricLoading.value = true;
    console.log('metricLoading.value',metricLoading.value);
  const apiCurrentPage = (metricPage.value - 1) * metricPageSize.value;
  try {
    // Use the API endpoint for listing metrics
    const response = await service.post('/cmfwxrobot/metrics/list', {
      page: metricPage.value,
      currentPage: apiCurrentPage, // Adjust param name if API needs it
      size: metricPageSize.value,
      metricName: metricSearchKeyword.value.trim(), // Allow searching by name
      // metricsCode: metricSearchKeyword.value.trim() // Or code, or both if API supports
    }, {
      headers: { 'Authentication': userToken.value }
    });

    if (response.data && Array.isArray(response.data.data)) {
      metricList.value = response.data.data;
      metricTotal.value = response.data.total || 0;
      // Optional: Highlight initial value if needed and found on current page
      // ... highlight logic ...
    } else {
      metricList.value = []; metricTotal.value = 0;
    }
  } catch (error) {
    console.error('获取指标列表失败:', error); ElMessage.error('获取指标列表失败');
    if (isAxiosError(error)) { console.error('Axios error details:', error.response?.data); }
    metricList.value = []; metricTotal.value = 0;
  } finally {
    metricLoading.value = false;
  }
};

const closeDialog = () => {
  emit('update:visible', false);
};

</script>

<style lang="scss" scoped>
/* Reuse styles or define specific ones */
.search-area {
  margin-bottom: 20px;
  .search-input {
    width: 300px;
     :deep(.el-input-group__append) {
       .el-button {
         background-color: #ff8c00; border-color: #ff8c00; color: white; padding: 8px 15px;
         &:hover { background-color: #ff9a22; border-color: #ff9a22; }
         &:active { background-color: #ff7f00; border-color: #ff7f00; }
       }
     }
  }
}
.current-selection-indicator { margin-bottom: 15px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: center; }
</style>