import { supabase } from './supabase'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000'
const TOKEN_KEY = 'rocket_lease:access_token'

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? localStorage.getItem(TOKEN_KEY)
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body.message ?? res.statusText), { status: res.status, ...body })
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

async function doFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(await authHeaders()),
      ...init?.headers,
    },
  })
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res = await doFetch(path, init)
  if (res.status === 401) {
    const { data, error } = await supabase.auth.refreshSession()
    if (!error && data.session) {
      localStorage.setItem(TOKEN_KEY, data.session.access_token)
      res = await doFetch(path, init)
    }
  }
  return handleResponse<T>(res)
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
}
