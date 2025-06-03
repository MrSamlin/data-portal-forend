// src/mock/platformMenuMock.ts
export interface MenuItem {
    id: number | string;
    title: string;
    link: string;
    type: string; // '内部' 或 '外部' 等，或者可能不需要了
  }
  
  export interface MenuGroup {
    id: number | string;
    groupTitle: string;
    children: MenuItem[];
  }
  
  // 模拟 API 响应的数据
  const mockMenuData: MenuGroup[] = [
    {
      id: 'group-a', // 使用字符串 ID 更灵活
      groupTitle: 'A公司',
      children: [
        { id: 101, title: '内外数据平台', link: '#', type: '内部' },
        { id: 102, title: '产品技术平台', link: '#', type: '内部' },
        { id: 103, title: '数据管理规范', link: '#', type: '内部' },
      ]
    },
    {
      id: 'group-b',
      groupTitle: 'B公司',
      children: [
        { id: 201, title: '数据管理', link: '#', type: '内部' },
        { id: 202, title: '数据资产平台', link: '#', type: '内部' },
      ]
    },
    {
      id: 'group-c',
      groupTitle: '通用平台',
      children: [
         { id: 301, title: '数据资产地图', link: '#', type: '内部' },
         { id: 302, title: '数据质量巡检报告', link: '#', type: '内部' },
         // 添加一个外部链接示例
         { id: 303, title: '外部资源示例', link: 'https://example.com', type: '外部'}
      ]
    }
  ];
  
  // 模拟异步获取数据的函数
  export const fetchMockPlatformMenuMock = (): Promise<MenuGroup[]> => {
    console.log('模拟 API 请求：获取平台菜单数据...');
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        console.log('模拟 API 响应：返回菜单数据');
        resolve(JSON.parse(JSON.stringify(mockMenuData))); // 返回深拷贝以防意外修改
      }, 500); // 500ms 延迟
    });
  };
  