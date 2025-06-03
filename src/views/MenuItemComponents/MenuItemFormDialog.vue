<!-- src/views/MenuItemComponents/MenuItemFormDialog.vue -->
<template>
  <el-dialog
    :title="getDialogTitle"
    :model-value="visible"
    @update:model-value="closeDialog"
    width="650px"
    @close="resetFormOnClose"
  >
    <el-form :model="menuItemForm" label-width="100px" :rules="rules" ref="menuItemFormRef">
      <template v-if="formType === 'company'">
         <el-form-item label="公司名称" prop="title">
            <el-input v-model="menuItemForm.title" placeholder="请输入公司名称" />
          </el-form-item>
          
        <el-form-item label="图标" prop="iconUrl">
         <div class="upload-wrapper"> 
              <el-upload
                class="icon-uploader"
                :action="uploadActionUrl" 
                :headers="uploadHeaders"
                :data="{ prefix: 'img' }" 
                name="file"  
                :on-exceed="handleImgUploadException"
                :show-file-list="false"
                :before-upload="beforeIconUpload"
                :on-success="handleIconSuccess" 
                :on-error="handleIconError">
                <img v-if="menuItemForm.iconUrl" :src="getPrefixedImageUrl(menuItemForm.iconUrl)" class="icon-preview" />
                <el-icon v-else class="icon-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </div>
        </el-form-item>
      </template>
      <template v-if="formType === 'link'">
          <el-form-item label="标题" prop="title">
            <el-input v-model="menuItemForm.title" placeholder="请输入标题" />
          </el-form-item>
          <el-form-item label="链接地址" prop="link">
            <el-input v-model="menuItemForm.link" placeholder="请输入链接地址" />
          </el-form-item>
          <el-form-item label="类型" prop="type">
            <el-select v-model="menuItemForm.type" placeholder="请选择类型">
              <el-option label="内部" value="内部" />
              <el-option label="外部" value="外部" />
            </el-select> 
          </el-form-item>
          <el-form-item label="所属公司" prop="parentId">
            <el-select v-model="menuItemForm.parentId" placeholder="请选择所属公司" filterable>
              <el-option
                v-for="company in companyOptions"
                :key="company.id"
                :label="company.title"
                :value="company.id"
              />
            </el-select>
          </el-form-item>
    
      </template>
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number v-model="menuItemForm.sortOrder" :min="0" :max="999" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch v-model="menuItemForm.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitMenuItemForm" :loading="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import service from '@/utils/axios';
import { isAxiosError } from 'axios';
import { userToken } from '@/composables/useAuth';
import { uploadActionUrl } from '@/api/commonApi';

import { imgList,iconList } from '@/utils/imgUtils';

// --- Props ---
const props = defineProps({
  visible: { type: Boolean, default: false },
  menuItemData: { type: Object, default: () => null },
  mode: { type: String as () => 'add' | 'edit', default: 'add' },
  formType: { type: String as () => 'company' | 'link', default: 'company' },
});

// --- Emits ---
const emit = defineEmits(['update:visible', 'submitted']);

// --- State ---
const loading = ref(false);
const menuItemFormRef = ref<FormInstance>();
const companyOptions = ref<any[]>([]);

// 计算属性
const isAddMode = computed(() => props.mode === 'add');
const getDialogTitle = computed(() => {
  if (props.mode === 'add') {
    return props.formType === 'company' ? '新增公司' : '新增链接';
  } else {
    return props.formType === 'company' ? '编辑公司' : '编辑链接';
  }
});

const uploadHeaders = computed(() => ({
  'Authentication': userToken.value
}));

// 表单数据接口
interface MenuItemFormItem {
  id: number | null;
  title: string;
  link: string;
  type: string;
  parentId: number | null;
  isGroup: boolean;
  sortOrder: number;
  status: number;
   iconUrl: string;  
}

// 表单数据
const menuItemForm = reactive<MenuItemFormItem>({
  id: null,
  title: '',
  link: '',
  type: '内部',
  parentId: null,
  isGroup: false,
  sortOrder: 0,
  status: 1,
  iconUrl:''
});

// 表单验证规则
const rules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { max: 100, message: '长度不能超过100个字符', trigger: 'blur' },
  ],
  link: [
    { required: true, message: '请输入链接地址', trigger: 'blur' },
    { max: 255, message: '长度不能超过255个字符', trigger: 'blur' },
  ],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  parentId: [
    { required: true, message: '请选择父级公司', trigger: 'change' },
  ],
  sortOrder: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
   iconUrl: [
    { required: true, message: '请上传图标', trigger: 'change' }
  ],
});

// --- Methods ---
const resetForm = () => {
  Object.assign(menuItemForm, {
    id: null,
    title: '',
    link: '',
    type: '内部',
    parentId: null,
    isGroup: false,
    sortOrder: 0,
    status: 1,
    iconUrl: '',
  });
  nextTick(() => menuItemFormRef.value?.clearValidate());
};

