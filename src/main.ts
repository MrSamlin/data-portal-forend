import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import './styles/main.css'
import './utils/axios'
import router from './router';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import axios from 'axios'
// import './utils/axios'  


const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 配置 axios
axios.defaults.baseURL = process.env.NODE_ENV === 'production' 
  ? '/dataPortal'  // 生产环境使用相对路径
  : 'http://localhost:7070'  // 开发环境使用本地服务器

app.use(router);
app.use(ElementPlus);
app.use(Antd);
app.mount('#app')
