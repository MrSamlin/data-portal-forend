// src/mock/dashboardMock.ts

interface Author {
    delFlag: number;
    id: string;
    cardCode: string;
    author: number;
    authorName: string;
    authorAccount: string;
  }
  
  interface DashboardRow {
    submitterName: string;
    id: string;
    bzNodeName: string;
    gmtCreate: string | null;
    cardTitle: string;
    researchDirection: string;
    handler: string;
    authorList: Author[];
    delFlag: number;
    auditStatus: number;
    cardCode: string;
    auditResult: string;
    submitterAuccount: string;
    browseCount: number;
    cardDate: string;
    bzRemark: string;
    industryId: string | null;
    processDate: string;
    auditDate: string | null;
  }
  
  interface InnerMockData {
    current: number | null;
    total: number;
    endRow: number | null;
    pageSize: number | null; // API示例中为null，但分页需要实际值
    startRow: number | null;
    rows: DashboardRow[];
    pageCount: number;
  }

  interface OuterMockDataWrapper {
    data: InnerMockData;
    // code?: number;
    // message?: string;
  }
  
  const generateRandomString = (length: number): string => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
  
  const generateRandomDate = (start: Date, end: Date): string => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  
  const createMockDashboardRow = (index: number): DashboardRow => {
    const uniqueId = Date.now().toString() + index + generateRandomString(5);
    const cardCode = generateRandomString(32);
    const authorId = Date.now().toString() + index + 'author' + generateRandomString(3);
  
    return {
      submitterName: "admin_mock",
      id: `mock_${uniqueId}`,
      bzNodeName: "",
      gmtCreate: null,
      cardTitle: `模拟看板标题 ${index + 1} - ${generateRandomString(10)}`,
      researchDirection: "农林牧渔,模拟化工,模拟金属,电子,汽车",
      handler: "",
      authorList: [
        {
          delFlag: 0,
          id: `mock_author_${authorId}`,
          cardCode: cardCode,
          author: 1,
          authorName: "admin_mock_author",
          authorAccount: ""
        }
      ],
      delFlag: 0,
      auditStatus: 4, 
      cardCode: cardCode,
      auditResult: "",
      submitterAuccount: "",
      browseCount: Math.floor(Math.random() * 1000) + 1,
      cardDate: generateRandomDate(new Date(2023, 0, 1), new Date()),
      bzRemark: `这是第 ${index + 1} 条模拟数据的备注。`,
      industryId: null,
      processDate: generateRandomDate(new Date(2023, 0, 1), new Date()),
      auditDate: null
    };
  };

interface MockGenerationParams {
  baseTotalCount?: number; // 总的模拟数据量，用于生成基础数据集
  page?: number;
  size?: number;
  keyword?: string;
}

// 缓存一个较大的基础数据集，避免每次都生成
let baseMockRowsCache: DashboardRow[] | null = null;
const DEFAULT_MOCK_BASE_COUNT = 100; // 生成100条基础数据用于模拟分页和搜索

const getBaseMockRows = (baseCount: number): DashboardRow[] => {
    if (!baseMockRowsCache || baseMockRowsCache.length !== baseCount) {
        baseMockRowsCache = [];
        for (let i = 0; i < baseCount; i++) {
            baseMockRowsCache.push(createMockDashboardRow(i));
        }
    }
    return baseMockRowsCache;
};

export const generateMockDashboardData = (params: MockGenerationParams = {}): OuterMockDataWrapper => {
    const {
        baseTotalCount = DEFAULT_MOCK_BASE_COUNT,
        page = 1,
        size = 5, // 默认每页5条
        keyword = ''
    } = params;

    const allMockRows = getBaseMockRows(baseTotalCount);
    let filteredRows = allMockRows;

    if (keyword.trim() !== '') {
        const lowerKeyword = keyword.trim().toLowerCase();
        filteredRows = allMockRows.filter(row =>
            row.cardTitle.toLowerCase().includes(lowerKeyword)
        );
    }

    const totalFiltered = filteredRows.length;
    const startIndex = (page - 1) * size;
    const paginatedRows = filteredRows.slice(startIndex, startIndex + size);

    const innerData: InnerMockData = {
        current: page,
        total: totalFiltered,
        rows: paginatedRows,
        pageSize: size, 
        pageCount: Math.ceil(totalFiltered / size),
        startRow: totalFiltered > 0 ? startIndex + 1 : null,
        endRow: totalFiltered > 0 ? startIndex + paginatedRows.length : null,
    };

    return {
        data: innerData
    };
};