import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { initSentry } from './monitoring/sentry.js'

initSentry()

const isRenderHost = typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')
const Router = isRenderHost ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <App />
          <Analytics />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  </StrictMode>,
)
