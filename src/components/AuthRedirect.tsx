'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { usePathname, useRouter } from 'next/navigation'

// Type Imports
import type { Locale } from '@configs/i18n'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const AuthRedirect = ({ lang }: { lang: Locale }) => {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const redirectUrl = `/${lang}/login?redirectTo=${pathname}`
    const login = `/${lang}/login`
    const homePage = getLocalizedUrl(themeConfig.homePageUrl, lang)
    const target = pathname === login ? login : pathname === homePage ? login : redirectUrl
    router.replace(target)
  }, [router, pathname, lang])

  return null
}

export default AuthRedirect
