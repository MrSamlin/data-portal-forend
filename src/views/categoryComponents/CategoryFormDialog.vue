<!-- src/views/categoryComponents/CategoryFormDialog.vue -->
<template>
  <el-dialog
    :title="dialogTitle"
    :model-value="visible"
    @update:model-value="closeDialog"
    width="600px"
    @close="resetForm"
  >
    <el-form :model="categoryForm" label-width="100px" :rules="rules" ref="categoryFormRef">
      <!-- 行业代码选择 -->
      <el-form-item label="行业代码" prop="themeCode">
        <div class="theme-code-input">
          <el-input
            v-model="categoryForm.themeCode"
            placeholder="请选择行业 (可多选)"
            readonly
          />
          <el-button
            type="primary"
            style="margin-left: 10px;"
            @click="industrySelectVisible = true"
          >
            选择行业
          </el-button>
        </div>
      </el-form-item>

      <!-- 其他表单项 -->
      <el-form-item label="主题名称" prop="categoryName">
        <el-input v-model="categoryForm.categoryName" placeholder="请输入主题名称" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="categoryForm.description" type="textarea" placeholder="请输入描述" />
      </el-form-item>
      <el-form-item label="详细描述" prop="detailedDescription">
        <el-input v-model="categoryForm.detailedDescription" type="textarea" placeholder="请输入详细描述" />
      </el-form-item>
      <el-form-item label="排序" prop="displayOrder">
        <el-input-number v-model="categoryForm.displayOrder" :min="1" :max="999" />
      </el-form-item>
        <el-form-item label="底图" prop="icon">
        <div class="icon-selector-container">
          <el-select
            v-model="categoryForm.icon"
            placeholder="请选择底图"
            clearable
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="item in iconList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div style="display: flex; align-items: center; height: 34px;">
                <img 
                  :src="`/icon/${item.value}`" 
                  :alt="item.label" 
                  style="width: 24px; height: 24px; margin-right: 8px; object-fit: contain; border: 1px solid #eee;" 
                />
                <span>{{ item.label }}</span>
              </div>
            </el-option>
          </el-select>
          <div v-if="categoryForm.icon" class="selected-icon-preview">
            <img :src="`/icon/${categoryForm.icon}`" alt="底图预览" />
          </div>
        </div>
      </el-form-item>


       <el-form-item label="图标" prop="bannerImage">
        <div class="icon-selector-container">
          <el-select
            v-model="categoryForm.bannerImage"
            placeholder="请选择图标"
            clearable
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="item in imgList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div style="display: flex; align-items: center; height: 34px;">
                <img 
                  :src="`/img/${item.value}`" 
                  :alt="item.label" 
                  style="width: 24px; height: 24px; margin-right: 8px; object-fit: contain; border: 1px solid #eee;" 
                />
                <span>{{ item.label }}</span>
              </div>
            </el-option>
          </el-select>
          <div v-if="categoryForm.bannerImage" class="selected-icon-preview">
            <img :src="`/img/${categoryForm.bannerImage}`" alt="图标预览" />
          </div>
        </div>
      </el-form-item>

      <el-form-item label="是否可见" prop="isVisible">
        <el-switch v-model="categoryForm.isVisible" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitCategoryForm" :loading="loading">确定</el-button>
      </span>
    </template>

    <!-- 行业选择对话框组件 -->
    <IndustrySelectDialog
      v-model:visible="industrySelectVisible"
      :initial-selection-codes="initialIndustryCodes"
      @confirm="handleIndustryConfirm"
    />
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import service from '@/utils/axios';
import { isAxiosError } from 'axios';
import { userToken, getToken } from '@/composables/useAuth';
import IndustrySelectDialog from './IndustrySelectDialog.vue'; // 导入行业选择组件
import { uploadActionUrl } from '@/api/commonApi';
import { imgList,iconList } from '@/types/imgUrl';

// --- Props --- (接收可见性、编辑数据、模式)
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  categoryData: { // 用于编辑模式下填充表单
    type: Object,
    default: () => null,
  },
  mode: { // 'add' or 'edit'
    type: String as () => 'add' | 'edit',
    default: 'add',
  },
});

