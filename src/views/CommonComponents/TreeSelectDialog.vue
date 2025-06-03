<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
// import { useTreeSelect } from '@/composables/useTreeSelect';
import type { TreeNode } from '@/types/treeSelect';
import { ElMessage, ElTree } from 'element-plus';  
import service from '@/utils/axios'; 
import { isAxiosError } from 'axios';  
import { userToken,getToken } from '@/composables/useAuth'; 
import { fetchMockNodes } from '@/mock/treeMockApi'; 
import {  isProduction, defaultParentCode,isDevelopment } from '@/utils/env';

import { commonApi } from '@/api/commonApi';


// 定义props
const props = defineProps<{
  visible: boolean;
  title?: string;
  // data?: TreeNode[]; // If using lazy load, data prop might not be needed for root
  showSearch?: { type: Boolean, default: true }; // Keep search prop
  initialSelectedId?: string | null;  
}>();

// 定义emit
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm', selected: TreeNode): void; // Emit single selected node
  (e: 'cancel'): void;
}>();

// --- State ---
const loading = ref(false);
const treeRef = ref<InstanceType<typeof ElTree>>();
const filterText = ref('');
const defaultExpandedKeys = ref<string[]>([]);
const treeDataMap = ref<Map<string, TreeNode>>(new Map());
// State for single selection
const selectedNode = ref<TreeNode | null>(null);

// 页面级别的token状态
const pageToken = ref('')


// 获取最新token的方法
const refreshToken = async () => {
  try {
    pageToken.value = await getToken()
  } catch (error) {
    console.error('刷新token失败:', error)
    throw error
  }
}

// Configure el-tree props mapping
const treeProps = {
  label: 'indicatorName',
  children: 'children',
  isLeaf: (data: TreeNode) => data.hasChildren === 0,
};

// --- Watchers ---
watch(filterText, (val) => {
  treeRef.value?.filter(val);
});

// --- Methods ---

// Filter nodes
const filterNode = (value: string, data: TreeNode): boolean => {
  if (!value) return true;
  return (data.indicatorName?.includes(value) || data.indicatorCode?.includes(value)) ?? false;
};

// Reset state when dialog opens
const handleDialogOpen = () => {
   defaultExpandedKeys.value = []; 
  filterText.value = '';
  selectedNode.value = null;  
  if (props.initialSelectedId) {
      
  }
};

const loadNode = async (node: any, resolve: (data: TreeNode[]) => void) => {
  const parentCode = node.level === 0 ? defaultParentCode : node.data?.indicatorCode;
  try {
     let children: TreeNode[] = [];
 // 判断是否为生产环境
    if (!isDevelopment) {
      // 生产环境：调用真实 API
      await refreshToken();
       const response = await commonApi.queryClickTreeList(
          {
            indicatorCode: parentCode, // 使用每个指标的metricsCode
            indicatorKeyName: "",  // 根据实际需求调整这些参数
            indicatorName: "",
            noteCategory: "",
            queryType: 0
          },
          pageToken.value
        );
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        children = response.data.data;
      } else {
        console.warn('API 响应格式异常:', response.data);
      }
    } else {
      // 开发环境：使用模拟数据
      console.log('开发环境: 使用模拟数据');
      children = await fetchMockNodes(parentCode);
    }
    children.forEach(n => { if (n.nodeId) treeDataMap.value.set(n.nodeId, n); });
      // 过滤 hasChildren =0节点
      // const filteredChildren = children.filter(node => node.hasChildren !== 0);
   //   filteredChildren.forEach(n => { if (n.nodeId) treeDataMap.value.set(n.nodeId, n); });
    resolve(children);
    //  if(node.level === 0 && props.initialSelectedId){
    //       nextTick(()=> highlightInitialNode());
    //  }

  } catch (error) {
    console.error(`加载节点失败 (ParentCode: ${parentCode}):`, error);
    ElMessage.error('加载节点失败');
    resolve([]);
  }
};

