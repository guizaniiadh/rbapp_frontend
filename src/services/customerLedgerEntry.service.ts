import apiClient from '@/lib/api-client'
import type {
  CustomerLedgerEntry,
  CustomerLedgerEntryFilters,
  CustomerLedgerEntryListResponse,
  CustomerLedgerEntryUpload,
  CustomerLedgerEntryUpdate
} from '@/types/customerLedgerEntry'
import { getBankApiPrefix } from '@/utils/bankApiHelper'

class CustomerLedgerEntryService {
  private baseUrl = '/customer-ledger-entries'

  /**
   * Get all customer ledger entries
   */
  async getCustomerLedgerEntries(filters?: CustomerLedgerEntryFilters): Promise<CustomerLedgerEntry[]> {
    const response = await apiClient.get(`${this.baseUrl}/`, { params: filters })
    return response.data
  }

  /**
   * Get customer ledger entry by ID
   */
  async getCustomerLedgerEntry(id: number): Promise<CustomerLedgerEntry> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/`)
    return response.data
  }

  /**
   * Upload new customer ledger entry
   */
  async uploadDocument(uploadData: CustomerLedgerEntryUpload): Promise<CustomerLedgerEntry> {
    const formData = new FormData()
    formData.append('file', uploadData.file)
    if (uploadData.name) {
      formData.append('name', uploadData.name)
    }
    if (uploadData.company_code) {
      formData.append('company_code', uploadData.company_code)
    }

    const response = await apiClient.post(`${this.baseUrl}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Helper: Get entries by company code
   */
  async getLedgerEntriesByCompany(company_code: string): Promise<CustomerLedgerEntry[]> {
    return this.getCustomerLedgerEntries({ company_code })
  }

  /**
   * Update customer ledger entry
   */
  async updateDocument(id: number, updateData: CustomerLedgerEntryUpdate): Promise<CustomerLedgerEntry> {
    const formData = new FormData()
    if (updateData.file) {
      formData.append('file', updateData.file)
    }
    if (updateData.name) {
      formData.append('name', updateData.name)
    }

    const response = await apiClient.put(`${this.baseUrl}/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Delete customer ledger entry
   */
  async deleteDocument(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}/`)
  }

  /**
   * Download document file
   */
  downloadDocument(fileUrl: string, filename: string): void {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Preprocess a customer ledger entry to extract transactions
   * @param id - Customer ledger entry ID
   * @param bankCode - Bank code (e.g., 'bt', 'attijari') - required for bank-specific processing
   * @param agencyCode - Agency code (e.g., '53-5', '12-3') - required to filter transactions
   */
  async preprocess(id: number, bankCode: string, agencyCode: string): Promise<{
    message: string
    import_batch_id: number
    transactions_count: number
    agency_code?: string
    total_rows_before_filter?: number
    filtered_rows?: number
  }> {
    const bankPrefix = getBankApiPrefix(bankCode)
    const response = await apiClient.post(`${bankPrefix}${this.baseUrl}/${id}/preprocess/`, {
      agency_code: agencyCode
    })
    return response.data
  }

  /**
   * Get transactions extracted for a specific customer ledger entry
   */
  async getTransactions(id: number): Promise<any[]> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/transactions/`)
    return response.data
  }

  /**
   * Get file name from URL
   */
  getFileNameFromUrl(url: string): string {
    const urlParts = url.split('/')
    return urlParts[urlParts.length - 1] || 'document'
  }

  /**
   * Get file extension from URL
   */
  getFileExtension(url: string): string {
    const fileName = this.getFileNameFromUrl(url)
    const parts = fileName.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  }

  /**
   * Check if file is Excel
   */
  isExcelFile(url: string): boolean {
    const extension = this.getFileExtension(url)
    return ['xls', 'xlsx'].includes(extension)
  }

  /**
   * Check if file can be previewed
   */
  canPreview(url: string): boolean {
    const extension = this.getFileExtension(url)
    return ['pdf', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'txt'].includes(extension)
  }

  /**
   * Get file icon based on file extension
   */
  getFileIcon(url: string): string {
    const extension = this.getFileExtension(url)
    
    if (extension === 'pdf') return 'tabler-file-type-pdf'
    if (['xls', 'xlsx'].includes(extension)) return 'tabler-file-type-xls'
    if (['doc', 'docx'].includes(extension)) return 'tabler-file-type-doc'
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'tabler-photo'
    if (extension === 'txt') return 'tabler-file-text'
    if (['zip', 'rar', '7z'].includes(extension)) return 'tabler-file-zip'
    
    return 'tabler-file'
  }
}

export const customerLedgerEntryService = new CustomerLedgerEntryService()
