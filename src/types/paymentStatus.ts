export interface PaymentStatus {
  id: number
  line: number
  name: string
  payment_class: string
  payment_class_id: string
  accounting_account?: string
  created_at?: string
  updated_at?: string
}

export interface CreatePaymentStatusDto {
  line: number
  name: string
  payment_class: string
  accounting_account?: string
}

export interface UpdatePaymentStatusDto extends Partial<CreatePaymentStatusDto> {}
