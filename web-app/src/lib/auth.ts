import { create } from 'zustand'
import api from './api'

interface User {
  id: string
  email: string
  name: string
  tier: 'free' | 'professional' | 'business' | 'enterprise'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  checkAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (email: string, password: string, name: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isAuthenticated: false, user: null })
      return
    }

    try {
      const response = await api.get('/api/auth/me')
      set({ user: response.data, isAuthenticated: true, token })
    } catch {
      localStorage.removeItem('token')
      set({ isAuthenticated: false, user: null, token: null })
    }
  },

  login: async (email: string, password: string) => {
  const response = await api.post('/api/auth/login', {
    email,
    password,
  })

  const { access_token, user } = response.data

  localStorage.setItem(
    'token',
    access_token
  )

  set({
    token: access_token,
    user,
    isAuthenticated: true,
  })
},
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  signup: async (
  email: string,
  password: string,
  name: string
) => {
  const response = await api.post(
    '/api/auth/signup',
    {
      email,
      password,
      name,
    }
  )

  const { access_token, user } =
    response.data

  localStorage.setItem(
    'token',
    access_token
  )

  set({
    token: access_token,
    user,
    isAuthenticated: true,
  })
},
}))
