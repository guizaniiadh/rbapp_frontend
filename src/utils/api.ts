import { store } from '@/redux-store'
import { logout, refreshSuccess, setTokens } from '@/redux-store/slices/auth'

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${BASE_URL}/api/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken })
  })

  if (!res.ok) throw new Error('Failed to refresh token')

  const data = (await res.json()) as { access: string }
  store.dispatch(refreshSuccess({ accessToken: data.access }))
  return data.access
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  // Prefix with backend base URL if relative path
  const url = input.startsWith('http') ? input : `${BASE_URL}${input}`

  const state = store.getState() as any
  const access = state.auth?.accessToken as string | null
  const refresh = state.auth?.refreshToken as string | null

  const headers = new Headers(init.headers || {})
  if (access) headers.set('Authorization', `Bearer ${access}`)

  let res = await fetch(url, { ...init, headers })

  if (res.status === 401 && refresh) {
    // Try refresh once
    try {
      const newAccess = await refreshAccessToken(refresh)
      const retryHeaders = new Headers(init.headers || {})
      retryHeaders.set('Authorization', `Bearer ${newAccess}`)
      res = await fetch(url, { ...init, headers: retryHeaders })
    } catch (e) {
      store.dispatch(logout())
    }
  }

  return res
}

export async function apiJson<T = any>(input: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {})
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await apiFetch(input, { ...init, headers })
  if (!res.ok) {
    let err: any
    try { err = await res.json() } catch { err = { status: res.status, statusText: res.statusText } }
    throw err
  }
  try {
    return (await res.json()) as T
  } catch {
    // In case of 204 No Content
    return undefined as T
  }
}

export function setAuthTokens(access: string, refresh: string) {
  store.dispatch(setTokens({ accessToken: access, refreshToken: refresh }) as any)
}
