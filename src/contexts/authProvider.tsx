'use client'

import { ReactNode, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { loadFromStorage } from '@/redux-store/slices/auth'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(loadFromStorage())
  }, [dispatch])

  return <>{children}</>
}
