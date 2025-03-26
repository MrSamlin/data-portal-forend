<template>
  <div class="data-portal">
    <div class="search-bar-container">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入搜索关键词"
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
    </div>
    
    <div class="content-wrapper">
      <div class="main-content">
        <!-- 分类标签 -->
        <div class="category-row">      
          <div
            v-for="category in categories"
            :key="category.categoryId"
            class="category-card"
            :class="{ active: activeTab === category.categoryId }"
            :style="{ backgroundColor: category.icon }"
            :data-category="category.categoryId"
            @click="activeTab = category.categoryId"
          >
            <div class="category-label">{{ category.categoryName }}</div>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="content-area">
          <div class="content-sections">
            <div v-for="(section, index) in sections" :key="index" class="content-section">
              <div class="section-title">{{ section.title }}</div>
              <a-table
                :columns="section.columns"
                :data-source="section.data"
                :pagination="false"
                size="small"
              >
                <template #headerCell="{ column }">
                  <span :style="{ color: '#777' }">
                    {{ column.title }}
                  </span>
                </template>
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'title'">
                    <div class="title-cell">
                      <a :href="`/details/${record.title}`" style="color: black;">
                        <span>{{ record.title }}</span>
                      </a>
                      <span v-if="record.isNew" class="new-tag">NEW</span>
                    </div>
                  </template>
                  <template v-if="column.key === 'analysisDimension'">
                    <div class="title-cell">
                      <a :href="`/details/${record.analysisDimension}`" style="color: black;">
                        <span>{{ record.analysisDimension }}</span>
                      </a>
                    </div>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 侧边栏 -->
      <div class="side-menu">
        <div class="platform-menu">
          <div class="platform-menu-title">数据平台</div>
          <ul class="platform-menu-list">
            <li v-for="menu in platformMenus" :key="menu.id" class="platform-menu-item">
              <span class="menu-number">{{ menu.id }}.</span>
              <a :href="menu.link" class="menu-link">
                {{ menu.title }}
                <span class="menu-type">（{{ menu.type }}）</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import type { TableColumnsType } from 'ant-design-vue';
import service from '@/utils/axios';

interface CategoryResponse {
    categoryId: string;
    categoryName: string;
    icon: string;  
}

const activeTab = ref('car'); // 确保 activeTab 被声明
const categories = ref<CategoryResponse[]>([]);

