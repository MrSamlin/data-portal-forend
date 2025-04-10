import { ref } from 'vue'
import service from '@/utils/axios'

// 创建全局状态
const userToken = ref('')

// 检查token是否过期
const isTokenExpired = () => {
  const expiration = localStorage.getItem('tokenExpiration')
  if (!expiration) return true
  
  return new Date().getTime() > parseInt(expiration)
}

// 登出方法
const logout = () => {
  userToken.value = ''
  localStorage.removeItem('userToken')
  localStorage.removeItem('tokenExpiration')
}

// 登录方法
const empLogin = async () => {
  try {
    const jwtResponse = await service.post('/cmfauth/cmfapi/jwt/login', {
      "userId": "2179610",
      "userName": "liujie",
      "name": "刘杰",
      "source": "juyuan_kanban"
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    console.log('jwtResponse:',jwtResponse);
 

    const jwtToken = jwtResponse.data.data.jwtToken
    // 第二步：使用jwtToken进行登录
    const loginResponse = await service.post('/dw/authentication/v2/submitLogin', {
      "loginType": "cmf",
      "jwtToken": jwtToken
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    if (!loginResponse.data?.user_token) {
      throw new Error('登录失败，未获取到user_token')
    }

    const token = loginResponse.data.user_token
    // 更新token和过期时间
    userToken.value = token
    return token
  } catch (error) {
    console.error('登录失败:', error)
    logout()
    throw error // 抛出错误，让调用者处理
  }
}

// 获取token的方法（自动处理过期情况）
const getToken = async () => {
  try {
      const newToken = await empLogin()
      return newToken
  } catch (error) {
    console.error('获取token失败:', error)
    throw error // 抛出错误，让调用者处理
  }
}

// 导出组合式函数
export function useAuth() {
  return {
    userToken,
    empLogin,
    getToken,
    logout
  }
}

// 直接导出变量，方便直接导入使用
export {
  userToken,
  getToken,
  empLogin,
  logout
}      