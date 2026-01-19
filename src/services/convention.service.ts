import apiClient from '@/lib/api-client'
import type { Convention, CreateConventionDto, UpdateConventionDto } from '@/types/convention'

export const conventionService = {
  async getConventions(companyCode?: string, bankCode?: string): Promise<Convention[]> {
    const params = new URLSearchParams()
    if (companyCode) params.append('company', companyCode)
    if (bankCode) params.append('bank', bankCode)
    
    const url = `/conventions/?${params.toString()}`
    console.log('Convention API URL:', url)
    console.log('Convention API params:', { companyCode, bankCode })
    console.log('Full API URL:', `${apiClient.defaults.baseURL}${url}`)
    
    const response = await apiClient.get(url)
    console.log('Convention API response:', response.data)
    return response.data
  },

  async getConvention(id: number): Promise<Convention> {
    const response = await apiClient.get(`/conventions/${id}/`)
    return response.data
  },

  async createConvention(data: CreateConventionDto): Promise<Convention> {
    const response = await apiClient.post('/conventions/', data)
    return response.data
  },

  async updateConvention(id: number, data: UpdateConventionDto): Promise<Convention> {
    const response = await apiClient.put(`/conventions/${id}/`, data)
    return response.data
  },

  async deleteConvention(id: number): Promise<void> {
    await apiClient.delete(`/conventions/${id}/`)
  }
}

