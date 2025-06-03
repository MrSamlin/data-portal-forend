<!-- src/views/IndicatorComponents/IndicatorFormDialog.vue -->
<template>
  <el-dialog
    :title="mode === 'add' ? '新增指标' : '编辑指标'"
    :model-value="visible"
    @update:model-value="closeDialog"
    width="650px"
    @close="resetFormOnClose"
  >
    <el-form :model="indicatorForm" label-width="100px" :rules="rules" ref="indicatorFormRef">
      <!-- 所属主题 -->
      <el-form-item label="所属主题" prop="categoryName">
        <div class="theme-code-input">
          <el-input
            v-model="selectedThemeNameDisplay"
            placeholder="请选择所属主题"
            readonly
          />
          <el-button type="primary" style="margin-left: 10px;" @click="openThemeSelect">
            选择主题
          </el-button>
        </div>
        
      </el-form-item>

      <!-- 添加行业代码字段 -->
      <el-form-item label="行业代码" prop="themeCode"  v-if="false">
        <el-input
          v-model="indicatorForm.themeCode"
          placeholder="选择主题后自动填充"
          readonly
        />
      </el-form-item>
      <!-- 指标代码 -->
      <el-form-item label="指标代码" prop="metricsCode">
        <!-- Changed: Input readonly, add select button -->
        <div class="metric-code-input">
          <el-input
            v-model="indicatorForm.metricsCode"
            placeholder="请选择或输入指标代码"
             readonly  
          />
          <!-- Hide select button in edit mode -->
          <el-button
            type="primary"
            style="margin-left: 10px;"
            @click="openMetricTreeSelect">
            选择代码 (树) 
          </el-button>
        </div>
      </el-form-item>
       <el-form-item label="指标类型" prop="metricType">
        <el-input v-model="indicatorForm.metricType"   placeholder="请输入指标类型" />
      </el-form-item>
      <!-- 指标 -->
      <el-form-item label="指标" prop="metricName">
        <el-input v-model="indicatorForm.metricName"   placeholder="请输入指标" />
      </el-form-item>
   

          <el-form-item label="可见" prop="isVisible">
        <el-switch v-model="indicatorForm.isVisible" :active-value="1" :inactive-value="0" />
      </el-form-item>

          <el-form-item label="重要性" prop="tag">
        <el-switch v-model="indicatorForm.tag" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    <template #footer>
       <!-- ... footer buttons ... -->
       <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitIndicatorForm" :loading="loading">确定</el-button>
      </span>
    </template>

    <!-- 主题选择对话框 -->
    <ThemeSelectDialog
      v-model:visible="themeSelectVisible"
      :initial-theme-name="indicatorForm.categoryName"
      @theme-selected="handleThemeSelected"
    />

    <!-- 指标代码选择对话框 -->
    <TreeSelectDialog
      v-model:visible="metricTreeSelectVisible"  
      title="选择指标代码 (树状)"
      @confirm="handleMetricTreeConfirm" 
    />

      
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import service from '@/utils/axios';
import { isAxiosError } from 'axios';
import { userToken } from '@/composables/useAuth';
import ThemeSelectDialog from '../CommonComponents/ThemeSelectDialog.vue'; 
import TreeSelectDialog from '../CommonComponents/TreeSelectDialog.vue'; // 确认路径
import type { TreeNode } from '@/types/treeSelect'; // 确认路径

// --- Props, Emits, IndicatorItem Interface (remain the same) ---
const props = defineProps({
   visible: { type: Boolean, default: false },
   indicatorData: { type: Object, default: () => null },
   mode: { type: String as () => 'add' | 'edit', default: 'add' },
});
const emit = defineEmits(['update:visible', 'submitted']);
interface IndicatorItem {
   id: number | null;
   metricsCode: string;
   metricName: string;
   parentId?: number | null;
   categoryName?: string;
   themeCode: string;
   isVisible:'';
    sourceCode?: string;  
   metricType?: string; 
   indicatorCode?: string;
}