// --- Emits --- (通知父组件关闭、提交成功)
const emit = defineEmits(['update:visible', 'submitted']);

// --- State ---
const loading = ref(false);
const categoryFormRef = ref<FormInstance>();
const industrySelectVisible = ref(false);
const initialIndustryCodes = ref(''); // 用于传递给行业选择对话框的初始值

 


// 内部表单数据
const categoryForm = reactive({
  categoryId: '',
  themeCode: '',  
  categoryName: '',
  description: '',
  detailedDescription: '',
  displayOrder: 1,
  icon: '',  
  bannerImage: '', 
  isVisible: 1,
  createdBy: 'admin',  
  updatedBy: 'admin',
});

// --- Computed --- (动态标题)
const dialogTitle = computed(() => (
   props.mode === 'add' ? '新增主题' : '编辑主题'
));

// --- Validation Rules ---
const rules = reactive<FormRules>({
  themeCode: [
    { required: true, message: '请选择行业', trigger: 'change' },
  ],
  categoryName: [
    { required: true, message: '请输入主题名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  description: [
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' },
  ],
});

// --- Methods ---
const resetForm = () => {
  if (categoryFormRef.value) {
    categoryFormRef.value.resetFields();
  }
  // 显式重置响应式对象
  Object.assign(categoryForm, {
    categoryId: '',
    themeCode: '',
    categoryName: '',
    description: '',
    detailedDescription: '',
    displayOrder: 1,
    icon: '',
    bannerImage: '',
    isVisible: 1,
    createdBy: 'admin',
    updatedBy: 'admin',
  });
   initialIndustryCodes.value = '';
};

const fullResetForm = () => {
  resetForm();
  initialIndustryCodes.value = ''; // 只在需要完全重置时才清空初始选择
}

// --- Watcher --- (监听外部传入的数据变化，填充表单)
watch(() => props.categoryData, (newData) => {
  if (newData && props.mode === 'edit') {
    Object.keys(categoryForm).forEach(key => {
      if (key in newData) {
        categoryForm[key] = newData[key];
      }
    });
    initialIndustryCodes.value = newData.themeCode || ''; // 设置初始行业代码
     // 编辑模式下清除验证状态，避免残留错误
    categoryFormRef.value?.clearValidate();
  } else if (props.mode === 'add') {
    fullResetForm(); // 如果是新增模式，则完全重置表单
  }
}, { immediate: true, deep: true });

// 处理行业选择确认
const handleIndustryConfirm = (selectedCodes: string) => {
  categoryForm.themeCode = selectedCodes;
   initialIndustryCodes.value = selectedCodes; // 添加这行，保存选择到初始值
  // 手动触发验证
  categoryFormRef.value?.validateField('themeCode');
};

// 提交表单
const submitCategoryForm = async () => {
  if (!categoryFormRef.value) return;
  console.log('categoryForm: ',categoryForm)
  await categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const dataToSubmit = { ...categoryForm };
        if (props.mode === 'add') {
          await service.post('/cmfwxrobot/categories', dataToSubmit, {
            headers: { 'Authentication': userToken.value }
          });
          ElMessage.success('新增成功');
        } else {
          await service.put(`/cmfwxrobot/categories/${categoryForm.categoryId}`, dataToSubmit, {
            headers: { 'Authentication': userToken.value }
          });
          ElMessage.success('更新成功');
        }
        emit('submitted'); // 通知父组件提交成功
        closeDialog();
      } catch (error) {
        console.error('操作失败:', error);
        ElMessage.error('操作失败，请检查控制台获取详细信息');
        if (isAxiosError(error)) {
          console.error('Axios error details:', error.response?.data);
        }
      } finally {
        loading.value = false;
      }
    }
  });
};

const closeDialog = () => {
  emit('update:visible', false);
};


 
</script>

<style lang="scss" scoped>
.theme-code-input {
  display: flex;
  align-items: center;
  width: 100%;
  .el-input {
      flex-grow: 1;
  }
}
 

 
.icon-selector-container {
  width: 100%;
}

.selected-icon-preview {
  margin-top: 10px;
  width: 100px; /* Or desired preview width */
  height: 100px; /* Or desired preview height */
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* To respect border-radius with img */
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}
</style> 