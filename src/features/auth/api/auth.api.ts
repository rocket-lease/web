import { apiClient } from '@/lib/api-client'
import { supabase } from '@/lib/supabase'
import type {
  LoginUserRequest,
  LoginUserResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  VerificationStatusResponse,
} from '@rocket-lease/contracts'

const TOKEN_KEY = 'rocket_lease:access_token'
const REFRESH_KEY = 'rocket_lease:refresh_token'

export const authApi = {
  async signIn(data: LoginUserRequest): Promise<LoginUserResponse> {
    const res = await apiClient.post<LoginUserResponse>('/auth/login', data)
    localStorage.setItem(TOKEN_KEY, res.access_token)
    localStorage.setItem(REFRESH_KEY, res.refresh_token)
    // Sync Supabase session so AuthProvider picks up the user
    await supabase.auth.setSession({
      access_token: res.access_token,
      refresh_token: res.refresh_token,
    })
    // setSession does not always fire onAuthStateChange reliably; tell
    // AuthProvider to re-read the session so the gate flips immediately.
    window.dispatchEvent(new CustomEvent('auth:refresh'))
    return res
  },

  async signUp(data: RegisterUserRequest): Promise<RegisterUserResponse> {
    return apiClient.post<RegisterUserResponse>('/auth/register', data)
  },

  async signOut() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async resetPassword(email: string) {
    await apiClient.post('/auth/forgot-password', { email })
  },

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.getSession()
    if (error || !data.session) throw error ?? new Error('No recovery session')
    await apiClient.post('/auth/reset-password', {
      accessToken: data.session.access_token,
      newPassword,
    })
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete('/profile/me')
    await this.signOut()
  },

  async resendEmailOtp(email: string): Promise<void> {
    await apiClient.post('/verifications/email/resend', { email })
  },

  async verifyEmailOtp(email: string, token: string): Promise<void> {
    await apiClient.post('/verifications/email/verify', { email, token })
  },

  async verifyPhoneOtp(token: string): Promise<void> {
    await apiClient.post('/verifications/phone/verify', { token })
  },

  async getVerificationStatus(): Promise<VerificationStatusResponse> {
    return apiClient.get<VerificationStatusResponse>('/verifications/status')
  },
}
