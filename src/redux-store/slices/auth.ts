import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Types
export type AuthUser = {
  id: number
  username: string
  email: string
  is_superuser: boolean
  is_staff: boolean
  // Allow extra fields from backend without strict typing errors
  [key: string]: any
}

export type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  is_admin: boolean
  loading: boolean
  error: string | null
}

const STORAGE_KEYS = {
  access: 'rb_access',
  refresh: 'rb_refresh',
  user: 'rb_user'
}

const readFromStorage = (): Partial<AuthState> => {
  if (typeof window === 'undefined') return {}
  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.access)
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refresh)
    const userRaw = localStorage.getItem(STORAGE_KEYS.user)
    const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null
    return {
      accessToken,
      refreshToken,
      user,
      is_admin: user?.is_superuser ?? false
    }
  } catch {
    return {}
  }
}

const writeToStorage = (state: AuthState) => {
  if (typeof window === 'undefined') return
  try {
    if (state.accessToken) {
      localStorage.setItem(STORAGE_KEYS.access, state.accessToken)
      // Also store in cookies for middleware access
      document.cookie = `rb_access=${state.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
    }
    if (state.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.refresh, state.refreshToken)
      document.cookie = `rb_refresh=${state.refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
    }
    if (state.user) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user))
      document.cookie = `rb_user=${encodeURIComponent(JSON.stringify(state.user))}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
    }
  } catch {}
}

const clearStorage = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEYS.access)
    localStorage.removeItem(STORAGE_KEYS.refresh)
    localStorage.removeItem(STORAGE_KEYS.user)
    // Also clear cookies
    document.cookie = 'rb_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'rb_refresh=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'rb_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  } catch {}
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  is_admin: false,
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<Partial<AuthState>>) {
      state.accessToken = action.payload.accessToken ?? state.accessToken
      state.refreshToken = action.payload.refreshToken ?? state.refreshToken
      state.user = (action.payload.user as AuthUser | null | undefined) ?? state.user
      state.is_admin = action.payload.is_admin ?? (state.user?.is_superuser ?? false)
      state.error = action.payload.error ?? null
      state.loading = false
    },
    loadFromStorage(state) {
      const data = readFromStorage()
      state.accessToken = data.accessToken ?? null
      state.refreshToken = data.refreshToken ?? null
      state.user = (data.user as AuthUser | null | undefined) ?? null
      state.is_admin = data.is_admin ?? (state.user?.is_superuser ?? false)
      state.loading = false
      state.error = null
    },
    loginStart(state) {
      state.loading = true
      state.error = null
    },
    loginSuccess(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string; user: AuthUser }>
    ) {
      state.loading = false
      state.error = null
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
      state.is_admin = !!action.payload.user?.is_superuser
      writeToStorage(state)
    },
    setTokens(state, action: PayloadAction<{ accessToken?: string; refreshToken?: string }>) {
      if (action.payload.accessToken !== undefined) state.accessToken = action.payload.accessToken
      if (action.payload.refreshToken !== undefined) state.refreshToken = action.payload.refreshToken
      writeToStorage(state)
    },
    refreshSuccess(state, action: PayloadAction<{ accessToken: string }>) {
      state.accessToken = action.payload.accessToken
      writeToStorage(state)
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
      state.is_admin = !!action.payload?.is_superuser
      writeToStorage(state)
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    logout(state) {
      state.accessToken = null
      state.refreshToken = null
      state.user = null
      state.is_admin = false
      state.loading = false
      state.error = null
      clearStorage()
    }
  }
})

export const {
  hydrate,
  loadFromStorage,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setTokens,
  setUser,
  refreshSuccess
} = authSlice.actions

export default authSlice.reducer
