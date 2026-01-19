import apiClient from '@/lib/api-client'
import type {
  ConventionParameter,
  CreateConventionParameterDto,
  UpdateConventionParameterDto,
  Holiday
} from '@/types/conventionParameter'

export const conventionParameterService = {
  async getConventionParameters(): Promise<ConventionParameter[]> {
    const response = await apiClient.get<ConventionParameter[]>('/convention-parameters/')
    return response.data
  },

  async getConventionParameterById(id: number): Promise<ConventionParameter> {
    const response = await apiClient.get<ConventionParameter>(`/convention-parameters/${id}/`)
    return response.data
  },

  async createConventionParameter(parameterData: CreateConventionParameterDto): Promise<ConventionParameter> {
    // Remove convention_id if it exists since parameters are now general
    const { convention_id, ...data } = parameterData as any
    const response = await apiClient.post<ConventionParameter>('/convention-parameters/', data)
    return response.data
  },

  async updateConventionParameter(
    id: number,
    parameterData: UpdateConventionParameterDto
  ): Promise<ConventionParameter> {
    // Remove convention_id if it exists since parameters are now general
    const { convention_id, ...data } = parameterData as any
    const response = await apiClient.patch<ConventionParameter>(`/convention-parameters/${id}/`, data)
    return response.data
  },

  async deleteConventionParameter(id: number): Promise<void> {
    const response = await apiClient.delete(`/convention-parameters/${id}/`)
    return response.data
  },

  async searchConventionParameters(query: string): Promise<ConventionParameter[]> {
    const response = await apiClient.get<ConventionParameter[]>('/convention-parameters/', {
      params: { search: query }
    })
    return response.data
  },

  async getConventionParametersByType(type: string): Promise<ConventionParameter[]> {
    const response = await apiClient.get<ConventionParameter[]>('/convention-parameters/', {
      params: { name: type }
    })
    return response.data
  },

  // Helper functions for specific parameter types
  async createTMMParameter(value: number): Promise<ConventionParameter> {
    return this.createConventionParameter({
      name: 'TMM',
      value: value
    })
  },

  async createBankDaysParameter(days: number): Promise<ConventionParameter> {
    return this.createConventionParameter({
      name: 'bank_days',
      value: days
    })
  },

  async createHolidaysParameter(holidays: Holiday[]): Promise<ConventionParameter> {
    return this.createConventionParameter({
      name: 'holidays',
      value: holidays
    })
  },

  // Utility functions for parsing parameter values
  parseHolidaysValue(value: string | Holiday[]): Holiday[] {
    if (Array.isArray(value)) {
      return value
    }
    try {
      return JSON.parse(value)
    } catch (error) {
      console.error('Error parsing holidays value:', error)
      return []
    }
  },

  parseNumericValue(value: string | number): number {
    if (typeof value === 'number') return value
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  },

  parseIntegerValue(value: string | number): number {
    if (typeof value === 'number') return value
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? 0 : parsed
  },

  // Validation functions
  validateTMMValue(value: string | number): boolean {
    const num = typeof value === 'number' ? value : parseFloat(value)
    return !isNaN(num) && num >= 0
  },

  validateBankDaysValue(value: string | number): boolean {
    const num = typeof value === 'number' ? value : parseInt(value, 10)
    return !isNaN(num) && num >= 1 && num <= 7
  },

  validateHolidaysValue(value: string): boolean {
    try {
      const holidays = JSON.parse(value)
      return (
        Array.isArray(holidays) &&
        holidays.every(
          holiday =>
            typeof holiday === 'object' && typeof holiday.date === 'string' && typeof holiday.label === 'string'
        )
      )
    } catch {
      return false
    }
  },

  // Additional utility functions
  async getTMMParameter(): Promise<ConventionParameter | null> {
    const parameters = await this.getConventionParametersByType('TMM')
    return parameters[0] || null
  },

  async getBankDaysParameter(): Promise<ConventionParameter | null> {
    const parameters = await this.getConventionParametersByType('bank_days')
    return parameters[0] || null
  },

  async getHolidaysParameter(): Promise<ConventionParameter | null> {
    const parameters = await this.getConventionParametersByType('holidays')
    return parameters[0] || null
  },

  // Batch operations
  async createMultipleParameters(parameters: CreateConventionParameterDto[]): Promise<ConventionParameter[]> {
    const promises = parameters.map(param => this.createConventionParameter(param))
    return Promise.all(promises)
  },

  async deleteMultipleParameters(ids: number[]): Promise<void> {
    const promises = ids.map(id => this.deleteConventionParameter(id))
    await Promise.all(promises)
  }
}
