// types/treeSelect.ts
export interface TreeNode {
    // 基础信息
    indicatorName?: string;      // 指标名称
    nodeId: string;             // 节点ID
    indicatorCode?: string;      // 指标代码
    indicatorId?: string;        // 完整指标ID (包含父节点)
    
    // 树形结构相关
    hasChildren?: number;        // 是否有子节点 (1表示有子节点)
    parentCode?: null |string;         // 父节点代码
    parentCodeNew?: string;      // 新的父节点代码
    levelCode?: string;          // 层级代码
    orderNum: number;           // 排序号
    isEndCatalog?: number;       // 是否是终端目录
    
    // 指标属性
    unit?: string;               // 单位
    stamp?: null | string;       // 时间戳
    source?: string;             // 来源
    noteCategory?: string;       // 备注类别
    sourceId?: string;           // 来源ID
    dataSource?: string;         // 数据来源
    remark?: string;             // 备注
    sourceTable?: string;        // 来源表
    frequency?: string;          // 频率
    version?: string;            // 版本
    sourceCode?: string;         // 来源代码
    
    // 其他属性
    tinyInt?: number;            // 标记字段
    delFlag?: null | number;     // 删除标记
    isUpdate?: null | number;    // 是否更新
    id?: null | string;          // ID
    hasPrivilege?: string;       // 权限标记
  }
  
  export interface TreeSelectState {
    selectedNode?: TreeNode | null;
    checkedNodes?: TreeNode[];
    expandedKeys?: string[];
  }