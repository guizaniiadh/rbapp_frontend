import apiClient from '@/lib/api-client'
import type { CustomerTransaction, CustomerTransactionFilters } from '@/types/customerTransaction'

class CustomerTransactionService {
  private baseUrl = '/customer-transactions'

  async getTransactions(filters?: CustomerTransactionFilters): Promise<CustomerTransaction[]> {
    const response = await apiClient.get(`${this.baseUrl}/`, { params: filters })
    return response.data
  }

  async getTransactionById(id: number): Promise<CustomerTransaction> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/`)
      return response.data
    } catch (error: any) {
      console.error(`Failed to load customer transaction details for ID ${id}:`, error)
      
      // Provide more specific error messages
      if (error.response?.status === 404) {
        throw new Error(`Customer transaction with ID ${id} not found`)
      } else if (error.response?.status === 403) {
        throw new Error('Access denied - insufficient permissions to view customer transaction')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error - please try again later')
      } else if (error.message) {
        throw new Error(`Failed to load customer transaction details: ${error.message}`)
      } else {
        throw new Error('Failed to load customer transaction details: Unknown error')
      }
    }
  }
}

export const customerTransactionService = new CustomerTransactionService()

