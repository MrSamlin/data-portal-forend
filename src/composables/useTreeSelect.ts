// composables/useTreeSelect.ts
import { ref, computed, Ref } from 'vue';
import type { TreeNode } from '@/types/treeSelect';

export function useTreeSelect(initialData: TreeNode[]) {
  const treeData: Ref<TreeNode[]> = ref(initialData || []);
  const loading = ref(false);
  const selectedNode = ref<TreeNode | null>(null);
  const checkedNodes = ref<TreeNode[]>([]);
  const expandedKeys = ref<string[]>([]);
  
  // 按层级排序
  const sortedTreeData = computed(() => {
    return [...treeData.value].sort((a, b) => a.orderNum - b.orderNum);
  });
  
  // 选择节点
  const handleNodeSelect = (node: TreeNode) => {
    selectedNode.value = node;
  };
  
  // 勾选节点
  const handleNodeCheck = (node: TreeNode, checked: boolean) => {
    if (checked) {
      checkedNodes.value.push(node);
    } else {
      checkedNodes.value = checkedNodes.value.filter(item => item.nodeId !== node.nodeId);
    }
  };
  
  // 展开节点
  const handleNodeExpand = async (node: TreeNode, expanded: boolean) => {
    if (expanded) {
      if (!expandedKeys.value.includes(node.nodeId)) {
        expandedKeys.value.push(node.nodeId);
      }
      
      // 如果有子节点，需要加载子节点数据
      if (node.hasChildren === 1) {
        await loadChildrenNodes(node);
      }
    } else {
      expandedKeys.value = expandedKeys.value.filter(key => key !== node.nodeId);
    }
  };
  
  // 加载子节点数据
  const loadChildrenNodes = async (node: TreeNode) => {
    loading.value = true;
    try {
      // 这里应该是你的API调用，获取子节点数据
      // const response = await api.getChildrenNodes(node.nodeId);
      // 将子节点数据添加到treeData中
      // treeData.value = [...treeData.value, ...response.data];
    } catch (error) {
      console.error('加载子节点失败：', error);
    } finally {
      loading.value = false;
    }
  };
  
  // 双击选择
  const handleNodeDoubleClick = (node: TreeNode) => {
    handleNodeSelect(node);
    // 如果需要在双击时自动确认选择
    // confirmSelection();
  };
  
  // 确认选择
  const confirmSelection = () => {
    return {
      selected: selectedNode.value,
      checked: checkedNodes.value
    };
  };
  
  return {
    treeData,
    sortedTreeData,
    loading,
    selectedNode,
    checkedNodes,
    expandedKeys,
    handleNodeSelect,
    handleNodeCheck,
    handleNodeExpand,
    handleNodeDoubleClick,
    confirmSelection
  };
}