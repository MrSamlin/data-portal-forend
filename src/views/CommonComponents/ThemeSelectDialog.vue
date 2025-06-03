<!-- src/views/CommonComponents/ThemeSelectDialog.vue -->
<template>
  <el-dialog
    title="选择所属主题"
    :model-value="visible"
    @update:model-value="closeDialog"
    width="800px"
    destroy-on-close
    @open="handleDialogOpen"
  >
    <div class="search-area">
      <el-input
        v-model="themeSearchKeyword"
        placeholder="搜索主题名称"
        class="search-input"
        clearable
        @keyup.enter="searchThemesInDialog"
      >
        <template #append>
          <el-button @click="searchThemesInDialog">搜索</el-button>
        </template>
      </el-input>
    </div>

    <div v-if="props.initialThemeName" class="current-selection-indicator">
      <el-alert
        title="当前已选主题 (仅供参考)"
        type="info"
        :closable="false"
        show-icon
      >
         <template #default>
           <span>{{ props.initialThemeName }}</span>
           <el-button
             type="primary"
             size="small"
             plain
             style="margin-left: 10px;"
             @click="findCurrentTheme"
             :disabled="themeLoading"
           >
             查找当前选择
           </el-button>
         </template>
      </el-alert>
    </div>

    <el-table
      :data="themeList"
      style="width: 100%; margin-top: 10px;"
      v-loading="themeLoading"
      highlight-current-row
      @current-change="handleThemeRowChange"
      @row-dblclick="handleThemeRowDoubleClick"
      ref="themeTableRef"
    >
      <el-table-column prop="categoryId" label="ID" width="80" />
      <el-table-column prop="categoryName" label="主题名称" />
      <el-table-column prop="themeCode" label="行业名称" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
    </el-table>

    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="themeTotal"
        v-model:current-page="themePage"
        :page-size="themePageSize"
        @current-change="handleThemePageChange"
      />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="confirmThemeSelection">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue';
import { ElMessage, ElTable } from 'element-plus';
import service from '@/utils/axios';
import { isAxiosError } from 'axios';
import { userToken } from '@/composables/useAuth'; // Assuming useAuth is appropriate

// --- Props ---
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  initialThemeName: { // Receive the currently selected theme name for find feature
      type: String,
      default: ''
  }
});

// --- Emits ---
const emit = defineEmits(['update:visible', 'themeSelected']);

// --- State ---
const themeSearchKeyword = ref('');
const themeList = ref<any[]>([]);
const themeLoading = ref(false);
const themeTotal = ref(0);
const themePage = ref(1);
const themePageSize = ref(10); // Keep consistent with API or make prop
const currentSelectedTheme = ref<any>(null);
const themeTableRef = ref<InstanceType<typeof ElTable>>();

// --- Methods ---
const handleDialogOpen = () => {
    // 重置搜索和分页状态，但保留之前的选择
    themeSearchKeyword.value = '';
    themePage.value = 1;
    
    // 不要立即重置选择
    // currentSelectedTheme.value = null; // 删除这行
    
    // 先获取数据
    fetchThemesForSelect().then(() => {
        // 如果有初始选择值，尝试恢复选择
        if (props.initialThemeName && themeList.value.length > 0) {
            const targetTheme = themeList.value.find(theme => 
                theme.categoryName === props.initialThemeName
            );
            
            if (targetTheme) {
                // 设置当前选中项
                nextTick(() => {
                    currentSelectedTheme.value = targetTheme;
                    if (themeTableRef.value) {
                        themeTableRef.value.setCurrentRow(targetTheme);
                    }
                });
            } else {
                // 如果当前页面没有找到初始选择项，则重置选择
                currentSelectedTheme.value = null;
            }
        } else if (!props.initialThemeName) {
            // 如果没有初始值，则重置选择
            currentSelectedTheme.value = null;
        }
    });
}

const searchThemesInDialog = () => {
  themePage.value = 1;
  fetchThemesForSelect();
};

const handleThemePageChange = (val: number) => {
  themePage.value = val;
  fetchThemesForSelect();
};

