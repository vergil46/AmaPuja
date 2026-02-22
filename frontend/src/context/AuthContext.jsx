import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(sessionStorage.getItem('amapuja_token') || '')
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem('amapuja_user')
    return raw ? JSON.parse(raw) : null
  })

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
    sessionStorage.setItem('amapuja_token', nextToken)
    sessionStorage.setItem('amapuja_user', JSON.stringify(nextUser))
  }

  const logout = () => {
    setToken('')
    setUser(null)
    sessionStorage.removeItem('amapuja_token')
    sessionStorage.removeItem('amapuja_user')
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
