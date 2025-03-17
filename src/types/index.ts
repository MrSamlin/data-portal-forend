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

// 后端返回的分类数据类型
export interface CategoryResponse {
  categoryId: string;
  categoryName: string;
}

// 前端使用的分类数据类型
export interface Category {
  key: string;
  label: string;
  color: string;
} 