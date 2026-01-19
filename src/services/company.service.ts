import apiClient from '@/lib/api-client'
import { userService } from './user.service'
import type { Company, CreateCompanyDto, UpdateCompanyDto, User, UserProfile, CreateUserProfileDto, RegisterUserDto } from '@/types/company'

export const companyService = {
  /**
   * Get all companies
   */
  async getCompanies(): Promise<Company[]> {
    const response = await apiClient.get<Company[]>('/companies/')
    return response.data
  },

  /**
   * Get companies with users included
   */
  async getCompaniesWithUsers(): Promise<Company[]> {
    console.log('Fetching companies with users...')
    const response = await apiClient.get<Company[]>('/companies/', {
      params: { include_users: true }
    })
    console.log('Companies response:', response.data)
    return response.data
  },

  /**
   * Get a single company by code
   */
  async getCompanyByCode(code: string): Promise<Company> {
    const response = await apiClient.get<Company>(`/companies/${code}/`)
    return response.data
  },

  /**
   * Get all users in a specific company
   */
  async getCompanyUsers(companyCode: string): Promise<User[]> {
    const response = await apiClient.get<User[]>(`/companies/${companyCode}/users/`)
    return response.data
  },

  /**
   * Get company statistics
   */
  async getCompanyStats(companyCode: string): Promise<any> {
    const response = await apiClient.get(`/companies/${companyCode}/stats/`)
    return response.data
  },

  /**
   * Get active users only for a company
   */
  async getCompanyActiveUsers(companyCode: string): Promise<User[]> {
    const response = await apiClient.get<User[]>(`/companies/${companyCode}/active_users/`)
    return response.data
  },

  /**
   * Get all users (delegates to user service)
   */
  async getUsers(): Promise<any[]> {
    return userService.getUsers()
  },

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/current-user/')
      return response.data
    } catch (error) {
      console.warn('Current user endpoint not available')
      throw error
    }
  },

  /**
   * Register a new user
   */
  async registerUser(userData: RegisterUserDto): Promise<User> {
    try {
      const response = await apiClient.post<User>('/register/', userData)
      return response.data
    } catch (error) {
      console.warn('Register endpoint not available')
      throw error
    }
  },

  /**
   * Assign user to company (delegates to user service)
   */
  async assignUserToCompany(userId: number, companyCode: string): Promise<any> {
    return userService.assignUserToCompany(userId, companyCode)
  },

  /**
   * Remove user from company (delegates to user service)
   */
  async removeUserFromCompany(userId: number, companyCode: string): Promise<any> {
    return userService.removeUserFromCompany(userId, companyCode)
  },

  /**
   * Get user's companies
   */
  async getUserCompanies(userId: number): Promise<Company[]> {
    try {
      const response = await apiClient.get<Company[]>(`/user-profiles/${userId}/companies/`)
      return response.data
    } catch (error) {
      console.error('Error getting user companies:', error)
      return []
    }
  },


  /**
   * Create user profile (assign user to company)
   */
  async createUserProfile(userProfileData: CreateUserProfileDto): Promise<UserProfile> {
    console.log('Sending user profile data:', userProfileData)
    
    // Ensure the data is properly formatted
    const formattedData = {
      user: Number(userProfileData.user),
      companies: userProfileData.companies || (userProfileData.company ? [userProfileData.company] : []),
      primary_company: userProfileData.primary_company || userProfileData.company || ''
    }
    
    console.log('Formatted data:', formattedData)
    console.log('Data types:', {
      user: typeof formattedData.user,
      companies: typeof formattedData.companies,
      primary_company: typeof formattedData.primary_company
    })
    
    // Check if the endpoint exists first and see existing data format
    try {
      console.log('Testing if user-profiles endpoint exists...')
      const testResponse = await apiClient.get('/user-profiles/')
      console.log('Endpoint exists, got response:', testResponse.data)
      console.log('Sample existing user profile:', testResponse.data[0])
    } catch (testError) {
      console.error('User-profiles endpoint test failed:', testError)
      console.log('This suggests the endpoint might not exist or have different requirements')
    }
    
    try {
      // Try with explicit headers and data - using exact format from existing data
      console.log('Attempting POST with exact format from existing data...')
      const response = await apiClient.post<UserProfile>('/user-profiles/', formattedData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      console.log('SUCCESS! User profile created:', response.data)
      return response.data
    } catch (error) {
      console.error('User profile creation error:', error)
      console.error('Request data that failed:', formattedData)
      console.error('Full error response:', error)
      
      // Try alternative endpoint or method
      console.log('Trying alternative approach...')
      try {
        // Try different data formats
        const altFormats = [
          { user_id: formattedData.user, company_code: formattedData.primary_company },
          { user: String(formattedData.user), companies: formattedData.companies },
          { user: formattedData.user.toString(), primary_company: formattedData.primary_company },
          { user: [formattedData.user], companies: formattedData.companies }, // Maybe it expects arrays?
        ]
        
        for (let i = 0; i < altFormats.length; i++) {
          try {
            console.log(`Trying format ${i + 1}:`, altFormats[i])
            const altResponse = await apiClient.post('/user-profiles/', altFormats[i])
            console.log(`Format ${i + 1} worked:`, altResponse.data)
            return altResponse.data
          } catch (formatError) {
            console.log(`Format ${i + 1} failed:`, formatError)
          }
        }
        
        console.error('All alternative formats failed')
        
        // Try to understand the backend error better
        console.log('🔍 BACKEND ERROR ANALYSIS:')
        console.log('1. The backend is converting single values to arrays')
        console.log('2. This suggests a backend validation or serialization issue')
        console.log('3. The endpoint exists and returns data, but POST fails')
        console.log('4. This might be a backend configuration problem')
        
        // Try one more approach - maybe the endpoint expects different HTTP method or URL
        try {
          console.log('Trying PUT method instead of POST...')
          const putResponse = await apiClient.put('/user-profiles/', formattedData)
          console.log('PUT method worked:', putResponse.data)
          return putResponse.data
        } catch (putError) {
          console.log('PUT method also failed:', putError)
        }
        
        // Try to create a user profile using a different approach
        try {
          console.log('Trying to create user profile using companies endpoint...')
          // Maybe we need to use a different endpoint or approach
          const companiesResponse = await apiClient.get('/companies/')
          console.log('Companies endpoint works, but user-profiles POST fails')
          console.log('This confirms the issue is specifically with the user-profiles POST endpoint')
        } catch (companiesError) {
          console.log('Companies endpoint also failed:', companiesError)
        }
        
        throw error // Throw original error
      } catch (altError) {
        console.error('Alternative approach also failed:', altError)
        throw error // Throw original error
      }
    }
  },

  /**
   * Update user profile (transfer user to another company)
   */
  async updateUserProfile(profileId: number, userProfileData: Partial<CreateUserProfileDto>): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>(`/user-profiles/${profileId}/`, userProfileData)
    return response.data
  },

  /**
   * Delete user profile (remove user from company)
   */
  async deleteUserProfile(profileId: number): Promise<void> {
    await apiClient.delete(`/user-profiles/${profileId}/`)
  },

  /**
   * Create a new company
   */
  async createCompany(companyData: CreateCompanyDto): Promise<Company> {
    const response = await apiClient.post<Company>('/companies/', companyData)
    return response.data
  },

  /**
   * Update a company
   */
  async updateCompany(code: string, companyData: UpdateCompanyDto): Promise<Company> {
    console.log('=== COMPANY SERVICE UPDATE DEBUG ===')
    console.log('1. Company code (from URL):', code)
    console.log('2. Company data received:', companyData)
    console.log('3. Company data keys:', Object.keys(companyData))
    console.log('4. Company data values:', Object.values(companyData))
    console.log('5. Company data type:', typeof companyData)
    
    // Handle file upload for logo
    if (companyData.logo instanceof File) {
      console.log('6. Handling logo file upload...')
      const formData = new FormData()
      formData.append('logo', companyData.logo)
      
      // Always include name if provided
      if (companyData.name !== undefined) {
        formData.append('name', companyData.name)
        console.log('7. Added name to FormData:', companyData.name)
      }
      
      // IMPORTANT: Include code in FormData if backend requires it
      formData.append('code', code)
      console.log('8. Added code to FormData:', code)
      
      console.log('9. Uploading logo file:', {
        fileName: companyData.logo.name,
        fileSize: companyData.logo.size,
        fileType: companyData.logo.type,
        isFile: companyData.logo instanceof File
      })
      
      console.log('10. FormData entries:')
      for (const [key, value] of formData.entries()) {
        console.log(`  - ${key}:`, value instanceof File ? `File(${value.name})` : value)
      }
      
      // Content-Type will be set automatically by axios interceptor for FormData
      console.log('11. Sending PUT request to:', `/companies/${code}/`)
      const response = await apiClient.put<Company>(`/companies/${code}/`, formData)
      console.log('12. Response received:', response.data)
      return response.data
    }
    
    // Handle logo removal (null)
    if (companyData.logo === null) {
      console.log('6. Handling logo removal...')
      const formData = new FormData()
      // For logo removal, send empty string - backend should handle it
      formData.append('logo', '')
      
      if (companyData.name !== undefined) {
        formData.append('name', companyData.name)
        console.log('7. Added name to FormData:', companyData.name)
      }
      
      // IMPORTANT: Include code in FormData if backend requires it
      formData.append('code', code)
      console.log('8. Added code to FormData:', code)
      
      console.log('9. FormData entries:')
      for (const [key, value] of formData.entries()) {
        console.log(`  - ${key}:`, value)
      }
      
      // Content-Type will be set automatically by axios interceptor for FormData
      console.log('10. Sending PUT request to:', `/companies/${code}/`)
      const response = await apiClient.put<Company>(`/companies/${code}/`, formData)
      console.log('11. Response received:', response.data)
      return response.data
    }
    
    // Regular update without logo changes
    console.log('6. Handling regular update (no logo changes)...')
    console.log('7. Company data being sent:', companyData)
    
    // IMPORTANT: Include code in request body if backend requires it
    const requestData = {
      ...companyData,
      code: code
    }
    console.log('8. Request data with code:', requestData)
    console.log('9. Sending PUT request to:', `/companies/${code}/`)
    
    const response = await apiClient.put<Company>(`/companies/${code}/`, requestData)
    console.log('10. Response received:', response.data)
    return response.data
  },

  /**
   * Delete a company
   */
  async deleteCompany(code: string): Promise<void> {
    await apiClient.delete(`/companies/${code}/`)
  },

  /**
   * Assign user to company (from company perspective)
   */
  async assignUserToCompanyFromCompany(companyCode: string, userId: number): Promise<any> {
    try {
      const response = await apiClient.post(`/companies/${companyCode}/assign_user/`, {
        user_id: userId
      })
      return response.data
    } catch (error) {
      console.error('Error assigning user to company:', error)
      throw error
    }
  },

  /**
   * Remove user from company (from company perspective)
   */
  async removeUserFromCompanyFromCompany(companyCode: string, userId: number): Promise<any> {
    try {
      const response = await apiClient.post(`/companies/${companyCode}/remove_user/`, {
        user_id: userId
      })
      return response.data
    } catch (error) {
      console.error('Error removing user from company:', error)
      throw error
    }
  },

  /**
   * Get companies with user statistics
   */
  async getCompaniesWithStats(): Promise<Company[]> {
    try {
      const companies = await this.getCompanies()
      const companiesWithStats = await Promise.all(
        companies.map(async (company) => {
          try {
            const stats = await this.getCompanyStats(company.code)
            return {
              ...company,
              total_users: stats.total_users,
              active_users: stats.active_users,
              inactive_users: stats.inactive_users,
              staff_users: stats.staff_users
            }
          } catch (err) {
            console.warn(`Failed to load stats for company ${company.code}:`, err)
            return {
              ...company,
              total_users: 0,
              active_users: 0,
              inactive_users: 0,
              staff_users: 0
            }
          }
        })
      )
      return companiesWithStats
    } catch (error) {
      console.error('Error getting companies with stats:', error)
      throw error
    }
  },

  /**
   * Assign a user to a company
   */
  async assignUserToCompany(companyId: string, userId: number): Promise<{
    message: string
    user_id: number
    username: string
    company_code: string
    company_name: string
  }> {
    try {
      console.log(`Assigning user ${userId} to company ${companyId}`)
      const response = await apiClient.post(`/companies/${companyId}/assign_user/`, {
        user_id: userId
      })
      console.log('User assignment response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error assigning user to company:', error)
      throw error
    }
  },

  /**
   * Remove a user from a company
   */
  async removeUserFromCompany(companyId: string, userId: number): Promise<{
    message: string
    user_id: number
    username: string
    company_code: string
    company_name: string
  }> {
    try {
      console.log(`Removing user ${userId} from company ${companyId}`)
      const response = await apiClient.post(`/companies/${companyId}/remove_user/`, {
        user_id: userId
      })
      console.log('User removal response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error removing user from company:', error)
      throw error
    }
  }
}
