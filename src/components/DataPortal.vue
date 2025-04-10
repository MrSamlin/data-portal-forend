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
        <!-- 分类标签导航区域 -->
        <div class="category-container">
          <!-- 左箭头 -->
          <div class="arrow left-arrow" @click="scrollCategories('left')" v-show="showLeftArrow">
            &lt;
          </div>
          
          <!-- 分类标签 -->
          <div class="category-row" ref="categoryRow">      
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
          
          <!-- 右箭头 -->
          <div class="arrow right-arrow" @click="scrollCategories('right')" v-show="showRightArrow">
            &gt;
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="content-area">
          <div class="content-sections">
            <div v-for="(section, index) in sections" :key="index" class="content-section">
              <div class="section-title">{{ section.title }}</div>
              <!-- 使用a-table，但采用简化的方式 -->
              <a-table
                v-if="section.data && section.data.length > 0"
                :columns="getSimplifiedColumns(section.title)"
                :dataSource="section.data"
                :pagination="false"
                :loading="section.loading"
                size="middle"
                rowKey="key"
                bordered
              >
                <template #headerCell="{ column }">
                  <span :style="{ color: '#777' }">
                    {{ column.title }}
                  </span>
                </template>
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'title'">
                    <!-- 打印 record 对象以供调试 -->
                    <a :href="record.jumpUrl" class="ant-link" target="_blank">{{ record.title }}</a>
                  </template>
                  <!-- 添加 else 模板以确保其他列也能正常渲染 -->
                  <template v-else>
                    {{ record[column.dataIndex] }}
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
import { ref, computed, onMounted, onBeforeMount, watch, shallowRef } from 'vue';
import axios from 'axios';
import type { TableColumnsType } from 'ant-design-vue';
import service from '@/utils/axios';
import { getToken } from '@/composables/useAuth';

interface CategoryResponse {
    categoryId: string;
    categoryName: string;
    icon: string;
    themeCode: string;
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

// 深度分析数据接口定义 (更新)
interface DeepAnalysisItem {
  id: number; // 使用 number 类型对应 Integer
  analysisName: string;
  jumpUrl?: string; // 可选
  viewCount?: number;
  status?: string;
  publishDate?: string | Date; // 日期可以是字符串或Date对象
  createDate?: string | Date;
  updateDate?: string | Date;
  createUser?: string;
  updateUser?: string;
  themeCode?: string;
}

// 指标数据接口定义
interface MetricsItem {
  id: number;
  metricsCode?: number; // 可能为 null，用可选
  metricName: string;
  parentId?: number;
  createUser?: string;
  updateUser?: string;
  createDate?: string | Date;
  updateDate?: string | Date;
  themeCode?: string;
}

const activeTab = ref(''); // 确保 activeTab 被声明

// 在script setup顶部添加
const currentThemeCode = ref('')


const categories = ref<CategoryResponse[]>([]);
const dashboardData = shallowRef<DashboardItem[]>([]);
const loadingDashboard = ref(false);
// 新增：指标数据和加载状态
const metricsData = shallowRef<MetricsItem[]>([]);
const loadingMetrics = ref(false);


// 新增：深度分析数据和加载状态
const deepAnalysisData = shallowRef<DeepAnalysisItem[]>([]);
const loadingDeepAnalysis = ref(false);

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

// 组件挂载前刷新token
onBeforeMount(async () => {
    if(process.env.NODE_ENV==='production'){
      await refreshToken()
    }

})

// 获取分类数据
const fetchCategories = async () => {      
    try {   
 // 每次请求前确保token是最新的
         if(process.env.NODE_ENV==='production'){
            await refreshToken()
          }
        const response = await service.get('/dataPortal/categories/topList', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authentication': pageToken.value
            }
        });
        
