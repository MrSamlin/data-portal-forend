import service from '@/utils/axios';
import type { DeepAnalysisItem, MetricsItem,PlatformMenuItem,PaginatedDeepAnalysisResult,DeepAnalysisQueryPayload } from '@/types/index'; // 确保类型已定义

const API_PREFIX_DW = '/dw/edbapply/v2';


// API路径前缀
const DATA_PORTAL_PREFIX = '/cmfwxrobot';
//  文件上传地址
export const uploadActionUrl = `${DATA_PORTAL_PREFIX}/menuItem/uploadIcon`;
 

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


    getAllDeepAnalysisList(query: DeepAnalysisQueryPayload, token: string) {
      console.log('query',query)
      const apiUrl = `${DATA_PORTAL_PREFIX}/deepAnalysis/list`;
      return service.post<PaginatedDeepAnalysisResult>(apiUrl, query, {
        headers: {
          // 'Content-Type': 'application/json', // service.post 通常会自动设置
          'Accept': 'application/json',
          'user_token': token // 根据您现有的API调用，token键名可能是 'Authentication' 或 'user_token'
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


  getMetricsDataByMetricType(payload: any, token: string) {
    // payload 应包含 indicatorCode, indicatorKeyName 等
     return service.post(`${DATA_PORTAL_PREFIX}/metrics/getMetricsDataByMetricType`, payload, {
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

    // --- 新增的友情链接相关 API 方法 ---
  /**
   * 获取顶级菜单项 (公司列表)
   */
  getTopMenuItems(token: string) {
    const apiUrl = `${DATA_PORTAL_PREFIX}/menuItem/getTopMenuItem`;
    return service.get<PlatformMenuItem[]>(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'user_token': token // 根据您的认证方式调整 'user_token' 或 'Authentication'
      }
    });
  },

  /**
   * 获取子菜单项 (链接列表)
   * @param parentId 父级ID (公司ID)
   * @param token 认证Token
   */
  getChildMenuItems(parentId: string | number, token: string) {
      const apiUrl = `${DATA_PORTAL_PREFIX}/menuItem/getChildMenuItem`;
      return service.post<PlatformMenuItem[]>(apiUrl, { parentId: String(parentId) }, { // 确保 parentId 是字符串
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'user_token': token // 根据您的认证方式调整
        }
      });
    },
    fetchMockPlatformMenu(token: string){
      const apiUrl = `${DATA_PORTAL_PREFIX}/menuItem/getAllMenuItem`;
      return service.get<PlatformMenuItem[]>(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'user_token': token  
        }
      });

    },
    addDeepAnalysisPv(analysisId: string, token: string){
      const apiUrl = `${DATA_PORTAL_PREFIX}/deepAnalysis/addDeepAnalysisPv/${analysisId}`;
      return service.get(apiUrl,   {
        headers: { 'user_token': token }
      });
    }
};

 
           