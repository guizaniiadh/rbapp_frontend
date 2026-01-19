export interface CustomerLedgerEntry {
  id: number
  user: number
  company_code: string
  file: string
  uploaded_at: string
  name?: string
}

export interface CustomerLedgerEntryFilters {
  search?: string
  date_from?: string
  date_to?: string
  user?: number
  company_code?: string
}

export interface CustomerLedgerEntryListResponse {
  data: CustomerLedgerEntry[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface CustomerLedgerEntryUpload {
  file: File
  name?: string
  company_code: string
}

export interface CustomerLedgerEntryUpdate {
  file?: File
  name?: string
}
