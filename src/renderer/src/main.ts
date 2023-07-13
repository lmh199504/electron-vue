import { createApp } from 'vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.less'
import App from './App.vue'
const app = createApp(App)
app.use(Antd)
app.use(router)
app.mount('#app')