// --- State ---
const loading = ref(false);
const indicatorFormRef = ref<FormInstance>();
const themeSelectVisible = ref(false);
 const metricTreeSelectVisible = ref(false); 
const selectedTheme = ref(null);
// 表单数据
const indicatorForm = reactive<IndicatorItem>({
   id: null, categoryName: '', metricsCode: '', metricName: '', parentId: null,themeCode:'',
   isVisible:'0',sourceCode:'',metricType:'',tag:'1',dataSource:'',indicatorCode:''
});
 

// Computed property
const selectedThemeNameDisplay = computed(() => indicatorForm.categoryName || '');

// 表单验证规则 (updated metricsCode trigger)
const rules = reactive<FormRules>({
  categoryName: [ { required: true, message: '请选择所属主题', trigger: 'change' } ],
  metricsCode: [
    // Trigger is now 'change' for selection, but keep 'blur' for manual input possibility (or remove manual input)
    { required: true, message: '请选择或输入指标代码', trigger: ['change', 'blur'] },
    { max: 500, message: '长度不能超过 500 个字符', trigger: ['change', 'blur'] }
  ],
  metricType: [
    { required: true, message: '请输入指标类型', trigger: 'blur' },
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ],
  metricName: [
    { required: true, message: '请输入指标', trigger: 'blur' },
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ],
    isVisible: [{ required: true, message: '请选择状态', trigger: 'change' }],
    tag: [{ required: true, message: '请选择重要性', trigger: 'change' }],
});

// --- Methods ---
const resetForm = () => {
   Object.assign(indicatorForm, { id: null, categoryName: '',themeCode:'', 
   metricsCode: '',metricType:'', metricName: '', parentId: null,tag:1,isVisible:'0',sourceCode:''
   , dataSource:'',indicatorCode:'' });
   nextTick(() => indicatorFormRef.value?.clearValidate());
};
const resetFormOnClose = () => { resetForm(); };

// Theme Selection
const openThemeSelect = () => { themeSelectVisible.value = true; };
const handleThemeSelected = (theme: any) => {
  
   if (theme && theme.categoryName) {
     indicatorForm.categoryName = theme.categoryName;
     nextTick(() => indicatorFormRef.value?.validateField('categoryName'));
   }
     // 设置行业代码
    if (theme.themeCode) {
      indicatorForm.themeCode = theme.themeCode;
      nextTick(() => indicatorFormRef.value?.validateField('themeCode'));
    }
   themeSelectVisible.value = false;
};

// --- NEW: Metric Selection ---
const openMetricTreeSelect = () => {
  metricTreeSelectVisible.value = true;
};

const handleMetricSelected = (metric: any) => {
  if (metric && metric.metricsCode) {
    indicatorForm.metricsCode = metric.metricsCode;
    // 如果需要，也可以用选中的指标填充名称字段
    // indicatorForm.metricName = metric.metricName || '';
    nextTick(() => {
        indicatorFormRef.value?.validateField('metricsCode');
       //  indicatorFormRef.value?.validateField('metricName');   
        // if (indicatorForm.metricName) {
        //     indicatorFormRef.value?.validateField('metricName');
        // }
    });
  }
//  metricSelectVisible.value = false; // 关闭对话框
};

// --- END NEW ---

// Submit Form
const submitIndicatorForm = async () => {
   if (!indicatorFormRef.value) return;
   await indicatorFormRef.value.validate(async (valid) => {
     if (valid) {
       loading.value = true;
       try {
         const dataToSubmit = { ...indicatorForm };
         console.log('dataToSubmit:',dataToSubmit);
         if (props.mode === 'add') {
           const { id, ...addData } = dataToSubmit;
           await service.post('/cmfwxrobot/metrics', addData, { headers: { 'Authentication': userToken.value } });
           ElMessage.success('新增成功');
         } else {
           if (dataToSubmit.id === null) throw new Error("ID missing for update");
           await service.put('/cmfwxrobot/metrics', dataToSubmit, { headers: { 'Authentication': userToken.value } });
           ElMessage.success('更新成功');
         }
         emit('submitted');
         closeDialog();
       } catch (error) {
         console.error('提交指标数据失败:', error); ElMessage.error('操作失败，请重试');
         if (isAxiosError(error)) { console.error('Axios error details:', error.response?.data); }
       } finally { loading.value = false; }
     }
   });
};


