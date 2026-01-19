import apiClient from '@/lib/api-client';
import type { Agency, CreateAgencyDto, UpdateAgencyDto } from '@/types/agency';
import { getBankCodeForAgency } from '@/utils/bankCodeCache';

export const agencyService = {
  /**
   * Get all agencies
   */
  async getAgencies(): Promise<Agency[]> {
    const response = await apiClient.get<Agency[]>('/agencies/')
    return response.data
  },

  /**
   * Get agencies by bank code
   */
  async getAgenciesByBank(bankCode: string): Promise<Agency[]> {
    const response = await apiClient.get<Agency[]>(`/agencies/?bank=${bankCode}`)
    return response.data
  },

  /**
   * Get a single agency by code
   */
  async getAgencyByCode(code: string): Promise<Agency> {
    const response = await apiClient.get<Agency>(`/agencies/${code}/`)
    return response.data
  },

  /**
   * Get bank code for an agency (with caching)
   * This method extracts the bank code from the agency's bank field
   * and caches it for future use
   */
  async getBankCodeForAgency(agencyCode: string, agency?: Agency): Promise<string> {
    // If agency is provided, use it; otherwise fetch it
    const agencyData = agency || await this.getAgencyByCode(agencyCode)
    return getBankCodeForAgency(agencyCode, agencyData.bank)
  },

  /**
   * Create a new agency
   */
  async createAgency(agencyData: CreateAgencyDto): Promise<Agency> {
    const response = await apiClient.post<Agency>('/agencies/', agencyData);
    return response.data;
  },

  /**
   * Update an existing agency
   * Accepts either numeric ID or code (string) as identifier
   */
  async updateAgency(idOrCode: number | string, agencyData: UpdateAgencyDto): Promise<Agency> {
    const response = await apiClient.patch<Agency>(`/agencies/${idOrCode}/`, agencyData);
    return response.data;
  },

  /**
   * Delete an agency
   * Accepts either numeric ID or code (string) as identifier
   */
  async deleteAgency(idOrCode: number | string): Promise<void> {
    await apiClient.delete(`/agencies/${idOrCode}/`);
  },

  /**
   * Search agencies by query
   */
  async searchAgencies(query: string): Promise<Agency[]> {
    const response = await apiClient.get<Agency[]>('/agencies/', {
      params: { search: query }
    });
    return response.data;
  }
};
