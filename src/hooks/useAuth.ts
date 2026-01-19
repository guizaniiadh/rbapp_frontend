import { useSelector } from 'react-redux'
import type { RootState } from '@/redux-store'

export function useAuth() {
  const auth = useSelector((state: RootState) => state.auth)
  return {
    ...auth,
    isAuthenticated: !!auth.accessToken
  }
}
