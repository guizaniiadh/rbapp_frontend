import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/fr/login',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/home',
        permanent: true,
        locale: false
      },
      {
        source: '/:path((?!en|fr|ar|front-pages|favicon\\.ico|images|_next|api|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp|.*\\.ico).*)',
        destination: '/fr/:path',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
