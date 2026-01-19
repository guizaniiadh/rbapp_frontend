import apiClient from '@/lib/api-client'
import type { PaymentStatus, CreatePaymentStatusDto, UpdatePaymentStatusDto } from '@/types/paymentStatus'

export const paymentStatusService = {
  /**
   * Get all payment statuses
   */
  async getPaymentStatuses(): Promise<PaymentStatus[]> {
    const response = await apiClient.get<PaymentStatus[]>('/payment-statuses/')
    return response.data
  },

  /**
   * Get payment statuses by payment class
   */
  async getPaymentStatusesByClass(paymentClassCode: string): Promise<PaymentStatus[]> {
    const response = await apiClient.get<PaymentStatus[]>(`/payment-statuses/?payment_class=${paymentClassCode}`)
    return response.data
  },

  /**
   * Get payment statuses filtered by bank
   */
  async getPaymentStatusesByBank(bankCode: string): Promise<PaymentStatus[]> {
    if (!bankCode) return []

    const response = await apiClient.get<PaymentStatus[]>('/payment-statuses/', {
      params: { bank: bankCode }
    })
    return response.data
  },

  /**
   * Get a single payment status by id
   */
  async getPaymentStatusById(id: number): Promise<PaymentStatus> {
    const response = await apiClient.get<PaymentStatus>(`/payment-statuses/${id}/`)
    return response.data
  },

  /**
   * Create a new payment status
   */
  async createPaymentStatus(paymentStatusData: CreatePaymentStatusDto): Promise<PaymentStatus> {
    const response = await apiClient.post<PaymentStatus>('/payment-statuses/', paymentStatusData)
    return response.data
  },

  /**
   * Update an existing payment status
   */
  async updatePaymentStatus(id: number, paymentStatusData: UpdatePaymentStatusDto): Promise<PaymentStatus> {
    const response = await apiClient.patch<PaymentStatus>(`/payment-statuses/${id}/`, paymentStatusData)
    return response.data
  },

  /**
   * Delete a payment status
   */
  async deletePaymentStatus(id: number): Promise<void> {
    await apiClient.delete(`/payment-statuses/${id}/`)
  },

  /**
   * Search payment statuses by query
   */
  async searchPaymentStatuses(query: string): Promise<PaymentStatus[]> {
    const response = await apiClient.get<PaymentStatus[]>('/payment-statuses/', {
      params: { search: query }
    })
    return response.data
  }
}
