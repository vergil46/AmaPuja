import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('amapuja_token') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('amapuja_user')
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
    localStorage.setItem('amapuja_token', nextToken)
    localStorage.setItem('amapuja_user', JSON.stringify(nextUser))
  }

  const logout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('amapuja_token')
    localStorage.removeItem('amapuja_user')
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
