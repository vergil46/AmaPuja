import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { AuthContext } from './auth-context'

const TOKEN_KEY = 'pujasamriddhi_token'
const USER_KEY = 'pujasamriddhi_user'
const LEGACY_TOKEN_KEY = 'pujasamrddhi_token'
const LEGACY_USER_KEY = 'pujasamrddhi_user'

const readSessionToken = () => sessionStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(LEGACY_TOKEN_KEY) || ''

const readSessionUser = () => {
  const raw = sessionStorage.getItem(USER_KEY) || sessionStorage.getItem(LEGACY_USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readSessionToken)
  const [user, setUser] = useState(readSessionUser)

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

  const logout = () => {
    setToken('')
    setUser(null)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(LEGACY_TOKEN_KEY)
    sessionStorage.removeItem(LEGACY_USER_KEY)
  }

  useEffect(() => {
    if (!token) return
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => logout())
  }, [token])

  const login = ({ token: nextToken, user: nextUser }) => {
    setToken(nextToken)
    setUser(nextUser)
    sessionStorage.setItem(TOKEN_KEY, nextToken)
    sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    sessionStorage.removeItem(LEGACY_TOKEN_KEY)
    sessionStorage.removeItem(LEGACY_USER_KEY)
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
