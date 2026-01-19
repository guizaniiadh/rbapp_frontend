export interface PaymentIdentification {
  line: number
  description: string
  payment_status: number
  debit: boolean
  credit: boolean
  bank: string
  grouped: boolean
}

export interface CreatePaymentIdentificationDto {
  description: string
  payment_status: number
  debit: boolean
  credit: boolean
  bank: string
  grouped: boolean
}

export interface UpdatePaymentIdentificationDto extends Partial<CreatePaymentIdentificationDto> {}
