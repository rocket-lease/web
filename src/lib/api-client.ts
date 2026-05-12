import type { ProblemDetails } from '@/features/auth/types'

const BASE_URL = import.meta.env.VITE_API_URL as string

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('rocket_lease:access_token')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
}
