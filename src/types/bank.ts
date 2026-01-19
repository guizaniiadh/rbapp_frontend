export interface Bank {
  code: string
  name: string
  address: string
  website: string
  agencies?: any[] | string
  beginningBalance?: string
  beginning_balance_label?: string
  created_at?: string
  updated_at?: string
}

export interface CreateBankDto extends Omit<Bank, 'code' | 'created_at' | 'updated_at'> {}

export interface UpdateBankDto extends Partial<CreateBankDto> {}
