<template>
  <div class="data-portal">
    <div class="search-bar-container">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="请输入搜索关键词" 
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch">搜索</button>
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
                :loading="section.loading"
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


interface DashboardItem {
    id: string;
    cardTitle: string;
    cardDate?: string;
    auditStatus?: string;
    authorList?: Array<{
        authorName: string;
    }>;
    submitterName?: string;
    gmtCreate?: string;
    viewCount?: number;  
}

const activeTab = ref('car'); // 确保 activeTab 被声明
const categories = ref<CategoryResponse[]>([]);
const dashboardData = ref<DashboardItem[]>([]);
const loadingDashboard = ref(false);

// 获取分类数据
const fetchCategories = async () => {      
    try {
        console.log('Fetching categories...');
        const response = await service.get('/api/categories/top', {  // 保持 /api 前缀
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data) {
            console.log('Response data:', response.data);
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


// 获取指标看板数据
const fetchDashboardData = async () => {
    loadingDashboard.value = true;
    try {
        const response = await service.post('/api/edbapply/v2/card/listEdbCardPage',
            {
                createUser: 1,
                pageNumber: 1,
                pageSize: 5,
                cardTitle: null,
                author: null,
                industryId: null,
                startCardDate: null,
                endCardDate: null
            },
            {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*',
              'Accept-Language': 'zh-CN,zh;q=0.9',
              'Authentication': '5cab2e44-7e64-41fa-aea4-d6ffe42f46a32', // 使用正确的Authentication值
              'Cache-Control': 'no-cache',
              'Origin': 'https://iadev.cmfchina.com  ',
              'Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoi5YiY5p2wIiwic291cmNlIjoiY21mX2NhbGVuZGFyIiwidXNlck5hbWUiOiJsaXVqaWUiLCJleHAiOjE3NDI0NTYwODEsInVzZXJJZCI6IjIxNzk2MTAifQ.YAehN4-PFoTegyDfP7OHjJ8KyVGknJiOTX5ohNZ8VTA'
              // Cookie可能也很重要，但在前端代码中通常会自动发送
              // 'Cookie': 'JSESSIONID=9851DE2660A9D37D27BB31D40920CDB3; sajssdk_2015_cross_new_user=1; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%22%E5%88%98%E6%9D%B02179610%22%2C%22first_id%22%3A%22195ad158455ac2-0f0490ae2da6cd8-26001a51-2073600-195ad158456dc1%22%2C%22props%22%3A%7B%7D%2C%22%24device_id%22%3A%22195ad158455ac2-0f0490ae2da6cd8-26001a51-2073600-195ad158456dc1%22%7D'
            }
          }
        );
        
        console.log('Dashboard API response:', response.data);
        
        if (response.data && response.data.rows) {
            dashboardData.value = response.data.rows.map((item: any) => ({
                id: item.id,
                cardTitle: item.cardTitle || '无标题',
                cardDate: item.cardDate || item.gmtCreate || '未知日期',
                authorName: item.authorList && item.authorList.length > 0 
                    ? item.authorList[0].authorName 
                    : item.submitterName || '未知作者',
                auditStatus: item.auditStatus || '未知状态',
                viewCount: Math.floor(Math.random() * 1000) // 模拟数据，实际应从API获取
            }));
        }
    } catch (error) {
        console.error('获取指标看板数据失败:', error);
    } finally {
        loadingDashboard.value = false;
    }
};



// 根据主题获取  指标数据
const fetchIndicatorByTheme = async () => {
    loadingDashboard.value = true;
    try {
        const response = await service.post('/api/edbapply/v2/indicatorSearch/queryClickTreeList',
            {
                indicatorCode: 1,
                indicatorKeyName: 1,
                indicatorName: 5,
                noteCategory: null,
                queryType: null 
            },
            {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*',
              'Accept-Language': 'zh-CN,zh;q=0.9',
              'Authentication': '5cab2e44-7e64-41fa-aea4-d6ffe42f46a32' // 使用正确的Authentication值
           }
          }
        );
               
        if (response.data && response.data.rows) {
            dashboardData.value = response.data.rows.map((item: any) => ({
                id: item.id,
                cardTitle: item.cardTitle || '无标题',
                cardDate: item.cardDate || item.gmtCreate || '未知日期',
                authorName: item.authorList && item.authorList.length > 0 
                    ? item.authorList[0].authorName 
                    : item.submitterName || '未知作者',
                auditStatus: item.auditStatus || '未知状态',
                viewCount: Math.floor(Math.random() * 1000) // 模拟数据，实际应从API获取
            }));
        }
    } catch (error) {
        console.error('获取指标看板数据失败:', error);
    } finally {
        loadingDashboard.value = false;
    }
};


https://iadev.cmfchina.com/dw/edbapply/v2/indicatorSearch/queryClickTreeList  

// 组件挂载时获取数据
onMounted(() => {
    fetchCategories();
    fetchDashboardData();
    fetchIndicatorByTheme();
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
  const sectionTitles = ['指标看板', '深度分析', '销售额度', '产量', '库存', '价格'];
  return sectionTitles.map(title => {
    let data;
    let columns;

    if (title === '指标看板') {
   // 使用从API获取的数据
      data = dashboardData.value.map(item => ({
        title: item.cardTitle,
        publishDate: item.cardDate || '未知日期',
        viewCount: item.viewCount || 0,
        author: item.authorName || '未知作者',
        status: item.auditStatus || '未知状态',
        isNew: new Date(item.cardDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000, // 7天内为新
      }));
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
      loading: title === '指标看板' ? loadingDashboard.value : false 
    };
  });
});

const currentEnv = ref(process.env.VUE_APP_ENV); // 获取当前环境

const searchKeyword = ref('');

const handleSearch = () => {
  const baseUrl = 'https://iadev.cmfchina.com/IA/polymerize/search.html  ';
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

.search-bar {
  background-color: #ffffff; /* 更改搜索栏颜色为灰色 */
}

.menu-link {
  color: #555; /* 更改菜单链接颜色为深灰色 */
}

.title-cell {
  color: #333; /* 更改标题单元格字体颜色为深灰色 */
}
</style>