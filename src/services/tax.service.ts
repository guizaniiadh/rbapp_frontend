import apiClient from '@/lib/api-client'
import type { Tax, CreateTaxDto, UpdateTaxDto } from '@/types/tax'

export const taxService = {
  async getTaxes(companyCode?: string, bankCode?: string): Promise<Tax[]> {
    const params = new URLSearchParams()
    if (companyCode) params.append('company', companyCode)
    if (bankCode) params.append('bank', bankCode)
    
    const url = `/taxes/?${params.toString()}`
    console.log('Tax API URL:', url)
    console.log('Tax API params:', { companyCode, bankCode })
    
    const response = await apiClient.get(url)
    console.log('Tax API response:', response.data)
    return response.data
  },

  async getTax(id: number): Promise<Tax> {
    const response = await apiClient.get(`/taxes/${id}/`)
    return response.data
  },

  async createTax(data: CreateTaxDto): Promise<Tax> {
    const response = await apiClient.post('/taxes/', data)
    return response.data
  },

  async updateTax(id: number, data: UpdateTaxDto): Promise<Tax> {
    // Log the exact data being sent to preserve spacing
    console.log('Tax service - updating tax:', id)
    console.log('Tax service - name value:', JSON.stringify(data.name))
    console.log('Tax service - description values:', data.description?.map(d => JSON.stringify(d)))
    console.log('Tax service - full data:', JSON.stringify(data))
    
    const response = await apiClient.put(`/taxes/${id}/`, data)
    
    // Log the response to see if spacing was preserved
    console.log('Tax service - response name:', JSON.stringify(response.data.name))
    console.log('Tax service - response name length:', response.data.name?.length)
    console.log('Tax service - response description:', response.data.description?.map(d => JSON.stringify(d)))
    console.log('Tax service - response description lengths:', response.data.description?.map(d => d.length))
    
    return response.data
  },

  async deleteTax(id: number): Promise<void> {
    await apiClient.delete(`/taxes/${id}/`)
  }
}