        if (response.data) {
            categories.value = response.data.map((item: CategoryResponse) => ({
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                icon: item.icon,
                themeCode: item.themeCode
            }));
            if(!activeTab.value){
               currentThemeCode.value = response.data[0].categoryName
              console.log('currentThemeCode',currentThemeCode.value);
            }
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




// 获取深度分析数据列表
const fetchDeepAnalysisList = async () => {      
    loadingDeepAnalysis.value = true;
    try {   
        if(process.env.NODE_ENV==='production'){
           await refreshToken()
         }
         
        const themeCodeForPath = currentThemeCode.value || 'default';
        const apiUrl = `/dataPortal/deepAnalysis/topList/${themeCodeForPath}`;

        // 明确指定期望的响应类型为 DeepAnalysisItem 数组
        const response = await service.get<DeepAnalysisItem[]>(apiUrl, { 
            headers: {
                'Accept': 'application/json',
                'user_token': pageToken.value 
            }
        });

        // 检查返回的数据是否为数组
        if (Array.isArray(response.data)) { 
          deepAnalysisData.value = response.data; // 直接赋值数组
        } else {
          deepAnalysisData.value = []; 
          console.warn('获取深度分析数据为空或返回结构不是数组'); // 更新警告信息
        }
    } catch (error) {
        console.error('获取深度分析数据失败:', error);
        deepAnalysisData.value = []; 
        if (axios.isAxiosError(error)) {
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
        }
    } finally {
        loadingDeepAnalysis.value = false;
    }
};


// 获取指标看板数据
const fetchDashboardData = async () => {
    loadingDashboard.value = true;
    try {    
        const response = await service.post('/dw/edbapply/v2/card/listEdbCardPage',
            {
                createUser: 1,
                pageNumber: 1,
                pageSize: 5,
                cardTitle: null,
                author: null,
                industryId: null,
                startCardDate: null,
                endCardDate: null,
                researchDirection: currentThemeCode.value
            },
            {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*',
              'Accept-Language': 'zh-CN,zh;q=0.9',
              'Authentication': pageToken.value,
              'Cache-Control': 'no-cache'
            }
          }
        );
        if (response.data.data && response.data.data.rows) {
            const newData = response.data.data.rows.map((item: any) => ({
                id: item.id,
                cardTitle: item.cardTitle || '无标题',
                cardDate: item.cardDate || item.gmtCreate || '未知日期',
                authorName: item.authorList && item.authorList.length > 0 
                    ? item.authorList[0].authorName 
                    : item.submitterName || '未知作者',
                viewCount: Math.floor(Math.random() * 1000) // 模拟数据，实际应从API获取
            }));
               dashboardData.value =  newData;
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
     if(process.env.NODE_ENV==='production'){
            await refreshToken()
          }
        const response = await service.post('/dw/edbapply/v2/indicatorSearch/queryClickTreeList',
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
              'Authentication': pageToken.value,
              'Accept-Language': 'zh-CN,zh;q=0.9',
           }
          }
        );
               
            
        if (response.data && response.data.rows) {
     
        }
    } catch (error) {
        console.error('获取指标看板数据失败:', error);
    } finally {
        loadingDashboard.value = false;
    }
};


//  获取指标数据列表
const fetchMetricsData = async (themeCode: string | null) => {      
    loadingMetrics.value = true;
    try {   
        if(process.env.NODE_ENV==='production'){
           await refreshToken()
         }
        const themeCodeForPath = themeCode || 'default';
        const apiUrl = `/dataPortal/metrics/topList/${themeCodeForPath}`;
        const response = await service.get<MetricsItem[]>(apiUrl, { 
            headers: {
                'Accept': 'application/json',
                'user_token': pageToken.value 
            }
        });
        if (Array.isArray(response.data)) { 
          metricsData.value = response.data;
        } else {
          metricsData.value = []; 
          console.warn('获取指标数据为空或返回结构不是数组');
        }
    } catch (error) {
        console.error('获取指标数据失败:', error);
        metricsData.value = []; 
        if (axios.isAxiosError(error)) {
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
        }
    } finally {
        loadingMetrics.value = false;
    }
};


 
// 监听activeTab变化
watch(activeTab, async (newTab) => {
  if (categories.value && categories.value.length > 0) {
    const currentCategory = categories.value.find(cat => cat.categoryId === newTab)
    if (currentCategory) {
      currentThemeCode.value = currentCategory.themeCode;
    } else {
      currentThemeCode.value = ''; // 如果找不到分类，清空 themeCode
    }
  }
  // 确保在 themeCode 更新后再调用 API
  if (newTab) { // 确保有新tab才请求
    await Promise.all([
      fetchDashboardData(),
      fetchDeepAnalysisList(),
      fetchMetricsData(currentThemeCode.value)
    ]);
  }
});    


 

