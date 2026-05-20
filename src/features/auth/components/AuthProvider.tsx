import React, { createContext, useEffect, useRef, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import { authApi } from '../api/auth.api'
import type { UserRole } from '../types'

const ROLE_KEY = 'rocket_lease:active_role'

interface AuthContextValue {
  user: User | null
  session: Session | null
  activeRole: UserRole
  setActiveRole: (role: UserRole) => void
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  activeRole: 'conductor',
  setActiveRole: () => {},
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem(ROLE_KEY)
      return stored === 'rentador' ? 'rentador' : 'conductor'
    } catch {
      return 'conductor'
    }
  })

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role)
    try { localStorage.setItem(ROLE_KEY, role) } catch {}
  }

  const signOut = async () => {
    await authApi.signOut()
    queryClient.clear()
  }

  const prevUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      prevUserIdRef.current = data.session?.user?.id ?? null
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUserId = session?.user?.id ?? null
      if (event === 'SIGNED_OUT' || prevUserIdRef.current !== nextUserId) {
        queryClient.clear()
      }
      prevUserIdRef.current = nextUserId
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const hasToken = Boolean(localStorage.getItem('rocket_lease:access_token'))
  const isAuthenticated = !!user || hasToken

  return (
    <AuthContext.Provider value={{ user, session, activeRole, setActiveRole, isLoading, isAuthenticated, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
