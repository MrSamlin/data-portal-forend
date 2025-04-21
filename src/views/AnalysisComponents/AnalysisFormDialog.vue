<!-- src/views/AnalysisComponents/AnalysisFormDialog.vue -->
<template>
  <el-dialog
    :title="mode === 'add' ? '新增分析' : '编辑分析'"
    :model-value="visible"
    @update:model-value="closeDialog"
    width="650px"
    @close="resetFormOnClose"
  >
    <el-form :model="analysisForm" label-width="100px" :rules="rules" ref="analysisFormRef">
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
      <el-form-item label="分析维度" prop="analysisName">
        <el-input v-model="analysisForm.analysisName" placeholder="请输入分析维度" />
      </el-form-item>
      <el-form-item label="跳转地址" prop="jumpUrl">
        <el-input v-model="analysisForm.jumpUrl" placeholder="请输入跳转地址" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <!-- 确保 active-value 和 inactive-value 是 number 类型 -->
        <el-switch v-model="analysisForm.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitAnalysisForm" :loading="loading">确定</el-button>
      </span>
    </template>

    <!-- 主题选择对话框 -->
    <AnalysisThemeSelectDialog
      v-model:visible="themeSelectVisible"
      :initial-theme-name="analysisForm.categoryName"
      @theme-selected="handleThemeSelected"
    />
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import service from '@/utils/axios';
import { isAxiosError } from 'axios';
import { userToken } from '@/composables/useAuth'; // Adjust path if necessary
import AnalysisThemeSelectDialog from '../CommonComponents/ThemeSelectDialog.vue'; // Import theme select dialog

// --- Props ---
const props = defineProps({
  visible: { type: Boolean, default: false },
  analysisData: { type: Object, default: () => null },
  mode: { type: String as () => 'add' | 'edit', default: 'add' },
});

// --- Emits ---
const emit = defineEmits(['update:visible', 'submitted']);

// --- State ---
const loading = ref(false);
const analysisFormRef = ref<FormInstance>();
const themeSelectVisible = ref(false);

// 表单数据接口 (可移至 types 文件)
interface AnalysisFormItem {
  id: number | null;
  analysisName: string;
  jumpUrl: string;
  status: number; // Ensure status is number
  categoryName?: string;
  // Omit fields not directly edited in the form like viewCount, dates, users
}

// 表单数据
const analysisForm = reactive<AnalysisFormItem>({
  id: null,
  analysisName: '',
  jumpUrl: '',
  status: 0, // Default to 0 (未发布)
  categoryName: '',
});

// Computed for display
const selectedThemeNameDisplay = computed(() => analysisForm.categoryName || '');

// 表单验证规则
const rules = reactive<FormRules>({
  categoryName: [{ required: true, message: '请选择所属主题', trigger: 'change' }],
  analysisName: [
    { required: true, message: '请输入分析维度', trigger: 'blur' },
    { max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' },
  ],
  jumpUrl: [
    { required: true, message: '请输入跳转地址', trigger: 'blur' },
    { max: 255, message: '长度不能超过 255 个字符', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
});

// --- Methods ---
const resetForm = () => {
  Object.assign(analysisForm, {
    id: null, analysisName: '', jumpUrl: '', status: 0, categoryName: '',
  });
  nextTick(() => analysisFormRef.value?.clearValidate());
};

const resetFormOnClose = () => {
  resetForm();
}

const openThemeSelect = () => {
  themeSelectVisible.value = true;
};

const handleThemeSelected = (theme: any) => {
  if (theme && theme.categoryName) {
    analysisForm.categoryName = theme.categoryName;
    nextTick(() => analysisFormRef.value?.validateField('categoryName'));
  }
  themeSelectVisible.value = false;
};

const submitAnalysisForm = async () => {
  if (!analysisFormRef.value) return;
  await analysisFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const dataToSubmit = { ...analysisForm };
        // Ensure status is number before sending
        dataToSubmit.status = Number(dataToSubmit.status);

        if (props.mode === 'add') {
          const { id, ...addData } = dataToSubmit;
          await service.post('/dataPortal/deepAnalysis', addData, {
            headers: { 'Authentication': userToken.value }
          });
          ElMessage.success('新增成功');
        } else {
          if (dataToSubmit.id === null) throw new Error("ID missing for update");
          await service.put('/dataPortal/deepAnalysis', dataToSubmit, {
            headers: { 'Authentication': userToken.value }
          });
          ElMessage.success('更新成功');
        }
        emit('submitted');
        closeDialog();
      } catch (error) {
        console.error('提交深度分析数据失败:', error);
        ElMessage.error('操作失败，请重试');
        if (isAxiosError(error)) {
          console.error('Axios error details:', error.response?.data);
        }
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.error('表单验证失败，请检查输入');
    }
  });
};

const closeDialog = () => {
  emit('update:visible', false);
};

// --- Watcher ---
watch(() => props.analysisData, (newData) => {
  resetForm(); // Reset first
  if (newData && props.mode === 'edit') {
    Object.keys(analysisForm).forEach(key => {
      if (key in newData && newData[key] !== undefined && newData[key] !== null) {
         if (key === 'status') {
             analysisForm[key] = Number(newData[key]); // Ensure status is number
         } else {
            analysisForm[key] = newData[key];
         }
      }
    });
    nextTick(() => analysisFormRef.value?.clearValidate()); // Clear all validation on edit load
  }
}, { immediate: true, deep: true });

</script>

<style lang="scss" scoped>
.theme-code-input {
  display: flex;
  align-items: center;
  width: 100%;
  .el-input { flex-grow: 1; }
}
</style>