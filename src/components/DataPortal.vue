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
              v-for="(category, index) in categories"
              :key="category.categoryId"
              class="category-card"
              :class="{ active: activeTab === category.categoryId }"
              :style="{
                backgroundImage: category.icon ? `url('./icon/${category.icon}')` : undefined,
                zIndex: categories.length - index,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }"
              :data-category="category.categoryId"
              @click="activeTab = category.categoryId">
              <div class="category-label">{{ category.categoryName }}</div>
              <img
                v-if="category.bannerImage"
                :src="`./img/${category.bannerImage}`"
                alt="" 
                class="category-banner-image"
              />
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
              <div class="section-title">{{ section.title }}
                <el-tag
                  v-if="section.tag === 1"
                  type="warning"
                  size="small"
                  style="margin-left: 8px;"
                  effect="dark" 
                >
                  重要
                </el-tag>
                </div>

              <div v-if="section.title === '指标看板'||section.title === '深度分析'" class="dashboard-controls">
                <div class="search-bar">
                <input
                        v-if="section.title === '指标看板'"
                        type="text"
                        v-model="dashboardSearchKeyword"
                        placeholder="搜索看板标题"
                        @keyup.enter="handleDashboardSearch(section.title)"
                    />
                    <input
                        v-else-if="section.title === '深度分析'" 
                        type="text"
                        v-model="deepAnalysisSearchKeyword"
                        placeholder="搜索深度分析标题"
                        @keyup.enter="handleDashboardSearch(section.title)"
                    />
                  <button @click="handleDashboardSearch(section.title)">搜索</button>
                </div>
              </div>

              <!-- 使用a-table -->
              <a-table
                v-if="section.data && section.data.length > 0"
                :columns="getSimplifiedColumns(section.title)"
                :dataSource="section.data"
                :loading="section.loading"
                size="middle"
                rowKey="key"
                bordered
                :pagination="section.title === '指标看板'||section.title === '深度分析' ? {
                  current: section.title === '指标看板' ? dashboardCurrentPage : deepAnalysisCurrentPage,
                  pageSize: section.title === '指标看板' ? dashboardPageSize : deepAnalysisPageSize,
                  total: section.title === '指标看板' ? dashboardTotalItems : deepAnalysisTotalItems,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  position: ['bottomCenter'],
                   locale: { jump_to: '跳至', page: '页' },
                    showTotal: (total, range) => `共 ${total} 条`
                } : false" 
    @change="(antPagination, antFilters, antSorter, antExtra) => handleDashboardTableChange(section.title, antPagination, antFilters, antSorter, antExtra)"
              >
                <template #headerCell="{ column }">
                  <span :style="{ color: '#777' }">
                    {{ column.title }}
                  </span>
                </template>
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'title'">
                   <a v-if="section.title === '深度分析'"  :href="record.jumpUrl" class="ant-link" target="_blank"  @click="handleDeepAnalysisClick(record)"  > {{ record.title }} </a>
                    <a  v-else  :href="record.jumpUrl" class="ant-link" target="_blank">{{ record.title }}</a>
                  </template>
                  <template v-else>
                    {{ record[column.dataIndex] }}
                  </template>
                </template>
              </a-table>
              <div v-else class="no-data-placeholder">
                 <span v-if="section.loading">加载中...</span>
                 <span v-else>暂无数据</span>
              </div>
            </div>
          </div>
        </div>
      </div>
       <SidePlatformMenu :token="pageToken" /> 
    </div>
  </div>
</template>



<script setup lang="ts">
import { ref, computed, onMounted, onBeforeMount, watch, shallowRef } from 'vue';
import axios from 'axios';
import {commonApi,addDeepAnalysisPv } from '@/api/commonApi';
import type { TableColumnsType } from 'ant-design-vue';
import service,{ dashCardUrl,searchApiUrl,getIndicatorUrl} from '@/utils/axios';
import { getToken } from '@/composables/useAuth';
import type { CategoryResponse, DashboardItem, DeepAnalysisItem, MetricsItem } from '@/types/index';

import { isDevelopment,isProduction } from '@/utils/env'
import { ElMessage } from 'element-plus';
import { generateMockIndicatorData } from '@/mock/treeMockApi';
import { getPrefixedImageUrl } from '@/utils/imgUtils';
import SidePlatformMenu from '@/components/SidePlatformMenu.vue';

import { generateMockDashboardData } from '@/mock/dashboardMock';

const activeTab = ref(''); 

// 主题
const currentThemeCode = ref('')

