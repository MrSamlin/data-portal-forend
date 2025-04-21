<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
// import { useTreeSelect } from '@/composables/useTreeSelect';
import type { TreeNode } from '@/types/treeSelect';
import { ElMessage, ElTree } from 'element-plus'; // Import ElTree
import service from '@/utils/axios'; // Keep if fetching data here
import { isAxiosError } from 'axios'; // Keep for error handling
import { userToken } from '@/composables/useAuth'; // Keep if fetching data here
import { fetchMockNodes } from '@/mock/treeMockApi'; // Keep for mock data
import {  isProduction, defaultParentCode } from '@/utils/env';

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
  filterText.value = '';
  selectedNode.value = null; // Clear previous selection
  // If using mock data, root is loaded by el-tree's lazy load automatically
  // If initialSelectedId is provided, we might try to find and highlight it after load
  if (props.initialSelectedId) {
      // Need logic here to expand and highlight after initial load if needed
      // Maybe set defaultExpandedKeys based on ancestor path of initialSelectedId?
  }
};

const loadNode = async (node: any, resolve: (data: TreeNode[]) => void) => {
  console.log('loadNode',node);
  const parentCode = node.level === 0 ? defaultParentCode : node.data?.indicatorCode;
  try {
     let children: TreeNode[] = [];
 
 // 判断是否为生产环境
    if (isProduction) {
      // 生产环境：调用真实 API
      console.log('生产环境: 使用真实 API 获取树节点');
      const response = await service.post(
        'https://iadev.cmfchina.com/dw/edbapply/v2/indicatorSearch/queryClickTreeList',
        {
          indicatorCode: parentCode || "",
          indicatorKeyName: "",
          indicatorName: "",
          noteCategory: "",
          queryType: 0
        },
        {
          headers: { 'Authentication': userToken.value }
        }
      );
      console.log('response.data',response.data);
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        children = response.data.data;
        console.log('获取到树节点数据:', children.length);
      } else {
        console.warn('API 响应格式异常:', response.data);
      }
    } else {
      // 开发环境：使用模拟数据
      console.log('开发环境: 使用模拟数据');
      children = await fetchMockNodes(parentCode);
    }
    children.forEach(n => { if (n.nodeId) treeDataMap.value.set(n.nodeId, n); });
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
       defaultExpandedKeys.value = defaultExpandedKeys.value.filter(id => id !== data.nodeId);
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
    ElMessage.warning('请选择一个末级节点');
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