# Dictionary-Based Translation System - Complete Implementation Guide

## Overview
This project uses a JSON-based dictionary translation system for multi-language support (English, French, Arabic) in a Next.js application.

## Architecture Components

### 1. Configuration (`src/configs/i18n.ts`)
```typescript
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'fr', 'ar'],
  langDirection: {
    en: 'ltr',
    fr: 'ltr',
    ar: 'rtl'
  }
} as const

export type Locale = (typeof i18n)['locales'][number]
```

### 2. Dictionary Files Structure
Location: `src/data/dictionaries/`
- `en.json`, `fr.json`, `ar.json`

Structure:
```json
{
  "navigation": {
    "keyName": "Translated Value",
    "parameterizedKey": "Text with {placeholder}"
  }
}
```

### 3. Dictionary Loaders

#### Server-Side (`src/utils/getDictionary.ts`)
```typescript
import 'server-only'
import type { Locale } from '@configs/i18n'

const dictionaries = {
  en: () => import('@/data/dictionaries/en.json', { with: { type: 'json' } }).then(module => module.default),
  fr: () => import('@/data/dictionaries/fr.json', { with: { type: 'json' } }).then(module => module.default),
  ar: () => import('@/data/dictionaries/ar.json', { with: { type: 'json' } }).then(module => module.default)
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
```

#### Client-Side (`src/utils/getDictionaryClient.ts`)
```typescript
import type { Locale } from '@configs/i18n'

const dictionaries = {
  en: () => import('@/data/dictionaries/en.json', { with: { type: 'json' } }).then(module => module.default),
  fr: () => import('@/data/dictionaries/fr.json', { with: { type: 'json' } }).then(module => module.default),
  ar: () => import('@/data/dictionaries/ar.json', { with: { type: 'json' } }).then(module => module.default)
}

export const getDictionaryClient = async (locale: Locale) => dictionaries[locale]()
```

### 4. Next.js Routing Setup

#### File Structure
```
src/app/
  [lang]/              # Dynamic locale segment
    layout.tsx         # Root layout with TranslationWrapper
    page.tsx
    (protected)/
      ...
```

#### Root Layout (`src/app/[lang]/layout.tsx`)
```typescript
import TranslationWrapper from '@/hocs/TranslationWrapper'
import { i18n } from '@configs/i18n'

const RootLayout = async (props: { params: Promise<{ lang: Locale }> }) => {
  const params = await props.params
  const headersList = await headers()
  const direction = i18n.langDirection[params.lang]

  return (
    <TranslationWrapper headersList={headersList} lang={params.lang}>
      <html lang={params.lang} dir={direction}>
        {children}
      </html>
    </TranslationWrapper>
  )
}
```

### 5. Translation Wrapper HOC (`src/hocs/TranslationWrapper.tsx`)
```typescript
import { i18n } from '@configs/i18n'
import LangRedirect from '@components/LangRedirect'

const TranslationWrapper = (props: { headersList: any; lang: Locale; children: React.ReactNode }) => {
  const doesLangExist = i18n.locales.includes(props.lang)
  const isInvalidLang = ['_next'].includes(props.lang) // Next.js static files

  return doesLangExist || isInvalidLang ? props.children : <LangRedirect />
}
```

### 6. Language Redirect (`src/components/LangRedirect.tsx`)
```typescript
'use client'
import { redirect, usePathname } from 'next/navigation'
import { i18n } from '@configs/i18n'

const LangRedirect = () => {
  const pathname = usePathname()
  const redirectUrl = `/${i18n.defaultLocale}${pathname}`
  redirect(redirectUrl)
}
```

### 7. Next.js Config Redirects (`next.config.ts`)
```typescript
redirects: async () => [
  {
    source: '/',
    destination: '/en/home',
    permanent: true,
    locale: false
  },
  {
    source: '/:lang(en|fr|ar)',
    destination: '/:lang/home',
    permanent: true,
    locale: false
  }
]
```

### 8. Middleware (`middleware.ts`)
```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const locale = pathname.split('/')[1] || 'en' // Extract locale from URL
  // ... rest of middleware logic
}
```

