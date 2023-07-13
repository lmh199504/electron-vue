import axios from 'axios'
import { message } from 'ant-design-vue'
// 使用实例的方式避免全局污染
const instance = axios.create()
instance.defaults.timeout = 60000
instance.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
instance.defaults.baseURL =
    import.meta.env.MODE == 'development' ? 'http://127.0.0.1:9000' : 'http://127.0.0.1:9000'
// instance.defaults.baseURL = 'http://127.0.0.1:9000'
/**'http://172.16.3.165:9000'*/
instance.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)
instance.interceptors.response.use(
    (response) => {
        if (response.data.code !== 'P200') {
            message.error(response.data.msg)
            return Promise.reject(response)
        }
        return response.data
    },
    (error) => {
        message.error('服务错误')
        return Promise.reject(error)
    }
)
export default instance
