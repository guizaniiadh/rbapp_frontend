export interface CustomerTransaction {
  id: number
  customer_ledger_entry: number
  import_batch_id: number
  account_number: string
  accounting_date: string
  document_number?: string
  description: string
  debit_amount?: number
  credit_amount?: number
  external_doc_number?: string
  due_date?: string
  payment_type?: string
  amount: number
  total_amount?: number
  matched_bank_transaction?: number
}

export interface CustomerTransactionFilters {
  customer_ledger_entry?: number
  import_batch_id?: number
  account_number?: string
  accounting_date?: string
  document_number?: string
  external_doc_number?: string
  amount?: number
  payment_type?: string
  matched_bank_transaction?: number
  has_matched_bank_transaction?: string
}



