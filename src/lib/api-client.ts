import type { ProblemDetails } from '@/features/auth/types'
import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_URL as string

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? localStorage.getItem('rocket_lease:access_token')
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(await authHeaders()),
      ...init?.headers,
    },
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw body as ProblemDetails
  }

  return body as T
}

export const apiClient = {
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),

  get: <T>(path: string) =>
    request<T>(path, { method: 'GET' }),

  patch: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}
