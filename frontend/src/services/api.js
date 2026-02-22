import axios from 'axios'

const resolveApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL
  if (configuredUrl) {
    return configuredUrl
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host && host.includes('onrender.com')) {
      return 'https://amapuja-backend-lokanath.onrender.com/api'
    }
  }

  return 'http://localhost:5000/api'
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('amapuja_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