// 获取分类数据
const fetchCategories = async () => {      
    try {
        const response = await service.get('/api/categories/top', {  // 保持 /api 前缀
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data) {
            categories.value = response.data.map((item: CategoryResponse) => ({
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                icon: item.icon
            }));
        }
    } catch (error) {
        console.error('获取分类数据失败:', error);
        if (axios.isAxiosError(error)) {
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
        }
    }
};

// 组件挂载时获取数据
onMounted(() => {
    fetchCategories();
});

const platformMenus = [
  { id: 1, title: '内外数据平台', link: '#', type: '内部' },
  { id: 2, title: '产品技术平台', link: '#', type: '内部' },
  { id: 3, title: '数据管理规范', link: '#', type: '内部' },
  { id: 4, title: '数据管理', link: '#', type: '内部' },
  { id: 5, title: '数据资产平台', link: '#', type: '内部' },
  { id: 6, title: '数据资产地图', link: '#', type: '内部' },
  { id: 7, title: '数据质量巡检报告', link: '#', type: '内部' },
];

const columns: TableColumnsType = [
  {
    title: '看板标题',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '发布日期',
    dataIndex: 'publishDate',
    key: 'publishDate',
  },
  {
    title: '浏览次数',
    dataIndex: 'viewCount',
    key: 'viewCount',
  },
];

const sections = computed(() => {
  const sectionTitles = ['指标标题', '深度分析', '销售额度', '产量', '库存', '价格'];
  return sectionTitles.map(title => {
    let data;
    let columns;

    if (title === '指标标题') {
      data = [
        { title: '指标1', publishDate: '2023-01-01', viewCount: 100 },
        { title: '指标2', publishDate: '2023-01-02', viewCount: 200 },
        { title: '指标3', publishDate: '2023-01-03', viewCount: 150 },
      ];
      columns = [
        {
          title: '看板标题',
          dataIndex: 'title',
          key: 'title',
        },
        {
          title: '发布日期',
          dataIndex: 'publishDate',
          key: 'publishDate',
        },
        {
          title: '浏览次数',
          dataIndex: 'viewCount',
          key: 'viewCount',
        },
      ];
    } else if (title === '深度分析') {
      data = [
        { title: '维度1', publishDate: '2023-01-01', viewCount: 80 },
        { title: '维度2', publishDate: '2023-01-02', viewCount: 120 },
        { title: '维度3', publishDate: '2023-01-03', viewCount: 90 },
      ];
      columns = [
        {
          title: '分析维度',
          dataIndex: 'title',
          key: 'title',
        },
        {
          title: '发布日期',
          dataIndex: 'publishDate',
          key: 'publishDate',
        },
        {
          title: '浏览次数',
          dataIndex: 'viewCount',
          key: 'viewCount',
        },
      ];
    } else if (title === '销售额度') {
      data = [
        { title: '数据1', dataSource: '台湾经济处', updateTime: '2023-01-01' },
        { title: '数据2', dataSource: '台湾经济处', updateTime: '2023-01-02' },
        { title: '数据3', dataSource: '台湾经济处', updateTime: '2023-01-03' },
      ];
      columns = [
        {
          title: '看板标题',
          dataIndex: 'title',
          key: 'title',
        },
        {
          title: '数据来源',
          dataIndex: 'dataSource',
          key: 'dataSource',
        },
        {
          title: '更新时间',
          dataIndex: 'updateTime',
          key: 'updateTime',
        },
      ];
    } else if (title === '产量' || title === '库存' || title === '价格') {
      data = [
        { title: '数据1', dataSource: '台湾经济处', updateTime: '2023-01-01' },
        { title: '数据2', dataSource: '台湾经济处', updateTime: '2023-01-02' },
        { title: '数据3', dataSource: '台湾经济处', updateTime: '2023-01-03' },
      ];
      columns = [
        {
          title: '数据指标',
          dataIndex: 'title',
          key: 'title',
        },
        {
          title: '数据来源',
          dataIndex: 'dataSource',
          key: 'dataSource',
        },
        {
          title: '更新时间',
          dataIndex: 'updateTime',
          key: 'updateTime',
        },
      ];
    }

    return {
      title,
      data,
      columns,
    };
  });
});

const currentEnv = ref(process.env.VUE_APP_ENV); // 获取当前环境

const searchKeyword = ref('');

const handleSearch = () => {
  const baseUrl = 'https://iadev.cmfchina.com/IA/polymerize/search.html';
  const params = new URLSearchParams({
    orderBy: 'true',
    keyWordType: 'title',
    rangeCount: '31',
    q: searchKeyword.value,
    query_field: '',
    query_fie_name: '',
    field_str: '',
    field_show: '',
    scene: 'all'
  });

  const encodedUrl = `${baseUrl}?${params.toString()}`;
  window.open(encodedUrl, '_blank');
};
</script>

<style scoped>
.data-portal {
  background-color: #f5f5f5; /* 更改背景颜色为浅灰色 */
}

.title-bar {
  background-color: #dcdcdc; /* 更改标题栏颜色为灰色 */
}

.category-card {
  background-color: #e0e0e0; /* 更改分类卡片颜色为灰色 */
}

.section-title {
  color: #333; /* 更改标题颜色为深灰色 */
}

.search-bar-container {
  padding: 20px;
}

.search-bar {
  max-width: 500px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
}

.menu-link {
  color: #555; /* 更改菜单链接颜色为深灰色 */
}

.title-cell {
  color: #333; /* 更改标题单元格字体颜色为深灰色 */
}
</style>