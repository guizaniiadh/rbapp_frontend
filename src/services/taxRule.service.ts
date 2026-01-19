import apiClient from '@/lib/api-client'
import type { TaxRule, CreateTaxRuleDto, UpdateTaxRuleDto } from '@/types/taxRule'

export const taxRuleService = {
  async getTaxRulesByConvention(conventionId: number): Promise<TaxRule[]> {
    const params = new URLSearchParams()
    params.append('convention_id', String(conventionId))
    const url = `/taxrules/?${params.toString()}`
    console.log('TaxRule by convention API URL:', url)
    const response = await apiClient.get(url)
    console.log('TaxRule by convention API response:', response.data)
    return response.data
  },

  async getTaxRules(companyCode?: string, bankCode?: string): Promise<TaxRule[]> {
    const params = new URLSearchParams()
    if (companyCode) params.append('company', companyCode)
    if (bankCode) params.append('bank', bankCode)
    
    const url = `/taxrules/?${params.toString()}`
    console.log('TaxRule API URL:', url)
    console.log('TaxRule API params:', { companyCode, bankCode })
    
    const response = await apiClient.get(url)
    console.log('TaxRule API response:', response.data)
    return response.data
  },

  async getTaxRule(id: number): Promise<TaxRule> {
    const response = await apiClient.get(`/taxrules/${id}/`)
    return response.data
  },

  async createTaxRule(data: CreateTaxRuleDto): Promise<TaxRule> {
    const response = await apiClient.post('/taxrules/', data)
    return response.data
  },

  async updateTaxRule(id: number, data: UpdateTaxRuleDto): Promise<TaxRule> {
    const response = await apiClient.put(`/taxrules/${id}/`, data)
    return response.data
  },

  async deleteTaxRule(id: number): Promise<void> {
    await apiClient.delete(`/taxrules/${id}/`)
  }
}

