import apiClient from '@/lib/api-client'

export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
}

class UserService {
  private baseUrl = '/users'

  /**
   * Get all users
   */
  async getUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get(this.baseUrl)
      return response.data
    } catch (error) {
      console.warn('Users API not available, using fallback names')
      return []
    }
  }

  /**
   * Get user by ID
   */
  async getUser(id: number): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/`)
      return response.data
    } catch (error) {
      console.warn(`User ${id} not found, using fallback name`)
      return {
        id,
        username: `user_${id}`,
        email: '',
        full_name: `User ${id}`
      }
    }
  }

  /**
   * Get user name by ID
   */
  async getUserName(id: number): Promise<string> {
    try {
      const user = await this.getUser(id)
      return user.full_name || user.username || `User ${id}`
    } catch (error) {
      console.error('Error fetching user name:', error)
      return `User ${id}`
    }
  }

  /**
   * Get multiple user names by IDs
   */
  async getUserNames(ids: number[]): Promise<Record<number, string>> {
    try {
      console.log('Fetching user names for IDs:', ids)
      const users = await this.getUsers()
      console.log('Users API response:', users)
      
      const userMap: Record<number, string> = {}
      
      users.forEach(user => {
        if (ids.includes(user.id)) {
          userMap[user.id] = user.full_name || user.username || `User ${user.id}`
        }
      })
      
      // Fill in missing users with fallback names
      ids.forEach(id => {
        if (!userMap[id]) {
          userMap[id] = `User ${id}`
        }
      })
      
      console.log('Final user map:', userMap)
      return userMap
    } catch (error) {
      console.error('Error fetching user names:', error)
      // Return fallback names for all IDs
      const userMap: Record<number, string> = {}
      ids.forEach(id => {
        userMap[id] = `User ${id}`
      })
      return userMap
    }
  }

  /**
   * Get user name by ID with better fallback
   */
  async getUserNameWithFallback(id: number): Promise<string> {
    try {
      const user = await this.getUser(id)
      return user.full_name || user.username || `User ${id}`
    } catch (error) {
      console.warn(`User ${id} not found, using fallback name`)
      return `User ${id}`
    }
  }

  /**
   * Get users with their company information
   */
  async getUsersWithCompanies(): Promise<any[]> {
    try {
      const response = await apiClient.get('/users/?include_companies=true')
      return response.data
    } catch (error) {
      console.warn('Users with companies API not available')
      return []
    }
  }

  /**
   * Get user's companies
   */
  async getUserCompanies(userId: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`/users/${userId}/companies/`)
      return response.data
    } catch (error) {
      console.warn(`User ${userId} companies not available`)
      return []
    }
  }

  /**
   * Assign user to company (from user perspective)
   */
  async assignUserToCompany(userId: number, companyCode: string): Promise<any> {
    try {
      const response = await apiClient.post(`/users/${userId}/assign_to_company/`, {
        company_code: companyCode
      })
      return response.data
    } catch (error) {
      console.error('Error assigning user to company:', error)
      throw error
    }
  }

  /**
   * Remove user from company (from user perspective)
   */
  async removeUserFromCompany(userId: number, companyCode: string): Promise<any> {
    try {
      const response = await apiClient.post(`/users/${userId}/remove_from_company/`, {
        company_code: companyCode
      })
      return response.data
    } catch (error) {
      console.error('Error removing user from company:', error)
      throw error
    }
  }
}

export const userService = new UserService()
