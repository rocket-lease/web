import React, { useEffect, useRef, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import { authApi } from '../api/auth.api'
import type { UserRole } from '../types'
import { AuthContext } from '../context/AuthContext'

const ROLE_KEY = 'rocket_lease:active_role'

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
    const applySession = (nextSession: Session | null) => {
      const nextUserId = nextSession?.user?.id ?? null
      if (prevUserIdRef.current !== null && prevUserIdRef.current !== nextUserId) {
        queryClient.clear()
      }
      prevUserIdRef.current = nextUserId
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setIsLoading(false)
    }

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession()
      applySession(data.session)
    }

    syncSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncSession()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const onAuthRefresh = () => {
      syncSession()
    }
    window.addEventListener('auth:refresh', onAuthRefresh)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('auth:refresh', onAuthRefresh)
    }
  }, [])

  const hasToken = Boolean(localStorage.getItem('rocket_lease:access_token'))
  const isAuthenticated = !!user || hasToken

  return (
    <AuthContext.Provider value={{ user, session, activeRole, setActiveRole, isLoading, isAuthenticated, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
