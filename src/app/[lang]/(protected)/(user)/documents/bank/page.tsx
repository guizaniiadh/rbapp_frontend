'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const BankDocumentsRedirect = () => {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the correct bank ledger entries page
    router.replace('/documents/bank-ledger-entries')
  }, [router])

  return null
}

export default BankDocumentsRedirect
