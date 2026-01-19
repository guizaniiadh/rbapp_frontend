'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import { useSelector } from 'react-redux'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'
import type { RootState } from '@/redux-store'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const GuestOnlyRoute = ({ children, lang }: ChildrenType & { lang: Locale }) => {
  const { accessToken } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (accessToken) {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('rb_user') || 'null') : null
      const dest = getLocalizedUrl((user?.is_superuser || user?.is_staff) ? '/dashboard' : '/home', lang)
      router.replace(dest)
    }
  }, [accessToken, router, lang])

  if (accessToken) return null
  return <>{children}</>
}

export default GuestOnlyRoute
