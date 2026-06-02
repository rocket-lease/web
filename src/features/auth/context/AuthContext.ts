import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { UserRole } from '../types'

export interface AuthContextValue {
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
