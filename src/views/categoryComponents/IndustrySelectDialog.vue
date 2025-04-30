<template>
  <el-dialog
    title="选择行业"
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    width="800px"
    @open="handleDialogOpen"
    destroy-on-close
  >
    <div class="search-area">
      <el-input
        v-model="industrySearchKeyword"
        placeholder="搜索行业名称"
        class="search-input"
        clearable
        @keyup.enter="searchIndustries"
      >
        <template #append>
          <el-button @click="searchIndustries">搜索</el-button>
        </template>
      </el-input>
    </div>

    <el-table
      ref="industryTableRef"
      :data="industryList"
      style="width: 100%"
      v-loading="industryLoading"
      row-key="id"
      reserve-selection
      @selection-change="handleIndustrySelectionChange"
    >
      <el-table-column type="selection" width="55" :reserve-selection="true" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="行业名称" />
      <el-table-column prop="value" label="行业代码" />
    </el-table>


    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="industryTotal"
        :current-page="industryPage"
        :page-size="industryPageSize"
        @current-change="handleIndustryPageChange"
      />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">取消</el-button>
        <el-button type="primary" @click="confirmIndustrySelection">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, nextTick } from 'vue';
import { ElMessage, ElTable } from 'element-plus';
import service from '@/utils/axios'; // 确保路径正确
import { isAxiosError } from 'axios';

// --- Props and Emits ---
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  // 用于预选，接收逗号分隔的行业代码字符串
  initialSelectionCodes: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:visible', 'confirm']);

// --- State ---
const industrySearchKeyword = ref('');
const industryList = ref<any[]>([]);
const industryLoading = ref(false);
const industryTotal = ref(0);
const industryPageSize = ref(10);
const industryPage = ref(1);
const industryTableRef = ref<InstanceType<typeof ElTable>>();
// 使用 Set 存储所有选中的行业代码 (跨分页)
const selectedCodesSet = ref(new Set<string>());
     
// 添加标志位
const isRestoringSelection = ref(false);
// --- Methods ---
const handleDialogOpen = async () => {
  // 1. 初始化 selectedCodesSet
  selectedCodesSet.value.clear();
  if (props.initialSelectionCodes) {
    props.initialSelectionCodes.split(',').forEach(code => {
      if (code) selectedCodesSet.value.add(code);
    });
  }
  // 2. 重置搜索和分页，清空列表
  industryPage.value = 1;
  industrySearchKeyword.value = '';
  industryList.value = []; // 清空列表很重要，避免旧数据干扰
  // 3. 触发第一次搜索并应用视觉选择
  await searchIndustries();
};

const searchIndustries = async () => {
  industryLoading.value = true;
  const apiCurrentPage = (industryPage.value - 1) * industryPageSize.value;

  try {
    const response = await service.post('/dataPortal/industryMapper/list', {
      page: industryPage.value,
      size: industryPageSize.value,
      currentPage: apiCurrentPage,
      value: industrySearchKeyword.value.trim(),
    }, { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } });

    console.log('Industry API Response:', response.data);

    if (response.data && Array.isArray(response.data.data)) {
      industryList.value = response.data.data || [];
      industryTotal.value = response.data.total || 0;

      // 确保 DOM 更新
      await nextTick();


      // 3. 同步当前页的视觉勾选状态
      // 使用 setTimeout 稍微延迟，确保表格渲染完成
      setTimeout(() => {
        if (industryTableRef.value && industryList.value.length > 0) {

              // 设置标志位，开始恢复选择
            isRestoringSelection.value = true;
          industryList.value.forEach(row => {
            const shouldBeSelected = selectedCodesSet.value.has(row.value);
            try {
              // 直接根据 Set 中的状态设置勾选
              // programatic toggleRowSelection 不应触发 selection-change
              industryTableRef.value!.toggleRowSelection(row, shouldBeSelected);
            } catch (e) {
              console.error("Error toggling row selection during visual sync:", e, row);
            }
          });
            // 恢复选择完成
           isRestoringSelection.value = false;
        } else {
          console.log('Table ref not available or industry list empty during visual sync.');
        }
      }, 50); // 50ms 延迟

    } else {
      industryList.value = [];
      industryTotal.value = 0;
      console.warn('获取行业列表响应为空或数据结构错误');
    }
  } catch (error) {
    console.error('获取行业列表失败:', error);
    ElMessage.error('获取行业列表失败');
    if (isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
    industryList.value = [];
    industryTotal.value = 0;
  } finally {
    industryLoading.value = false;
  }
};

const handleIndustryPageChange = (newPage: number) => {
  industryPage.value = newPage;
  searchIndustries(); // 搜索新页并同步视觉勾选
};

// selection-change 在 reserve-selection 模式下会返回所有选中的行
const handleIndustrySelectionChange = (selection: any[]) => {
  console.log('Table selection changed (total selection):', selection.map(r => r.value));
  // 如果是正在恢复选择状态，则完全忽略此事件
  if (isRestoringSelection.value) {
    return;
  }
  // 先获取当前页面所有行的值
  const currentPageValues = new Set(industryList.value.map(row => row.value));
  
  // 从 selectedCodesSet 中移除当前页面的所有行
  currentPageValues.forEach(value => {
    selectedCodesSet.value.delete(value);
  });
  
  // 然后添加当前页面中被选中的行
  selection.forEach(row => {
    if (row && row.value) {
      selectedCodesSet.value.add(row.value);
    }
  });
  console.log('Updated selectedCodesSet:', selectedCodesSet.value);
};

// 5. 确认时使用 Set
const confirmIndustrySelection = () => {
  const codesArray = Array.from(selectedCodesSet.value);
  if (codesArray.length === 0) {
    ElMessage.warning('请至少选择一个行业');
    return;
  }
  const selectedCodesString = codesArray.join(',');
  emit('confirm', selectedCodesString);
  emit('update:visible', false);
};

</script>

<style lang="scss" scoped>
/* 保持或调整原有样式 */
.search-area {
  margin-bottom: 20px;
  .search-input {
    width: 300px; // 根据需要调整
     :deep(.el-input-group__append) { /* 保持按钮样式 */
        .el-button {
          background-color: #ff8c00; border-color: #ff8c00; color: white; padding: 8px 20px;
          &:hover { background-color: #ff9a22; border-color: #ff9a22; }
          &:active { background-color: #ff7f00; border-color: #ff7f00; }
        }
      }
  }
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 表格紧凑样式 (可选) */
:deep(.el-table th.el-table__cell),
:deep(.el-table td.el-table__cell) {
  padding: 6px 0;
}
</style> 