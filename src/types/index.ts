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
}