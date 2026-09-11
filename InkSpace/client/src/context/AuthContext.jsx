import { createContext, useContext, useMemo, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('inkspace_user')) } catch { return null }
  })

  const applyAuth = (data) => {
    localStorage.setItem('inkspace_token', data.token)
    localStorage.setItem('inkspace_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    applyAuth(data)
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    applyAuth(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('inkspace_token')
    localStorage.removeItem('inkspace_user')
    setUser(null)
  }

  const value = useMemo(() => ({ user, login, register, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