// Handle single node click (updates selection)
const handleNodeClick = (data: TreeNode, node: any) => {
    selectedNode.value = data; // Update the selected node state
    treeRef.value?.setCurrentKey(data.nodeId); // Visually highlight
};

const handleNodeDoubleClick = (event: MouseEvent) => {
   // 找到被点击的树节点元素
     const target = event.target as HTMLElement;
     const nodeEl = target.closest('.el-tree-node');
     
     if (nodeEl) {
       // 通过DOM属性获取节点数据
       const nodeId = nodeEl.getAttribute('data-key');
       if (nodeId) {
         // 尝试通过nodeId找到节点数据
         const node = treeRef.value?.getNode(nodeId);
         if (node && node.data) {
           selectedNode.value = node.data;
           handleConfirm();
         }
       }
     }
};


// Keep track of expanded nodes
const handleNodeExpand = (data: TreeNode) => {
  if (data.nodeId && !defaultExpandedKeys.value.includes(data.nodeId)) {
    defaultExpandedKeys.value.push(data.nodeId);
  }
};
const handleNodeCollapse = (data: TreeNode) => {
   if (data.nodeId) {
       // 创建新数组而不是修改原数组
       defaultExpandedKeys.value = [...defaultExpandedKeys.value.filter(id => id !== data.nodeId)];
       
       // 使用 nextTick 确保视图更新
       nextTick(() => {
         console.log('折叠后的展开节点:', defaultExpandedKeys.value);
         // 可以尝试手动调用树的方法
         if (treeRef.value) {
           treeRef.value.store.nodesMap[data.nodeId]?.collapse();
         }
       });
   }
};

// --- Confirmation ---
const handleConfirm = () => {
  const nodeToConfirm = selectedNode.value || treeRef.value?.getCurrentNode(); // Get highlighted if no click selection
  if (!nodeToConfirm) {
       ElMessage.warning('请选择一个节点');
       return;
   }
   if(nodeToConfirm.hasChildren!==0){
    ElMessage.warning('请选择一个末级文件');
    return;
   }
  emit('confirm', nodeToConfirm); // Emit the single selected node
  handleClose();
};
// Close dialog
const handleClose = () => {
  emit('update:visible', false);
  emit('cancel'); // Emit cancel event if needed
};

</script>

<template>
  <!-- Use el-dialog for consistency -->
  <el-dialog
    :title="title || '请选择'"
    :model-value="visible"
    @update:model-value="handleClose"
    width="600px"
    destroy-on-close
    @open="handleDialogOpen"
    class="tree-select-dialog"
  >
      <!-- Search Input -->
      <div class="search-area" v-if="props.showSearch">
        <el-input
          v-model="filterText"
          placeholder="输入关键字进行过滤"
          clearable
        />
      </div>

      <!-- Tree Container -->
      <div class="tree-container" v-loading="loading">
        <el-tree
          ref="treeRef"
          :props="treeProps"
          :load="loadNode"
          lazy
          node-key="nodeId"
          :default-expanded-keys="defaultExpandedKeys"
          :filter-node-method="filterNode"
          :expand-on-click-node="true"  
          :highlight-current="true"     
          @node-click="handleNodeClick"
          @dblclick="handleNodeDoubleClick($event)" 
          @node-expand="handleNodeExpand"
          @node-collapse="handleNodeCollapse"
        >
          <template #default="{ node }">
            <span class="custom-tree-node">
              <span>{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>

      <!-- Footer -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button
            type="primary"
            @click="handleConfirm"
            :disabled="!selectedNode && !treeRef?.getCurrentNode()" 
          >
            确定
          </el-button>
        </span>
      </template>
  </el-dialog>
</template>

<style scoped>
/* Keep styles, remove checkbox related styles if any */
.tree-select-dialog {
  /* ... existing styles ... */

  .tree-container {
    min-height: 300px;
    max-height: 50vh; /* Adjust max height */
    overflow-y: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 10px;
  }
  .search-area {
      margin-bottom: 10px;
  }
   .custom-tree-node { /* Keep node styles */
    /* ... */
   }
   /* Remove styles specifically for checkboxes if they existed */
}

</style>        