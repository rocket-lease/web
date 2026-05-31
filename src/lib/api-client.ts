import type { ProblemDetails } from '@rocket-lease/contracts'
import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_URL as string

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? localStorage.getItem('rocket_lease:access_token')
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

async function forceLogout() {
  await supabase.auth.signOut()
  localStorage.removeItem('rocket_lease:access_token')
  if (window.location.pathname !== '/login') {
    const returnTo = window.location.pathname + window.location.search
    const params = new URLSearchParams({ returnTo })
    window.location.href = `/login?${params.toString()}`
  }
}

async function doFetch(path: string, init?: RequestInit) {
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(await authHeaders()),
      ...init?.headers,
    },
  })
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res = await doFetch(path, init)

  if (res.status === 401) {
    const { data, error } = await supabase.auth.refreshSession()
    if (error || !data.session) {
      await forceLogout()
      const body = await res.json().catch(() => ({}))
      throw body as ProblemDetails
    }
    res = await doFetch(path, init)
    if (res.status === 401) {
      await forceLogout()
    }
  }

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw body as ProblemDetails
  }

  return body as T
}

export const apiClient = {
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),

  postFormData: <T>(path: string, data: FormData) =>
    request<T>(path, { method: 'POST', body: data }),

  get: <T>(path: string) =>
    request<T>(path, { method: 'GET' }),

  patch: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),

  deleteWithBody: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'DELETE', body: JSON.stringify(data) }),
}
