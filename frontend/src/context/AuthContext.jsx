import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(sessionStorage.getItem('pujasamrddhi_token') || '')
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem('pujasamrddhi_user')
    return raw ? JSON.parse(raw) : null
  })

  const logout = () => {
    setToken('')
    setUser(null)
    sessionStorage.removeItem('pujasamrddhi_token')
    sessionStorage.removeItem('pujasamrddhi_user')
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
    sessionStorage.setItem('pujasamrddhi_token', nextToken)
    sessionStorage.setItem('pujasamrddhi_user', JSON.stringify(nextUser))
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
