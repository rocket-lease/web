import { useState, useCallback } from 'react'
import type { UserRole } from '../types'

const STORAGE_KEY = 'rocket_leaser:active_role'

function getStoredRole(): UserRole {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'conductor' || stored === 'rentador') return stored
  } catch {}
  return 'conductor'
}

export function useActiveRole() {
  const [activeRole, setActiveRoleState] = useState<UserRole>(getStoredRole)

  const setActiveRole = useCallback((role: UserRole) => {
    setActiveRoleState(role)
    try {
      localStorage.setItem(STORAGE_KEY, role)
    } catch {}
  }, [])

  return { activeRole, setActiveRole }
}
