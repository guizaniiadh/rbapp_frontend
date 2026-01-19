import type { Bank } from './bank'

export interface Agency {
  id?: number
  code: string
  bank: number | Bank | { code: string; name?: string } // Can be ID, full Bank object, or minimal bank object
  name: string
  address: string
  city: string
  created_at?: string
  updated_at?: string
}

export interface CreateAgencyDto extends Omit<Agency, 'id' | 'code' | 'created_at' | 'updated_at'> {
  code: string
}

export interface UpdateAgencyDto extends Partial<CreateAgencyDto> {}
