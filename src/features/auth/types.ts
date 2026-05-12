export type UserRole = 'conductor' | 'rentador'

export interface AuthUser {
  id: string
  email: string
  createdAt: string
}

export interface Profile {
  id: string
  fullName: string
  avatarUrl?: string | null
  phone?: string | null
  isConductor: boolean
  isRentador: boolean
  verificationStatus: 'unverified' | 'pending' | 'verified'
  reputationScore: number
  level: 'bronze' | 'silver' | 'gold' | 'platinum'
  createdAt: string
}
