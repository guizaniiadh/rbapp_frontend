import apiClient from '@/lib/api-client'
import type {
  BankLedgerEntry,
  BankLedgerEntryFilters,
  BankLedgerEntryListResponse,
  BankLedgerEntryUpload,
  BankLedgerEntryUpdate
} from '@/types/bankLedgerEntry'
import { getBankApiPrefix } from '@/utils/bankApiHelper'

class BankLedgerEntryService {
  private baseUrl = '/bank-ledger-entries'

  /**
   * Get all bank ledger entries
   */
  async getBankLedgerEntries(filters?: BankLedgerEntryFilters): Promise<BankLedgerEntry[]> {
    const response = await apiClient.get(this.baseUrl, { params: filters })
    return response.data
  }

  /**
   * Get bank ledger entry by ID
   */
  async getBankLedgerEntry(id: number): Promise<BankLedgerEntry> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/`)
    return response.data
  }

  /**
   * Upload a new bank ledger entry document
   */
  async uploadDocument(uploadData: BankLedgerEntryUpload): Promise<BankLedgerEntry> {
    const formData = new FormData()
    formData.append('file', uploadData.file)
    if (uploadData.name) {
      formData.append('name', uploadData.name)
    }
    formData.append('agency', uploadData.agency)

    const response = await apiClient.post(`${this.baseUrl}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Update an existing bank ledger entry
   */
  async updateDocument(id: number, updateData: BankLedgerEntryUpdate): Promise<BankLedgerEntry> {
    const formData = new FormData()
    if (updateData.file) {
      formData.append('file', updateData.file)
    }
    if (updateData.name) {
      formData.append('name', updateData.name)
    }
    if (updateData.agency) {
      formData.append('agency', updateData.agency)
    }

    const response = await apiClient.put(`${this.baseUrl}/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Delete a bank ledger entry
   */
  async deleteDocument(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}/`)
  }

  /**
   * Preprocess a bank ledger entry to extract transactions
   * @param id - Bank ledger entry ID
   * @param bankCode - Bank code (e.g., 'bt', 'attijari') - required for bank-specific processing
   */
  async preprocess(id: number, bankCode: string): Promise<{ message: string; import_batch_id: number; transactions_count: number }> {
    const bankPrefix = getBankApiPrefix(bankCode)
    const response = await apiClient.post(`${bankPrefix}${this.baseUrl}/${id}/preprocess/`)
    return response.data
  }

  /**
   * Extract beginning balance from a bank ledger entry
   * @param id - Bank ledger entry ID
   * @param bankCode - Bank code (e.g., 'bt', 'attijari') - required for bank-specific processing
   */
  async extractBeginningBalance(id: number, bankCode: string): Promise<{ beginning_balance: number }> {
    const bankPrefix = getBankApiPrefix(bankCode)
    const response = await apiClient.get(`${bankPrefix}${this.baseUrl}/${id}/extract-beginning-balance/`)
    return response.data
  }

  /**
   * Run transaction matching routine across transactions
   * @param bankCode - Bank code (e.g., 'bt', 'attijari') - required for bank-specific processing
   * @param params - Optional parameters (agency, bank)
   */
  async matchTransactions(bankCode: string, params?: { agency?: string; bank?: string }): Promise<{
    message: string
    total_transactions_processed: number
    payment_identifications_checked: number
    matching_rules_applied: Record<string, string>
  }> {
    const bankPrefix = getBankApiPrefix(bankCode)
    const response = await apiClient.post(`${bankPrefix}/match-transactions/`, params ?? {})
    return response.data
  }

  /**
   * Match taxes across transactions
   * @param bankCode - Bank code (e.g., 'bt', 'attijari') - required for bank-specific processing
   * @param companyCode - Company code - required to filter taxes by company
   */
  async matchTaxes(bankCode: string, companyCode: string): Promise<{
    message: string
    matched_count: number
    total_transactions: number
  }> {
    const bankPrefix = getBankApiPrefix(bankCode)
    const response = await apiClient.post(`${bankPrefix}/match-taxes/`, {
      company_code: companyCode,
      bank_code: bankCode
    })
    return response.data
  }

  /**
   * Match bank transactions with taxes (post-tax classification)
   * @param bankCode - Bank code (e.g., 'bt', 'attijari') - required for bank-specific processing
   */
  async matchBankTransactionTaxes(bankCode: string): Promise<{
    message: string
    total_transactions: number
    origine_transactions: number
    non_origine_transactions: number
    matched_count: number
    unmatched_count: number
    total_with_internal_number: number
  }> {
    const bankPrefix = getBankApiPrefix(bankCode)
    const response = await apiClient.post(`${bankPrefix}/match-bank-transaction-taxes/`)
    return response.data
  }

  /**
   * Get transactions extracted for a specific bank ledger entry
   */
  async getTransactions(id: number): Promise<any[]> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/transactions/`)
    return response.data
  }

  /**
   * Run customer-bank transaction matching for reconciliation
   * @param bankCode - Bank code (e.g., 'bt', 'attijari') - required for bank-specific processing
   */
  async matchCustomerBankTransactions(bankCode: string): Promise<{
    summary: {
      total_bank_transactions: number
      high_matches_count: number
      high_matches_percentage: number
      low_matches_count: number
      low_matches_percentage: number
    }
    high_matches: any[]
    low_matches: any[]
  }> {
    const bankPrefix = getBankApiPrefix(bankCode)
    const response = await apiClient.post(`${bankPrefix}/match-customer-bank-transactions/`)
    return response.data
  }

  /**
   * Get unmatched transactions for an agency
   * @param bankCode - Bank code (e.g., 'bt', 'attijari') - required for bank-specific processing
   * @param agency - Agency code
   */
  async getUnmatchedTransactions(bankCode: string, agency: string): Promise<{
    unmatched_bank_transactions: any[]
    unmatched_customer_transactions: any[]
  }> {
    const bankPrefix = getBankApiPrefix(bankCode)
    const response = await apiClient.get(`${bankPrefix}/unmatched-transactions/`, {
      params: { agency }
    })
    return response.data
  }

  /**
   * Helper: Get entries by agency code
   */
  async getLedgerEntriesByAgency(agency: string): Promise<BankLedgerEntry[]> {
    return this.getBankLedgerEntries({ agency })
  }

  /**
   * Get file name from URL
   */
  getFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const filename = pathname.split('/').pop() || 'unknown'
      return decodeURIComponent(filename)
    } catch {
      return 'unknown'
    }
  }

  /**
   * Get file extension from URL
   */
  getFileExtension(url: string): string {
    const filename = this.getFileNameFromUrl(url)
    const lastDotIndex = filename.lastIndexOf('.')
    return lastDotIndex > 0 ? filename.substring(lastDotIndex + 1).toLowerCase() : ''
  }

  /**
   * Check if file is Excel
   */
  isExcelFile(url: string): boolean {
    const extension = this.getFileExtension(url)
    return ['xlsx', 'xls'].includes(extension)
  }

  /**
   * Check if file can be previewed
   */
  canPreview(url: string): boolean {
    const extension = this.getFileExtension(url)
    return ['xlsx', 'xls', 'pdf'].includes(extension)
  }

  /**
   * Get file icon based on extension
   */
  getFileIcon(url: string): string {
    const extension = this.getFileExtension(url)
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return '📊'
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      default:
        return '📁'
    }
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
}

export const bankLedgerEntryService = new BankLedgerEntryService()