// 行业
const currentIndustryCode = ref('')
const categories = ref<CategoryResponse[]>([]);
const dashboardData = shallowRef<DashboardItem[]>([]);
const loadingDashboard = ref(false);
// 新增：指标数据和加载状态
const metricsData = shallowRef<MetricsItem[]>([]);
const loadingMetrics = ref(false);
// 添加一个全局指标加载状态
const indicatorsLoading = ref(false);

// 新增：深度分析数据和加载状态
const deepAnalysisData = shallowRef<DeepAnalysisItem[]>([]);
const loadingDeepAnalysis = ref(false);


// 页面级别的token状态
const pageToken = ref('');

// 新增：指标看板分页和搜索状态
const dashboardSearchKeyword = ref('');

const dashboardCurrentPage = ref(1);
const dashboardPageSize = ref(5); // 与后台 pageSize 对应，或 a-table 默认值
const dashboardTotalItems = ref(0);

// 深度分析分页和搜索状态
const deepAnalysisSearchKeyword = ref('');
const deepAnalysisCurrentPage = ref(1);
const deepAnalysisPageSize = ref(5);
const deepAnalysisTotalItems = ref(0);






// 添加一个新的 ref 存储指标详细数据
const indicatorResults = ref<Array<{
  metricName: string;
  metricsCode: string;
  indicatorData: any;
  metricType:string;
  tag:string;
  error?: any;
}>>([]);




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
    if(isProduction){
      await refreshToken()
    }
})

