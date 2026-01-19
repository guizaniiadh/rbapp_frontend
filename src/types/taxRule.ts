export interface TaxRule {
  id: number
  convention: number
  payment_class: number
  payment_status: number
  tax_type: string
  calculation_type: 'percentage' | 'flat' | 'formula'
  rate: number
  formula?: string
}

export interface CreateTaxRuleDto {
  convention: number
  payment_class: number
  payment_status: number
  tax_type: string
  calculation_type: 'percentage' | 'flat' | 'formula'
  rate: number
  formula?: string
}

export interface UpdateTaxRuleDto {
  convention?: number
  payment_class?: number
  payment_status?: number
  tax_type?: string
  calculation_type?: 'percentage' | 'flat' | 'formula'
  rate?: number
  formula?: string
}












