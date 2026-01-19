export interface Convention {
  id: number
  name: string
  bank: number
  company: number
  is_active: boolean
}

export interface CreateConventionDto {
  name: string
  bank: number
  company: number
  is_active?: boolean
}

export interface UpdateConventionDto {
  name?: string
  bank?: number
  company?: number
  is_active?: boolean
}
















