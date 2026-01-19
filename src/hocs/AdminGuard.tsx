'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import { useSelector } from 'react-redux'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'
import type { RootState } from '@/redux-store'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

export default function AdminGuard({ children, locale }: ChildrenType & { locale: Locale }) {
  const { accessToken, user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Delay decision until after first render to avoid hook-order issues
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return

    if (!accessToken) {
      router.replace(getLocalizedUrl('/login', locale))

      return
    }

    if (!user?.is_superuser) {
      router.replace(getLocalizedUrl('/pages/misc/401-not-authorized', locale))
    }
  }, [ready, accessToken, user, router, locale])

  if (!ready || !accessToken || !user?.is_superuser) return null

  return <>{children}</>
}
