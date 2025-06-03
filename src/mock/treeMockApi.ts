// src/mockData/treeMockApi.ts
import type { TreeNode } from '@/types/treeSelect'; // 确认路径
import { mockTreeData } from '@/mock/treeMock'; // 从同一目录下的 treeMock.ts 导入  

// --- 模拟的顶层节点数据 ---
const topLevelNodes: TreeNode[] = [
  { indicatorName: "汽车", nodeId: "727167761438240777", hasChildren: 1, indicatorCode: "AUTO", parentCode: "727167761399846748", levelCode: "1", orderNum: 1 },
  { indicatorName: "宏观经济", nodeId: "MACRO_ECONOMY", hasChildren: 1, indicatorCode: "MACRO", parentCode: "727167761399846748", levelCode: "1", orderNum: 2 },
  { indicatorName: "地产", nodeId: "REAL_ESTATE", hasChildren: 1, indicatorCode: "RE", parentCode: "727167761399846748", levelCode: "1", orderNum: 3 },
  { indicatorName: "策略", nodeId: "STRATEGY", hasChildren: 0, indicatorCode: "STRAT", parentCode: "727167761399846748", levelCode: "1", orderNum: 4, isEndCatalog: 1, sourceCode:"M0000059" },
  // 可以添加更多顶层节点
];

// --- 模拟的“汽车”子节点数据 ---
const autoChildren: TreeNode[] = [
  { indicatorName: "产品产量和消费量", nodeId: "72716776262349839", hasChildren: 1, indicatorCode: "AUTO_PROD_CONS", parentCode: "AUTO", levelCode: "2", orderNum: 579 ,isEndCatalog:1},
  { indicatorName: "产品产量和销售量", nodeId: "72716776152048474", hasChildren: 1, indicatorCode: "AUTO_PROD_SALE", parentCode: "AUTO", levelCode: "2", orderNum: 581 ,isEndCatalog:1},
  { indicatorName: "产品进出口", nodeId: "727167761143609270", hasChildren: 0, indicatorCode: "AUTO_IMPORT_EXPORT", parentCode: "AUTO", levelCode: "2", orderNum: 583, isEndCatalog: 1 , sourceCode:"M0000059"},
  { indicatorName: "产品销量和销售量", nodeId: "727167761125068575", hasChildren: 0, indicatorCode: "AUTO_SALE_VOL", parentCode: "AUTO", levelCode: "2", orderNum: 586, isEndCatalog: 1 , sourceCode:"M0000059"},
];

// --- 模拟的“宏观经济”子节点数据 ---
const macroChildren: TreeNode[] = [
    { indicatorName: "GDP", nodeId: "MACRO_GDP", hasChildren: 1, indicatorCode: "GDP", parentCode: "MACRO", levelCode: "2", orderNum: 1 ,isEndCatalog:1},
    { indicatorName: "CPI", nodeId: "MACRO_CPI", hasChildren: 0, indicatorCode: "CPI", parentCode: "MACRO", levelCode: "2", orderNum: 2, isEndCatalog: 1 , sourceCode:"M0000059"},
    { indicatorName: "PMI", nodeId: "MACRO_PMI", hasChildren: 0, indicatorCode: "PMI", parentCode: "MACRO", levelCode: "2", orderNum: 3, isEndCatalog: 1 , sourceCode:"M0000059"},
];

// --- 模拟的“地产”子节点数据 ---
const realEstateChildren: TreeNode[] = [
    { indicatorName: "销售面积", nodeId: "RE_SALE_AREA", hasChildren: 0, indicatorCode: "RE_SALE_AREA", parentCode: "RE", levelCode: "2", orderNum: 1, isEndCatalog: 1 , sourceCode:"M0000059"},
    { indicatorName: "新开工面积", nodeId: "RE_NEW_START", hasChildren: 0, indicatorCode: "RE_NEW_START", parentCode: "RE", levelCode: "2", orderNum: 2, isEndCatalog: 1, sourceCode:"M0000059" },
];

