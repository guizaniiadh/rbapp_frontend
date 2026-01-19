import apiClient from '@/lib/api-client';
import type { Bank, CreateBankDto, UpdateBankDto } from '@/types/bank';

export const bankService = {
  /**
   * Get all banks
   */
  async getBanks(): Promise<Bank[]> {
    const response = await apiClient.get<Bank[]>('/banks/');
    return response.data;
  },

  /**
   * Get a single bank by code
   */
  async getBankByCode(code: string): Promise<Bank> {
    // For now, we'll get all banks and find by code
    // In a real implementation, you'd have a specific endpoint for this
    const response = await apiClient.get<Bank[]>('/banks/');
    const bank = response.data.find(b => b.code === code);
    if (!bank) {
      throw new Error('Bank not found');
    }
    return bank;
  },

  /**
   * Create a new bank
   */
  async createBank(bankData: CreateBankDto): Promise<Bank> {
    const response = await apiClient.post<Bank>('/banks/', bankData);
    return response.data;
  },

  /**
   * Update an existing bank
   */
  async updateBank(code: string, bankData: UpdateBankDto): Promise<Bank> {
    console.log('=== BANK SERVICE UPDATE DEBUG ===')
    console.log('1. Bank code (from URL):', code)
    console.log('2. Bank data received:', bankData)
    console.log('3. Bank data keys:', Object.keys(bankData))
    console.log('4. Bank data values:', Object.values(bankData))
    console.log('5. Bank data type:', typeof bankData)
    
    // Handle file upload for logo
    if (bankData.logo instanceof File) {
      console.log('6. Handling logo file upload...')
      const formData = new FormData()
      formData.append('logo', bankData.logo)
      
      // Always include name if provided
      if (bankData.name !== undefined) {
        formData.append('name', bankData.name)
        console.log('7. Added name to FormData:', bankData.name)
      }
      
      // Include address if provided
      if (bankData.address !== undefined) {
        formData.append('address', bankData.address)
        console.log('8. Added address to FormData:', bankData.address)
      }
      
      // Include website if provided
      if (bankData.website !== undefined) {
        formData.append('website', bankData.website)
        console.log('9. Added website to FormData:', bankData.website)
      }
      
      // IMPORTANT: Include code in FormData if backend requires it
      formData.append('code', code)
      console.log('10. Added code to FormData:', code)
      
      console.log('11. Uploading logo file:', {
        fileName: bankData.logo.name,
        fileSize: bankData.logo.size,
        fileType: bankData.logo.type,
        isFile: bankData.logo instanceof File
      })
      
      console.log('12. FormData entries:')
      for (const [key, value] of formData.entries()) {
        console.log(`  - ${key}:`, value instanceof File ? `File(${value.name})` : value)
      }
      
      // Content-Type will be set automatically by axios interceptor for FormData
      console.log('13. Sending PATCH request to:', `/banks/${code}/`)
      const response = await apiClient.patch<Bank>(`/banks/${code}/`, formData)
      console.log('14. Response received:', response.data)
      return response.data
    }
    
    // Handle logo removal (null)
    if (bankData.logo === null) {
      console.log('6. Handling logo removal...')
      const formData = new FormData()
      // For logo removal, send empty string - backend should handle it
      formData.append('logo', '')
      
      if (bankData.name !== undefined) {
        formData.append('name', bankData.name)
        console.log('7. Added name to FormData:', bankData.name)
      }
      
      if (bankData.address !== undefined) {
        formData.append('address', bankData.address)
        console.log('8. Added address to FormData:', bankData.address)
      }
      
      if (bankData.website !== undefined) {
        formData.append('website', bankData.website)
        console.log('9. Added website to FormData:', bankData.website)
      }
      
      // IMPORTANT: Include code in FormData if backend requires it
      formData.append('code', code)
      console.log('10. Added code to FormData:', code)
      
      console.log('11. FormData entries:')
      for (const [key, value] of formData.entries()) {
        console.log(`  - ${key}:`, value)
      }
      
      // Content-Type will be set automatically by axios interceptor for FormData
      console.log('12. Sending PATCH request to:', `/banks/${code}/`)
      const response = await apiClient.patch<Bank>(`/banks/${code}/`, formData)
      console.log('13. Response received:', response.data)
      return response.data
    }
    
    // Regular update without logo changes
    console.log('6. Handling regular update (no logo changes)...')
    console.log('7. Bank data being sent:', bankData)
    
    // IMPORTANT: Include code in request body if backend requires it
    const requestData = {
      ...bankData,
      code: code
    }
    console.log('8. Request data with code:', requestData)
    console.log('9. Sending PATCH request to:', `/banks/${code}/`)
    
    const response = await apiClient.patch<Bank>(`/banks/${code}/`, requestData)
    console.log('10. Response received:', response.data)
    return response.data
  },

  /**
   * Delete a bank
   */
  async deleteBank(code: string): Promise<void> {
    // Delete by code (code is the primary identifier)
    await apiClient.delete(`/banks/${code}/`);
  },

  /**
   * Search banks by query
   */
  async searchBanks(query: string): Promise<Bank[]> {
    const response = await apiClient.get<Bank[]>('/banks/', {
      params: { search: query }
    });
    return response.data;
  }
};
