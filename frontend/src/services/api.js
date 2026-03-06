import axios from 'axios'

const DEFAULT_PRODUCTION_API_URL = 'https://amapuja-backend-lokanath.onrender.com/api'

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

const resolveApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL
  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl)
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

const localApiBaseUrl = 'http://localhost:5000/api'
const productionApiBaseUrl = trimTrailingSlash(DEFAULT_PRODUCTION_API_URL)

const isSameBaseUrl = (left, right) => trimTrailingSlash(left) === trimTrailingSlash(right)

const shouldRetryWithProduction = (error) => {
  const config = error?.config
  if (!config) {
    return false
  }

  const isNetworkFailure = !error.response
  const statusCode = Number(error?.response?.status)
  const isServerUnavailable = Number.isFinite(statusCode) && statusCode >= 500
  const isLikelyWrongLocalTarget = statusCode === 404

  // Retry for local-only failures when localhost backend is down/unavailable
  // or when another service is running on the same port without our API routes.
  if (!isNetworkFailure && !isServerUnavailable && !isLikelyWrongLocalTarget) {
    return false
  }

  const alreadyRetried = Boolean(config.__retriedWithProduction)
  if (alreadyRetried) {
    return false
  }

  return isSameBaseUrl(config.baseURL, localApiBaseUrl)
}

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('pujasamrddhi_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!shouldRetryWithProduction(error)) {
      return Promise.reject(error)
    }

    const retryConfig = {
      ...error.config,
      baseURL: productionApiBaseUrl,
      __retriedWithProduction: true,
    }

    // Keep subsequent calls on a healthy backend instead of failing once per request.
    api.defaults.baseURL = productionApiBaseUrl

    return api.request(retryConfig)
  }
)

export default api
