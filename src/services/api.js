import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:7000/api',  // Backend của bạn đang chạy port 7000
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Tự động thêm token vào header nếu có
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api