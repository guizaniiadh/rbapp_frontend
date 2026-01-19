export interface ConventionParameter {
  id: number
  name: string
  value: string | number | Holiday[]
  convention_id?: number
}

export interface CreateConventionParameterDto {
  name: string
  value: string | number | Holiday[]
}

export interface UpdateConventionParameterDto extends Partial<CreateConventionParameterDto> {}

// Specialized types for different parameter values
export interface Holiday {
  date: string
  label: string
}

export interface TMMParameter {
  name: 'TMM'
  value: string // Numeric value as string
}

export interface BankDaysParameter {
  name: 'bank_days'
  value: string // Integer value as string
}

export interface HolidaysParameter {
  name: 'holidays'
  value: Holiday[] // Array of holiday objects
}

// Union type for all parameter types
export type ParameterType = TMMParameter | BankDaysParameter | HolidaysParameter

// Parameter value types
export type ParameterValueType = 'string' | 'number' | 'integer' | 'boolean' | 'json' | 'array' | 'object'

// Parameter type definitions with validation
export interface ParameterTypeInfo {
  type: ParameterValueType
  label: string
  description: string
  icon: string
  placeholder: string
  validation: (value: string) => boolean
  formatValue: (value: string) => any
  examples: string[]
}

// Form data for creating/editing parameters
export interface ConventionParameterForm {
  name: string
  value: string
  type: ParameterValueType
  holidays?: Holiday[] // For holidays parameter
  numericValue?: number // For TMM parameter
  integerValue?: number // For bank_days parameter
  customName?: string // For custom parameter name
}
