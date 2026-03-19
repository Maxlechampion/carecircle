'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { authApi } from '@/lib/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'caregiver' | 'doctor' | 'recipient' | 'family'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string | null
  phone?: string
  countryCode?: string
  createdAt?: string
  subscriptionPlan?: string
  preferences: {
    notifications: boolean
    emailNotifications: boolean
    pushNotifications: boolean
    soundEnabled: boolean
    darkMode: boolean
    language: string
  }
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: UserRole
  countryCode?: string
  phone?: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  loginWithOAuth: (provider: 'google' | 'facebook' | 'apple') => Promise<void>
  loginWithPhone: (phone: string, countryCode: string) => Promise<void>
  verifyOTP: (phone: string, code: string) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  updateUser: (updates: Partial<AuthUser>) => void
  hasRole: (role: UserRole | UserRole[]) => boolean
}

// ─── Role configuration ───────────────────────────────────────────────────────

export const ROLE_CONFIG: Record<UserRole, {
  label: string
  description: string
  color: string
  dashboardTitle: string
  welcomeMessage: string
}> = {
  caregiver: {
    label: 'Aidant Familial',
    description: 'Vous accompagnez un proche au quotidien',
    color: 'teal',
    dashboardTitle: 'Tableau de bord – Aidant',
    welcomeMessage: 'Bienvenue ! Prenez soin de vous autant que de votre proche.',
  },
  doctor: {
    label: 'Professionnel de Santé',
    description: 'Médecin, infirmier, kinésithérapeute...',
    color: 'blue',
    dashboardTitle: 'Tableau de bord – Professionnel',
    welcomeMessage: 'Bienvenue ! Suivez vos patients aidés facilement.',
  },
  recipient: {
    label: 'Personne Aidée',
    description: "Vous bénéficiez du soutien d'un aidant",
    color: 'purple',
    dashboardTitle: 'Mon espace personnel',
    welcomeMessage: 'Bienvenue ! Votre équipe de soins est là pour vous.',
  },
  family: {
    label: 'Membre de la Famille',
    description: "Vous partagez l'aidance en famille",
    color: 'orange',
    dashboardTitle: 'Tableau de bord – Famille',
    welcomeMessage: 'Bienvenue ! Coordonnez les soins en famille.',
  },
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null)

function sessionToUser(session: any): AuthUser | null {
  if (!session?.user) return null
  return {
    id: session.user.id,
    name: session.user.name || '',
    email: session.user.email || '',
    role: (session.user.role as UserRole) || 'caregiver',
    avatar: session.user.image || null,
    subscriptionPlan: session.user.subscriptionPlan || 'free',
    preferences: {
      notifications: true,
      emailNotifications: true,
      pushNotifications: true,
      soundEnabled: true,
      darkMode: false,
      language: 'fr',
    },
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession()
  const [localPrefs, setLocalPrefs] = useState<AuthUser['preferences']>({
    notifications: true,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    darkMode: false,
    language: 'fr',
  })

  // Load saved preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('carecircle_prefs')
      if (saved) setLocalPrefs(JSON.parse(saved))
    } catch {}
  }, [])

  const user: AuthUser | null = session
    ? { ...sessionToUser(session), preferences: localPrefs } as AuthUser
    : null

  const isAuthenticated = status === 'authenticated' && !!session?.user
  const isLoading = status === 'loading'

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email: email.toLowerCase(),
      password,
      redirect: false,
    })
    if (result?.error) {
      throw new Error('Email ou mot de passe incorrect.')
    }
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    // 1. Create user in DB
    await authApi.register(data)
    // 2. Auto sign in
    const result = await signIn('credentials', {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: false,
    })
    if (result?.error) throw new Error('Inscription réussie mais connexion échouée.')
  }, [])

  const loginWithOAuth = useCallback(async (provider: 'google' | 'facebook' | 'apple') => {
    if (provider === 'google') {
      await signIn('google', { redirect: false })
    } else {
      // Facebook/Apple: not yet configured — show toast in UI
      throw new Error(`Connexion via ${provider} non disponible actuellement.`)
    }
  }, [])

  const loginWithPhone = useCallback(async (_phone: string, _countryCode: string) => {
    // OTP flow — API call to generate OTP
    await new Promise(r => setTimeout(r, 500))
  }, [])

  const verifyOTP = useCallback(async (_phone: string, _code: string) => {
    // In production: verify OTP then sign in with credentials
    await new Promise(r => setTimeout(r, 500))
  }, [])

  const logout = useCallback(() => {
    signOut({ callbackUrl: '/auth' })
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    const { authApi } = await import('@/lib/api-client')
    await authApi.forgotPassword(email)
  }, [])

  const resetPassword = useCallback(async (token: string, password: string) => {
    const { authApi } = await import('@/lib/api-client')
    await authApi.resetPassword(token, password)
  }, [])

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    if (updates.preferences) {
      setLocalPrefs(updates.preferences)
      try { localStorage.setItem('carecircle_prefs', JSON.stringify(updates.preferences)) } catch {}
    }
    // Update session for name/email changes
    if (updates.name || updates.email) {
      update({ name: updates.name, email: updates.email })
    }
  }, [update])

  const hasRole = useCallback((role: UserRole | UserRole[]) => {
    if (!user) return false
    return Array.isArray(role) ? role.includes(user.role) : user.role === role
  }, [user])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      loginWithOAuth,
      loginWithPhone,
      verifyOTP,
      logout,
      forgotPassword,
      resetPassword,
      updateUser,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
