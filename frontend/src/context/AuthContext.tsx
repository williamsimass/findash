import { createContext, useContext, useState, useCallback } from 'react'
import type { User } from '../types'
import { usersApi } from '../lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  setAuth: () => {},
  logout: () => {},
  updateUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token')
  )

  const setAuth = useCallback((u: User, t: string) => {
    setUser(u)
    setToken(t)
    localStorage.setItem('user', JSON.stringify(u))
    localStorage.setItem('token', t)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }, [])

  const updateUser = useCallback(
    async (data: Partial<User>) => {
      const res = await usersApi.updateMe(data)
      const updated = res.data as User
      setUser(updated)
      localStorage.setItem('user', JSON.stringify(updated))
    },
    []
  )

  return (
    <AuthContext.Provider value={{ user, token, setAuth, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
