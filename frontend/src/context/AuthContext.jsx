import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import api from '../services/api'
import { AuthContext } from './auth-context'

const TOKEN_KEY = 'pujasamriddhi_token'
const USER_KEY = 'pujasamriddhi_user'
const LEGACY_TOKEN_KEY = 'pujasamrddhi_token'
const LEGACY_USER_KEY = 'pujasamrddhi_user'
const INACTIVITY_LIMIT_MS = 10 * 60 * 1000
const WARNING_LEAD_MS = 60 * 1000

const readSessionToken = () => sessionStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(LEGACY_TOKEN_KEY) || ''

const readSessionUser = () => {
  const raw = sessionStorage.getItem(USER_KEY) || sessionStorage.getItem(LEGACY_USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readSessionToken)
  const [user, setUser] = useState(readSessionUser)
  const inactivityTimeoutRef = useRef(null)
  const warningTimeoutRef = useRef(null)
  const warningIntervalRef = useRef(null)
  const [showInactivityWarning, setShowInactivityWarning] = useState(false)
  const [secondsUntilAutoLogout, setSecondsUntilAutoLogout] = useState(WARNING_LEAD_MS / 1000)

  useEffect(() => {
    const legacyToken = sessionStorage.getItem(LEGACY_TOKEN_KEY)
    const legacyUser = sessionStorage.getItem(LEGACY_USER_KEY)

    if (!sessionStorage.getItem(TOKEN_KEY) && legacyToken) {
      sessionStorage.setItem(TOKEN_KEY, legacyToken)
      sessionStorage.removeItem(LEGACY_TOKEN_KEY)
    }

    if (!sessionStorage.getItem(USER_KEY) && legacyUser) {
      sessionStorage.setItem(USER_KEY, legacyUser)
      sessionStorage.removeItem(LEGACY_USER_KEY)
    }
  }, [])

  const logout = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current)
      inactivityTimeoutRef.current = null
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current)
      warningIntervalRef.current = null
    }
    setShowInactivityWarning(false)
    setSecondsUntilAutoLogout(WARNING_LEAD_MS / 1000)
    setToken('')
    setUser(null)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(LEGACY_TOKEN_KEY)
    sessionStorage.removeItem(LEGACY_USER_KEY)
  }, [])

  const clearWarningTimers = useCallback(() => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current)
      warningIntervalRef.current = null
    }
  }, [])

  const showWarningAndStartCountdown = useCallback(() => {
    setShowInactivityWarning(true)
    setSecondsUntilAutoLogout(WARNING_LEAD_MS / 1000)

    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current)
    }

    warningIntervalRef.current = setInterval(() => {
      setSecondsUntilAutoLogout((prev) => Math.max(prev - 1, 0))
    }, 1000)
  }, [])

  const resetInactivityTimer = useCallback(() => {
    if (!token) return

    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current)
    }

    clearWarningTimers()
    setShowInactivityWarning(false)
    setSecondsUntilAutoLogout(WARNING_LEAD_MS / 1000)

    warningTimeoutRef.current = setTimeout(() => {
      showWarningAndStartCountdown()
    }, INACTIVITY_LIMIT_MS - WARNING_LEAD_MS)

    inactivityTimeoutRef.current = setTimeout(() => {
      logout()
    }, INACTIVITY_LIMIT_MS)
  }, [token, clearWarningTimers, showWarningAndStartCountdown, logout])

  useEffect(() => {
    if (!token) return
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => logout())
  }, [token, logout])

  const login = useCallback(({ token: nextToken, user: nextUser }) => {
    setToken(nextToken)
    setUser(nextUser)
    sessionStorage.setItem(TOKEN_KEY, nextToken)
    sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    sessionStorage.removeItem(LEGACY_TOKEN_KEY)
    sessionStorage.removeItem(LEGACY_USER_KEY)
  }, [])

  useEffect(() => {
    if (!token) {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current)
        inactivityTimeoutRef.current = null
      }
      clearWarningTimers()
      return
    }

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer)
    })

    const initialResetTimeout = window.setTimeout(() => {
      resetInactivityTimer()
    }, 0)

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer)
      })

      clearTimeout(initialResetTimeout)

      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current)
        inactivityTimeoutRef.current = null
      }

      clearWarningTimers()
    }
  }, [token, resetInactivityTimer, clearWarningTimers])

  const stayLoggedIn = useCallback(() => {
    resetInactivityTimer()
  }, [resetInactivityTimer])

  const value = useMemo(
    () => ({ token, user, login, logout, showInactivityWarning, secondsUntilAutoLogout, stayLoggedIn }),
    [token, user, login, logout, showInactivityWarning, secondsUntilAutoLogout, stayLoggedIn],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