## Usage Patterns

### Client Components
```typescript
'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

const MyComponent = () => {
  const params = useParams()
  const lang = params.lang as Locale
  const [dictionary, setDictionary] = useState<any>(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(true)

  useEffect(() => {
    if (!lang) {
      setDictionaryLoading(false)
      return
    }
    
    const loadDictionary = async () => {
      try {
        const dict = await getDictionaryClient(lang)
        setDictionary(dict)
        setDictionaryLoading(false)
      } catch (err) {
        console.error('Dictionary load failed:', err)
        setDictionaryLoading(false)
      }
    }
    
    loadDictionary()
  }, [lang])

  // Timeout fallback (optional)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (dictionaryLoading) {
        setDictionaryLoading(false)
      }
    }, 3000)
    return () => clearTimeout(timeout)
  }, [dictionaryLoading])

  if (dictionaryLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>{dictionary?.navigation?.myTitle || 'Default Title'}</h1>
      <p>{dictionary?.navigation?.myDescription || 'Default Description'}</p>
    </div>
  )
}
```

### Server Components
```typescript
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'

const MyServerComponent = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return (
    <div>
      <h1>{dictionary.navigation.myTitle}</h1>
    </div>
  )
}
```

### Parameterized Translations
```typescript
// Dictionary entry:
// "successfullyProcessedTransactions": "Successfully processed {count} transactions"

// Usage:
const message = dictionary?.navigation?.successfullyProcessedTransactions
  ?.replace('{count}', count.toString()) 
  || `Successfully processed ${count} transactions`
```

### Accessing Locale in Components
```typescript
// Client components
const params = useParams()
const lang = params.lang as Locale

// Server components
const { lang } = await params
```

## Utility Functions

### URL Localization (`src/utils/i18n.ts`)
```typescript
import { i18n } from '@configs/i18n'

// Check if URL is missing locale
export const isUrlMissingLocale = (url: string) => {
  return i18n.locales.every(locale => 
    !(url.startsWith(`/${locale}/`) || url === `/${locale}`)
  )
}

// Get localized URL
export const getLocalizedUrl = (url: string, languageCode: string): string => {
  if (!url || !languageCode) throw new Error("URL or Language Code can't be empty")
  return isUrlMissingLocale(url) 
    ? `/${languageCode}${ensurePrefix(url, '/')}` 
    : url
}
```

## Key Implementation Details

1. **URL Structure**: All routes must include locale: `/en/page`, `/fr/page`, `/ar/page`
2. **Dynamic Import**: Dictionaries are lazy-loaded using dynamic imports
3. **Type Safety**: Uses TypeScript `Locale` type for type checking
4. **Error Handling**: Try-catch blocks with fallback to default locale
5. **Loading States**: Optional loading state management with timeout fallback
6. **RTL Support**: Arabic automatically gets `dir="rtl"` attribute
7. **Optional Chaining**: Always use `?.` when accessing dictionary keys
8. **Fallback Values**: Provide fallback strings when translations might be missing

## Complete Example

```typescript
'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

export default function MyPage() {
  const params = useParams()
  const lang = (params?.lang as Locale) || 'en'
  const [dict, setDict] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const dictionary = await getDictionaryClient(lang)
        setDict(dictionary)
      } catch (err) {
        console.error('Failed to load dictionary:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [lang])

  if (loading) return <div>Loading translations...</div>

  return (
    <div>
      <h1>{dict?.navigation?.pageTitle || 'Default Title'}</h1>
      <button>{dict?.navigation?.submitButton || 'Submit'}</button>
    </div>
  )
}
```

## Testing Checklist

- [ ] Dictionary files exist for all locales (en, fr, ar)
- [ ] All dictionary keys are consistent across locales
- [ ] Locale is extracted correctly from URL params
- [ ] TranslationWrapper validates locale
- [ ] Fallback to default locale works
- [ ] RTL direction applied for Arabic
- [ ] Parameterized translations work correctly
- [ ] Error handling prevents crashes
- [ ] Loading states handled gracefully








