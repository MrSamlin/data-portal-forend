<template>
  <div class="side-menu friendly-links">
    <div class="section-title">数据平台</div>

    <div v-if="loadingInitial && !token" class="loading-placeholder error-text">
      认证信息缺失，无法加载菜单。
    </div>
    <div v-else-if="loadingInitial" class="loading-placeholder">
      主菜单加载中...
    </div>
    <div v-else-if="initialError" class="loading-placeholder error-text">
      {{ initialError }}
    </div>

 <div v-else v-for="item in menuItems" :key="item.id" class="company">
      <template v-if="item.isGroup">
        <div class="company-title" @click="toggleGroup(item)">
          <img v-if="item.iconUrl" :src="getPrefixedImageUrl(item.iconUrl)" alt="" class="company-icon">
          <span class="company-name">{{ item.title }}</span>
          <span class="toggle-icon" :class="{ rotate: isGroupExpanded(item.id) }">▶</span>
        </div>
        <div class="sub-links" :class="{ show: isGroupExpanded(item.id) }">
          <div v-if="item._isLoadingChildren" class="loading-placeholder">加载链接中...</div>
          <div v-else-if="item._childrenFetched && item.children && item.children.length > 0">
            <div v-for="childMenu in item.children" :key="childMenu.id" class="sub-link">
              <a :href="childMenu.link || '#'" target="_blank" :title="childMenu.title" class="sub-link-anchor">
                <span class="sub-link-text">{{ childMenu.title }}</span>
              </a>
            </div>
          </div>
          <div v-else-if="item._childrenFetched && (!item.children || item.children.length === 0)" class="no-sublinks">
            暂无链接
          </div>
        </div>
      </template>
    </div>
     <div v-if="!loadingInitial && !initialError && menuItems.length === 0 && token" class="loading-placeholder">
      暂无数据平台链接。
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'; // Added watch
import { commonApi } from '@/api/commonApi';
import type { PlatformMenuItem } from '@/types/index'; 
import { isDevelopment,isProduction } from '@/utils/env'
import { getPrefixedImageUrl } from '@/utils/imgUtils'

// --- Props ---
const props = defineProps({
  token: {
    type: String,
    required: true, // 或者 false，如果允许在没有token时显示某些内容
  }
});

const menuItems = ref<PlatformMenuItem[]>([]);
const loadingInitial = ref(false);
const initialError = ref<string | null>(null);
const expandedGroups = ref<Set<number | string>>(new Set());
// pageToken ref and fetchAuthToken are removed

// 获取顶级菜单项 (公司)
const fetchTopLevelItems = async () => {
 

  loadingInitial.value = true;
  initialError.value = null;
  try { 
    const response = await commonApi.getTopMenuItems(props.token);
    const topLevelItems = response.data.map((apiItem: any): PlatformMenuItem => ({
      ...apiItem,
      children: [], 
      _childrenFetched: !apiItem.isGroup, // 如果不是分组，则认为子项已“获取”（即没有子项）
      _isLoadingChildren: false,
    }));
    menuItems.value = topLevelItems;

    // 默认展开所有顶级分组并获取其子项
    if (topLevelItems && topLevelItems.length > 0) {
      const groupFetchPromises: Promise<void>[] = [];
      topLevelItems.forEach(item => {
        if (item.isGroup) {
          expandedGroups.value.add(item.id); // 默认展开
          if (!item._childrenFetched) {  
            groupFetchPromises.push(fetchChildrenForItem(item));
          }
        }
      });
      await Promise.all(groupFetchPromises); // 等待所有默认展开项的子项加载完成
    }
  } catch (error) {
    console.error('获取顶级菜单项失败:', error);
    initialError.value = '获取数据平台列表失败。';
    menuItems.value = [];
  } finally {
    loadingInitial.value = false;
  }
};

