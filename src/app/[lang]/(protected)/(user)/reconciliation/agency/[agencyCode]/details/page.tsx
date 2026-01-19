'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

import {
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Button,
  Breadcrumbs,
  Link,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Divider,
  Chip
} from '@mui/material'
import { 
  ArrowBack,
  AccountBalance,
  Receipt,
  Business,
  AttachMoney,
  TrendingUp,
  MonetizationOn,
  Calculate
} from '@mui/icons-material'

// Service Imports
import { agencyService } from '@/services/agency.service'
import { recoBankTransactionService } from '@/services/recoBankTransaction.service'
import { recoCustomerTransactionService } from '@/services/recoCustomerTransaction.service'
import { taxExtractionService } from '@/services/taxExtraction.service'

// Type Imports
import type { Agency } from '@/types/agency'
import type { BankTransaction } from '@/types/bankTransaction'
import type { CustomerTransaction } from '@/types/customerTransaction'

// Dictionary imports
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

const ReconciliationDetailsPage = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const agencyCode = params.agencyCode as string
  const lang = params.lang as Locale
  
  // Get URL parameters
  const bankId = searchParams.get('bankId')
  const customerId = searchParams.get('customerId')
  const score = searchParams.get('score')
  const cachedBankTaxesParam = searchParams.get('cachedBankTaxes')
  const cachedCustomerTaxesParam = searchParams.get('cachedCustomerTaxes')
  const cachedBankTransactionParam = searchParams.get('cachedBankTransaction')
  const cachedCustomerTransactionParam = searchParams.get('cachedCustomerTransaction')

  const [agency, setAgency] = useState<Agency | null>(null)
  const [bankTransaction, setBankTransaction] = useState<BankTransaction | null>(null)
  const [customerTransaction, setCustomerTransaction] = useState<CustomerTransaction | null>(null)
  const [bankTaxes, setBankTaxes] = useState<any[]>([])
  const [customerTaxes, setCustomerTaxes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dictionary, setDictionary] = useState<any>(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(true)

  // Load dictionary
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

  /**
   * PRIMARY METHOD: Load tax data from comparison API
   * This is the recommended approach as it provides matched tax data
   * @returns Promise<{bankTaxes: any[], customerTaxes: any[]}>
   */
  const loadTaxesFromComparisonAPI = async (): Promise<{bankTaxes: any[], customerTaxes: any[]}> => {
    const taxComparison = await taxExtractionService.getTaxComparisonByTransactions(Number(bankId), Number(customerId))
    
    return {
      bankTaxes: taxComparison.bankTaxes || [],
      customerTaxes: taxComparison.customerTaxes || []
    }
  }

  /**
   * FALLBACK METHOD 1: Load tax data from cached URL parameters
   * Used when comparison API fails but we have cached data from the main page
   * @returns Promise<{bankTaxes: any[], customerTaxes: any[]}>
   */
  const loadTaxesFromCache = async (): Promise<{bankTaxes: any[], customerTaxes: any[]}> => {
    let bankTaxesData: any[] = []
    let customerTaxesData: any[] = []

    // Parse cached bank taxes
    if (cachedBankTaxesParam && bankId) {
      try {
        const cachedData = JSON.parse(decodeURIComponent(cachedBankTaxesParam))
        bankTaxesData = cachedData[bankId] || []
      } catch (e) {
        // Silent fail for cached data
      }
    }

    // Parse cached customer taxes
    if (cachedCustomerTaxesParam && customerId) {
      try {
        const cachedData = JSON.parse(decodeURIComponent(cachedCustomerTaxesParam))
        customerTaxesData = cachedData[customerId] || []
      } catch (e) {
        // Silent fail for cached data
      }
    }

    return {
      bankTaxes: bankTaxesData,
      customerTaxes: customerTaxesData
    }
  }

  /**
   * FALLBACK METHOD 2: Load tax data from individual API endpoints
   * Used when both comparison API and cache fail
   * @returns Promise<{bankTaxes: any[], customerTaxes: any[]}>
   */
  const loadTaxesFromIndividualAPIs = async (): Promise<{bankTaxes: any[], customerTaxes: any[]}> => {
    console.log('🔄 Attempting to load taxes from individual API endpoints...')
    
    let bankTaxesData: any[] = []
    let customerTaxesData: any[] = []

    // Load bank taxes
    try {
      const bankTaxResult = await taxExtractionService.getBankTaxRowsByTransaction(Number(bankId))
      bankTaxesData = bankTaxResult.extracted_taxes || []
      console.log('✅ Loaded bank taxes from individual API:', bankTaxesData.length)
    } catch (e) {
      console.warn('❌ Failed to fetch bank taxes from individual API:', e)
    }

    // Load customer taxes
    try {
      const customerTaxResult = await taxExtractionService.getCustomerTaxRowsByTransaction(Number(customerId))
      customerTaxesData = customerTaxResult.extracted_taxes || []
      console.log('✅ Loaded customer taxes from individual API:', customerTaxesData.length)
    } catch (e) {
      console.warn('❌ Failed to fetch customer taxes from individual API:', e)
    }

    return {
      bankTaxes: bankTaxesData,
      customerTaxes: customerTaxesData
    }
  }

  /**
   * MAIN TAX LOADING FUNCTION: Prioritized approach
   * 1. Try comparison API first (recommended)
   * 2. Fall back to cached data if available
   * 3. Fall back to individual APIs as last resort
   * @returns Promise<{bankTaxesData: any[], customerTaxesData: any[]}>
   */
  const loadTaxData = async (): Promise<{bankTaxesData: any[], customerTaxesData: any[]}> => {
    // First try to use cached data (fastest - no API call needed)
    if (cachedBankTaxesParam && cachedCustomerTaxesParam) {
      try {
        const cachedResult = await loadTaxesFromCache()
        if (cachedResult.bankTaxes.length > 0 || cachedResult.customerTaxes.length > 0) {
          return {
            bankTaxesData: cachedResult.bankTaxes,
            customerTaxesData: cachedResult.customerTaxes
          }
        }
      } catch (e) {
        // Fall through to API call if cache fails
      }
    }

    // Fallback to API call only if no cached data available
    try {
      const result = await loadTaxesFromComparisonAPI()
      return {
        bankTaxesData: result.bankTaxes,
        customerTaxesData: result.customerTaxes
      }
    } catch (e) {
      // Return empty arrays on error
      return {
        bankTaxesData: [],
        customerTaxesData: []
      }
    }
  }

  // Load all data
  const loadData = useCallback(async () => {
    if (!bankId || !customerId) {
      setError('Missing transaction IDs in URL parameters')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Check if we have cached data (instant loading)
      const hasCachedTaxData = cachedBankTaxesParam && cachedCustomerTaxesParam
      const hasCachedTransactionData = cachedBankTransactionParam && cachedCustomerTransactionParam
      
      if (hasCachedTaxData && hasCachedTransactionData) {
        // INSTANT LOADING: Use all cached data (no API calls needed)
        try {
          // Parse cached transaction data
          const bankTx = JSON.parse(decodeURIComponent(cachedBankTransactionParam))
          const customerTx = JSON.parse(decodeURIComponent(cachedCustomerTransactionParam))
          
          // Load only agency data (lightweight)
      const agencies = await agencyService.getAgencies()
      const foundAgency = agencies.find(a => a.code === agencyCode)
      if (!foundAgency) {
        throw new Error(`Agency with code ${agencyCode} not found`)
      }

          // Load tax data from cache (instant)
          const taxData = await loadTaxData()

          // Set all data
      setAgency(foundAgency)
      setBankTransaction(bankTx)
      setCustomerTransaction(customerTx)
          setBankTaxes(taxData.bankTaxesData)
          setCustomerTaxes(taxData.customerTaxesData)
      } catch (e) {
          // Fall through to API calls if cache parsing fails
          throw e
        }
      } else if (hasCachedTaxData) {
        // PARTIAL CACHE: Use cached tax data, load transactions from API
        const [agencies, bankTx, customerTx] = await Promise.all([
          agencyService.getAgencies(),
          recoBankTransactionService.getTransactionById(Number(bankId)),
          recoCustomerTransactionService.getTransactionById(Number(customerId))
        ])

        // Find agency
        const foundAgency = agencies.find(a => a.code === agencyCode)
        if (!foundAgency) {
          throw new Error(`Agency with code ${agencyCode} not found`)
        }

        // Load tax data from cache (instant)
        const taxData = await loadTaxData()

        // Set all data
        setAgency(foundAgency)
        setBankTransaction(bankTx)
        setCustomerTransaction(customerTx)
        setBankTaxes(taxData.bankTaxesData)
        setCustomerTaxes(taxData.customerTaxesData)
      } else {
        // Load all data in parallel (including API call for tax data)
        const [agencies, bankTx, customerTx, taxData] = await Promise.all([
          agencyService.getAgencies(),
          recoBankTransactionService.getTransactionById(Number(bankId)),
          recoCustomerTransactionService.getTransactionById(Number(customerId)),
          loadTaxData()
        ])

        // Find agency
        const foundAgency = agencies.find(a => a.code === agencyCode)
        if (!foundAgency) {
          throw new Error(`Agency with code ${agencyCode} not found`)
        }

        // Set all data
        setAgency(foundAgency)
        setBankTransaction(bankTx)
        setCustomerTransaction(customerTx)
        setBankTaxes(taxData.bankTaxesData)
        setCustomerTaxes(taxData.customerTaxesData)
      }

      } catch (err) {
      console.error('Error loading reconciliation details:', err)
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to load reconciliation details: ${errorMsg}`)
      } finally {
        setLoading(false)
    }
  }, [bankId, customerId, agencyCode, cachedBankTaxesParam, cachedCustomerTaxesParam, cachedBankTransactionParam, cachedCustomerTransactionParam])
    
  useEffect(() => {
    loadData()
  }, [loadData])

  // Robust back navigation function (declare before any usage)
  const handleGoBack = useCallback(() => {
    // Try multiple strategies to ensure we go back
    try {
      // Strategy 1: Try browser history back
      if (window.history.length > 1) {
        window.history.back()
        return
      }
    } catch (e) {
      // Strategy 2: Navigate to reconciliation page
      router.push(`/${lang}/reconciliation/agency/${agencyCode}`)
    }
    
    // Strategy 3: Fallback - close tab if opened in new tab
    if (window.opener) {
      window.close()
    } else {
      // Strategy 4: Navigate to reconciliation page
      router.push(`/${lang}/reconciliation/agency/${agencyCode}`)
    }
  }, [router, lang, agencyCode])

  // Add keyboard shortcut for back navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || (event.ctrlKey && event.key === 'b')) {
        event.preventDefault()
        handleGoBack()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleGoBack])

  // Memoized helper function to categorize taxes
  const categorizeTaxes = useMemo(() => {
    const matchedTaxes: any[] = []
    const unmatchedBankTaxes: any[] = []
    const unmatchedCustomerTaxes: any[] = []
    const missingTaxes: any[] = []

    // Create maps for easier matching
    const bankTaxMap = new Map(bankTaxes.map(tax => [tax.tax_name, tax]))
    const customerTaxMap = new Map(customerTaxes.map(tax => [tax.tax_name, tax]))

    // Find matched taxes
    bankTaxes.forEach(bankTax => {
      const customerTax = customerTaxMap.get(bankTax.tax_name)
      if (customerTax) {
        matchedTaxes.push({
          taxName: bankTax.tax_name,
          bankValue: bankTax.value,
          customerValue: customerTax.value,
          status: bankTax.type === 'matched' ? 'matched' : 'mismatch',
          bankType: bankTax.type,
          customerType: customerTax.type
        })
      } else {
        unmatchedBankTaxes.push(bankTax)
      }
    })

    // Find unmatched customer taxes
    customerTaxes.forEach(customerTax => {
      if (!bankTaxMap.has(customerTax.tax_name)) {
        unmatchedCustomerTaxes.push(customerTax)
      }
    })

    // Check for missing taxes (when one side has no value)
    matchedTaxes.forEach(tax => {
      const bankValue = parseFloat(tax.bankValue) || 0
      const customerValue = parseFloat(tax.customerValue) || 0
      
      if (bankValue === 0 || customerValue === 0) {
        tax.status = 'missing'
        // If bank value is 0, bank side is missing; if customer value is 0, customer side is missing
        tax.missingSide = bankValue === 0 ? 'bank' : 'customer'
        missingTaxes.push(tax)
      }
    })


    return { matchedTaxes, unmatchedBankTaxes, unmatchedCustomerTaxes, missingTaxes }
  }, [bankTaxes, customerTaxes])

  if (dictionaryLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
        >
          {dictionary?.navigation?.goBack || 'Go Back'}
        </Button>
      </Box>
    )
  }

  if (!bankTransaction || !customerTransaction) {
    return (
      <Box p={3}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {dictionary?.navigation?.transactionsNotFound || 'Transactions not found'}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
        >
          {dictionary?.navigation?.goBack || 'Go Back'}
        </Button>
      </Box>
    )
  }

  const { matchedTaxes, unmatchedBankTaxes, unmatchedCustomerTaxes, missingTaxes } = categorizeTaxes

  return (
    <Box p={3}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          href={`/${lang}/reconciliation`}
          color="inherit"
          underline="hover"
        >
          {dictionary?.navigation?.reconciliation || 'Reconciliation'}
        </Link>
          <Link 
          href={`/${lang}/reconciliation/agency/${agencyCode}`}
            color="inherit" 
          underline="hover"
          >
          {agency?.name || agencyCode}
          </Link>
        <Typography color="text.primary">
          {dictionary?.navigation?.matchDetails || 'Match Details'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {dictionary?.navigation?.matchDetails || 'Match Details'}
        </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
        >
          {dictionary?.navigation?.goBack || 'Go Back'}
        </Button>
      </Box>

      {/* Split Screen Layout - Same as reconciliation page */}
      <Grid container spacing={3}>
        {/* Bank Transaction */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <AccountBalance color="primary" />
                  <Typography variant="h6">{dictionary?.navigation?.bankTransaction || 'Bank Transaction'}</Typography>
                </Box>
              }
            />
            <CardContent>
              {/* Bank Transaction Details */}
              <Typography variant="subtitle1" gutterBottom>
                {dictionary?.navigation?.transactionDetails || 'Transaction Details'}
                  </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420 }}>
                <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px', whiteSpace: 'nowrap' }}>
                        {dictionary?.navigation?.operationDate || 'Operation Date'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px', minWidth: '200px' }}>
                        {dictionary?.navigation?.label || 'Label'}
                      </TableCell>
                      <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.debit || 'Debit'}
                      </TableCell>
                      <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.credit || 'Credit'}
                      </TableCell>
                      <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.amount || 'Amount'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px', whiteSpace: 'nowrap' }}>
                        {dictionary?.navigation?.valueDate || 'Value Date'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.paymentClass || 'Payment Class'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.paymentStatus || 'Payment Status'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.ref || 'Reference'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px', whiteSpace: 'nowrap' }}>
                        {dictionary?.navigation?.dateRef || 'Date Reference'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.documentReference || 'Document Reference'}
                      </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                    <TableRow sx={{ height: '48px' }}>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{bankTransaction.operation_date}</TableCell>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle', minWidth: '200px' }}>{bankTransaction.label}</TableCell>
                      <TableCell align="right" sx={{ height: '48px', verticalAlign: 'middle' }}>{bankTransaction.debit?.toLocaleString() || '-'}</TableCell>
                      <TableCell align="right" sx={{ height: '48px', verticalAlign: 'middle' }}>{bankTransaction.credit?.toLocaleString() || '-'}</TableCell>
                      <TableCell align="right" sx={{ height: '48px', verticalAlign: 'middle' }}>{bankTransaction.amount?.toLocaleString()}</TableCell>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{bankTransaction.value_date}</TableCell>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle' }}>{bankTransaction.payment_class_id || '-'}</TableCell>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle' }}>{bankTransaction.payment_status_id || '-'}</TableCell>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle' }}>{bankTransaction.ref || '-'}</TableCell>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{bankTransaction.date_ref || '-'}</TableCell>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle' }}>{bankTransaction.document_reference || '-'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Transaction */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Receipt color="primary" />
                  <Typography variant="h6">{dictionary?.navigation?.customerTransaction || 'Customer Transaction'}</Typography>
                </Box>
              }
            />
            <CardContent>
              {/* Customer Transaction Details */}
              <Typography variant="subtitle1" gutterBottom>
                {dictionary?.navigation?.transactionDetails || 'Transaction Details'}
                  </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420 }}>
                <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px', whiteSpace: 'nowrap' }}>
                        {dictionary?.navigation?.accountingDate || 'Accounting Date'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.description || 'Description'}
                      </TableCell>
                      <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.debit || 'Debit'}
                      </TableCell>
                      <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.credit || 'Credit'}
                      </TableCell>
                      <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.amount || 'Amount'}
                      </TableCell>
                      <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.totalAmount || 'Total Amount'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.paymentStatus || 'Payment Status'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.paymentType || 'Payment Type'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px', whiteSpace: 'nowrap' }}>
                        {dictionary?.navigation?.dueDate || 'Due Date'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.externalDocNumber || 'External Doc Number'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '48px' }}>
                        {dictionary?.navigation?.documentNumber || 'Document Number'}
                      </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                    <TableRow sx={{ height: '48px' }}>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{customerTransaction.accounting_date}</TableCell>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle' }}>{customerTransaction.description}</TableCell>
                      <TableCell align="right" sx={{ height: '48px', verticalAlign: 'middle' }}>{customerTransaction.debit_amount?.toLocaleString() || '-'}</TableCell>
                      <TableCell align="right" sx={{ height: '48px', verticalAlign: 'middle' }}>{customerTransaction.credit_amount?.toLocaleString() || '-'}</TableCell>
                      <TableCell align="right" sx={{ height: '48px', verticalAlign: 'middle' }}>{customerTransaction.amount?.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ height: '48px', verticalAlign: 'middle' }}>{customerTransaction.total_amount?.toLocaleString() || '-'}</TableCell>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle' }}>-</TableCell>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle' }}>{customerTransaction.payment_type || '-'}</TableCell>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{customerTransaction.due_date || '-'}</TableCell>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle' }}>{customerTransaction.external_doc_number || '-'}</TableCell>
                      <TableCell sx={{ height: '48px', verticalAlign: 'middle' }}>{customerTransaction.document_number || '-'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tax Comparison Section - NEW STRUCTURE */}
      {(matchedTaxes.length > 0 || unmatchedBankTaxes.length > 0 || unmatchedCustomerTaxes.length > 0) && (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Calculate sx={{ mr: 1, color: 'primary.main' }} />
            {dictionary?.navigation?.taxComparison || 'Tax Comparison'}
          </Typography>


          {/* Matched Taxes - Single Table (excluding missing) */}
          {matchedTaxes.filter(tax => tax.status !== 'missing').length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: matchedTaxes.filter(tax => tax.status !== 'missing').every(tax => tax.status === 'matched') ? 'success.main' : 'error.main' 
              }}>
                {matchedTaxes.filter(tax => tax.status !== 'missing').every(tax => tax.status === 'matched') ? '✅' : '❌'} 
                {matchedTaxes.filter(tax => tax.status !== 'missing').every(tax => tax.status === 'matched') 
                  ? (dictionary?.navigation?.matchedTaxes || 'Matched Taxes')
                  : (dictionary?.navigation?.mismatchedTaxes || 'Mismatched Taxes')
                } ({matchedTaxes.filter(tax => tax.status !== 'missing').length})
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, width: '100%' }}>
                <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '40px', width: '30%' }}>
                        {dictionary?.navigation?.taxName || 'Tax Name'}
                      </TableCell>
                      <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ height: '40px', width: '25%' }}>
                        {dictionary?.navigation?.bankValue || 'Bank Value'}
                      </TableCell>
                      <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ height: '40px', width: '25%' }}>
                        {dictionary?.navigation?.customerValue || 'Customer Value'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '40px', width: '20%' }}>
                        {dictionary?.navigation?.status || 'Status'}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {matchedTaxes.filter(tax => tax.status !== 'missing').map((tax, index) => (
                      <TableRow 
                        key={index} 
                        sx={{ 
                          height: '40px',
                          backgroundColor: tax.status === 'matched' ? '#e8f5e8' : 
                                          tax.status === 'missing' ? '#fff3e0' : '#ffebee', // Green for matched, orange for missing, red for mismatch
                          '&:hover': {
                            backgroundColor: tax.status === 'matched' ? '#f5f5f5' : 
                                           tax.status === 'missing' ? '#fff3e0' : '#ffebee'
                          }
                        }}
                      >
                        <TableCell sx={{ height: '40px', verticalAlign: 'middle' }}>{tax.taxName}</TableCell>
                        <TableCell align="right" sx={{ height: '40px', verticalAlign: 'middle' }}>{tax.bankValue}</TableCell>
                        <TableCell align="right" sx={{ height: '40px', verticalAlign: 'middle' }}>{tax.customerValue}</TableCell>
                        <TableCell sx={{ height: '40px', verticalAlign: 'middle' }}>
                          <Chip 
                            label={
                              tax.status === 'matched' ? (dictionary?.navigation?.matched || 'Matched') :
                              tax.status === 'missing' ? (dictionary?.navigation?.missing || 'Missing') :
                              (dictionary?.navigation?.mismatch || 'Mismatch')
                            } 
                            size="small" 
                            color={
                              tax.status === 'matched' ? 'success' :
                              tax.status === 'missing' ? 'warning' :
                              'error'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Missing Taxes - Separate Section */}
          {missingTaxes.length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
                ⚠️ {dictionary?.navigation?.missingTaxes || 'Missing Taxes'} ({missingTaxes.length})
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontStyle: 'italic' }}>
                {missingTaxes.some(tax => tax.missingSide === 'bank') && missingTaxes.some(tax => tax.missingSide === 'customer')
                  ? (dictionary?.navigation?.missingTaxesNoteBoth || 'These taxes have missing values on both bank and customer sides.')
                  : missingTaxes.some(tax => tax.missingSide === 'bank')
                  ? (dictionary?.navigation?.missingTaxesNoteBank || 'These taxes have missing values on the bank side.')
                  : (dictionary?.navigation?.missingTaxesNoteCustomer || 'These taxes have missing values on the customer side.')
                }
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, width: '100%' }}>
                <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '40px', width: '30%' }}>
                        {dictionary?.navigation?.taxName || 'Tax Name'}
                      </TableCell>
                      <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ height: '40px', width: '25%' }}>
                        {dictionary?.navigation?.bankValue || 'Bank Value'}
                      </TableCell>
                      <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ height: '40px', width: '25%' }}>
                        {dictionary?.navigation?.customerValue || 'Customer Value'}
                      </TableCell>
                      <TableCell component="th" className="MuiTableCell-head" sx={{ height: '40px', width: '20%' }}>
                        {dictionary?.navigation?.status || 'Status'}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {missingTaxes.map((tax, index) => (
                      <TableRow 
                        key={index} 
                        sx={{ 
                          height: '40px',
                          backgroundColor: '#fff3e0', // Orange background for missing taxes
                          '&:hover': {
                            backgroundColor: '#fff3e0'
                          }
                        }}
                      >
                        <TableCell sx={{ height: '40px', verticalAlign: 'middle' }}>{tax.taxName}</TableCell>
                        <TableCell align="right" sx={{ height: '40px', verticalAlign: 'middle' }}>{tax.bankValue || '-'}</TableCell>
                        <TableCell align="right" sx={{ height: '40px', verticalAlign: 'middle' }}>{tax.customerValue || '-'}</TableCell>
                        <TableCell sx={{ height: '40px', verticalAlign: 'middle' }}>
                          <Chip 
                            label={dictionary?.navigation?.missing || 'Missing'} 
                            size="small" 
                            color="warning"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Unmatched Taxes - Separate Tables */}
          <Grid container spacing={3}>
            {/* Unmatched Bank Taxes */}
            {unmatchedBankTaxes.length > 0 && (
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
                  ⚠️ {dictionary?.navigation?.unmatchedBankTaxes || 'Unmatched Bank Taxes'} ({unmatchedBankTaxes.length})
                      </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, width: '100%' }}>
                  <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
                          <TableHead>
                            <TableRow>
                        <TableCell component="th" className="MuiTableCell-head" sx={{ height: '40px', width: '40%' }}>
                            {dictionary?.navigation?.taxName || 'Tax Name'}
                        </TableCell>
                        <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ height: '40px', width: '30%' }}>
                          {dictionary?.navigation?.value || 'Value'}
                        </TableCell>
                        <TableCell component="th" className="MuiTableCell-head" sx={{ height: '40px', width: '30%' }}>
                          {dictionary?.navigation?.type || 'Type'}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unmatchedBankTaxes.map((tax, index) => (
                        <TableRow 
                          key={index} 
                          sx={{ 
                            height: '40px',
                            backgroundColor: '#ffebee', // Red background for unmatched taxes
                            '&:hover': {
                              backgroundColor: '#ffebee'
                            }
                          }}
                        >
                          <TableCell sx={{ height: '40px', verticalAlign: 'middle' }}>{tax.tax_name}</TableCell>
                          <TableCell align="right" sx={{ height: '40px', verticalAlign: 'middle' }}>{tax.value}</TableCell>
                          <TableCell sx={{ height: '40px', verticalAlign: 'middle' }}>
                            <Chip 
                              label={tax.type} 
                              size="small" 
                              color={tax.type === 'formula' ? 'primary' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}

            {/* Unmatched Customer Taxes */}
            {unmatchedCustomerTaxes.length > 0 && (
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
                  ⚠️ {dictionary?.navigation?.unmatchedCustomerTaxes || 'Unmatched Customer Taxes'} ({unmatchedCustomerTaxes.length})
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, width: '100%' }}>
                  <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell component="th" className="MuiTableCell-head" sx={{ height: '40px', width: '40%' }}>
                          {dictionary?.navigation?.taxName || 'Tax Name'}
                        </TableCell>
                        <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ height: '40px', width: '30%' }}>
                            {dictionary?.navigation?.value || 'Value'}
                          </TableCell>
                        <TableCell component="th" className="MuiTableCell-head" sx={{ height: '40px', width: '30%' }}>
                            {dictionary?.navigation?.type || 'Type'}
                          </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                      {unmatchedCustomerTaxes.map((tax, index) => (
                        <TableRow 
                          key={index} 
                          sx={{ 
                            height: '40px',
                            backgroundColor: '#ffebee', // Red background for unmatched taxes
                            '&:hover': {
                              backgroundColor: '#ffebee'
                            }
                          }}
                        >
                            <TableCell sx={{ height: '40px', verticalAlign: 'middle' }}>{tax.tax_name}</TableCell>
                            <TableCell align="right" sx={{ height: '40px', verticalAlign: 'middle' }}>{tax.value}</TableCell>
                            <TableCell sx={{ height: '40px', verticalAlign: 'middle' }}>
                              <Chip 
                                label={tax.type} 
                                size="small" 
                                color={tax.type === 'formula' ? 'primary' : 'default'}
                              />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
              </Grid>
            )}
          </Grid>
                </Box>
              )}
    </Box>
  )
}

export default ReconciliationDetailsPage
