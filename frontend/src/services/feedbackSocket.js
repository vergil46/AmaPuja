import { io } from 'socket.io-client'

const productionApiUrl = 'https://amapuja-backend-lokanath.onrender.com'

const resolveSocketUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL
  if (configuredUrl && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configuredUrl)) {
    return configuredUrl.replace(/\/api\/?$/, '')
  }

  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'http://localhost:5000'
  }

  return productionApiUrl
}

export const feedbackSocket = io(resolveSocketUrl(), {
  autoConnect: false,
  transports: ['websocket', 'polling'],
})
