<template>
  <div class="menuitem-config">
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <span>友情链接维护</span>
          <div>
            <el-button type="primary" @click="handleAddCompany">新增公司</el-button>
            <el-button type="primary" @click="handleAddLink">新增链接</el-button>
          </div>
        </div>
      </template>

      <!-- 标签页 -->
      <el-tabs v-model="activeTab" class="menu-tabs">
        <el-tab-pane label="公司管理" name="companies"></el-tab-pane>
        <el-tab-pane label="链接管理" name="links"></el-tab-pane>
      </el-tabs>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
         :placeholder="activeTab === 'companies' ? '请输入公司名称搜索' : '请输入标题搜索'"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <!-- 数据表格 -->
<el-table :data="menuItemList" style="width: 100%" v-loading="loading">
  <!-- 公共列 -->
  <el-table-column prop="id" label="ID" min-width="60" />
  <template v-if="activeTab === 'companies'">
   <el-table-column prop="title" label="公司" min-width="200" />
     <el-table-column label="图标" min-width="200">
    <template #default="scope">
      <img 
        v-if="scope.row.iconUrl" 
        :src="getPrefixedImageUrl(scope.row.iconUrl)" 
        alt="图标" 
        style="width: 50px; height: 50px; object-fit: contain;" 
      />
      <span v-else>无图标</span>
    </template>
  </el-table-column>
  </template>
  <!-- 链接管理特定列 -->
  <template v-if="activeTab === 'links'">
   <el-table-column prop="title" label="标题" min-width="200" />
    <el-table-column prop="link" label="链接地址" min-width="200" show-overflow-tooltip />
    <el-table-column prop="type" label="类型" min-width="80" />
    <el-table-column prop="parentName" label="所属公司" min-width="120" show-overflow-tooltip />
  </template>


  <el-table-column prop="sortOrder" label="排序" min-width="70" />
  <el-table-column prop="status" label="状态" min-width="80">
    <template #default="scope">
      <el-tag :type="Number(scope.row.status) === 1 ? 'success' : 'info'">
        {{ Number(scope.row.status) === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
  </el-table-column>
  <el-table-column label="操作" min-width="120" fixed="right">
    <template #default="scope">
      <el-button type="primary" size="small" @click="handleEditMenuItem(scope.row)">编辑</el-button>
      <el-button type="danger" size="small" @click="handleDeleteMenuItem(scope.row)">删除</el-button>
    </template>
  </el-table-column>
</el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-wrapper">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            v-model:current-page="page"
            :page-count="totalPages"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
          <div class="page-info">
            当前第 {{ page }} 页 / 共 {{ totalPages }} 页
          </div>
        </div>
      </div>
    </el-card>

    <!-- 使用表单对话框组件 -->
    <MenuItemFormDialog
      v-model:visible="dialogVisible"
      :mode="dialogType"
      :form-type="formType"
      :menu-item-data="currentMenuItemData"
      @submitted="handleDialogSubmitted"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import service from '@/utils/axios';
import { isAxiosError } from 'axios';
import { userToken } from '@/composables/useAuth';
import { getPrefixedImageUrl } from '@/utils/imgUtils';

import MenuItemFormDialog from '@/views/MenuItemComponents/MenuItemFormDialog.vue';

// --- 标签页状态 ---
const activeTab = ref('companies');

// --- 主列表状态 ---
const loading = ref(false);
const menuItemList = ref<any[]>([]);
const searchKeyword = ref('');
const total = ref(0);
const pageSize = ref(10);
const page = ref(1);
const totalPages = ref(1);

// --- 对话框状态 ---
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formType = ref<'company' | 'link'>('company');
const currentMenuItemData = ref<any>(null);

// --- 监听标签页变化 ---
watch(activeTab, () => {
 fetchMenuItemList();
  page.value = 1;
});

// --- 主列表方法 ---
const handleSearch = () => {
  page.value = 1;
 fetchMenuItemList();
};


const fetchMenuItemList = () => {
  if (activeTab.value === 'companies') {
    fetchTopMenuItemList();
  } else {
    fetchChildMenuItemList();
  }
};

const fetchTopMenuItemList = async () => {
  loading.value = true;
  const apiCurrentPage = (page.value - 1) * pageSize.value;
  try {
    const response = await service.post('/cmfwxrobot/menuItem/getTopMenuItemList', {
      page: page.value,
      currentPage: apiCurrentPage,
      size: pageSize.value,
      title: searchKeyword.value.trim()
    }, { headers: { 'Authentication': userToken.value } });

    if (response.data && response.data.data) {
      menuItemList.value = response.data.data.filter((item: any) => {
        return activeTab.value === 'companies' ? item.isGroup : !item.isGroup;
      });
      total.value = response.data.total || 0;
      totalPages.value = response.data.totalPages || 1;
    } else {
      menuItemList.value = [];
      total.value = 0;
      totalPages.value = 1;
    }
  } catch (error) {
    console.error('获取菜单项列表失败:', error);
    ElMessage.error('获取菜单项列表失败');
    if (isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
    menuItemList.value = [];
    total.value = 0;
    totalPages.value = 1;
  } finally {
    loading.value = false;
  }
};


const fetchChildMenuItemList = async () => {
  loading.value = true;
  const apiCurrentPage = (page.value - 1) * pageSize.value;
  try {
    const response = await service.post('/cmfwxrobot/menuItem/getChildMenuItemList', {
      page: page.value,
      currentPage: apiCurrentPage,
      size: pageSize.value,
      title: searchKeyword.value.trim()
    }, { headers: { 'Authentication': userToken.value } });

    if (response.data && response.data.data) {
      menuItemList.value = response.data.data.filter((item: any) => {
        return activeTab.value === 'companies' ? item.isGroup : !item.isGroup;
      });
      total.value = response.data.total || 0;
      totalPages.value = response.data.totalPages || 1;
    } else {
      menuItemList.value = [];
      total.value = 0;
      totalPages.value = 1;
    }
  } catch (error) {
    console.error('获取菜单项列表失败:', error);
    ElMessage.error('获取菜单项列表失败');
    if (isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
    menuItemList.value = [];
    total.value = 0;
    totalPages.value = 1;
  } finally {
    loading.value = false;
  }
};




const handleAddCompany = () => {
  dialogType.value = 'add';
  formType.value = 'company';
  currentMenuItemData.value = {
    isGroup: true,
    parentId: null,
    status: 1,
    sortOrder: 0
  };
  dialogVisible.value = true;
};

const handleAddLink = () => {
  dialogType.value = 'add';
  formType.value = 'link';
  currentMenuItemData.value = {
    isGroup: false,
    status: 1,
    sortOrder: 0
  };
  dialogVisible.value = true;
};

const handleEditMenuItem = (row: any) => {
  dialogType.value = 'edit';
  formType.value = row.isGroup ? 'company' : 'link';
  currentMenuItemData.value = { ...row };
  dialogVisible.value = true;
};

const handleDeleteMenuItem = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除"${row.title}"吗？`,
    '警告', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    loading.value = true;
    try {
      await service.delete(`/cmfwxrobot/menuItem/${row.id}`, {
        headers: { 'Authentication': userToken.value }
      });
      ElMessage.success('删除成功');
      if (menuItemList.value.length === 1 && page.value > 1) {
        page.value--;
      }
      fetchMenuItemList();
    } catch (error) {
      console.error('删除菜单项失败:', error);
      ElMessage.error('删除失败，请重试');
      if (isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data);
      }
    } finally {
      loading.value = false;
    }
  }).catch(() => {});
};

const handleDialogSubmitted = () => {
  fetchMenuItemList();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  page.value = 1;
  fetchMenuItemList();
};

const handleCurrentChange = (newPage: number) => {
  page.value = newPage;
  fetchMenuItemList();
};



 

onMounted(() => {
  fetchMenuItemList();
});
</script>

<style lang="scss" scoped>
.menuitem-config {
  .operation-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .menu-tabs {
    margin-bottom: 20px;
  }
  
  .search-area {
    margin-bottom: 20px;
    
    .search-input {
      width: 400px;
      :deep(.el-input-group__append) {
        .el-button {
          background-color: #ff8c00;
          border-color: #ff8c00;
          color: white;
          padding: 8px 20px;
          &:hover {
            background-color: #ff9a22;
            border-color: #ff9a22;
          }
          &:active {
            background-color: #ff7f00;
            border-color: #ff7f00;
          }
        }
      }
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    
    .pagination-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .page-info {
        margin-top: 10px;
        color: #666;
      }
    }
  }
}
</style>