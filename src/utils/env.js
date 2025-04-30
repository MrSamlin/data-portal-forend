// 环境判断
 const isDevelopment = process.env.NODE_ENV === 'development';
 const isProduction = process.env.NODE_ENV === 'production';
 const isTest = process.env.NODE_ENV === 'test';

 const defaultParentCode = '727167761399846748';


module.exports = {
    isDevelopment,
    isProduction,
    isTest,
    defaultParentCode
  };