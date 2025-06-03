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
         <!-- Keep el-table-column definitions -->
         <el-table-column prop="categoryName" label="所属主题" />
         <el-table-column prop="analysisName" label="分析维度" />
         <el-table-column prop="jumpUrl" label="跳转地址" show-overflow-tooltip />
         <el-table-column prop="viewCount" label="浏览次数" width="100" />
         <el-table-column prop="status" label="是否可见" width="100">
           <template #default="scope">
             <el-tag :type="Number(scope.row.status) === 1 ? 'success' : 'info'">
               {{ Number(scope.row.status) === 1 ? '可见' : '隐藏' }}
             </el-tag>
           </template>
         </el-table-column>
         <el-table-column prop="publishDate" label="发布日期" width="180" :formatter="formatDate" />
         <el-table-column label="操作" width="200">
           <template #default="scope">
             <el-button type="primary" size="small" @click="handleEditAnalysis(scope.row)">编辑</el-button>
             <el-button type="danger" size="small" @click="handleDeleteAnalysis(scope.row)">删除</el-button>
           </template>
         </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
         <!-- Keep pagination -->
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
    <AnalysisFormDialog
      v-model:visible="dialogVisible"
      :mode="dialogType"
      :analysis-data="currentAnalysisData"
      @submitted="handleDialogSubmitted"
    />

  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import service from '@/utils/axios';
import { isAxiosError } from 'axios';
import { userToken } from '@/composables/useAuth'; // Keep if needed

// Import the new dialog component
import AnalysisFormDialog from '../AnalysisComponents/AnalysisFormDialog.vue'; // Adjust path if needed

// --- 主列表状态 ---
const loading = ref(false);
const analysisList = ref<any[]>([]); // Use specific type
const searchKeyword = ref('');
const total = ref(0);
const pageSize = ref(10);
const page = ref(1);
const totalPages = ref(1);
// const currentPage = ref(0); // Keep if API needs it, otherwise remove

// --- 对话框状态 ---
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const currentAnalysisData = ref<any>(null);

// --- 主列表方法 ---

const handleSearch = () => {
  page.value = 1;
  // currentPage.value = 0; // Update if needed
  fetchAnalysisList();
};

const fetchAnalysisList = async () => {
  loading.value = true;
  const apiCurrentPage = (page.value - 1) * pageSize.value; // Recalculate here or adjust state management
  try {
    const response = await service.post('/cmfwxrobot/deepAnalysis/list', {
      page: page.value,
      currentPage: apiCurrentPage, // Ensure correct parameter name
      size: pageSize.value,
      analysisName: searchKeyword.value.trim()
    }, { headers: { 'Authentication': userToken.value } });

    if (response.data) {
      analysisList.value = (response.data.data || []).map((item: any) => ({
        ...item,
        status: Number(item.status) // Ensure status is number for tag
        // Map other fields if necessary
      }));
      total.value = response.data.total || 0;
      totalPages.value = response.data.totalPages || 1;
    } else {
      analysisList.value = []; total.value = 0; totalPages.value = 1;
    }
  } catch (error) {
    console.error('获取深度分析列表失败:', error); ElMessage.error('获取深度分析列表失败');
    if (isAxiosError(error)) { console.error('Axios error details:', error.response?.data); }
    analysisList.value = []; total.value = 0; totalPages.value = 1;
  } finally { loading.value = false; }
};

const handleAddAnalysis = () => {
  dialogType.value = 'add';
  currentAnalysisData.value = null;
  dialogVisible.value = true;
};

const handleEditAnalysis = (row: any) => {
  dialogType.value = 'edit';
  currentAnalysisData.value = { ...row }; // Pass copy
  dialogVisible.value = true;
};

const handleDeleteAnalysis = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除分析 "${row.analysisName}" 吗？`,
    '警告', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    loading.value = true;
    try {
      await service.delete(`/cmfwxrobot/deepAnalysis/${row.id}`, {
          headers: { 'Authentication': userToken.value }
      });
      ElMessage.success('删除成功');
      if (analysisList.value.length === 1 && page.value > 1) { page.value--; }
      fetchAnalysisList();
    } catch (error) { /* ... error handling ... */ }
    finally { loading.value = false; }
  }).catch(() => {});
};

 

const handleDialogSubmitted = () => {
  fetchAnalysisList();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size; page.value = 1; fetchAnalysisList();
};

const handleCurrentChange = (newPage: number) => {
  page.value = newPage; fetchAnalysisList();
};

const formatDate = (row: any, column: any, cellValue: string) => {
  if (!cellValue) return '';
  try { return cellValue.replace('T', ' ').substring(0, 19); }
  catch (e) { return cellValue; }
};

onMounted(() => { fetchAnalysisList(); });

</script>

<style lang="scss" scoped>
/* Keep original styles for main page structure */
.analysis-config {
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
}
</style>