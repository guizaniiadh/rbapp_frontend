import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documents',
  description: 'View and download customer and bank documents'
}

export default function DocumentsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
