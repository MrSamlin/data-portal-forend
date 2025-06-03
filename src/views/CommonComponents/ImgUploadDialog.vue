<template>
  <el-form-item :label="label" :prop="propName">
    <div class="upload-wrapper">
      <el-upload
        class="reusable-uploader"
        :action="uploadActionUrl"
        :headers="headers"
        :data="{ prefix: uploadPrefix }"
        name="file"
        :show-file-list="false"
        :before-upload="beforeUploadHandler"
        :on-success="handleSuccess"
        :on-error="handleError"
      >
        <img v-if="modelValue" :src="getPrefixedImageUrl(modelValue)" class="uploader-preview" />
        <el-icon v-else class="uploader-icon"><Plus /></el-icon>
      </el-upload>
    </div>
  </el-form-item>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { ElMessage, type UploadProps } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { uploadActionUrl } from '@/api/commonApi';

import { getPrefixedImageUrl } from '@/utils/imgUtils';
const props = withDefaults(defineProps<{
  modelValue: string | null; // For v-model, URL of the image
  label?: string;
  propName?: string; // For el-form-item prop (validation)
  actionUrl: string;
  headers: Record<string, any>;
  uploadPrefix?: string;
  allowedTypes?: string[]; // e.g., ['image/jpeg', 'image/png']
  maxSizeMb?: number; // Max size in MB
}>(), {
  uploadPrefix: 'img', // Default prefix
  allowedTypes: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], // Default allowed types
  maxSizeMb: 5, // Default max size 5MB
});

const emit = defineEmits(['update:modelValue', 'upload-error']);

const beforeUploadHandler: UploadProps['beforeUpload'] = (rawFile) => {
  if (props.allowedTypes && props.allowedTypes.length > 0) {
    if (!props.allowedTypes.includes(rawFile.type)) {
      ElMessage.error(`图片格式必须是 ${props.allowedTypes.join(', ')} 之一!`);
      return false;
    }
  }
  if (props.maxSizeMb) {
    if (rawFile.size / 1024 / 1024 > props.maxSizeMb) {
      ElMessage.error(`图片大小不能超过 ${props.maxSizeMb}MB!`);
      return false;
    }
  }
  return true;
};

const handleSuccess: UploadProps['onSuccess'] = (response: any) => {
  let imageUrl = '';
  if (response && response.url) {
    imageUrl = response.url;
  } else if (response && response.data && response.data.url) {
    imageUrl = response.data.url;
  } else if (response && response.data && typeof response.data === 'string') { // common for some APIs
    imageUrl = response.data;
  } else if (response && typeof response === 'string') { // if response itself is the URL
    imageUrl = response;
  } else {
    console.error('Upload success response does not contain a valid URL:', response);
    ElMessage.error('上传成功，但无法获取图片URL!');
    emit('upload-error', new Error('Invalid response format for image URL'));
    return;
  }
  emit('update:modelValue', imageUrl);
  ElMessage.success('上传成功!');
};

const handleError: UploadProps['onError'] = (error: Error) => {
  ElMessage.error('图片上传失败!');
  console.error('Upload error:', error);
  emit('upload-error', error);
};
</script>

<style scoped>
.upload-wrapper {
  /* Styles for the wrapper if needed */
}
.reusable-uploader .el-upload { /* Targeting via class on el-upload itself */
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 100px; /* Define a fixed size or make it configurable */
  height: 100px; /* Define a fixed size or make it configurable */
  display: flex;
  align-items: center;
  justify-content: center;
}

.reusable-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.uploader-preview {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
</style>