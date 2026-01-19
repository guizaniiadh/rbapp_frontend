import apiClient from '@/lib/api-client'
import type { BankTransaction, BankTransactionFilters } from '@/types/bankTransaction'

class BankTransactionService {
  private baseUrl = '/bank-transactions'

  async getTransactions(filters?: BankTransactionFilters): Promise<BankTransaction[]> {
    const response = await apiClient.get(`${this.baseUrl}/`, { params: filters })
    return response.data
  }

  async getTransactionById(id: number): Promise<BankTransaction> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/`)
    return response.data
  }
}

export const bankTransactionService = new BankTransactionService()

