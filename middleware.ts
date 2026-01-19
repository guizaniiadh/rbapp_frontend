import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define admin-only routes
const adminRoutes = [
  '/dashboards/crm',
  '/dashboards/analytics',
  '/apps/user/list',
  '/apps/roles',
  '/apps/permissions',
  '/apps/settings',
  '/apps/user/view',
  '/admin/dashboard',
  '/admin/logs',
  '/admin/audit-trail',
  '/admin/system-health',
  '/admin/api-explorer',
  '/admin/database',
  '/admin/banques/comptes-bancaires',
  '/admin/company/company-informations',
  '/admin/company/company-list',
  '/admin/parameters/general',
  '/admin/parameters/reconciliation',
  '/front-pages/*',
  'banques/*'
]

// Define authenticated user routes
const authenticatedRoutes = [
  '/apps/email',
  '/apps/chat',
  '/apps/calendar',
  '/pages/account-settings',
  '/pages/user-profile',
  '/reconciliation/*',
  '/home',
  '/documents/*',
  '/customer-ledger-entries',
  '/agencies/*'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const locale = pathname.split('/')[1] || 'en'

  // Skip middleware for public paths
  const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/pages/pricing',
    '/pages/faq',
    '/_next',
    '/static',
    '/images'
  ]

  // Allow public paths
  if (publicPaths.some(path => pathname === `/${path}` || pathname.startsWith(`/${path}/`))) {
    return NextResponse.next()
  }

  // Get auth data from cookies
  const accessToken = request.cookies.get('rb_access')?.value
  const userData = request.cookies.get('rb_user')?.value

  // If no access token, redirect to login
  if (!accessToken) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  // Parse user data
  let user = null

  try {
    user = userData ? JSON.parse(userData) : null
  } catch (e) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  // Check if route requires admin access
  const isAdminRoute = adminRoutes.some(route => pathname.includes(route))
  const isAuthenticatedRoute = authenticatedRoutes.some(route => pathname.includes(route))

  // Redirect to 401 if user tries to access admin route without admin privileges
  if (isAdminRoute && !user?.is_superuser && !user?.is_staff) {
    return NextResponse.redirect(new URL(`/${locale}/401-not-authorized`, request.url))
  }

  // Allow access to authenticated routes for logged-in users
  if (isAuthenticatedRoute) {
    return NextResponse.next()
  }

  // For any other route, allow access but log it
  console.log(`Accessing unprotected route: ${pathname}`)

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
