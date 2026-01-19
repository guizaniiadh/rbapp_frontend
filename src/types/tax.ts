export interface Tax {
  id: number
  name: string
  description: string[]
  company: number
  bank: number
  accounting_account?: string
}

export interface CreateTaxDto {
  name: string
  description: string[]
  company: number
  bank: number
  accounting_account?: string
}

export interface UpdateTaxDto {
  name?: string
  description?: string[]
  company?: number
  bank?: number
  accounting_account?: string
}
















