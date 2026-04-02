import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '@/utils/api'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem('token').then((t) => {
      if (t) {
        setToken(t)
        AsyncStorage.getItem('user').then((u) => {
          if (u) setUser(JSON.parse(u))
        })
      }
      setLoading(false)
    })
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/api/auth/mobile-login', { email, password })
    const { token: newToken, user: newUser } = data
    await AsyncStorage.setItem('token', newToken)
    await AsyncStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user'])
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
