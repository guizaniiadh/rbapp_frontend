import apiClient from '@/lib/api-client'
import { getBankApiPrefix } from '@/utils/bankApiHelper'

export interface ExtractedTax {
  tax_name: string
  value: string
  type: string
  bank: string
  transaction_reference: string
  convention: string
  tax_rule: number
}

export interface TaxExtractionResponse {
  extracted_taxes: ExtractedTax[]
}

export const taxExtractionService = {
  /**
   * Extract customer taxes
   * Now requires company_code and bank_code to identify the specific convention
   * @param companyCode - The code of the company (required)
   * @param bankCode - The code of the bank (required) - used for bank-specific endpoint
   * @param transactions - Optional array of transaction objects to process
   */
  async extractCustomerTaxes(companyCode: string, bankCode: string, transactions?: any[]): Promise<TaxExtractionResponse> {
    const bankPrefix = getBankApiPrefix(bankCode)
    console.log('🔍 Tax extraction request: POST /extract-customer-taxes/')
    console.log('📋 Request Details:')
    console.log('  - Company Code:', companyCode)
    console.log('  - Bank Code:', bankCode)
    console.log('  - Transactions provided:', transactions?.length || 0)
    console.log('  - Full API URL:', `${apiClient.defaults.baseURL}${bankPrefix}/extract-customer-taxes/`)
    
    const requestBody: any = {
      company_code: companyCode,
      bank_code: bankCode
    }
    
    if (transactions && transactions.length > 0) {
      requestBody.transactions = transactions
      console.log('  - Transaction samples (first 3):', transactions.slice(0, 3).map((tx: any) => ({
        id: tx.id,
        payment_type: tx.payment_type,
        payment_status: tx.payment_status,
        document_number: tx.document_number
      })))
    }
    
    console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2))
    
    try {
      const response = await apiClient.post<TaxExtractionResponse>(`${bankPrefix}/extract-customer-taxes/`, requestBody)
      console.log('✅ Tax extraction response received:')
      console.log('  - Status:', response.status)
      console.log('  - Total taxes:', response.data.extracted_taxes?.length || 0)
      console.log('  - Full response:', response.data)
      
      // Log tax rule matching details if available
      if (response.data.extracted_taxes && response.data.extracted_taxes.length > 0) {
        console.log('📊 Tax Rule Matching Details:')
        response.data.extracted_taxes.forEach((tax: any, idx: number) => {
          console.log(`  Tax ${idx + 1}:`, {
            tax_name: tax.tax_name,
            value: tax.value,
            type: tax.type,
            tax_rule_id: tax.tax_rule,
            transaction_reference: tax.transaction_reference,
            convention: tax.convention,
            error: tax.error // Log any errors in tax calculation
          })
        })
      }
      
      return response.data
    } catch (error: any) {
      console.error('❌ Tax extraction API error:')
      console.error('  - Error type:', error.constructor.name)
      console.error('  - Error message:', error.message)
      console.error('  - Request sent:', {
        url: `${apiClient.defaults.baseURL}/extract-customer-taxes/`,
        method: 'POST',
        body: requestBody
      })
      console.error('  - Response status:', error.response?.status)
      console.error('  - Response data:', error.response?.data)
      console.error('  - Response headers:', error.response?.headers)
      
      // If the endpoint doesn't exist (404), return empty result instead of failing
      if (error.response?.status === 404) {
        console.warn('Tax extraction endpoint not found, returning empty result')
        return { extracted_taxes: [] }
      }
      
      throw error
    }
  },

  /**
   * Get customer tax rows for a specific transaction
   */
  async getCustomerTaxRowsByTransaction(transactionId: number): Promise<TaxExtractionResponse> {
    console.log('Getting customer tax rows for transaction:', transactionId)
    console.log('Full API URL will be:', `${apiClient.defaults.baseURL}/customer-tax-rows/?transaction=${transactionId}`)
    
    try {
      const response = await apiClient.get<any[]>(`/customer-tax-rows/?transaction=${transactionId}`)
      console.log('Customer tax rows response for transaction:', response.data)
      
      // Transform the response to match our expected format
      // Preserve customer_tax and customer_total_tax fields from the database
      const extractedTaxes = response.data.map((tax: any) => ({
        tax_name: tax.tax_type,
        value: tax.tax_amount?.toString() || '0',
        type: tax.applied_formula ? 'formula' : 'flat',
        bank: 'N/A', // This might need to be fetched from transaction data
        transaction_reference: `Transaction ${transactionId}`,
        convention: 'N/A', // This might need to be fetched from transaction data
        tax_rule: tax.id,
        // Preserve original database fields for display
        tax_type: tax.tax_type,
        customer_tax: tax.customer_tax,
        customer_total_tax: tax.customer_total_tax,
        tax_amount: tax.tax_amount
      }))
      
      return { extracted_taxes: extractedTaxes }
    } catch (error: any) {
      console.error('Customer tax rows API error for transaction:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error headers:', error.response?.headers)
      
      // If the endpoint doesn't exist (404), return empty result instead of failing
      if (error.response?.status === 404) {
        console.warn('Customer tax rows endpoint not found, returning empty result')
        return { extracted_taxes: [] }
      }
      
      throw error
    }
  },

  /**
   * Generate tax comparisons for matched transactions
   * This triggers the reconciliation process to compare customer and bank taxes
   * @param bankCode - Bank code (e.g., 'bt', 'attijari') - required for bank-specific processing
   */
  async generateTaxComparisons(bankCode: string): Promise<{
    message: string,
    results: any[]
  }> {
    const bankPrefix = getBankApiPrefix(bankCode)
    console.log('Generating tax comparisons...')
    console.log('Full API URL will be:', `${apiClient.defaults.baseURL}${bankPrefix}/tax-comparison/`)
    
    try {
      const response = await apiClient.post(`${bankPrefix}/tax-comparison/`, {})
      console.log('Tax comparison generation response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Tax comparison generation API error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error headers:', error.response?.headers)
      
      throw error
    }
  },

  /**
   * Update customer total tax amounts
   * This recalculates and updates customer total tax amounts for consistency
   * @param bankCode - Bank code (e.g., 'bt', 'attijari') - required for bank-specific processing
   */
  async updateCustomerTotalTax(bankCode: string): Promise<{
    message: string
  }> {
    const bankPrefix = getBankApiPrefix(bankCode)
    console.log('Updating customer total tax...')
    console.log('Full API URL will be:', `${apiClient.defaults.baseURL}${bankPrefix}/tax-comparison/`)
    
    try {
      const response = await apiClient.put(`${bankPrefix}/tax-comparison/`, {})
      console.log('Customer total tax update response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Customer total tax update API error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error headers:', error.response?.headers)
      
      throw error
    }
  },

  /**
   * Get tax comparison data for matched transactions
   * This fetches from the tax comparison table with matched transaction data
   * FIXED: Changed from GET to POST as required by the API
   * @param bankCode - Bank code (e.g., 'bt', 'attijari') - required for bank-specific processing
   */
  async getTaxComparisonByTransactions(bankCode: string, bankTransactionId: number, customerTransactionId: number): Promise<{
    bankTaxes: ExtractedTax[],
    customerTaxes: ExtractedTax[]
  }> {
    const bankPrefix = getBankApiPrefix(bankCode)
    try {
      // Use POST request with transaction IDs in the body
      const response = await apiClient.post<{message: string, results: any[]}>(`${bankPrefix}/tax-comparison/`, {
        bank_transaction: bankTransactionId,
        customer_transaction: customerTransactionId
      })
      
      // Transform the response to separate bank and customer taxes
      const bankTaxes: ExtractedTax[] = []
      const customerTaxes: ExtractedTax[] = []
      
      // Access the results array from the response
      const results = response.data.results || []
      
      // Filter results to only include the specific transaction pair we're looking for
      const filteredResults = results.filter((comparison: any) => 
        comparison.matched_bank_transaction_id === bankTransactionId && 
        comparison.customer_transaction_id === customerTransactionId
      )
      
      filteredResults.forEach((comparison: any) => {
        // Add bank tax
        if (comparison.bank_tax) {
          bankTaxes.push({
            tax_name: comparison.tax_type,
            value: comparison.bank_tax?.toString() || '0',
            type: comparison.status === 'matched' ? 'matched' : 'mismatch',
            bank: 'Bank Transaction',
            transaction_reference: `Bank ${bankTransactionId}`,
            convention: 'N/A',
            tax_rule: comparison.id
          })
        }
        
        // Add customer tax
        // For AGIOS taxes, use customer_total_tax instead of customer_tax
        const customerTaxValue = comparison.tax_type === 'AGIOS' 
          ? comparison.customer_total_tax 
          : comparison.customer_tax
        
        if (customerTaxValue) {
          customerTaxes.push({
            tax_name: comparison.tax_type,
            value: customerTaxValue?.toString() || '0',
            type: comparison.status === 'matched' ? 'matched' : 'mismatch',
            bank: 'Customer Transaction',
            transaction_reference: `Customer ${customerTransactionId}`,
            convention: 'N/A',
            tax_rule: comparison.id
          })
        }
      })
      
      return { bankTaxes, customerTaxes }
    } catch (error: any) {
      // If the endpoint doesn't exist (404), return empty result instead of failing
      if (error.response?.status === 404) {
        return { bankTaxes: [], customerTaxes: [] }
      }
      throw new Error(`Failed to load tax comparison: ${error.message}`)
    }
  },

  /**
   * Get bank tax rows for a specific transaction
   * Uses the simplified bank tax rows API endpoint that gets tax rows for customer transactions matched to the bank transaction
   */
  async getBankTaxRowsByTransaction(transactionId: number): Promise<TaxExtractionResponse> {
    console.log('Getting bank tax rows for transaction:', transactionId)
    console.log('Using simplified bank tax rows API endpoint')
    console.log('Full API URL will be:', `${apiClient.defaults.baseURL}/bank-transactions/${transactionId}/tax_rows/`)
    
    try {
      const response = await apiClient.get<any>(`/bank-transactions/${transactionId}/tax_rows/`)
      console.log('Bank tax rows response for transaction:', response.data)
      
      // Transform the response to match our expected format
      const extractedTaxes = response.data.tax_rows?.map((taxRow: any) => ({
        tax_name: taxRow.tax_type,
        value: taxRow.tax_amount?.toString() || '0',
        type: taxRow.applied_formula ? 'formula' : 'flat',
        bank: response.data.bank_transaction_label || 'Bank Transaction',
        transaction_reference: `Bank ${response.data.bank_transaction_id}`,
        convention: 'N/A', // This might need to be fetched from transaction data
        tax_rule: taxRow.tax_row_id
      })) || []
      
      return { extracted_taxes: extractedTaxes }
    } catch (error: any) {
      console.error('Bank tax rows API error for transaction:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error headers:', error.response?.headers)
      
      // If the endpoint doesn't exist (404), return empty result instead of failing
      if (error.response?.status === 404) {
        console.warn('Bank tax rows endpoint not found, returning empty result')
        return { extracted_taxes: [] }
      }
      
      throw error
    }
  },

  /**
   * Clear all customer tax rows by emptying the CustomerTaxRow table.
   * Uses TRUNCATE TABLE for faster execution (instant table reset).
   */
  async clearCustomerTaxRows(): Promise<void> {
    try {
      console.log('🗑️ Clearing customer tax rows table...')
      const response = await apiClient.delete('/customer-tax-rows/empty/')
      console.log('✅ Customer tax rows cleared:', response.data)
    } catch (error: any) {
      console.error('❌ Error clearing customer tax rows:', error)
      console.error('Response:', error?.response?.data)
      console.error('Status:', error?.response?.status)
      throw error
    }
  }
}
