import apiClient from '@/lib/api-client'
import type { CustomerTransaction, CustomerTransactionFilters } from '@/types/customerTransaction'

class RecoCustomerTransactionService {
  private baseUrl = '/reco-customer-transactions'

  async getTransactions(filters?: CustomerTransactionFilters): Promise<CustomerTransaction[]> {
    const response = await apiClient.get(`${this.baseUrl}/`, { params: filters })
    return response.data
  }

  async getTransactionById(id: number): Promise<CustomerTransaction> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/`)
    return response.data
  }

  /**
   * Update a customer transaction
   */
  async updateTransaction(id: number, updateData: Partial<CustomerTransaction>): Promise<CustomerTransaction> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/`, updateData)
    return response.data
  }

  /**
   * Bulk update customer transactions with matched bank transaction IDs
   */
  async bulkUpdateMatchedBankTransactions(
    matches: Array<{ customer_transaction_id: number; bank_transaction_id: number }>
  ): Promise<void> {
    try {
      // Update each customer transaction with its matched bank transaction ID
      const updatePromises = matches.map(match =>
        this.updateTransaction(match.customer_transaction_id, {
          matched_bank_transaction: match.bank_transaction_id
        })
      )
      await Promise.all(updatePromises)
      console.log(`✅ Updated ${matches.length} customer transactions with matched bank transaction IDs`)
    } catch (error: any) {
      console.error('❌ Error bulk updating matched bank transactions:', error)
      throw error
    }
  }

  /**
   * Clear all reco customer transactions by emptying the RecoCustomerTransaction table.
   * Uses TRUNCATE TABLE for faster execution (instant table reset).
   */
  async clearAll(): Promise<void> {
    try {
      console.log('🗑️ Clearing reco customer transactions table...')
      const response = await apiClient.delete(`${this.baseUrl}/empty/`)
      console.log('✅ Reco customer transactions cleared:', response.data)
    } catch (error: any) {
      console.error('❌ Error clearing reco customer transactions:', error)
      console.error('Response:', error?.response?.data)
      console.error('Status:', error?.response?.status)
      throw error
    }
  }
}

export const recoCustomerTransactionService = new RecoCustomerTransactionService()










