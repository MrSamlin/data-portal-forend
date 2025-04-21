// Mock data for TreeSelectDialog in IndicatorConfig.vue
import type { TreeNode } from '@/types/treeSelect';

export const mockTreeData: TreeNode[] = [
  // --- 第一层 ---
  {
    indicatorName: "TMT",
    nodeId: "727167761082522280",
    hasChildren: 1,
    indicatorCode: "727167761082522280",
    parentCode: "727167761214922697", // 假设的根节点 Code
    levelCode: "2",
    orderNum: 432,
    // 其他字段根据需要补充，可以为空或默认值
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&727167761082522280", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "交通运输",
    nodeId: "727167762076927639",
    hasChildren: 1,
    indicatorCode: "727167762076927639",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 437,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&727167762076927639", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "其他行业",
    nodeId: "72716776585328698",
    hasChildren: 1, // 假设也有子节点
    indicatorCode: "72716776585328698",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 453,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&72716776585328698", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "农林牧渔", // 注意这里 API 数据有两个相似的名字，取其中一个
    nodeId: "727167761105689838",
    hasChildren: 1,
    indicatorCode: "727167761105689838",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 456,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&727167761105689838", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "化工",
    nodeId: "727167761237286591",
    hasChildren: 1,
    indicatorCode: "727167761237286591",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 471,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&727167761237286591", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "医药生物",
    nodeId: "72716776406615637",
    hasChildren: 1,
    indicatorCode: "72716776406615637",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 477,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&72716776406615637", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "建材家居",
    nodeId: "727167761437131671",
    hasChildren: 1, // 假设有子节点
    indicatorCode: "727167761437131671",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 482,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&727167761437131671", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "房地产及建筑业",
    nodeId: "72716776615290891",
    hasChildren: 0, // 假设这个没有子节点
    indicatorCode: "72716776615290891",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 485,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&72716776615290891", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 1, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: "" // isEndCatalog: 1
  },
  {
    indicatorName: "批发零售业",
    nodeId: "72716776728865311",
    hasChildren: 1,
    indicatorCode: "72716776728865311",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 552,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&72716776728865311", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "文教体娱及工艺品",
    nodeId: "72716776925991998",
    hasChildren: 1,
    indicatorCode: "72716776925991998",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 560,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&72716776925991998", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "旅游酒店",
    nodeId: "727167761172158373",
    hasChildren: 1,
    indicatorCode: "727167761172158373",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 563,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&727167761172158373", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "有色金属",
    nodeId: "727167761154705984",
    hasChildren: 1,
    indicatorCode: "727167761154705984",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 568,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&727167761154705984", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "汽车", // 这个节点使用你提供的子节点数据
    nodeId: "727167761438240777",
    hasChildren: 1,
    indicatorCode: "727167761438240777",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 578,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&727167761438240777", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "能源",
    nodeId: "72716776466702057",
    hasChildren: 1,
    indicatorCode: "72716776466702057",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 588,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&72716776466702057", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "钢铁",
    nodeId: "727167762059766388",
    hasChildren: 1,
    indicatorCode: "727167762059766388",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 601,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&727167762059766388", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "食品饮料",
    nodeId: "727167761154545157",
    hasChildren: 1,
    indicatorCode: "727167761154545157",
    parentCode: "727167761214922697",
    levelCode: "2",
    orderNum: 611,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761214922697&727167761154545157", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "半导体",
    nodeId: "tmt_child_1",
    hasChildren: 0, // 假设是叶子节点
    indicatorCode: "TMT_SEMICON",
    parentCode: "727167761082522280", // TMT 的 code
    levelCode: "3",
    orderNum: 1,
    isEndCatalog: 1 // 叶子节点
  },
  {
    indicatorName: "软件服务",
    nodeId: "tmt_child_2",
    hasChildren: 0,
    indicatorCode: "TMT_SOFTWARE",
    parentCode: "727167761082522280",
    levelCode: "3",
    orderNum: 2,
    isEndCatalog: 1
  },

  // --- 第二层 - 交通运输 的子节点 (模拟) ---
  {
    indicatorName: "公路运输",
    nodeId: "trans_child_1",
    hasChildren: 1, // 假设还有子节点
    indicatorCode: "TRANS_ROAD",
    parentCode: "727167762076927639", // 交通运输 的 code
    levelCode: "3",
    orderNum: 1,
    isEndCatalog: 0
  },
  {
    indicatorName: "铁路运输",
    nodeId: "trans_child_2",
    hasChildren: 0,
    indicatorCode: "TRANS_RAIL",
    parentCode: "727167762076927639",
    levelCode: "3",
    orderNum: 2,
    isEndCatalog: 1
  },
   {
    indicatorName: "航空运输",
    nodeId: "trans_child_3",
    hasChildren: 0,
    indicatorCode: "TRANS_AIR",
    parentCode: "727167762076927639",
    levelCode: "3",
    orderNum: 3,
    isEndCatalog: 1
  },


  // --- 第二层 - 汽车 的子节点 (使用你提供的数据) ---
  {
    indicatorName: "产品产量和消费量",
    nodeId: "72716776262349839",
    hasChildren: 1, // 假设还有下一层
    indicatorCode: "72716776262349839",
    parentCode: "727167761438240777", // 汽车 的 code
    levelCode: "3", // Level 3
    orderNum: 579,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761438240777&72716776262349839", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 0, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "产品产量和销售量",
    nodeId: "72716776152048474",
    hasChildren: 0, // 假设是叶子
    indicatorCode: "72716776152048474",
    parentCode: "727167761438240777",
    levelCode: "3",
    orderNum: 581,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761438240777&72716776152048474", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 1, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "产品进出口",
    nodeId: "727167761143609270",
    hasChildren: 0,
    indicatorCode: "727167761143609270",
    parentCode: "727167761438240777",
    levelCode: "3",
    orderNum: 583,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761438240777&727167761143609270", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 1, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },
  {
    indicatorName: "产品销量和销售量", // API名字可能需要调整？
    nodeId: "727167761125068575",
    hasChildren: 0,
    indicatorCode: "727167761125068575",
    parentCode: "727167761438240777",
    levelCode: "3",
    orderNum: 586,
    tinyInt: 0, unit: "", stamp: null, source: "", noteCategory: "72716776", indicatorId: "727167761438240777&727167761125068575", sourceId: "", dataSource: "", remark: "", sourceTable: "", parentCodeNew: "", isUpdate: null, isEndCatalog: 1, frequency: "", version: "", delFlag: null, id: null, sourceCode: "", hasPrivilege: ""
  },

  // --- 第三层 - 公路运输 的子节点 (模拟) ---
   {
    indicatorName: "高速公路里程",
    nodeId: "trans_road_child_1",
    hasChildren: 0, // 叶子节点
    indicatorCode: "TRANS_ROAD_HIGHWAY",
    parentCode: "TRANS_ROAD", // 公路运输 的 code
    levelCode: "4",
    orderNum: 1,
    isEndCatalog: 1
  },
  {
    indicatorName: "国道里程",
    nodeId: "trans_road_child_2",
    hasChildren: 0,
    indicatorCode: "TRANS_ROAD_NATIONAL",
    parentCode: "TRANS_ROAD",
    levelCode: "4",
    orderNum: 2,
    isEndCatalog: 1
  },

   // --- 第三层 - 产品产量和消费量 的子节点 (模拟) ---
   {
    indicatorName: "乘用车产量",
    nodeId: "auto_prod_cons_1",
    hasChildren: 0,
    indicatorCode: "AUTO_PASSENGER_PROD",
    parentCode: "72716776262349839", // 产品产量和消费量 的 code
    levelCode: "4",
    orderNum: 1,
    isEndCatalog: 1
   },
   {
    indicatorName: "商用车产量",
    nodeId: "auto_prod_cons_2",
    hasChildren: 0,
    indicatorCode: "AUTO_COMMERCIAL_PROD",
    parentCode: "72716776262349839",
    levelCode: "4",
    orderNum: 2,
    isEndCatalog: 1
   }

  // ... 为其他第一层节点添加模拟的第二层子节点 ...
  // 例如：化工、医药生物、有色金属等
  // ... 确保 parentCode, levelCode, orderNum, hasChildren/isEndCatalog 正确设置 ...

];

// 你可以继续为其他第一层分类（如化工、医药等）添加第二层数据，
// 并为一些第二层节点添加第三层数据，以模拟更深的树结构。
// 注意保持 nodeId 和 indicatorCode 的唯一性。