const resetFormOnClose = () => {
  resetForm();
};

// 获取公司列表
const fetchCompanies = async () => {
  try {
    const response = await service.post('/cmfwxrobot/menuItem/getTopMenuItemList', {
      page: 1,
      size: 100,
      currentPage: 0,
    }, { headers: { 'Authentication': userToken.value } });

    if (response.data && response.data.data) {
      companyOptions.value = response.data.data.filter((item: any) => item.isGroup);
    }
  } catch (error) {
    console.error('获取公司列表失败:', error);
    if (isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
  }
};

const submitMenuItemForm = async () => {
  if (!menuItemFormRef.value) return;
  await menuItemFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const dataToSubmit = { ...menuItemForm };
        // 设置是否为分组
        dataToSubmit.isGroup = props.formType === 'company';
        
        // 确保数值类型字段正确
        dataToSubmit.status = Number(dataToSubmit.status);
        dataToSubmit.sortOrder = Number(dataToSubmit.sortOrder);
        
        if (props.mode === 'add') {
          const { id, ...addData } = dataToSubmit;
          if (props.formType === 'company') {
            addData.parentId = null;
          }
          await service.post('/cmfwxrobot/menuItem/insertMenuItem', addData, {
            headers: { 'Authentication': userToken.value }
          });
          ElMessage.success('新增成功');
        } else {
          // 编辑时需要ID
          if (dataToSubmit.id === null) throw new Error("ID missing for update");
          
          await service.post('/cmfwxrobot/menuItem/updateMenuItem', dataToSubmit, {
            headers: { 'Authentication': userToken.value }
          });
          ElMessage.success('更新成功');
        }
        emit('submitted');
        // 刷新公司集合
         fetchCompanies();
        closeDialog();
      } catch (error) {
        console.error('提交菜单项数据失败:', error);
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
watch(() => props.menuItemData, (newData) => {
  resetForm(); // 重置表单
  
  if (newData && props.mode === 'edit') {
    Object.keys(menuItemForm).forEach(key => {
      if (key in newData && newData[key] !== undefined && newData[key] !== null) {
        if (['status', 'sortOrder'].includes(key)) {
          menuItemForm[key] = Number(newData[key]); // 确保数值类型
        } else {
          menuItemForm[key] = newData[key];
        }
      }
    });
    
    nextTick(() => menuItemFormRef.value?.clearValidate());
  } else if (newData && props.mode === 'add') {
    // 设置新增时的默认值
    menuItemForm.isGroup = props.formType === 'img';
    menuItemForm.status = 1;
    menuItemForm.sortOrder = 0;
    
    // 如果是新增链接，需要继承父级ID
    if (props.formType === 'link' && newData.parentId !== undefined) {
      menuItemForm.parentId = newData.parentId;
    }
  }
}, { immediate: true, deep: true });


//--- 图片上传 

// 上传前验证
const beforeIconUpload: UploadProps['beforeUpload'] = (file) => {
  return true;
};

const handleImgUploadException = () => {
  ElMessage.warning('只传一张图片');
};

 

// 上传成功回调
const handleIconSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  if (response.code === 200) {
    menuItemForm.iconUrl = response.url;  
    ElMessage.success(response.message  ||'图标上传成功');
  } else {
    ElMessage.error(response.message || '上传失败');
  }
};

// 上传失败回调
const handleIconError: UploadProps['onError'] = (error) => {
  console.error('图标上传失败:', error);
  ElMessage.error('图标上传失败，请重试');
};

// --- 生命周期 ---
onMounted(() => {
  // 加载公司列表用于选择父级
  fetchCompanies();
});






</script>

<style lang="scss" scoped>


.upload-wrapper {
  max-width: 100px; 
  width: 100%; 
}

.icon-uploader {
  width: 100%; // 让 .icon-uploader 填满 .upload-wrapper 的宽度

  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
    width: 100%; // 让 el-upload 组件也填满其父级 (.icon-uploader)
    /* 
      你需要为上传框设置一个宽高比，或者固定的高度。
      如果只设置宽度，高度可能会依赖内容或默认值。
      例如，设置一个正方形的上传框：
    */
    aspect-ratio: 1 / 1; // 保持1:1的宽高比 (如果浏览器支持)
    /* 或者设置一个固定的高度，如果 aspect-ratio 不支持或不适用 */
    /* height: 150px; // 示例：可以根据实际宽度调整这个值 */

    display: flex; // 用于内部 icon 和 preview 的居中
    justify-content: center;
    align-items: center;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.icon-uploader-icon {
  font-size: 48px;  
  color: #8c939d;
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;           /* 添加这行 */
  justify-content: center; /* 添加这行 */
  align-items: center;     /* 添加这行 */
}

.icon-preview {
  width: 100%;  
  height: 100%;  
  object-fit: contain; 
  display: block;
}

.upload-tip {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}
</style>