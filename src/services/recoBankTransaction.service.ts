import apiClient from '@/lib/api-client'
import type { BankTransaction, BankTransactionFilters } from '@/types/bankTransaction'
import { getBankApiPrefix } from '@/utils/bankApiHelper'

class RecoBankTransactionService {
  private baseUrl = '/reco-bank-transactions'

  async getTransactions(filters?: BankTransactionFilters): Promise<BankTransaction[]> {
    const response = await apiClient.get(`${this.baseUrl}/`, { params: filters })
    return response.data
  }

  async getTransactionById(id: number): Promise<BankTransaction> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/`)
    return response.data
  }

  /**
   * Clear all reco bank transactions by emptying the RecoBankTransaction table.
   * Uses TRUNCATE TABLE for faster execution (instant table reset).
   */
  async clearAll(): Promise<void> {
    try {
      console.log('🗑️ Clearing reco bank transactions table...')
      const response = await apiClient.delete(`${this.baseUrl}/empty/`)
      console.log('✅ Reco bank transactions cleared:', response.data)
    } catch (error: any) {
      console.error('❌ Error clearing reco bank transactions:', error)
      console.error('Response:', error?.response?.data)
      console.error('Status:', error?.response?.status)
      throw error
    }
  }

  /**
   * Get count of unmatched reco bank transactions from the backend.
   * Uses the dedicated unmatched-count endpoint.
   */
  async getUnmatchedCount(): Promise<number> {
    try {
      console.log('📊 Fetching unmatched reco bank transactions count...')
      const response = await apiClient.get<{ unmatched_reco_bank_transactions: number }>(
        `${this.baseUrl}/unmatched-count/`
      )
      const count = response.data?.unmatched_reco_bank_transactions ?? 0
      console.log('✅ Unmatched reco bank transactions count:', count)
      return count
    } catch (error: any) {
      console.error('❌ Error fetching unmatched reco bank transactions count:', error)
      console.error('Response:', error?.response?.data)
      console.error('Status:', error?.response?.status)
      // Fallback to 0 so UI still works
      return 0
    }
  }

  /**
   * Get full list of unmatched reco bank transactions.
   * Uses the dedicated /unmatched/ endpoint.
   */
  async getUnmatched(): Promise<BankTransaction[]> {
    try {
      console.log('📄 Fetching unmatched reco bank transactions list...')
      const response = await apiClient.get<BankTransaction[]>(`${this.baseUrl}/unmatched/`)
      console.log('✅ Unmatched reco bank transactions list length:', response.data?.length || 0)
      return response.data
    } catch (error: any) {
      console.error('❌ Error fetching unmatched reco bank transactions list:', error)
      console.error('Response:', error?.response?.data)
      console.error('Status:', error?.response?.status)
      // Fallback to empty list so UI still works
      return []
    }
  }

  /**
   * Get all reco bank transactions grouped with their taxes.
   * Uses the /with-taxes/ endpoint recently added on the backend.
   */
  async getWithTaxes(): Promise<{
    transactions_with_taxes: {
      bank_transaction: any
      taxes: any[]
      total_taxes: number
      internal_number: string
    }[]
    total_transactions: number
  }> {
    try {
      console.log('📊 Fetching reco bank transactions with taxes...')
      const response = await apiClient.get<{
        transactions_with_taxes: {
          bank_transaction: any
          taxes: any[]
          total_taxes: number
          internal_number: string
        }[]
        total_transactions: number
      }>(`${this.baseUrl}/with-taxes/`)
      console.log('✅ Reco bank transactions with taxes loaded:', response.data.total_transactions)
      return response.data
    } catch (error: any) {
      console.error('❌ Error fetching reco bank transactions with taxes:', error)
      console.error('Response:', error?.response?.data)
      console.error('Status:', error?.response?.status)
      // Fallback to empty structure so UI still works
      return {
        transactions_with_taxes: [],
        total_transactions: 0
      }
    }
  }

  /**
   * Get sorted and grouped bank transactions
   * Uses the bank-specific sorted endpoint: /api/{bank_code}/sorted-reco-bank-transactions/
   * @param bankCode - The bank code (e.g., "1", "2", "4")
   * @returns Sorted and grouped transactions with metadata
   */
  async getSortedTransactions(bankCode: string): Promise<{
    transactions: BankTransaction[]
    total: number
    grouped_count: number
    ungrouped_count: number
    bank: string
    bank_code: string
  }> {
    console.log('🔍 ========== getSortedTransactions FUNCTION CALLED ==========')
    console.log('🔍 Function entered with bankCode:', bankCode)
    console.log('🔍 bankCode type:', typeof bankCode)
    console.log('🔍 bankCode value:', JSON.stringify(bankCode))
    
    console.log('📤 Request Details:')
    console.log('  - bankCode parameter:', bankCode)
    console.log('  - bankCode type:', typeof bankCode)
    
    try {
      console.log('🔍 Step 1: Getting bank prefix...')
      const bankPrefix = getBankApiPrefix(bankCode)
      console.log('🔍 bankPrefix result:', bankPrefix)
      
      const endpoint = `${bankPrefix}/sorted-reco-bank-transactions/`
      const params = { bank_code: bankCode }
      const baseURL = apiClient.defaults.baseURL || 'NOT_SET'
      const fullUrl = `${baseURL}${endpoint}?bank_code=${bankCode}`
      
      console.log('🔍 Step 2: Building request...')
      console.log('  - bankPrefix:', bankPrefix)
      console.log('  - endpoint path:', endpoint)
      console.log('  - query params:', JSON.stringify(params))
      console.log('  - full URL:', fullUrl)
      console.log('  - baseURL:', baseURL)
      console.log('  - apiClient.defaults:', {
        baseURL: apiClient.defaults.baseURL,
        timeout: apiClient.defaults.timeout,
        headers: apiClient.defaults.headers
      })
      
      console.log('🔍 Step 3: Making API request...')
      console.log('🔍 Calling apiClient.get with:', {
        url: endpoint,
        params: params
      })
      
      const response = await apiClient.get<{
        transactions: BankTransaction[]
        total: number
        grouped_count: number
        ungrouped_count: number
        bank: string
        bank_code: string
      }>(endpoint, {
        params: params
      })
      
      console.log('✅ ========== API Response Received ==========')
      console.log('✅ Response object:', response)
      console.log('📥 Response Status:', response.status)
      console.log('📥 Response Status Text:', response.statusText)
      console.log('📥 Response Headers:', JSON.stringify(response.headers))
      console.log('📥 Response Data:', response.data)
      console.log('📥 Response Data Type:', typeof response.data)
      console.log('📥 Response Data Keys:', Object.keys(response.data || {}))
      
      console.log('📥 Response Data Structure:', {
        hasTransactions: !!response.data?.transactions,
        transactionsType: Array.isArray(response.data?.transactions) ? 'array' : typeof response.data?.transactions,
        transactionsLength: Array.isArray(response.data?.transactions) ? response.data.transactions.length : 'N/A',
        total: response.data?.total,
        grouped_count: response.data?.grouped_count,
        ungrouped_count: response.data?.ungrouped_count,
        bank: response.data?.bank,
        bank_code: response.data?.bank_code,
        allKeys: Object.keys(response.data || {})
      })
      
      if (response.data?.transactions && Array.isArray(response.data.transactions)) {
        console.log('📥 Transactions Array Details:')
        console.log('  - Count:', response.data.transactions.length)
        if (response.data.transactions.length > 0) {
          console.log('  - First transaction sample:', {
            id: response.data.transactions[0].id,
            internal_number: response.data.transactions[0].internal_number,
            group_id: response.data.transactions[0].group_id,
            is_origine: response.data.transactions[0].is_origine,
            group_size: response.data.transactions[0].group_size,
            type: response.data.transactions[0].type,
            operation_date: response.data.transactions[0].operation_date,
            allKeys: Object.keys(response.data.transactions[0])
          })
          console.log('  - Full first transaction:', JSON.stringify(response.data.transactions[0], null, 2))
        }
      } else {
        console.warn('⚠️ Response.data.transactions is not an array or missing')
        console.warn('⚠️ response.data:', response.data)
        console.warn('⚠️ response.data.transactions:', response.data?.transactions)
      }
      
      console.log('✅ Returning response.data')
      return response.data
    } catch (error: any) {
      console.error('❌ ========== API Error Caught ==========')
      console.error('❌ Error object:', error)
      console.error('❌ Error Type:', error?.constructor?.name)
      console.error('❌ Error Message:', error?.message)
      console.error('❌ Error Stack:', error?.stack)
      console.error('❌ Error toString:', error?.toString())
      
      if (error?.response) {
        console.error('📥 Error Response Details:')
        console.error('  - Status:', error.response.status)
        console.error('  - Status Text:', error.response.statusText)
        console.error('  - Headers:', JSON.stringify(error.response.headers))
        console.error('  - Data:', JSON.stringify(error.response.data))
        console.error('  - Full Response:', error.response)
      } else if (error?.request) {
        console.error('📤 Request was made but no response received:')
        console.error('  - Request:', error.request)
        console.error('  - Request URL:', error.request?.responseURL)
        console.error('  - Request Method:', error.request?.method)
      } else {
        console.error('❌ Error setting up request (no response or request object):')
        console.error('  - Error:', error)
      }
      
      if (error?.config) {
        console.error('📤 Request Config:')
        console.error('  - URL:', error.config.url)
        console.error('  - Method:', error.config.method)
        console.error('  - BaseURL:', error.config.baseURL)
        console.error('  - Params:', error.config.params)
        console.error('  - Headers:', error.config.headers)
      }
      
      console.error('❌ Full Error Object (stringified):', JSON.stringify(error, Object.getOwnPropertyNames(error)))
      
      // Fallback to empty structure
      const fallback = {
        transactions: [],
        total: 0,
        grouped_count: 0,
        ungrouped_count: 0,
        bank: '',
        bank_code: bankCode
      }
      console.log('🔄 Returning fallback structure:', fallback)
      return fallback
    }
  }

  /**
   * Get sum of matched bank transactions
   * Uses the bank-specific endpoint: /api/{bank_code}/sum-matched-bank-transactions/
   * @param bankCode - The bank code (e.g., "1", "2", "4")
   * @param options - Optional filters
   * @returns Sum of matched bank transactions with optional details
   */
  async getSumMatchedTransactions(
    bankCode: string,
    options?: {
      detail?: boolean
      bank_id?: number
      type?: string
    }
  ): Promise<{
    total_sum: string
    total_sum_decimal: number
    count: number
    message: string
    transactions?: any[]
    transactions_returned?: number
  }> {
    try {
      console.log('📊 Fetching sum of matched bank transactions...')
      const bankPrefix = getBankApiPrefix(bankCode)
      const endpoint = `${bankPrefix}/sum-matched-bank-transactions/`
      
      const params: any = {}
      if (options?.detail) params.detail = 'true'
      if (options?.bank_id) params.bank_id = options.bank_id
      if (options?.type) params.type = options.type
      
      const response = await apiClient.get<{
        total_sum: string
        total_sum_decimal: number
        count: number
        message: string
        transactions?: any[]
        transactions_returned?: number
      }>(endpoint, { params })
      
      console.log('✅ Sum of matched bank transactions:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Error fetching sum of matched bank transactions:', error)
      console.error('Response:', error?.response?.data)
      console.error('Status:', error?.response?.status)
      // Fallback to empty structure so UI still works
      return {
        total_sum: '0.000',
        total_sum_decimal: 0,
        count: 0,
        message: 'Error loading matched transactions sum'
      }
    }
  }
}

export const recoBankTransactionService = new RecoBankTransactionService()