// 组件挂载时获取数据
onMounted(async () => {
    try {
      if(process.env.NODE_ENV==='production'){
              // 确保token已刷新
          await refreshToken()
            }
       await fetchCategories()
     await fetchDashboardData()
     await fetchIndicatorByTheme()
      await fetchDeepAnalysisList()
        await fetchMetricsData(currentThemeCode.value)
        // 初始化检查
        setTimeout(() => {
            checkArrowsVisibility();
        }, 500);
        
        // 监听滚动事件
        if (categoryRow.value) {
            categoryRow.value.addEventListener('scroll', checkArrowsVisibility);
        }
    } catch (error) {
        console.error('初始化数据失败:', error)
    }
});

// 监听窗口大小变化
window.addEventListener('resize', () => {
    checkArrowsVisibility();
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
  let sectionTitles;
  console.log('metricsData',metricsData.value);
  const baseTitles = ['指标看板', '深度分析'];
   const metricNames = metricsData.value.map(item => item.metricName);
  if(process.env.NODE_ENV==='production'){
    sectionTitles = [...baseTitles, ...metricNames];
  } else {
    sectionTitles = [...baseTitles, ...metricNames];
  //  sectionTitles = ['指标看板', '深度分析', '销售额度', '产量', '库存', '价格'];
  }
  
  const result = sectionTitles.map(title => {
    let sectionData = [];
    let sectionLoading = false; // 添加局部 loading 变量
    
    try {
      if (title === '指标看板') {
        const dashboardItems = dashboardData.value;
        if(dashboardItems && dashboardItems.length > 0){
          sectionData = dashboardItems.map(item => ({
            key: item.id || `item-${Math.random().toString(36).substring(2)}`,
            title: item.cardTitle || '无标题',
            publishDate: item.cardDate || '未知日期',
            viewCount: item.viewCount || Math.floor(Math.random() * 1000),
            jumpUrl: item.jumpUrl // 添加 jumpUrl 字段
          }));
        }
        sectionLoading = loadingDashboard.value; // 链接到看板的 loading
      } else if (title === '深度分析') {
        const analysisItems = deepAnalysisData.value;
        if (analysisItems && analysisItems.length > 0) {
          sectionData = analysisItems.map(item => ({
            key: item.id, // 使用 id 作为 key
            title: item.analysisName || '无名称', // 使用 analysisName 作为 title
            publishDate: item.publishDate ? new Date(item.publishDate).toLocaleDateString() : '未知日期', // 使用 publishDate 并格式化
            viewCount: item.viewCount || 0, // 使用 viewCount
            jumpUrl: item.jumpUrl // 添加 jumpUrl 字段
          }));
        }
        sectionLoading = loadingDeepAnalysis.value;
      } else if (title === '销售额度') {
        sectionData = [
          { key: '1', title: '数据1', dataSource: '台湾经济处', updateTime: '2023-01-01' },
          { key: '2', title: '数据2', dataSource: '台湾经济处', updateTime: '2023-01-02' },
          { key: '3', title: '数据3', dataSource: '台湾经济处', updateTime: '2023-01-03' },
        ];
      } else if (title === '产量' || title === '库存' || title === '价格') {
        sectionData = [
          { key: '1', title: '数据1', dataSource: '台湾经济处', updateTime: '2023-01-01' },
          { key: '2', title: '数据2', dataSource: '台湾经济处', updateTime: '2023-01-02' },
          { key: '3', title: '数据3', dataSource: '台湾经济处', updateTime: '2023-01-03' },
        ];
      }
    } catch (err) {
      console.error(`处理${title}数据时出错:`, err);
    }
    
    return {
      title,
      data: sectionData,
      loading: sectionLoading // 使用对应的 loading 状态
    };
  });
  
  return result;
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

const scrollLeft = () => {
  // Implementation of scrollLeft function
};

const scrollRight = () => {
  // Implementation of scrollRight function
};

// 添加引用和状态变量
const categoryRow = ref<HTMLElement | null>(null);

const showLeftArrow = ref(false);
const showRightArrow = ref(false);

// 滚动分类
const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoryRow.value) return;

    const scrollAmount = 200; // 每次滚动的像素值
    const currentScroll = categoryRow.value.scrollLeft;
    
    if (direction === 'left') {
        categoryRow.value.scrollTo({
            left: Math.max(0, currentScroll - scrollAmount),
            behavior: 'smooth'
        });
    } else {
        categoryRow.value.scrollTo({
            left: currentScroll + scrollAmount,
            behavior: 'smooth'
        });
    }
    
    // 更新箭头可见性
    setTimeout(() => {
        checkArrowsVisibility();
    }, 300);
};

