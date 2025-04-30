import service from '@/utils/axios'
import type { DeepAnalysisItem, MetricsItem } from '@/types/index'; // 确保类型已定义

// API路径前缀
const DATA_PORTAL_PREFIX = '/dataPortal';

const API_PREFIX_DW = '/dw/edbapply/v2';

export const searchApiUrl =   'https://iadev.cmfchina.com/IA/polymerize/search.html';

// export const searchApiUrl =   'https://ia.cmfchina.com/IA/polymerize/search.html';

export const dashCardUrl =  'http://192.168.126.158:8188/web-main/#/dataCardDetail';
// ?token=6cfd77f6-de98-4f57-ace7-7b84a7ecf0371&type=get&id=2c17a80664e24cbdaa0f9f95515b17c5   数据来源:主题下的行业(多个，并且不同主题可同个行业) 


export const getIndicatorUrl = (token: string, indicatorCode: string) => {
  return `https://jstest.cmfchina.com/web-main/#/dataChartDetail?token=${token}&hideMenu=true&layout=false&type=getChart&codes=${indicatorCode}`;
};

// 分类相关API
export const commonApi = {
   /**
   * 获取顶部导航分类列表
   */
   getTopCategoriesList(token: string) {
    return service.get(`${DATA_PORTAL_PREFIX}/categories/topList`, {
      headers: {
        'Accept': 'application/json',
        'Authentication': token
      }
    });
  },

    /**
   * 获取深度分析顶部列表
   */
    getDeepAnalysisTopList(themeCode: string | null, token: string) {
      const themeCodeForPath = themeCode || 'default';
      const apiUrl = `${DATA_PORTAL_PREFIX}/deepAnalysis/topList/${themeCodeForPath}`;
      // 注意：这里返回 Promise<AxiosResponse<DeepAnalysisItem[]>>
      return service.get<DeepAnalysisItem[]>(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'user_token': token // API 使用 user_token ?
        }
      });
    },
  

  /**
   * 获取指标数据顶部列表
   */
  getMetricsTopList(themeCode: string | null, token: string) {
    const themeCodeForPath = themeCode || 'default';
    const apiUrl = `${DATA_PORTAL_PREFIX}/metrics/topList/${themeCodeForPath}`;
    // 注意：这里返回 Promise<AxiosResponse<MetricsItem[]>>
    return service.get<MetricsItem[]>(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'user_token': token // API 使用 user_token ?
      }
    });
  },

    /**
   * 获取指标看板卡片分页列表
   */
    listEdbCardPage(payload: any, token: string) {
      // payload 应包含 researchDirection, pageNumber, pageSize 等
      return service.post(`${API_PREFIX_DW}/card/listEdbCardPage`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'Authentication': token,
          'Cache-Control': 'no-cache'
        }
      });
    },

  /**
   * 查询点击树列表（指标数据？）
   */
  queryClickTreeList(payload: any, token: string) {
    // payload 应包含 indicatorCode, indicatorKeyName 等
     return service.post(`${API_PREFIX_DW}/indicatorSearch/queryClickTreeList`, payload, {
       headers: {
         'Content-Type': 'application/json',
         'Accept': 'application/json, text/plain, */*',
         'Authentication': token
       }
     });
  },

  /**
   * 获取指标数据列表 
   */
  getMetricsDataList(themeCode: string | null, token: string) {
    const themeCodeForPath = themeCode || 'default';
    const apiUrl = `${DATA_PORTAL_PREFIX}/metrics/topList/${themeCodeForPath}`;
    // 注意：这里返回 Promise<AxiosResponse<MetricsItem[]>>
    return service.get<MetricsItem[]>(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'user_token': token // API 使用 user_token ?
      }
    });
  } ,
  fetchIndustryDataByCategory(categoryName: string, token: string) {
    // 构建请求体
    const payload = {
      size: 4, // 固定 size 为 5
      categoryName: categoryName // 使用传入的 categoryName
    };
    const apiUrl = `${DATA_PORTAL_PREFIX}/indicatorSearch/fetchIndustryDataByIndustry`;

    // 发起 POST 请求
    return service.post(apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // 根据实际 API 调整 Accept 头
        'Authentication': token      // 假设使用 'Authentication' 作为 Token 的 Header Key
        // 如果需要其他 header，在这里添加
      }
    });
  },


};