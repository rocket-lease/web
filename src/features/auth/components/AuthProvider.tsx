import React, { createContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '../types'

const ROLE_KEY = 'rocket_leaser:active_role'

interface AuthContextValue {
  user: User | null
  session: Session | null
  activeRole: UserRole
  setActiveRole: (role: UserRole) => void
  isLoading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  activeRole: 'conductor',
  setActiveRole: () => {},
  isLoading: true,
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
    await supabase.auth.signOut()
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, activeRole, setActiveRole, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
