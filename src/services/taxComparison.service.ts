import apiClient from '@/lib/api-client'
import { getBankApiPrefix } from '@/utils/bankApiHelper'

export interface TaxComparisonResult {
  message: string
  results?: Array<{
    customer_transaction_id: number
    matched_bank_transaction_id: number
    internal_number: string
    tax_type: string
    customer_tax: string
    bank_tax: string
    status: 'match' | 'mismatch' | 'missing'
    customer_total_tax: string
  }>
}

export const taxComparisonService = {
  /**
   * Updates customer total tax amounts in the Comparison table by calculating 
   * the sum of tax amounts for all CustomerTaxRow entries.
   * @param bankCode - Bank code (e.g., 'bt', 'attijari') - required for bank-specific processing
   */
  async compareTaxes(bankCode: string): Promise<TaxComparisonResult> {
    const bankPrefix = getBankApiPrefix(bankCode)
    try {
      const response = await apiClient.post(`${bankPrefix}/tax-comparison/`)
      return response.data
    } catch (error) {
      console.error('Error comparing taxes:', error)
      throw new Error('Failed to compare taxes')
    }
  },

  /**
   * Clears all tax comparison data by truncating the tax_comparison table.
   * Uses TRUNCATE TABLE for faster execution (instant table reset).
   * @param bankCode - Bank code (e.g., 'bt', 'attijari') - required for bank-specific processing
   */
  async clearAll(bankCode: string): Promise<void> {
    const bankPrefix = getBankApiPrefix(bankCode)
    try {
      console.log('🗑️ Clearing tax comparison table...')
      const response = await apiClient.delete(`${bankPrefix}/tax-comparison/`)
      console.log('✅ Tax comparison cleared:', response.data)
    } catch (error: any) {
      console.error('❌ Error clearing tax comparison data:', error)
      console.error('Response:', error?.response?.data)
      console.error('Status:', error?.response?.status)
      throw error
    }
  }
}
