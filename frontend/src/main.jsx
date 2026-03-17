import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { initSentry } from './monitoring/sentry.js'

initSentry()

function DeferredAnalytics() {
  const [AnalyticsComponent, setAnalyticsComponent] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadAnalytics = () => {
      import('@vercel/analytics/react')
        .then((mod) => {
          if (isMounted) {
            setAnalyticsComponent(() => mod.Analytics)
          }
        })
        .catch(() => {
          // Keep analytics failure from affecting user experience.
        })
    }

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadAnalytics, { timeout: 3000 })
    } else {
      setTimeout(loadAnalytics, 1200)
    }

    return () => {
      isMounted = false
    }
  }, [])

  if (!AnalyticsComponent) return null

  return <AnalyticsComponent />
}

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
