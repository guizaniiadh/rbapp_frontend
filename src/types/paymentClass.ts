export interface PaymentClass {
  code: string
  name: string
  created_at?: string
  updated_at?: string
}

export interface CreatePaymentClassDto extends Omit<PaymentClass, 'created_at' | 'updated_at'> {}

export interface UpdatePaymentClassDto extends Partial<CreatePaymentClassDto> {}
