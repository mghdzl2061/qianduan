import axios from 'axios'
import { ElMessage } from 'element-plus'

const http = axios.create({ baseURL: '/api', timeout: 15000 })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('doorplate_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body.code === 'number' && body.code !== 0) {
      ElMessage.error(body.message || '操作失败')
      return Promise.reject(new Error(body.message || '操作失败'))
    }
    return body?.data ?? body
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('doorplate_token')
      localStorage.removeItem('doorplate_user')
      if (!location.pathname.startsWith('/login')) location.href = '/login'
    }
    ElMessage.error(error.response?.data?.message || error.message || '网络连接失败')
    return Promise.reject(error)
  }
)

export default http
