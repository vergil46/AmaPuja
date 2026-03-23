import axios from 'axios'

const DEFAULT_PRODUCTION_API_URL = 'https://amapuja-backend-lokanath.onrender.com/api'
const TOKEN_KEY = 'pujasamriddhi_token'
const LEGACY_TOKEN_KEY = 'pujasamrddhi_token'

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

const isLocalhostUrl = (url) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(String(url || ''))

const resolveApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL

  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    const onLocalhost = host === 'localhost' || host === '127.0.0.1'

    if (onLocalhost) {
      // In local dev: honour VITE_API_URL if set, otherwise default to local backend
      return configuredUrl ? trimTrailingSlash(configuredUrl) : 'http://localhost:5000/api'
    }

    // In production: only use VITE_API_URL when it is NOT a localhost address,
    // so a stale .env copy in Vercel never silently breaks the app.
    if (configuredUrl && !isLocalhostUrl(configuredUrl)) {
      return trimTrailingSlash(configuredUrl)
    }

    return DEFAULT_PRODUCTION_API_URL
  }

  return configuredUrl ? trimTrailingSlash(configuredUrl) : 'http://localhost:5000/api'
}

// 65 s gives Render free-tier services time to wake from sleep (~50 s cold start)
const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 65000,
})

let warmupPromise = null

export const prewarmApi = () => {
  if (warmupPromise) {
    return warmupPromise
  }

  warmupPromise = api
    .get('/health', {
      timeout: 65000,
      headers: {
        'x-prewarm-request': '1',
      },
    })
    .catch(() => null)
    .finally(() => {
      warmupPromise = null
    })

  return warmupPromise
}

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

  const currentBaseUrl = trimTrailingSlash(config.baseURL || api.defaults.baseURL || '')
  const isAlreadyOnProduction = isSameBaseUrl(currentBaseUrl, productionApiBaseUrl)
  if (isAlreadyOnProduction) {
    return false
  }

  // Recover from stale/misconfigured frontend API URLs by retrying once on
  // the canonical production backend.
  return true
}

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(LEGACY_TOKEN_KEY)
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

    const retrySourceBaseUrl = trimTrailingSlash(error?.config?.baseURL || api.defaults.baseURL || '')
    if (typeof window !== 'undefined') {
      console.warn('[api] Retrying failed request on production API base URL.', {
        from: retrySourceBaseUrl || null,
        to: productionApiBaseUrl,
        url: error?.config?.url || null,
        code: error?.code || null,
        status: Number(error?.response?.status) || null,
      })
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