// --- 模拟的“GDP”子节点数据 ---
const gdpChildren: TreeNode[] = [
    { indicatorName: "第一产业GDP", nodeId: "GDP_PRIMARY", hasChildren: 0, indicatorCode: "GDP_P", parentCode: "GDP", levelCode: "3", orderNum: 1, isEndCatalog: 1, sourceCode:"M0000059" },
    { indicatorName: "第二产业GDP", nodeId: "GDP_SECONDARY", hasChildren: 0, indicatorCode: "GDP_S", parentCode: "GDP", levelCode: "3", orderNum: 2, isEndCatalog: 1 , sourceCode:"M0000059"},
    { indicatorName: "第三产业GDP", nodeId: "GDP_TERTIARY", hasChildren: 0, indicatorCode: "GDP_T", parentCode: "GDP", levelCode: "3", orderNum: 3, isEndCatalog: 1, sourceCode:"M0000059"   },
];
// --- 模拟的“产品产量和消费量”子节点数据 ---
const autoProdConsChildren: TreeNode[] = [
     { indicatorName: "乘用车产量", nodeId: "AUTO_PASSENGER_PROD", hasChildren: 0, indicatorCode: "AUTO_P_PROD", parentCode: "AUTO_PROD_CONS", levelCode: "3", orderNum: 1, isEndCatalog: 1,
      sourceCode:"M0000059"  
      },
     { indicatorName: "商用车产量", nodeId: "AUTO_COMMERCIAL_PROD", hasChildren: 0, indicatorCode: "AUTO_C_PROD", parentCode: "AUTO_PROD_CONS", levelCode: "3", orderNum: 2, isEndCatalog: 1 ,
      sourceCode:"M0000059"  
     },
];
// --- 模拟的“产品产量和销售量”子节点数据 ---
const autoProdSaleChildren: TreeNode[] = [
    { indicatorName: "新能源汽车销量", nodeId: "AUTO_NEV_SALE", hasChildren: 0, indicatorCode: "AUTO_NEV_S", parentCode: "AUTO_PROD_SALE", levelCode: "3", orderNum: 1, isEndCatalog: 1, 
      sourceCode:"M0000059"    },
    { indicatorName: "燃油车销量", nodeId: "AUTO_FUEL_SALE", hasChildren: 0, indicatorCode: "AUTO_FUEL_S", parentCode: "AUTO_PROD_SALE", levelCode: "3", orderNum: 2, isEndCatalog: 1,
      sourceCode:"M0000059"
     },
];


// --- 模拟的 API 调用函数 ---
/**
 * 模拟根据 parentCode 获取子节点数据的 API 调用
 * @param parentCode 父节点的 indicatorCode，如果是获取顶层节点则为 null
 * @returns Promise<TreeNode[]>
 */
export const fetchMockNodes = (parentCode: string | null): Promise<TreeNode[]> => {
  // 模拟网络延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      let children: TreeNode[] = [];
      if (parentCode === '727167761399846748') {
        children = topLevelNodes;
      } else if (parentCode === "AUTO") { // "汽车" 的 indicatorCode
        children = autoChildren;
      } else if (parentCode === "MACRO") { // "宏观经济" 的 indicatorCode
        children = macroChildren;
      } else if (parentCode === "RE") { // "地产" 的 indicatorCode
          children = realEstateChildren;
      } else if (parentCode === "GDP") { // "GDP" 的 indicatorCode
          children = gdpChildren;
      } else if (parentCode === "AUTO_PROD_CONS") { // "产品产量和消费量" 的 indicatorCode
          children = autoProdConsChildren;
      } else if (parentCode === "AUTO_PROD_SALE") { // "产品产量和销售量" 的 indicatorCode
          children = autoProdSaleChildren;
      }
      // 对于其他有 hasChildren 但未定义子节点的，返回空数组
      // 对于 hasChildren: 0 的节点，也会返回空数组（因为不会去请求）

      // 给返回的每个节点稍微补充一些可选字段，使其更像真实数据
      const processedChildren = children.map(node => ({
          ...node,
          unit: node.unit ?? "",
          stamp: node.stamp ?? null,
          source: node.source ?? "MockSource",
          // ... 补充其他你需要的默认值 ...
      }));
      const targetParentCode = parentCode === null ? "727167761214922697" : parentCode;

      children = mockTreeData.filter(node => node.parentCode === targetParentCode);
      resolve(processedChildren);
    }, 500); // 模拟 500ms 延迟
  });
};


// --- 添加并导出 generateMockIndicatorData 函数 ---
/**
 * 生成模拟的指标详细数据
 * @param metricsCode 指标代码
 * @param metricName 指标名称
 * @returns 模拟的表格数据数组
 */
export const generateMockIndicatorData = (metricsCode: string, metricName: string) => {
  // 根据不同的指标代码生成不同的模拟数据集
  const count = Math.floor(Math.random() * 5) + 2; // 随机生成2-6条数据
  const mockData = [];

  for (let i = 0; i < count; i++) {
    let indicatorName, source, updateTime;

    // 根据指标类型生成有意义的示例数据
    if (metricName.includes('测试')) {
      indicatorName = `测试指标 ${i+1}`;
      source = "测试数据中心";
      updateTime = "2023-11-01";
    } else if (metricsCode.includes('321')) {
      indicatorName = `${metricName} 数据项 ${i+1}`;
      source = "行业数据库";
      updateTime = "2023-12-15";
    } else {
      indicatorName = `${metricName} - 子指标 ${i+1}`;
      source = "国家统计局";
      updateTime = "2024-01-20";
    }

    mockData.push({
      key: `${metricsCode}_${i}`,
      title: indicatorName,
      dataSource: source,
      updateTime: updateTime,
      jumpUrl: `#/indicator/${metricsCode}_${i}` // 模拟跳转链接
    });
  }

  return mockData;
};