// 调用API获取指标类型
const fetchIndicatorType = async (indicatorCode: string) => {
  if (!indicatorCode) return null;
  try {
    // 注意：在生产环境中，localhost 需要替换为实际API地址
    const apiUrl = `/cmfwxrobot/indicatorSearch/fetchIndicatorTypeByCode`
      
    const response = await service.post(apiUrl, 
      { indicatorCode },
      // 如果API需要token，请添加headers
      // { headers: { 'Authentication': userToken.value } } 
    );
    if (response.data && response.data.indicatorType) {
      return response.data;
    } else {
      console.warn("API did not return indicatorType for code:", indicatorCode, response.data);
      ElMessage.warning('未能获取指标类型，请手动输入或检查数据。');
      return null;
    }
  } catch (error) {
    console.error('获取指标类型失败:', error);
    ElMessage.error('获取指标类型失败，请稍后重试或手动输入。');
    if (isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
    return null;
  }
};



    const handleMetricTreeConfirm = async (selectedNode: TreeNode) => {
          indicatorForm.indicatorCode = selectedNode.indicatorCode;
          if (selectedNode) {
            let originalMetricsCode = '';
            let originalMetricName = ''; 
            if (!selectedNode.indicatorCode) {
              console.warn("Selected tree node missing sourceCode:", selectedNode);
            }
            if (selectedNode.indicatorName) {
              originalMetricName = selectedNode.indicatorName; 
              originalMetricsCode = selectedNode.indicatorCode;
            } else {
              console.warn("Selected tree node missing indicatorName:", selectedNode);
            }
            loading.value = true; // 开始加载状态
            const fetchedIndicatorType = await fetchIndicatorType( selectedNode.sourceCode);
            loading.value = false; // 结束加载状态
            if (fetchedIndicatorType !== null) {
              indicatorForm.metricName = fetchedIndicatorType.indicatorName;
              indicatorForm.metricsCode = fetchedIndicatorType.indicatorCode;
              indicatorForm.metricType = fetchedIndicatorType.indicatorType;
              indicatorForm.dataSource = fetchedIndicatorType.dataSource;
            } else {
               ElMessage.warning('指标类型获取失败，已填入节点名称，请检查或手动修改。');
               indicatorForm.metricName = originalMetricName;  
                indicatorForm.metricsCode = originalMetricsCode;
                indicatorForm.metricType = '';
                indicatorForm.dataSource = '';
            }
           
          } else {
              console.warn("Tree selection confirmed without a node.");
          }
          metricTreeSelectVisible.value = false; // 关闭对话框
        };


const closeDialog = () => { emit('update:visible', false); };

// Watcher
watch(() => props.indicatorData, (newData) => {
   resetForm();
   if (newData && props.mode === 'edit') {
     Object.keys(indicatorForm).forEach(key => {
       if (key in newData && newData[key] !== undefined && newData[key] !== null) {
         indicatorForm[key] = newData[key];
       }
     });
     // 编辑时，指标代码通常不可修改，清除验证状态即可
     nextTick(() => {
         indicatorFormRef.value?.clearValidate('metricsCode');
         indicatorFormRef.value?.clearValidate('metricName');
         indicatorFormRef.value?.clearValidate('categoryName');
     });
   }
}, { immediate: true, deep: true });

</script>

<style lang="scss" scoped>
.theme-code-input, .metric-code-input { 
  display: flex;
  align-items: center;
  width: 100%;
  .el-input { flex-grow: 1; }
}
</style>