// 检查箭头可见性
const checkArrowsVisibility = () => {
    if (!categoryRow.value) return;
    const { scrollLeft, scrollWidth, clientWidth } = categoryRow.value;
  // 只有当分类超过可视区域时才考虑显示箭头
    const hasOverflow = scrollWidth > clientWidth;
    // 左箭头：当滚动位置大于0时显示
   // showLeftArrow.value = hasOverflow && scrollLeft > 0;
    
    // 右箭头：当还有内容可以向右滚动时显示
   // showRightArrow.value = hasOverflow && scrollLeft < (scrollWidth - clientWidth - 2);

       // 始终显示左右箭头，只要有内容溢出
    // 这样无论滚动位置如何，用户都能看到箭头并进行导航
    showLeftArrow.value = hasOverflow;
    showRightArrow.value = hasOverflow;
};

// 添加获取简化列的方法
const getSimplifiedColumns = (sectionTitle) => {
  if (sectionTitle === '指标看板') {
    return [
      { title: '看板标题', dataIndex: 'title', key: 'title', width: '50%' },
      { title: '发布日期', dataIndex: 'publishDate', key: 'publishDate', width: '25%' },
      { title: '浏览次数', dataIndex: 'viewCount', key: 'viewCount', width: '25%' }
    ];
  } else if (sectionTitle === '深度分析') {
    // 更新深度分析的列定义以匹配新数据结构
    return [
      { title: '分析名称', dataIndex: 'title', key: 'title', width: '50%' }, // 标题改为 分析名称
      { title: '发布日期', dataIndex: 'publishDate', key: 'publishDate', width: '25%' }, // 标题改为 发布日期
      { title: '浏览次数', dataIndex: 'viewCount', key: 'viewCount', width: '25%' } // 标题改为 浏览次数
    ];
  } else if (sectionTitle === '销售额度' || sectionTitle === '产量' || sectionTitle === '库存' || sectionTitle === '价格') {
    return [
      { title: '数据名称', dataIndex: 'title', key: 'title', width: '40%' },
      { title: '数据来源', dataIndex: 'dataSource', key: 'dataSource', width: '30%' },
      { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: '30%' }
    ];
  }
  return [];
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
  min-width: 100px; /* 减小最小宽度 */
  padding: 8px 15px; /* 减小内边距 */
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
  white-space: nowrap; /* 防止文本换行 */
  font-size: 14px; /* 减小字体大小 */
}

.section-title {
  color: #333; /* 更改标题颜色为深灰色 */
}

.search-bar {
 
  background-color: #ffffff    /* 更改搜索栏颜色为灰色 */
 

}

.menu-link {
  color: #555; /* 更改菜单链接颜色为深灰色 */
}

.title-cell {
  color: #333; /* 更改标题单元格字体颜色为深灰色 */
}

/* 添加分类容器样式 */
.category-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
}

/* 调整分类行样式使其支持滚动 */
.category-row {
  display: flex;
  overflow-x: auto; /* 允许水平滚动 */
  scroll-behavior: smooth;
  width: 100%;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  padding: 5px 0;
}

/* 隐藏滚动条 */
.category-row::-webkit-scrollbar {
  display: none;
}

/* 箭头样式 */
.arrow {
  position: absolute;
  z-index: 2;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.3); /* 半透明黑色 */
  padding: 10px 15px;
  border-radius: 5px;
  font-weight: bold;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.arrow:hover {
  background-color: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.left-arrow {
  left: 0px;
}

.right-arrow {
  right: 0px;
}

/* 备用表格样式 */
.fallback-table {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
}

.fallback-header {
  display: flex;
  background-color: #f7f7f7;
  font-weight: bold;
  border-bottom: 1px solid #eee;
}

.fallback-row {
  display: flex;
  border-bottom: 1px solid #eee;
}

.fallback-row:last-child {
  border-bottom: none;
}

.fallback-cell {
  padding: 8px 12px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 自定义表格样式 */
.custom-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #eaeaea;
  margin-top: 10px;
}

.custom-table th, 
.custom-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #eaeaea;
}

.custom-table th {
  background-color: #f5f5f5;
  font-weight: 500;
  color: #333;
}

.custom-table tr:hover {
  background-color: #f9f9f9;
}

.title-link {
  color: #1890ff;
  text-decoration: none;
}

.title-link:hover {
  text-decoration: underline;
}

.no-data {
  padding: 20px;
  text-align: center;
  color: #999;
  background: #f9f9f9;
  border: 1px solid #eaeaea;
  border-radius: 4px;
}
</style>
     
     