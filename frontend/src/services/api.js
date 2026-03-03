import axios from 'axios'

const DEFAULT_PRODUCTION_API_URL = 'https://amapuja-backend-lokanath.onrender.com/api'

const resolveApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL
  if (configuredUrl) {
    return configuredUrl
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api'
    }

    return DEFAULT_PRODUCTION_API_URL
  }

  return 'http://localhost:5000/api'
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('pujasamrddhi_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
