import apiClient from '@/lib/api-client'
import type {
  PaymentIdentification,
  CreatePaymentIdentificationDto,
  UpdatePaymentIdentificationDto
} from '@/types/paymentIdentification'

export const paymentIdentificationService = {
  async getPaymentIdentifications(): Promise<PaymentIdentification[]> {
    const response = await apiClient.get<PaymentIdentification[]>('/payment-identifications/')
    return response.data
  },

  async getPaymentIdentificationsByStatus(paymentStatusId: number): Promise<PaymentIdentification[]> {
    const response = await apiClient.get<PaymentIdentification[]>(
      `/payment-identifications/?payment_status=${paymentStatusId}`
    )
    return response.data
  },

  async getPaymentIdentificationsByBank(bankCode: string): Promise<PaymentIdentification[]> {
    const response = await apiClient.get<PaymentIdentification[]>(`/payment-identifications/?bank=${bankCode}`)
    return response.data
  },

  async getPaymentIdentificationsByStatusAndBank(
    paymentStatusId: number,
    bankCode: string
  ): Promise<PaymentIdentification[]> {
    console.log('🔍 Getting payment identifications for:', { paymentStatusId, bankCode })

    // Since API doesn't filter properly, get all and filter client-side
    const url = `/payment-identifications/`
    console.log('🔍 Payment Identification API Call:', url)

    const response = await apiClient.get<PaymentIdentification[]>(url)
    console.log('📥 All payment identifications from API:', response.data)

    // Filter client-side by payment_status and bank
    const filtered = response.data.filter(item => {
      const matchesStatus = item.payment_status === paymentStatusId
      const matchesBank = item.bank === bankCode
      console.log(
        `🔍 Item ${item.line}: payment_status=${item.payment_status} (${matchesStatus}), bank=${item.bank} (${matchesBank})`
      )
      return matchesStatus && matchesBank
    })

    console.log('✅ Filtered results:', filtered)
    console.log('📊 Filtered count:', filtered.length)

    return filtered
  },

  async getPaymentIdentificationByLine(line: number): Promise<PaymentIdentification> {
    const response = await apiClient.get<PaymentIdentification>(`/payment-identifications/${line}/`)
    return response.data
  },

  async createPaymentIdentification(
    paymentIdentificationData: CreatePaymentIdentificationDto
  ): Promise<PaymentIdentification> {
    const response = await apiClient.post<PaymentIdentification>('/payment-identifications/', paymentIdentificationData)
    return response.data
  },

  async updatePaymentIdentification(
    line: number,
    paymentIdentificationData: UpdatePaymentIdentificationDto
  ): Promise<PaymentIdentification> {
    const response = await apiClient.patch<PaymentIdentification>(
      `/payment-identifications/${line}/`,
      paymentIdentificationData
    )
    return response.data
  },

  async deletePaymentIdentification(line: number): Promise<void> {
    const response = await apiClient.delete(`/payment-identifications/${line}/`)
    return response.data
  },

  async searchPaymentIdentifications(query: string): Promise<PaymentIdentification[]> {
    const response = await apiClient.get<PaymentIdentification[]>('/payment-identifications/', {
      params: { search: query }
    })
    return response.data
  }
}
