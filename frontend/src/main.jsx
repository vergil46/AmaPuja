import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import DeferredAnalytics from './components/DeferredAnalytics.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { initSentry } from './monitoring/sentry.js'
import { injectSpeedInsights } from '@vercel/speed-insights'

initSentry()
injectSpeedInsights()

const isRenderHost = typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')
const Router = isRenderHost ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <App />
          <DeferredAnalytics />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  </StrictMode>,
)