// 获取分类数据
const fetchCategories = async () => {      
    try {   
  // 每次请求前确保token是最新的
         if(isProduction){
            await refreshToken()
          }
        const response = await  commonApi.getTopCategoriesList(pageToken.value);
        if (response.data) {
            categories.value = response.data.map((item: CategoryResponse) => ({
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                icon: item.icon,
                themeCode: item.themeCode,
                bannerImage:item.bannerImage
            }));
            if(!activeTab.value){
               currentThemeCode.value = response.data[0].categoryName
               currentIndustryCode.value = response.data[0].themeCode
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
      const apiCurrentPage = (deepAnalysisCurrentPage.value - 1) * deepAnalysisPageSize.value;
        const payload: DeepAnalysisQueryPayload = {
          currentPage:apiCurrentPage, // 使用共享的当前页码
          size: deepAnalysisPageSize.value,   // 使用共享的每页条目数
          analysisName: deepAnalysisSearchKeyword.value.trim() || undefined, // 搜索关键词
          categoryName: currentThemeCode.value   // 主题  
        };
        if(isProduction){
           await refreshToken()
         }
        const response = await commonApi.getAllDeepAnalysisList(payload,pageToken.value);
        // 检查返回的数据是否为数组
        if (Array.isArray(response.data.data)) { 
          deepAnalysisData.value = response.data.data; // 直接赋值数组
            deepAnalysisTotalItems.value = response.data.total || 0; 
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
         let response;
          if(isDevelopment){
          response = { 
             data: generateMockDashboardData({
               baseTotalCount: 55, 
               page: dashboardCurrentPage.value,
               size: dashboardPageSize.value,
               keyword: dashboardSearchKeyword.value
             })
          };
          }else {
              response =    await commonApi.listEdbCardPage(
                          {
                              createUser: 1,
                              pageNumber:  dashboardCurrentPage.value,
                              pageSize: dashboardPageSize.value,  
                              cardTitle: dashboardSearchKeyword.value.trim(),
                              author: null,
                              industryId: null,
                              startCardDate: null,
                              endCardDate: null,
                              researchDirection: currentIndustryCode.value || null, 
                          },
                          pageToken.value
                        );
          }
          const innerData = response.data?.data;
        if (innerData &&innerData.rows) {
           dashboardData.value = innerData.rows.map((item: any) => ({
                id: item.id,
                cardTitle: item.cardTitle || '无标题',
                cardDate: item.cardDate || item.gmtCreate || '未知日期',
                authorName: item.authorList && item.authorList.length > 0 
                    ? item.authorList[0].authorName 
                    : item.submitterName || '未知作者',
                viewCount:item.browseCount,
                jumpUrl:dashCardUrl + '?token=' + pageToken.value + '&type=get&id=' + item.cardCode  // 模拟数据，实际应从API获取
            }));
              dashboardTotalItems.value = innerData.total||0;
        }else {
              dashboardData.value = [];
            dashboardTotalItems.value = 0;
            console.warn('获取指标看板数据为空或返回结构不正确', response.data);
        }
    } catch (error) {
        console.error('获取指标看板数据失败:', error);
         dashboardData.value = [];
        dashboardTotalItems.value = 0;
    } finally {
        loadingDashboard.value = false;
    }
};

// 指标看板搜索处理
const handleDashboardSearch = (title: string) => {
  if(title === '指标看板' ){
     dashboardCurrentPage.value = 1; // 搜索后重置到第一页
    fetchDashboardData();
  }
  if(title === '深度分析'){
    deepAnalysisCurrentPage.value = 1 ;
    fetchDeepAnalysisList();
  }
};


interface AntTablePagination {
  current: number;
  pageSize: number;
  total?: number;
}

// 指标看板表格变化处理（分页、排序等）
const handleDashboardTableChange = (title: string,paginationInfo: AntTablePagination, filtersInfo: any, sorterInfo: any,extraInfo?: any ) => {
 
  if (!paginationInfo || typeof paginationInfo.current !== 'number' || typeof paginationInfo.pageSize !== 'number') {
    console.error('Invalid or missing pagination object from a-table change event.');
    return;
  }
 if (title === '指标看板') {
    dashboardCurrentPage.value = paginationInfo.current;
    dashboardPageSize.value = paginationInfo.pageSize;
    fetchDashboardData();
  } else if (title === '深度分析') {
    deepAnalysisCurrentPage.value = paginationInfo.current;
    deepAnalysisPageSize.value = paginationInfo.pageSize;
    fetchDeepAnalysisList();
  } else {
    console.warn(`Unhandled section title in handleDashboardTableChange: "${title}"`);
  }
};



//  获取指标数据TOP4
const fetchMetricsData = async (themeCode: string | null) => {      
    loadingMetrics.value = true;
    try {   
        if(isProduction){
           await refreshToken()
         }
        const themeCodeForPath = themeCode || 'default';
      // 从mysql中获取指标表数据
       const response = await commonApi.getMetricsDataList(currentIndustryCode.value,pageToken.value);
      //  从oracle中获取指标数据
       // const response = await commonApi.fetchIndustryDataByCategory(currentIndustryCode.value,pageToken.value);
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

// 根据指标代码获取详细数据
const fetchIndicatorByTheme = async () => {
    indicatorsLoading.value = true;
  if (!metricsData.value || metricsData.value.length === 0) {
    console.log('没有指标数据可请求');
    return;
  }
  
  try {
    if (isProduction) {
      await refreshToken();
    }
    // 创建一个数组来存储所有请求的Promise
    const requests = metricsData.value.map(async (metric) => {
      try {
         let indicatorData;
         const response =await  commonApi.getMetricsDataByMetricType({
            metricType: metric.metricType,  
            themeCode: metric.themeCode 
          } 
        );
         // const response = await commonApi.queryClickTreeList(
        //   {
        //     indicatorCode: metric.metricsCode, // 使用每个指标的metricsCode
        //     indicatorKeyName: "",  // 根据实际需求调整这些参数
        //     indicatorName: "",
        //     noteCategory: "",
        //     queryType: 0
        //   },
        //   pageToken.value
        // );
        const indicatorItems = Array.isArray(response.data ) ? response.data  : [];
        // 这里可以处理返回的数据
         const tableData = indicatorItems.map((item, index) => ({
          key: item.metricsCode,
          title: item.metricName || '未命名指标',
          dataSource: item.dataSource || '未知来源',
          updateTime: item.updateDate || '',
          jumpUrl:  getIndicatorUrl(pageToken.value, item.indicatorCode || '')  
        }));
          return {
            metricName: metric.metricName,
            metricsCode: metric.indicatorCode,
            metricType: metric.metricType,
             tag: metric.tag,
            indicatorData: tableData
          };
       
      } catch (error) {
        console.error(`获取指标 ${metric.metricName} 数据失败:`, error);
        return {
          metricName: metric.metricName,
          metricsCode: metric.indicatorCode,
          metricType: metric.metricType,
          tag: metric.tag,
          indicatorData: null,
          error: error
        };
      }
    });
    
    // 等待所有请求完成
    const results = await Promise.all(requests);
    indicatorResults.value = results;
  } catch (error) {
    console.error('批量获取指标数据失败:', error);
  }finally {
    indicatorsLoading.value = false;
  }
};

 
// 监听activeTab变化
watch(activeTab, async (newTab) => {

  if (categories.value && categories.value.length > 0) {
    const currentCategory = categories.value.find(cat => cat.categoryId === newTab)
    if (currentCategory) { 
      currentThemeCode.value = currentCategory.categoryName;
      currentIndustryCode.value = currentCategory.themeCode;
    } else {
      currentThemeCode.value = ''; // 如果找不到分类，清空 themeCode
    }
  }

  // 确保在 themeCode 更新后再调用 API
  if (newTab) { // 确保有新tab才请求

    await fetchMetricsData(currentThemeCode.value);
    await fetchIndicatorByTheme();

    await Promise.all([
      fetchDashboardData(),
      fetchDeepAnalysisList()
    ]);

    deepAnalysisCurrentPage.value =1 ;
     dashboardCurrentPage.value = 1; // 切换tab时重置看板到第一页
    dashboardSearchKeyword.value = ''; // 清空搜索条件
    deepAnalysisSearchKeyword.value ='';
    await fetchDashboardData(); // 主动获取指标看板数据
  }
});    


// 组件挂载时获取数据
onMounted(async () => {
    try {
      if(isProduction){
              // 确保token已刷新
          await refreshToken()
            }
       await fetchCategories()
     //  await fetchDashboardData()
       await fetchDeepAnalysisList()
       await fetchMetricsData(currentThemeCode.value)
       await fetchIndicatorByTheme()
        // 初始化检查
        setTimeout(() => {
            checkArrowsVisibility();
        }, 500);
        
        // 监听滚动事件
        if (categoryRow.value) {
            categoryRow.value.addEventListener('scroll', checkArrowsVisibility);
        }


          if (categories.value.length > 0 && !activeTab.value) {
        activeTab.value = categories.value[0].categoryId; // watch 会触发
      } else if (activeTab.value) { // 如果已有 activeTab
        await fetchDashboardData();
      } else {
        // 如果 categories 为空，或者没有初始 activeTab, 依然尝试加载一次默认看板数据
        // (如果业务逻辑允许在没有特定分类时显示看板)
        await fetchDashboardData();
      }
    } catch (error) {
        console.error('初始化数据失败:', error)
    }
});

// 监听窗口大小变化
window.addEventListener('resize', () => {
    checkArrowsVisibility();
});
 

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
  const baseTitles = ['指标看板', '深度分析'];
  //  oracle 
  // const metricNames = metricsData.value.map(item => item.indicatorType);
  //  mysql 
   const metricTypes = metricsData.value.map(item => item.metricType);
  if(isProduction){
    sectionTitles = [...baseTitles, ...metricTypes];
  } else {
    sectionTitles = [...baseTitles, ...metricTypes];
  }
  const result = sectionTitles.map(title => {
    let sectionData = [];
    let sectionLoading = false;
    let sectionTag = null;
    try {
      if (title === '指标看板') {
        const dashboardItems = dashboardData.value;
        if (dashboardItems && dashboardItems.length > 0) {
          sectionData = dashboardItems.map(item => ({
            key: item.id,
            title: item.cardTitle || '无标题',
            publishDate: item.cardDate || '未知日期',
            viewCount: item.viewCount,
            jumpUrl: item.jumpUrl 
          }));
        }
        sectionLoading = loadingDashboard.value;
      } else if (title === '深度分析') {
        const analysisItems = deepAnalysisData.value;
        if (analysisItems && analysisItems.length > 0) {
          sectionData = analysisItems.map(item => ({
            key: item.id,
            title: item.analysisName || '无名称',
            publishDate: item.publishDate ? new Date(item.publishDate).toLocaleDateString() : '未知日期',
            viewCount: item.viewCount || 0,
            jumpUrl: item.jumpUrl 
          }));
        }
        sectionLoading = loadingDeepAnalysis.value;
      } else {
        // 这是指标部分 - 从indicatorResults中查找相应的数据
        const matchingResult = indicatorResults.value.find(result => result.metricType === title);
        if (matchingResult) {
          if( matchingResult.indicatorData){
            sectionData = matchingResult.indicatorData;
          }
          if( matchingResult.tag){
            sectionTag = matchingResult.tag;
          }
        }
        sectionLoading = indicatorsLoading.value;
      }
    } catch (err) {
      console.error(`处理 ${title} 数据时出错:`, err);
    }
    
    return {
      title,
      data: sectionData,
      loading: sectionLoading,
        tag: sectionTag 
    };
  });
  return result;
});

const currentEnv = ref(process.env.VUE_APP_ENV); // 获取当前环境

const searchKeyword = ref('');

const handleSearch = () => {
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
  const encodedUrl = `${searchApiUrl}?${params.toString()}`;
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

// 生成指标跳转URL的示例
const generateJumpUrl = (indicatorCode: string) => {
  return getIndicatorUrl(pageToken.value, indicatorCode);
};

// 检查箭头可见性
const checkArrowsVisibility = () => {
    if (!categoryRow.value) return;
    const { scrollLeft, scrollWidth, clientWidth } = categoryRow.value;
  // 只有当分类超过可视区域时才考虑显示箭头
    const hasOverflow = scrollWidth > clientWidth;
    // 左箭头：当滚动位置大于0时显示
    showLeftArrow.value = hasOverflow && scrollLeft > 0;
    
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
  }  else  {
    return [
      { title: '数据指标', dataIndex: 'title', key: 'title', width: '40%' },
      { title: '数据来源', dataIndex: 'dataSource', key: 'dataSource', width: '30%' },
      { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: '30%', formatter: formatDate }
    ];
  }
};
 

// 处理深度分析项点击事件
const handleDeepAnalysisClick = async (record: any) => {
  if (!record || !record.key) {
    console.error('无法获取深度分析项 ID');
    return;
  }
  const analysisId = record.key;
  try {
      if(isProduction){
         await refreshToken(); // 确保 token 是最新的
      }
      commonApi.addDeepAnalysisPv(analysisId,pageToken.value);
       await fetchDeepAnalysisList();
  } catch (error) {
     console.error(`增加深度分析项 ${analysisId} PV失败:`, error);
     ElMessage.error('更新浏览次数失败'); // 显示错误提示
     if (axios.isAxiosError(error)) {
          console.error('Error details:', {
              message: error.message,
              status: error.response?.status,
              data: error.response?.data
          });
      }
  }
};


// 日期格式化
const formatDate = (row: any, column: any, cellValue: string, index: number) => {
  if (!cellValue) return '';
  try {
    return cellValue.replace('T', ' ').substring(0, 19);
  } catch (e) {
    return cellValue;
  }
};


 
</script>                  

<style scoped>
.category-banner-image {
  position: absolute;
  right: 8.5px;  
  bottom: 8.5px;
  width: 70px;  
  height: 70px; 
  object-fit: contain;  
  opacity: 0.7; 
  pointer-events: none;  
  z-index: 1; 
}

.category-row {
  display: flex;
  align-items: center; 
  /* padding-left: 20px;  之前为重叠效果添加的，如果箭头在外部，可能不需要，或者需要调整 */
  /* 确保横向滚动正常工作 */
  overflow-x: auto; 
  /* 隐藏滚动条，如果需要的话 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE 10+ */
}
.category-row::-webkit-scrollbar { /* WebKit */
  display: none;
}
 

/* 箭头样式 */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 101; /* 确保箭头在所有卡片之上 */
  background-color: rgba(150, 150, 150, 0.6); /* 半透明背景，确保可见 */
  color: white;
  border: none;
  border-radius: 50%; /* 圆形 */
  width: 36px; /* 调整大小 */
  height: 36px; /* 调整大小 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease;
  font-size: 20px;
  line-height: 1;
}

.arrow:hover {
  background-color: rgba(120, 120, 120, 0.8); /* 悬停时加深背景 */
}

.left-arrow {
  left: 10px; /* 定位在 category-container 的内边距区域 */
}

.right-arrow {
  right: 10px; /* 定位在 category-container 的内边距区域 */
}

.dashboard-controls {
    margin-top: 10px;
    margin-left: 15px;
    margin-bottom: 10px; /* 增加一些底部间距 */
}

/* 调整指标看板区域内的 search-bar 样式 */
.dashboard-controls .search-bar {
  width: 300px; /* 设置一个适合看板区域的宽度，可以根据需要调整 */
  margin: 0;    /* 移除全局 .search-bar 可能带有的 auto margin */
  background-color: transparent; /* 如果全局样式有背景色，这里可以覆盖为透明 */
  /* 确保 flex 布局以正确排列 input 和 button */
  display: flex; 
  gap: 5px; /* 可以调整输入框和按钮之间的间距 */
}

/* 缩小指标看板搜索框的 input */
.dashboard-controls .search-bar input {
  padding: 6px 10px; /* 减小上下和左右内边距 */
  font-size: 13px;   /* 减小字体大小 */
  height: 32px;      /* 可以明确设置一个较小的高度 */
  /* 其他需要的样式调整 */
}

/* 缩小指标看板搜索框的 button */
.dashboard-controls .search-bar button {
  padding: 6px 15px; /* 减小上下和左右内边距 */
  font-size: 13px;   /* 减小字体大小 */
  height: 32px;      /* 保持与输入框一致的高度 */
  min-width: auto;   /* 移除全局样式中可能设置的最小宽度，使其自适应内容 */
  /* 其他需要的样式调整 */
}
</style>