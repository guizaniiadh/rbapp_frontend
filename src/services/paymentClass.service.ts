import apiClient from '@/lib/api-client'
import type { PaymentClass, CreatePaymentClassDto, UpdatePaymentClassDto } from '@/types/paymentClass'

export const paymentClassService = {
  /**
   * Get all payment classes
   */
  async getPaymentClasses(): Promise<PaymentClass[]> {
    const response = await apiClient.get<PaymentClass[]>('/payment-classes/')
    return response.data
  },

  /**
   * Get payment classes by bank code
   */
  async getPaymentClassesByBank(bankCode: string): Promise<PaymentClass[]> {
    const response = await apiClient.get<PaymentClass[]>('/payment-classes/', {
      params: { bank: bankCode }
    })
    return response.data
  },

  /**
   * Get a single payment class by code
   */
  async getPaymentClassByCode(code: string): Promise<PaymentClass> {
    const response = await apiClient.get<PaymentClass>(`/payment-classes/${code}/`)
    return response.data
  },

  /**
   * Create a new payment class
   */
  async createPaymentClass(paymentClassData: CreatePaymentClassDto): Promise<PaymentClass> {
    const response = await apiClient.post<PaymentClass>('/payment-classes/', paymentClassData)
    return response.data
  },

  /**
   * Update an existing payment class
   */
  async updatePaymentClass(code: string, paymentClassData: UpdatePaymentClassDto): Promise<PaymentClass> {
    const response = await apiClient.patch<PaymentClass>(`/payment-classes/${code}/`, paymentClassData)
    return response.data
  },

  /**
   * Delete a payment class
   */
  async deletePaymentClass(code: string): Promise<void> {
    await apiClient.delete(`/payment-classes/${code}/`)
  },

  /**
   * Search payment classes by query
   */
  async searchPaymentClasses(query: string): Promise<PaymentClass[]> {
    const response = await apiClient.get<PaymentClass[]>('/payment-classes/', {
      params: { search: query }
    })
    return response.data
  }
}
