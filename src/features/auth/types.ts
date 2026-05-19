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

// Mirrors @rocket-lease/contracts auth/login.ts
export interface LoginUserRequest {
  email: string
  password: string
}

export interface LoginUserResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

// Mirrors @rocket-lease/contracts auth/register.ts
export interface RegisterUserRequest {
  name: string
  email: string
  dni: string
  phone: string
  password: string
}

export interface RegisterUserResponse {
  id: string
  name: string
  email: string
}

// Mirrors @rocket-lease/contracts auth/verification.ts
export interface VerificationStatusResponse {
  email: boolean
  phone: boolean
}

export type VerificationChannel = 'email' | 'phone'

// RFC 7807 error shape from api
export interface ProblemDetails {
  type: string
  title: string
  status: number
  code: string
  detail: string
  instance?: string
  statusCode: number
  message: string
  timestamp: string
  path: string
}
