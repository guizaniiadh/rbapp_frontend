export interface Company {
  // Basic Information
  code: string
  name: string
  logo?: string | null
  logo_url?: string | null
  
  // User Management (Lookup field)
  users?: string | Array<{
    id: number
    username: string
    email: string
    first_name?: string
    last_name?: string
  }>
}

export interface CompanyWithUsers extends Company {
  total_users: number
  active_users: number
  inactive_users: number
  staff_users: number
}

export interface CreateCompanyDto {
  code: string
  name: string
}

export interface UpdateCompanyDto {
  name?: string
  logo?: File | null
}

export interface UserWithCompanies extends User {
  companies: Company[]
  company_count: number
}

export interface UserCompaniesResponse {
  user_id: number
  username: string
  companies: Company[]
}

export interface CompanyAssignmentResponse {
  message: string
  user_id: number
  username: string
  company_code: string
  company_name: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  date_joined: string
  last_login: string | null
  companies?: Company[]
  primary_company?: {
    code: string
    name: string
  }
  company_count?: number
  profile?: {
    id: number
    company: {
      id: string
      name: string
      code: string
    }
  }
}

export interface UserProfile {
  id: number
  user: number
  companies: string[]
  primary_company: string
  company: string // Backward compatibility
}

export interface CreateUserProfileDto {
  user: number
  companies?: string[]
  primary_company?: string
  company?: string // Backward compatibility
}

export interface RegisterUserDto {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export interface CompanyForm {
  code: string
  name: string
}

export interface UserForm {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
}
