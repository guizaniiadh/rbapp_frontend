'use client'

// React Imports
import { ReactNode, useEffect, useState } from 'react'

// Third-party Imports
import { useSelector } from 'react-redux'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'
import type { RootState } from '@/redux-store'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'

export default function AuthGuard({ children, locale }: ChildrenType & { locale: Locale }) {
  const { accessToken } = useSelector((state: RootState) => state.auth)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return <>{accessToken ? (children as ReactNode) : <AuthRedirect lang={locale} />}</>
}
