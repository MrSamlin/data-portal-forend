// 定义数据类型接口
export interface DataItem {
  id: number;
  title: string;
  updateTime: string;
  source: string;
  isNew?: boolean;
}

export interface CategoryData {
  category: string;
  items: DataItem[];
}

 

// 前端使用的分类数据类型
export interface Category {
  key: string;
  label: string;
  color: string;
}   


// 行业类型
export  interface CategoryResponse {
  categoryId: string;
  categoryName: string;
  icon: string;
  themeCode: string;
  bannerImage: string;
}

// 展示行业卡片类型
export interface DashboardItem {
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
export interface DeepAnalysisItem {
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

export interface PaginatedDeepAnalysisResult {
  data: DeepAnalysisItem[]; // 对应 result.setData(data)
  total: number;           // 对应 result.setTotal(total)
  currentPage: number;     // 对应 result.setCurrentPage(query.getPage())
  pageSize: number;        // 对应 result.setPageSize(query.getSize())
  totalPages: number;      // 对应 result.setTotalPages(totalPages)
}

export interface DeepAnalysisQueryPayload {
  page: number; // 对应 query.getPage()
  size: number; // 对应 query.getSize()
  analysisName?: string;  
}

// 指标数据接口定义
export interface MetricsItem {
id: number;
metricsCode?: number; // 可能为 null，用可选
metricName: string;
parentId?: number;
createUser?: string;
updateUser?: string;
createDate?: string | Date;
updateDate?: string | Date;
themeCode?: string;
tag: string;
}


// 友情链接
 
export interface PlatformMenuItem {
  id: number | string;
  parentId?: number | string | null;
  parentName?: string | null;
  title: string;
  link?: string | null;
  type?: string | null;
  isGroup: boolean;
  sortOrder?: number;
  status?: number;
  createTime?: string;
  updateTime?: string;
  children: PlatformMenuItem[]; // 用于存储获取到的子项
  _childrenFetched?: boolean;   // 内部状态：标记子项是否已获取
  _isLoadingChildren?: boolean; // 内部状态：标记是否正在加载子项
}