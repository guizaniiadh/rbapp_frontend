export interface BankTransaction {
  id: number
  import_batch_id: number
  operation_date: string
  label: string
  value_date: string
  debit?: number
  credit?: number
  document_reference?: string
  amount: number
  bank_ledger_entry_id: number
  payment_class_id?: string | number
  payment_status_id?: string | number
  date_ref?: string
  ref?: string
  type?: string
  internal_number?: string
  bank_id?: string | number
  accounting_account?: string
}

export interface BankTransactionFilters {
  import_batch_id?: number
  bank_ledger_entry_id?: number
}