// 获取子菜单项 (链接)
const fetchChildrenForItem = async (item: PlatformMenuItem) => {
  if (!item.isGroup || item._childrenFetched || item._isLoadingChildren) {
    return; 
  }
  
   

  item._isLoadingChildren = true;
  try {
    // 使用 props.token
    const response = await commonApi.getChildMenuItems(item.id, props.token);
    item.children = response.data.map((apiChild: any): PlatformMenuItem => ({
      ...apiChild,
      children: [], 
      _childrenFetched: true,
      _isLoadingChildren: false,
    }));
    item._childrenFetched = true;
  } catch (error) {
    console.error(`获取ID为 ${item.id} 的子项失败:`, error);
    item.children = []; 
    // Optionally set an error on the item
    // item.error = "加载子项失败";
  } finally {
    item._isLoadingChildren = false;
  }
};

// 切换分组展开/折叠状态
const toggleGroup = async (item: PlatformMenuItem) => {
  if (!item.isGroup) return;

  const itemId = item.id;
  if (expandedGroups.value.has(itemId)) {
    expandedGroups.value.delete(itemId);
  } else {
    expandedGroups.value.add(itemId);
    if (!item._childrenFetched) {
      await fetchChildrenForItem(item);
    }
  }
};

// 检查分组是否展开
const isGroupExpanded = (groupId: number | string): boolean => {
  return expandedGroups.value.has(groupId);
};

onMounted(() => {
  // 在组件挂载后调用获取数据的方法
  fetchTopLevelItems();
});
 
</script>

<style scoped>
/* 保留您之前的样式 */
.side-menu {
  width: 250px;
  padding: 20px;
  background-color: #f8f9fa;
  border-left: 1px solid #e0e0e0;
  height: calc(100vh - 120px); 
  overflow-y: auto;
}
.friendly-links {
  border-radius: 5px;
  background-color: #f9f9f9;
}

.company {
   margin-top: 10px;
}
.company-title {
  cursor: pointer;
  color:rgb(85, 85, 85);
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
   font-weight:bold;
  font-size: 12.5px;
  /* justify-content: space-between;  
  align-items: center;
  transition: background-color 0.2s ease;
   /* 新增：与 platform-menu-title 统一或按需调整 */
}

.company-icon {
  width: 25px;  
  height: 25px;  
  margin-right: 8px;
  object-fit: contain; 
  border-radius: 3px; 
}
.company-name {
  flex-grow: 1; 
  margin-top:9px;
}

.company-title:hover {
  background-color: #FEF4D5; 
}
.toggle-icon {
  transition: transform 0.3s ease;
  font-size: 9.5px;
  display: inline-block;
}
.toggle-icon.rotate {
  transform: rotate(90deg);
}
.sub-links {
  display: none;
  padding-left: 20px;
  margin-top: 8px;
  border-left: 2px solid #e0e0e0;
  margin-left: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}
.sub-links.show {
  display: block;
}
.sub-link {
  padding: 5px 0px;
  margin: 4px 0;
  border-radius: 3px;
  list-style-type: none;
  position: relative;
  padding-left: 15px;
}
.sub-link::before {
    content: '•';
    position: absolute;
    left: 0;
    top: 5px;
    color: #007bff;
    font-size: 14px;
}
.sub-link a {
  text-decoration: none;
  color: #3498db;
  font-size: 14px;
  display: block;
  transition: color 0.2s ease;
}
.sub-link a:hover {
  text-decoration: underline;
  color: #2980b9;
}
.loading-placeholder,
.no-sublinks {
    padding: 10px;
    color: #888;
    font-style: italic;
    text-align: center;
}
.error-text {
  color: red;
}


.sub-link a.sub-link-anchor {  
  text-decoration: none;
  color: #3498db;
  font-size: 14px;
  display: block;  
  transition: color 0.2s ease;
   overflow: hidden;  
  white-space: nowrap; 
  text-overflow: ellipsis; 
}

.sub-link a.sub-link-anchor:hover {
  text-decoration: underline;
  color: #2980b9;
}

.sub-link {
  padding: 5px 0px;
  margin: 4px 0;
  border-radius: 3px;
  list-style-type: none;
  position: relative;
  padding-left: 15px; 
}

.sub-link::before {
    content: '•';
    position: absolute;
    left: 0;
    top: 5px; 
    color: #007bff;
    font-size: 14px;
}

</style>