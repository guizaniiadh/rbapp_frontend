export interface BankLedgerEntry {
  id: number
  agency: string
  file: string
  uploaded_at: string
  name?: string
}

export interface BankLedgerEntryFilters {
  search?: string
  date_from?: string
  date_to?: string
  agency?: string
}

export interface BankLedgerEntryListResponse {
  data: BankLedgerEntry[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface BankLedgerEntryUpload {
  file: File
  name?: string
  agency: string
}

export interface BankLedgerEntryUpdate {
  file?: File
  name?: string
  agency?: string
}