const handleThemeRowChange = (currentRow: any) => {
  if (currentRow) {
      currentSelectedTheme.value = currentRow;
  }
};

const handleThemeRowDoubleClick = (row: any) => {
  if (row) {
      currentSelectedTheme.value = row;
      confirmThemeSelection(); // Double click confirms
  }
};

const confirmThemeSelection = () => {
  if (currentSelectedTheme.value) {
    emit('themeSelected', currentSelectedTheme.value); // Emit the selected theme object
    closeDialog();
  } else {
    ElMessage.warning('请选择一个主题');
  }
};

const findCurrentTheme = async () => {
  if (!props.initialThemeName || themeLoading.value) return;

  themeSearchKeyword.value = ''; // Reset search for finding
  themePage.value = 1;          // Start from page 1
  themeLoading.value = true;

  try {
    // Fetch first page (or potentially loop/search API if backend supports it)
    await fetchThemesForSelect();

    const targetTheme = themeList.value.find(theme => theme.categoryName === props.initialThemeName);

    if (targetTheme) {
      ElMessage.success('已找到当前选择的主题');
       nextTick(() => { // Ensure table is rendered
         if (themeTableRef.value) {
            themeTableRef.value.setCurrentRow(targetTheme);
            currentSelectedTheme.value = targetTheme; // Also update selection state
         }
       });
    } else {
      ElMessage.info('当前页未找到该主题，请尝试翻页或搜索');
      // Clear current row selection if not found on current page
       if (themeTableRef.value) {
           themeTableRef.value.setCurrentRow(undefined);
       }
        currentSelectedTheme.value = null;
    }
  } catch (error) {
    console.error('查找主题失败:', error);
    ElMessage.error('查找失败，请重试');
  } finally {
    themeLoading.value = false;
  }
};


// 获取主题列表 (API Call)
const fetchThemesForSelect = async () => {
  themeLoading.value = true;
  try {
    const response = await service.post('/cmfwxrobot/categories/list', {
      page: themePage.value,
      size: themePageSize.value,
      currentPage: (themePage.value - 1) * themePageSize.value, // Adjust if API expects 0-based
      categoryName: themeSearchKeyword.value.trim()
    }, {
      headers: { 'Authentication': userToken.value } // Assuming token is needed
    });

    if (response.data && Array.isArray(response.data.data)) {
      themeList.value = response.data.data;
      themeTotal.value = response.data.total || 0;
      // Reset selection if current selection is not on the new page
        if (currentSelectedTheme.value && !themeList.value.some(t => t.categoryId === currentSelectedTheme.value.categoryId)) {
             currentSelectedTheme.value = null;
              nextTick(() => { // Ensure table ref is available
                  if (themeTableRef.value) {
                      themeTableRef.value.setCurrentRow(undefined);
                  }
              });
         }

    } else {
      themeList.value = [];
      themeTotal.value = 0;
      currentSelectedTheme.value = null; // Clear selection if no data
    }
  } catch (error) {
    console.error('获取主题列表失败:', error);
    ElMessage.error('获取主题列表失败');
    if (isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
    themeList.value = [];
    themeTotal.value = 0;
    currentSelectedTheme.value = null;
  } finally {
    themeLoading.value = false;
  }
};


const closeDialog = () => {
    emit('update:visible', false);
}

</script>

<style lang="scss" scoped>
/* Copy relevant styles from IndicatorConfig.vue for search area, pagination, current selection */
.search-area {
  margin-bottom: 20px;
  .search-input {
    width: 300px; /* Adjust as needed */
     :deep(.el-input-group__append) {
       .el-button { /* Use parent styles or define here */
         background-color: #ff8c00; border-color: #ff8c00; color: white; padding: 8px 15px;
         &:hover { background-color: #ff9a22; border-color: #ff9a22; }
         &:active { background-color: #ff7f00; border-color: #ff7f00; }
       }
     }
  }
}

.current-selection-indicator {
  margin-bottom: 15px;
  :deep(.el-alert__content) { display: flex; align-items: center; justify-content: space-between; }
  :deep(.el-alert__title) { font-size: 13px; font-weight: normal; margin-right: 10px; } /* Adjust title style */
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>