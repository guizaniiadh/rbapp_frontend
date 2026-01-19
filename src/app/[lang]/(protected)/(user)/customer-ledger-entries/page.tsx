'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CustomerLedgerEntriesRedirect = () => {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the documents page
    router.replace('/documents/customer-ledger-entries')
  }, [router])

  return null
}

export default CustomerLedgerEntriesRedirect
