'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'

import {
  Typography,
  Grid,
  Card,
  CardHeader,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material'
import { Edit, Delete, Search, Business, AccountBalance, ArrowUpward, ArrowDownward, Add, Check, Close } from '@mui/icons-material'

// Third-party Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState
} from '@tanstack/react-table'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import TablePaginationComponent from '@/components/TablePaginationComponent'

// Service Imports
import { conventionService } from '@/services/convention.service'
import { taxService } from '@/services/tax.service'
import { taxRuleService } from '@/services/taxRule.service'
import { companyService } from '@/services/company.service'
import { bankService } from '@/services/bank.service'

// Type Imports
import type { Convention, CreateConventionDto, UpdateConventionDto } from '@/types/convention'
import type { Tax, CreateTaxDto, UpdateTaxDto } from '@/types/tax'
import type { TaxRule, CreateTaxRuleDto, UpdateTaxRuleDto } from '@/types/taxRule'
import type { Company } from '@/types/company'
import type { Bank } from '@/types/bank'
import { paymentStatusService } from '@/services/paymentStatus.service'
import type { PaymentStatus } from '@/types/paymentStatus'
import { paymentClassService } from '@/services/paymentClass.service'
import type { PaymentClass } from '@/types/paymentClass'

// Style Imports
import styles from '@core/styles/table.module.css'

// Dictionary imports
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const ConventionParametersPage = () => {
  const params = useParams()
  const lang = params.lang as Locale
  
  // Dictionary state
  const [dictionary, setDictionary] = useState<any>(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(true)
  
  // Safe dictionary fallback
  const safeDictionary = dictionary || { navigation: {} }
  
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')


  // Data states
  const [companies, setCompanies] = useState<Company[]>([])
  const [banks, setBanks] = useState<Bank[]>([])
  const [conventions, setConventions] = useState<Convention[]>([])
  const [taxes, setTaxes] = useState<Tax[]>([])
  const [taxRules, setTaxRules] = useState<TaxRule[]>([])
  const [openingBalances, setOpeningBalances] = useState<any[]>([])
  const [loadingSelectors, setLoadingSelectors] = useState(true)

  // Selection states
  const [selectedCompany, setSelectedCompany] = useState<string | ''>('')
  const [selectedBank, setSelectedBank] = useState<string | ''>('')

  // Debug logging removed - only log when needed

  // Load dictionary
  useEffect(() => {
    if (!lang) {
      setDictionaryLoading(false)
      return
    }
    
    const loadDictionary = async () => {
      try {
        const dict = await getDictionaryClient(lang)
        setDictionary(dict)
        setDictionaryLoading(false)
      } catch (err) {
        console.error('Dictionary load failed:', err)
        setDictionaryLoading(false)
      }
    }
    
    loadDictionary()
  }, [lang])

  // Timeout fallback - show page after 3 seconds even if dictionary fails
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (dictionaryLoading) {
        setDictionaryLoading(false)
      }
    }, 3000)

    return () => clearTimeout(timeout)
  }, [dictionaryLoading])

  // Dialog states
  const [conventionDialogOpen, setConventionDialogOpen] = useState(false)
  const [taxDialogOpen, setTaxDialogOpen] = useState(false)
  const [taxRuleDialogOpen, setTaxRuleDialogOpen] = useState(false)
  const [openingBalanceDialogOpen, setOpeningBalanceDialogOpen] = useState(false)
  
  // Dialog error states
  const [taxDialogError, setTaxDialogError] = useState('')
  const [conventionDialogError, setConventionDialogError] = useState('')
  const [taxRuleDialogError, setTaxRuleDialogError] = useState('')
  const [openingBalanceDialogError, setOpeningBalanceDialogError] = useState('')
  
  // Field-specific error states
  const [conventionFieldErrors, setConventionFieldErrors] = useState<{ [key: string]: string }>({})
  const [taxFieldErrors, setTaxFieldErrors] = useState<{ [key: string]: string }>({})
  const [taxRuleFieldErrors, setTaxRuleFieldErrors] = useState<{ [key: string]: string }>({})

  // Form states
  const [conventionForm, setConventionForm] = useState<CreateConventionDto>({
    name: '',
    bank: 0,
    company: 0,
    is_active: true
  })

  const [taxForm, setTaxForm] = useState<CreateTaxDto>({
    name: '',
    description: [''],
    company: 0,
    bank: 0,
    accounting_account: ''
  })

  const [taxRuleForm, setTaxRuleForm] = useState<CreateTaxRuleDto & { payment_class: number | string }>({
    convention: 0,
    payment_class: '',
    payment_status: 0,
    tax_type: '',
    calculation_type: 'percentage',
    rate: 0,
    formula: ''
  })

  // Search states
  const [conventionSearch, setConventionSearch] = useState('')
  const [taxSearch, setTaxSearch] = useState('')
  const [taxRuleSearch, setTaxRuleSearch] = useState('')
  const [openingBalanceSearch, setOpeningBalanceSearch] = useState('')
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>([])
  const [paymentClasses, setPaymentClasses] = useState<PaymentClass[]>([])
  const [taxRulePaymentStatusFilter, setTaxRulePaymentStatusFilter] = useState<number | ''>('')
  const [bankPaymentStatuses, setBankPaymentStatuses] = useState<PaymentStatus[]>([])
  const [allBankPaymentStatuses, setAllBankPaymentStatuses] = useState<PaymentStatus[]>([]) // Store all statuses for filtering

  // Sorting states
  const [conventionSorting, setConventionSorting] = useState<SortingState>([])
  const [taxSorting, setTaxSorting] = useState<SortingState>([])
  const [taxRuleSorting, setTaxRuleSorting] = useState<SortingState>([])
  const [openingBalanceSorting, setOpeningBalanceSorting] = useState<SortingState>([])

  // Edit states for inline editing
  const [editingConventionId, setEditingConventionId] = useState<number | null>(null)
  const [editingTaxId, setEditingTaxId] = useState<number | null>(null)
  const [editingTaxRuleId, setEditingTaxRuleId] = useState<number | null>(null)
  const [editingOpeningBalanceId, setEditingOpeningBalanceId] = useState<number | null>(null)
  const [editingConvention, setEditingConvention] = useState<Partial<Convention>>({})
  const [editingTax, setEditingTax] = useState<Partial<Tax>>({})
  const [editingTaxRule, setEditingTaxRule] = useState<Partial<TaxRule>>({})
  const [editingOpeningBalance, setEditingOpeningBalance] = useState<Partial<any>>({})

  // Load initial data
  const loadCompanies = async () => {
    try {
      console.log('Loading companies...')
      const data = await companyService.getCompanies()
      console.log('Companies loaded:', data)
      console.log('First company structure:', data[0])
      setCompanies(data)
    } catch (err) {
      console.error('Error loading companies:', err)
      setError('Failed to load companies')
    }
  }

  const loadBanks = async () => {
    try {
      console.log('Loading banks...')
      const data = await bankService.getBanks()
      console.log('Banks loaded:', data)
      console.log('First bank structure:', data[0])
      setBanks(data)
    } catch (err) {
      console.error('Error loading banks:', err)
      setError('Failed to load banks')
    }
  }

  const loadInitialData = async () => {
    setLoadingSelectors(true)
    try {
      await Promise.all([loadCompanies(), loadBanks()])
      // Preload lookups
      const [statuses, classes] = await Promise.all([
        paymentStatusService.getPaymentStatuses(),
        paymentClassService.getPaymentClasses()
      ])
      setPaymentStatuses(statuses)
      setPaymentClasses(classes)
    } catch (err) {
      console.error('Error loading initial data:', err)
      // Add fallback mock data for testing
      setCompanies([
        { id: 1, name: 'Test Company 1', code: 'TC1' },
        { id: 2, name: 'Test Company 2', code: 'TC2' }
      ])
      setBanks([
        { id: 1, name: 'Test Bank 1', code: 'TB1', address: 'Test Address 1', website: 'https://test1.com' },
        { id: 2, name: 'Test Bank 2', code: 'TB2', address: 'Test Address 2', website: 'https://test2.com' }
      ])
    } finally {
      setLoadingSelectors(false)
    }
  }

  // Resolve query param (prefer numeric id if present, else numeric code)
  const resolveQueryParam = (selected: string, items: Array<{ id?: number; code: string }>): string => {
    const match = items.find(item => item.code === selected || String(item.id ?? '') === selected)
    if (match && typeof match.id === 'number') return String(match.id)
    // Fall back to the selected value (code) to ensure backend receives both filters
    return selected
  }

  // Load data based on selection
  const loadConventions = async () => {
    if (!selectedCompany || !selectedBank) return

    try {
      setLoading(true)
      const companyParam = resolveQueryParam(selectedCompany, companies)
      const bankParam = resolveQueryParam(selectedBank, banks)
      console.log('Loading conventions for params -> company:', companyParam, 'bank:', bankParam)
      const data = await conventionService.getConventions(companyParam, bankParam)
      console.log('Conventions loaded (backend filtered):', data)
      setConventions(data)
    } catch (err) {
      setError('Failed to load conventions')
      console.error('Error loading conventions:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadTaxes = async () => {
    if (!selectedCompany || !selectedBank) return

    try {
      setLoading(true)
      const companyParam = resolveQueryParam(selectedCompany, companies)
      const bankParam = resolveQueryParam(selectedBank, banks)
      console.log('Loading taxes for params -> company:', companyParam, 'bank:', bankParam)
      const data = await taxService.getTaxes(companyParam, bankParam)
      console.log('Taxes loaded (backend filtered):', data)
      setTaxes(data)
    } catch (err) {
      setError('Failed to load taxes')
      console.error('Error loading taxes:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadTaxRules = async () => {
    if (!selectedCompany || !selectedBank) return

    try {
      setLoading(true)
      const companyParam = resolveQueryParam(selectedCompany, companies)
      const bankParam = resolveQueryParam(selectedBank, banks)
      console.log('Resolving convention for tax rules with params -> company:', companyParam, 'bank:', bankParam)
      const conventionsForPair = await conventionService.getConventions(companyParam, bankParam)
      const activeConvention = conventionsForPair.find(c => c.is_active) || conventionsForPair[0]
      console.log('Resolved convention for tax rules:', activeConvention)
      if (!activeConvention) {
        setTaxRules([])
        return
      }
      const data = await taxRuleService.getTaxRulesByConvention(activeConvention.id)
      console.log('Tax rules loaded by convention:', data)
      setTaxRules(data)
    } catch (err) {
      setError('Failed to load tax rules')
      console.error('Error loading tax rules:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPaymentStatusesByBank = async () => {
    if (!selectedBank) {
      setBankPaymentStatuses([])
      setAllBankPaymentStatuses([])
      return
    }

    try {
      const bankParam = resolveQueryParam(selectedBank, banks)
      const data = await paymentStatusService.getPaymentStatusesByBank(bankParam)
      // Store all payment statuses for filtering
      setAllBankPaymentStatuses(data)
      // Get unique payment statuses by name to avoid duplicates in display
      // Keep the first occurrence of each unique name
      const uniqueStatuses = Array.from(
        new Map(data.map(status => [status.name.toLowerCase().trim(), status])).values()
      )
      setBankPaymentStatuses(uniqueStatuses)
    } catch (err) {
      console.error('Error loading payment statuses by bank:', err)
      setBankPaymentStatuses([])
      setAllBankPaymentStatuses([])
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadOpeningBalances = async () => {
    if (!selectedCompany || !selectedBank) return

    try {
      setLoading(true)
      // TODO: Implement opening balance service when available
      // For now, set empty array
      setOpeningBalances([])
    } catch (err) {
      setError('Failed to load opening balances')
      console.error('Error loading opening balances:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedCompany && selectedBank) {
      loadConventions()
      loadTaxes()
      loadTaxRules()
      loadOpeningBalances()
    }
  }, [selectedCompany, selectedBank])

  useEffect(() => {
    loadPaymentStatusesByBank()
    setTaxRulePaymentStatusFilter('') // Reset filter when bank changes
  }, [selectedBank])

  // Helper function to translate error messages
  const translateError = (message: string, fieldTranslations?: { [key: string]: string }): string => {
    if (!message || lang !== 'fr') return message
    
    let translated = message
    const messageLower = message.toLowerCase().trim()
    
    // Handle "no more than X characters" - multiple patterns
    const noMoreThanPatterns = [
      /ensure this field has no more than (\d+) characters?\.?/i,
      /this field has no more than (\d+) characters?\.?/i,
      /no more than (\d+) characters?\.?/i,
      /maximum (\d+) characters?\.?/i,
      /max (\d+) characters?\.?/i,
    ]
    
    for (const pattern of noMoreThanPatterns) {
      const match = message.match(pattern)
      if (match) {
        const max = match[1]
        translated = (safeDictionary?.navigation?.ensureFieldNoMoreThanCharacters || 'Assurez-vous que ce champ ne contient pas plus de {max} caractères.').replace('{max}', max)
        return translated
      }
    }
    
    // Handle "at least X characters" - multiple patterns
    const atLeastPatterns = [
      /ensure this field has at least (\d+) characters?\.?/i,
      /this field has at least (\d+) characters?\.?/i,
      /at least (\d+) characters?\.?/i,
      /minimum (\d+) characters?\.?/i,
      /min (\d+) characters?\.?/i,
    ]
    
    for (const pattern of atLeastPatterns) {
      const match = message.match(pattern)
      if (match) {
        const min = match[1]
        translated = (safeDictionary?.navigation?.ensureFieldAtLeastCharacters || 'Assurez-vous que ce champ contient au moins {min} caractères.').replace('{min}', min)
        return translated
      }
    }
    
    // Handle "this field is required"
    if (messageLower.includes('this field is required') || messageLower === 'this field is required') {
      translated = safeDictionary?.navigation?.thisFieldIsRequired || 'Ce champ est requis'
      return translated
    }
    
    // Handle "ensure this field is valid"
    if (messageLower.includes('ensure this field is valid') || messageLower === 'ensure this field is valid') {
      translated = safeDictionary?.navigation?.ensureFieldIsValid || 'Assurez-vous que ce champ est valide.'
      return translated
    }
    
    // Handle other common patterns
    if (messageLower.includes('field is required')) {
      translated = safeDictionary?.navigation?.thisFieldIsRequired || 'Ce champ est requis'
      return translated
    }
    
    return translated
  }

  // Create handlers
  const handleCreateConvention = async () => {
    if (!selectedCompany || !selectedBank) {
      setConventionDialogError(safeDictionary?.navigation?.pleaseSelectCompanyAndBankFirst || 'Please select a company and bank first')
      return
    }

    // Validation
    if (!conventionForm.name || !conventionForm.name.trim()) {
      setConventionDialogError(safeDictionary?.navigation?.conventionNameRequired || 'Convention name is required')
      return
    }

    try {
      setLoading(true)
      setConventionDialogError('')
      setConventionFieldErrors({})
      
      // Get company and bank - use code as identifier
      const company = companies.find(c => c.code === selectedCompany)
      const bank = banks.find(b => b.code === selectedBank)
      
      if (!company || !bank) {
        setConventionDialogError(safeDictionary?.navigation?.companyOrBankNotFound || 'Company or bank not found')
        return
      }

      // Use company and bank codes - backend may accept codes as strings or need IDs
      // Try to use ID if available, otherwise use code (backend should handle code lookup)
      const createData: CreateConventionDto = {
        ...conventionForm,
        company: (company as any).id || parseInt(selectedCompany) || selectedCompany as any, // Use ID if available, else code
        bank: (bank as any).id || parseInt(selectedBank) || selectedBank as any // Use ID if available, else code
      }

      await conventionService.createConvention(createData)
      setSuccess(safeDictionary?.navigation?.conventionCreatedSuccessfully || 'Convention created successfully')
      setConventionDialogOpen(false)
      setConventionDialogError('')
      setConventionFieldErrors({})
      setConventionForm({ name: '', bank: 0, company: 0, is_active: true })
      loadConventions()
    } catch (err: any) {
      console.error('Error creating convention - Full error:', err)
      console.error('Error response:', err?.response)
      console.error('Error response data:', err?.response?.data)
      
      let errorMessage = safeDictionary?.navigation?.failedToCreateConvention || 'Failed to create convention'
      const fieldErrors: { [key: string]: string } = {}
      
      // Check for original axios error structure first
      if (err?.response?.data) {
        const errorData = err.response.data
        console.error('Error data structure:', errorData)
        
        if (typeof errorData === 'string') {
          errorMessage = translateError(errorData)
        } else if (errorData.detail) {
          errorMessage = translateError(errorData.detail)
        } else if (errorData.message) {
          errorMessage = translateError(errorData.message)
        } else if (errorData.error) {
          errorMessage = translateError(errorData.error)
        } else if (Object.keys(errorData).length > 0) {
          // Handle validation errors - set field-specific errors
          const fieldTranslations: { [key: string]: string } = {
            'name': safeDictionary?.navigation?.name || 'Nom',
            'company': safeDictionary?.navigation?.company || 'Entreprise',
            'bank': safeDictionary?.navigation?.bank || 'Banque',
            'is_active': safeDictionary?.navigation?.active || 'Actif',
          }
          
          Object.entries(errorData).forEach(([field, messages]) => {
            const msg = Array.isArray(messages) ? messages.join(', ') : String(messages)
            const translatedMsg = translateError(msg, fieldTranslations)
            fieldErrors[field] = translatedMsg
          })
          
          // If there are field errors, don't show general error message
          if (Object.keys(fieldErrors).length > 0) {
            errorMessage = ''
          } else {
            const validationErrors = Object.entries(errorData)
              .map(([field, messages]) => {
                const translatedField = fieldTranslations[field] || field
                const msg = Array.isArray(messages) ? messages.join(', ') : String(messages)
                const translatedMsg = translateError(msg, fieldTranslations)
                return Object.keys(errorData).length > 1 ? `${translatedField}: ${translatedMsg}` : translatedMsg
              })
              .join('; ')
            
            const validationPrefix = lang === 'fr' 
              ? (safeDictionary?.navigation?.validationErrors || 'Erreurs de validation')
              : (safeDictionary?.navigation?.validationErrors || 'Validation errors')
            errorMessage = Object.keys(errorData).length > 1 ? `${validationPrefix}: ${validationErrors}` : validationErrors
          }
        }
      } 
      // Check for modified error from interceptor
      else if (err?.message) {
        errorMessage = translateError(err.message)
      }
      
      setConventionFieldErrors(fieldErrors)
      setConventionDialogError(errorMessage)
      console.error('Final error message:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTax = async () => {
    if (!selectedCompany || !selectedBank) {
      setTaxDialogError(safeDictionary?.navigation?.pleaseSelectCompanyAndBankFirst || 'Please select a company and bank first')
      return
    }

    // Validation
    if (!taxForm.name || !taxForm.name.trim()) {
      setTaxDialogError(safeDictionary?.navigation?.taxNameRequired || 'Tax name is required')
      return
    }

    try {
      setLoading(true)
      setTaxDialogError('')
      setTaxFieldErrors({})
      
      // Get company and bank - use code as identifier
      const company = companies.find(c => c.code === selectedCompany)
      const bank = banks.find(b => b.code === selectedBank)
      
      if (!company || !bank) {
        setTaxDialogError(safeDictionary?.navigation?.companyOrBankNotFound || 'Company or bank not found')
        return
      }

      // Use company and bank IDs - backend expects numeric IDs
      const companyId = (company as any).id || parseInt(selectedCompany)
      const bankId = (bank as any).id || parseInt(selectedBank)
      
      if (!companyId || !bankId || isNaN(companyId) || isNaN(bankId)) {
        setTaxDialogError(safeDictionary?.navigation?.invalidCompanyOrBankId || 'Invalid company or bank ID')
        setLoading(false)
        return
      }
      
      const createData: CreateTaxDto = {
        ...taxForm,
        company: companyId,
        bank: bankId,
        description: taxForm.description.filter(d => d.trim() !== '') // Remove empty descriptions
      }

      console.log('Creating tax with data:', createData)
      console.log('Company ID:', companyId, 'Bank ID:', bankId)
      console.log('Selected Company:', selectedCompany, 'Selected Bank:', selectedBank)
      console.log('Company object:', company, 'Bank object:', bank)

      await taxService.createTax(createData)
      setSuccess(safeDictionary?.navigation?.taxCreatedSuccessfully || 'Tax created successfully')
      setTaxDialogOpen(false)
      setTaxDialogError('')
      setTaxFieldErrors({})
      setTaxForm({ name: '', description: [''], company: 0, bank: 0, accounting_account: '' })
      loadTaxes()
    } catch (err: any) {
      console.error('Error creating tax - Full error:', err)
      console.error('Error response:', err?.response)
      console.error('Error response data:', err?.response?.data)
      
      let errorMessage = safeDictionary?.navigation?.failedToCreateTax || 'Failed to create tax'
      const fieldErrors: { [key: string]: string } = {}
      
      // Check for original axios error structure first
      if (err?.response?.data) {
        const errorData = err.response.data
        console.error('Error data structure:', errorData)
        
        if (typeof errorData === 'string') {
          errorMessage = translateError(errorData)
        } else if (errorData.detail) {
          errorMessage = translateError(errorData.detail)
        } else if (errorData.message) {
          errorMessage = translateError(errorData.message)
        } else if (errorData.error) {
          errorMessage = translateError(errorData.error)
        } else if (Object.keys(errorData).length > 0) {
          // Handle validation errors - set field-specific errors
          const fieldTranslations: { [key: string]: string } = {
            'name': safeDictionary?.navigation?.taxName || safeDictionary?.navigation?.name || 'Nom',
            'description': safeDictionary?.navigation?.description || 'Description',
            'company': safeDictionary?.navigation?.company || 'Entreprise',
            'bank': safeDictionary?.navigation?.bank || 'Banque',
            'accounting_account': safeDictionary?.navigation?.accountingAccount || 'Compte comptable',
          }
          
          Object.entries(errorData).forEach(([field, messages]) => {
            const msg = Array.isArray(messages) ? messages.join(', ') : String(messages)
            const translatedMsg = translateError(msg, fieldTranslations)
            fieldErrors[field] = translatedMsg
          })
          
          // If there are field errors, don't show general error message
          if (Object.keys(fieldErrors).length > 0) {
            errorMessage = ''
          } else {
            const validationErrors = Object.entries(errorData)
              .map(([field, messages]) => {
                const translatedField = fieldTranslations[field] || field
                const msg = Array.isArray(messages) ? messages.join(', ') : String(messages)
                const translatedMsg = translateError(msg, fieldTranslations)
                return Object.keys(errorData).length > 1 ? `${translatedField}: ${translatedMsg}` : translatedMsg
              })
              .join('; ')
            
            const validationPrefix = lang === 'fr' 
              ? (safeDictionary?.navigation?.validationErrors || 'Erreurs de validation')
              : (safeDictionary?.navigation?.validationErrors || 'Validation errors')
            errorMessage = Object.keys(errorData).length > 1 ? `${validationPrefix}: ${validationErrors}` : validationErrors
          }
        }
      } 
      // Check for modified error from interceptor
      else if (err?.message) {
        errorMessage = translateError(err.message)
      }
      
      setTaxFieldErrors(fieldErrors)
      setTaxDialogError(errorMessage)
      console.error('Final error message:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTaxRule = async () => {
    if (!selectedCompany || !selectedBank) {
      setTaxRuleDialogError(safeDictionary?.navigation?.pleaseSelectCompanyAndBankFirst || 'Please select a company and bank first')
      return
    }

    // Validation
    if (!taxRuleForm.convention || taxRuleForm.convention === 0) {
      setTaxRuleDialogError(safeDictionary?.navigation?.conventionRequired || 'Convention is required')
      return
    }
    if (!taxRuleForm.payment_class || taxRuleForm.payment_class === '' || taxRuleForm.payment_class === 0) {
      setTaxRuleDialogError(safeDictionary?.navigation?.paymentClassRequired || 'Payment class is required')
      return
    }
    if (!taxRuleForm.payment_status || taxRuleForm.payment_status === 0) {
      setTaxRuleDialogError(safeDictionary?.navigation?.paymentStatusRequired || 'Payment status is required')
      return
    }
    if (!taxRuleForm.tax_type || !taxRuleForm.tax_type.trim()) {
      setTaxRuleDialogError(safeDictionary?.navigation?.taxTypeRequired || 'Tax type is required')
      return
    }
    if (taxRuleForm.calculation_type === 'formula' && (!taxRuleForm.formula || !taxRuleForm.formula.trim())) {
      setTaxRuleDialogError(safeDictionary?.navigation?.formulaRequired || 'Formula is required when calculation type is formula')
      return
    }
    if (taxRuleForm.calculation_type !== 'formula' && (taxRuleForm.rate === undefined || taxRuleForm.rate === null)) {
      setTaxRuleDialogError(safeDictionary?.navigation?.rateRequired || 'Rate is required when calculation type is not formula')
      return
    }

    try {
      setLoading(true)
      setTaxRuleDialogError('')
      setTaxRuleFieldErrors({})
      
      // Prepare data - payment_class is a code (string), payment_status is an ID (number)
      // Backend expects payment_class as code string and payment_status as ID number
      const createData: any = {
        convention: taxRuleForm.convention,
        payment_class: String(taxRuleForm.payment_class), // Send code as string
        payment_status: taxRuleForm.payment_status, // Send ID as number
        tax_type: taxRuleForm.tax_type,
        calculation_type: taxRuleForm.calculation_type
      }
      if (taxRuleForm.calculation_type !== 'formula') {
        createData.rate = taxRuleForm.rate
      }
      
      if (taxRuleForm.calculation_type === 'formula' && taxRuleForm.formula) {
        createData.formula = taxRuleForm.formula
      }
      
      console.log('Creating tax rule with data:', createData)
      console.log('Payment class (code):', taxRuleForm.payment_class)
      console.log('Payment status (ID):', taxRuleForm.payment_status)
      
      await taxRuleService.createTaxRule(createData)
      setSuccess(safeDictionary?.navigation?.taxRuleCreatedSuccessfully || 'Tax rule created successfully')
      setTaxRuleDialogOpen(false)
      setTaxRuleDialogError('')
      setTaxRuleFieldErrors({})
      setTaxRuleForm({ convention: 0, payment_class: '', payment_status: 0, tax_type: '', calculation_type: 'percentage', rate: 0, formula: '' })
      loadTaxRules()
    } catch (err: any) {
      console.error('Error creating tax rule - Full error:', err)
      console.error('Error response:', err?.response)
      console.error('Error response data:', err?.response?.data)
      
      let errorMessage = safeDictionary?.navigation?.failedToCreateTaxRule || 'Failed to create tax rule'
      const fieldErrors: { [key: string]: string } = {}
      
      // Check for original axios error structure first
      if (err?.response?.data) {
        const errorData = err.response.data
        console.error('Error data structure:', errorData)
        
        if (typeof errorData === 'string') {
          errorMessage = translateError(errorData)
        } else if (errorData.detail) {
          errorMessage = translateError(errorData.detail)
        } else if (errorData.message) {
          errorMessage = translateError(errorData.message)
        } else if (errorData.error) {
          errorMessage = translateError(errorData.error)
        } else if (Object.keys(errorData).length > 0) {
          // Handle validation errors - set field-specific errors
          const fieldTranslations: { [key: string]: string } = {
            'convention': safeDictionary?.navigation?.convention || 'Convention',
            'payment_class': safeDictionary?.navigation?.paymentClass || 'Classe de paiement',
            'payment_status': safeDictionary?.navigation?.paymentStatus || 'Statut de paiement',
            'tax_type': safeDictionary?.navigation?.taxType || 'Type de taxe',
            'calculation_type': safeDictionary?.navigation?.calculationType || 'Type de calcul',
            'rate': safeDictionary?.navigation?.rate || 'Taux',
            'formula': safeDictionary?.navigation?.formula || 'Formule',
          }
          
          Object.entries(errorData).forEach(([field, messages]) => {
            const msg = Array.isArray(messages) ? messages.join(', ') : String(messages)
            const translatedMsg = translateError(msg, fieldTranslations)
            fieldErrors[field] = translatedMsg
          })
          
          // If there are field errors, don't show general error message
          if (Object.keys(fieldErrors).length > 0) {
            errorMessage = ''
          } else {
            const validationErrors = Object.entries(errorData)
              .map(([field, messages]) => {
                const translatedField = fieldTranslations[field] || field
                const msg = Array.isArray(messages) ? messages.join(', ') : String(messages)
                const translatedMsg = translateError(msg, fieldTranslations)
                return Object.keys(errorData).length > 1 ? `${translatedField}: ${translatedMsg}` : translatedMsg
              })
              .join('; ')
            
            const validationPrefix = lang === 'fr' 
              ? (safeDictionary?.navigation?.validationErrors || 'Erreurs de validation')
              : (safeDictionary?.navigation?.validationErrors || 'Validation errors')
            errorMessage = Object.keys(errorData).length > 1 ? `${validationPrefix}: ${validationErrors}` : validationErrors
          }
        }
      } 
      // Check for modified error from interceptor
      else if (err?.message) {
        errorMessage = translateError(err.message)
      }
      
      setTaxRuleFieldErrors(fieldErrors)
      setTaxRuleDialogError(errorMessage)
      console.error('Final error message:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Update handlers
  const handleUpdateConvention = async (id: number, data: Partial<Convention>) => {
    try {
      setLoading(true)
      // Get the original convention to ensure we have all required fields
      const originalConvention = conventions.find(c => c.id === id)
      if (!originalConvention) {
        setError(safeDictionary?.navigation?.conventionNotFound || 'Convention not found')
        return
      }
      // Merge with original to ensure all required fields are present
      const updateData: UpdateConventionDto = {
        name: data.name ?? originalConvention.name,
        bank: data.bank ?? originalConvention.bank,
        company: data.company ?? originalConvention.company,
        is_active: data.is_active !== undefined ? data.is_active : originalConvention.is_active
      }
      await conventionService.updateConvention(id, updateData)
      setSuccess(safeDictionary?.navigation?.conventionUpdatedSuccessfully || 'Convention updated successfully')
      setEditingConventionId(null)
      setEditingConvention({})
      loadConventions()
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || safeDictionary?.navigation?.failedToUpdateConvention || 'Failed to update convention'
      setError(errorMessage)
      console.error('Error updating convention:', err)
      console.error('Error response data:', err?.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTax = async (id: number, data: Partial<Tax>) => {
    try {
      setLoading(true)
      // Get the original tax to ensure we have all required fields
      const originalTax = taxes.find(t => t.id === id)
      if (!originalTax) {
        setError(safeDictionary?.navigation?.taxNotFound || 'Tax not found')
        return
      }
      // Merge with original to ensure all required fields are present
      // Preserve exact spacing in all fields - don't normalize multiple spaces
      const updateData: UpdateTaxDto = {
        name: data.name !== undefined ? data.name : originalTax.name,
        description: data.description ?? originalTax.description,
        company: data.company ?? originalTax.company,
        bank: data.bank ?? originalTax.bank,
        accounting_account: data.accounting_account !== undefined ? data.accounting_account : originalTax.accounting_account
      }
      
      // Log the exact values being sent to help debug spacing issues
      console.log('Updating tax - name value:', JSON.stringify(updateData.name))
      console.log('Updating tax - name length:', updateData.name?.length)
      console.log('Updating tax - name char codes:', updateData.name?.split('').map(c => c.charCodeAt(0)))
      console.log('Updating tax - description values:', updateData.description?.map(d => JSON.stringify(d)))
      console.log('Updating tax - description char codes:', updateData.description?.map(d => d.split('').map(c => c.charCodeAt(0))))
      
      await taxService.updateTax(id, updateData)
      setSuccess(safeDictionary?.navigation?.taxUpdatedSuccessfully || 'Tax updated successfully')
      setEditingTaxId(null)
      setEditingTax({})
      loadTaxes()
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || safeDictionary?.navigation?.failedToUpdateTax || 'Failed to update tax'
      setError(errorMessage)
      console.error('Error updating tax:', err)
      console.error('Error response data:', err?.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTaxRule = async (id: number, data: Partial<TaxRule>) => {
    try {
      setLoading(true)
      // Get the original tax rule to ensure we have all required fields
      const originalTaxRule = taxRules.find(tr => tr.id === id)
      if (!originalTaxRule) {
        setError(safeDictionary?.navigation?.taxRuleNotFound || 'Tax rule not found')
        return
      }
      // Merge with original to ensure all required fields are present
      const updateData: UpdateTaxRuleDto = {
        convention: data.convention ?? originalTaxRule.convention,
        payment_class: data.payment_class !== undefined ? String(data.payment_class) : String(originalTaxRule.payment_class),
        payment_status: data.payment_status ?? originalTaxRule.payment_status,
        tax_type: data.tax_type ?? originalTaxRule.tax_type,
        calculation_type: data.calculation_type ?? originalTaxRule.calculation_type,
        rate: data.rate !== undefined ? data.rate : originalTaxRule.rate,
        formula: data.formula !== undefined ? data.formula : originalTaxRule.formula
      }
      await taxRuleService.updateTaxRule(id, updateData)
      setSuccess(safeDictionary?.navigation?.taxRuleUpdatedSuccessfully || 'Tax rule updated successfully')
      setEditingTaxRuleId(null)
      setEditingTaxRule({})
      loadTaxRules()
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || safeDictionary?.navigation?.failedToUpdateTaxRule || 'Failed to update tax rule'
      setError(errorMessage)
      console.error('Error updating tax rule:', err)
      console.error('Error response data:', err?.response?.data)
    } finally {
      setLoading(false)
    }
  }

  // Delete handlers
  const handleDeleteConvention = async (id: number) => {
    if (!window.confirm(safeDictionary?.navigation?.confirmDeleteConvention || 'Are you sure you want to delete this convention?')) {
      return
    }
    try {
      setLoading(true)
      await conventionService.deleteConvention(id)
      setSuccess(safeDictionary?.navigation?.conventionDeletedSuccessfully || 'Convention deleted successfully')
      loadConventions()
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || safeDictionary?.navigation?.failedToDeleteConvention || 'Failed to delete convention')
      console.error('Error deleting convention:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTax = async (id: number) => {
    if (!window.confirm(safeDictionary?.navigation?.confirmDeleteTax || 'Are you sure you want to delete this tax?')) {
      return
    }
    try {
      setLoading(true)
      await taxService.deleteTax(id)
      setSuccess(safeDictionary?.navigation?.taxDeletedSuccessfully || 'Tax deleted successfully')
      loadTaxes()
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || safeDictionary?.navigation?.failedToDeleteTax || 'Failed to delete tax')
      console.error('Error deleting tax:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTaxRule = async (id: number) => {
    if (!window.confirm(safeDictionary?.navigation?.confirmDeleteTaxRule || 'Are you sure you want to delete this tax rule?')) {
      return
    }
    try {
      setLoading(true)
      await taxRuleService.deleteTaxRule(id)
      setSuccess(safeDictionary?.navigation?.taxRuleDeletedSuccessfully || 'Tax rule deleted successfully')
      loadTaxRules()
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || safeDictionary?.navigation?.failedToDeleteTaxRule || 'Failed to delete tax rule')
      console.error('Error deleting tax rule:', err)
    } finally {
      setLoading(false)
    }
  }

  // Reset forms when dialogs open
  const openConventionDialog = () => {
    setConventionForm({ name: '', bank: 0, company: 0, is_active: true })
    setConventionDialogError('')
    setConventionDialogOpen(true)
  }

  const openTaxDialog = () => {
    setTaxForm({ name: '', description: [''], company: 0, bank: 0, accounting_account: '' })
    setTaxDialogError('')
    setTaxDialogOpen(true)
  }

  const openTaxRuleDialog = async () => {
    // Load conventions for the selected company/bank pair
    if (selectedCompany && selectedBank) {
      try {
        const companyParam = resolveQueryParam(selectedCompany, companies)
        const bankParam = resolveQueryParam(selectedBank, banks)
        const conventionsForPair = await conventionService.getConventions(companyParam, bankParam)
        setConventions(conventionsForPair)
        // Load payment classes for the selected bank
        try {
          const classes = await paymentClassService.getPaymentClassesByBank(bankParam)
          setPaymentClasses(classes)
        } catch (err) {
          console.error('Error loading payment classes for bank:', err)
          setPaymentClasses([])
        }
      } catch (err) {
        console.error('Error loading conventions for tax rule:', err)
      }
    }
    setTaxRuleForm({ convention: 0, payment_class: '', payment_status: 0, tax_type: '', calculation_type: 'percentage', rate: 0, formula: '' })
    // Clear statuses until a class is selected
    setPaymentStatuses([])
    setTaxRuleDialogError('')
    setTaxRuleDialogOpen(true)
  }

  // Column Helpers
  const conventionColumnHelper = createColumnHelper<Convention>()
  const taxColumnHelper = createColumnHelper<Tax>()
  const taxRuleColumnHelper = createColumnHelper<TaxRule>()
  const openingBalanceColumnHelper = createColumnHelper<any>()

  // Convention Columns
  const conventionColumns = useMemo(
    () => [
      conventionColumnHelper.accessor('name', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {safeDictionary?.navigation?.name || 'Name'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => {
          const row = info.row.original
          const isEditing = editingConventionId === row.id
          if (isEditing) {
            return (
              <CustomTextField
                size='small'
                value={editingConvention.name ?? row.name}
                onChange={e => setEditingConvention({ ...editingConvention, name: e.target.value })}
                sx={{ minWidth: 200 }}
              />
            )
          }
          return row.name
        },
        enableSorting: true
      }),
      conventionColumnHelper.accessor('is_active', {
        header: ({ column }) => (
          <Box style={{ fontWeight: 700 }}>
            {safeDictionary?.navigation?.status || 'Status'}
          </Box>
        ),
        cell: info => {
          const row = info.row.original
          const isEditing = editingConventionId === row.id
          if (isEditing) {
            return (
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <Select
                  value={editingConvention.is_active !== undefined ? editingConvention.is_active : row.is_active}
                  onChange={e => setEditingConvention({ ...editingConvention, is_active: e.target.value === 'true' })}
                >
                  <MenuItem value='true'>{safeDictionary?.navigation?.active || 'Active'}</MenuItem>
                  <MenuItem value='false'>{safeDictionary?.navigation?.inactive || 'Inactive'}</MenuItem>
                </Select>
              </FormControl>
            )
          }
          return (
            <Chip 
              label={row.is_active ? (safeDictionary?.navigation?.active || 'Active') : (safeDictionary?.navigation?.inactive || 'Inactive')} 
              color={row.is_active ? 'success' : 'error'} 
              size='small' 
            />
          )
        },
        enableSorting: true
      }),
      conventionColumnHelper.display({
        id: 'actions',
        header: safeDictionary?.navigation?.actions || 'Actions',
        cell: info => {
          const row = info.row.original
          const isEditing = editingConventionId === row.id
          
          if (isEditing) {
            return (
              <Box display='flex' gap={1}>
                <IconButton
                  size='small'
                  color='primary'
                  onClick={() => handleUpdateConvention(row.id, editingConvention)}
                  disabled={loading}
                >
                  <Check />
                </IconButton>
                <IconButton
                  size='small'
                  color='secondary'
                  onClick={() => {
                    setEditingConventionId(null)
                    setEditingConvention({})
                  }}
                  disabled={loading}
                >
                  <Close />
                </IconButton>
              </Box>
            )
          }
          
          return (
            <Box display='flex' gap={1}>
              <IconButton
                size='small'
                color='primary'
                onClick={() => {
                  setEditingConventionId(row.id)
                  setEditingConvention({ 
                    name: row.name, 
                    is_active: row.is_active,
                    bank: row.bank,
                    company: row.company
                  })
                }}
              >
                <Edit />
              </IconButton>
              <IconButton
                size='small'
                color='error'
                onClick={() => handleDeleteConvention(row.id)}
                disabled={loading}
              >
                <Delete />
              </IconButton>
            </Box>
          )
        }
      })
    ],
    [conventionColumnHelper, safeDictionary, editingConventionId, editingConvention, loading]
  )

  // Tax Columns
  const taxColumns = useMemo(
    () => [
      taxColumnHelper.accessor('name', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {safeDictionary?.navigation?.name || 'Name'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => {
          const row = info.row.original
          const isEditing = editingTaxId === row.id
          if (isEditing) {
            return (
              <Box onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                <CustomTextField
                  size='small'
                  value={editingTax.name ?? row.name}
                  onChange={e => setEditingTax({ ...editingTax, name: e.target.value })}
                  onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                  onFocus={e => e.stopPropagation()}
                  autoFocus
                  sx={{ minWidth: 200 }}
                />
              </Box>
            )
          }
          return row.name
        },
        enableSorting: true
      }),
      taxColumnHelper.accessor('accounting_account', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {safeDictionary?.navigation?.accountingAccount || 'Accounting Account'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => {
          const row = info.row.original
          const isEditing = editingTaxId === row.id
          if (isEditing) {
            return (
              <Box onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                <CustomTextField
                  size='small'
                  value={editingTax.accounting_account ?? row.accounting_account ?? ''}
                  onChange={e => setEditingTax({ ...editingTax, accounting_account: e.target.value })}
                  onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                  onFocus={e => e.stopPropagation()}
                  sx={{ minWidth: 150 }}
                />
              </Box>
            )
          }
          return row.accounting_account || '-'
        },
        enableSorting: true
      }),
      taxColumnHelper.accessor('description', {
        header: ({ column }) => (
          <Box style={{ fontWeight: 700 }}>
            {safeDictionary?.navigation?.description || 'Description'}
          </Box>
        ),
        cell: info => {
          const row = info.row.original
          const isEditing = editingTaxId === row.id
          if (isEditing) {
            return (
              <Box onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                {(editingTax.description ?? row.description).map((desc, index) => (
                  <Box key={index} display='flex' gap={1} mb={1} onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                    <CustomTextField
                      size='small'
                      value={desc}
                      onChange={e => {
                        const newDesc = [...(editingTax.description ?? row.description)]
                        newDesc[index] = e.target.value
                        setEditingTax({ ...editingTax, description: newDesc })
                      }}
                      onClick={e => e.stopPropagation()}
                      onMouseDown={e => e.stopPropagation()}
                      onFocus={e => e.stopPropagation()}
                      sx={{ minWidth: 200 }}
                    />
                    {(editingTax.description ?? row.description).length > 1 && (
                      <IconButton
                        size='small'
                        onClick={() => {
                          const newDesc = [...(editingTax.description ?? row.description)]
                          newDesc.splice(index, 1)
                          setEditingTax({ ...editingTax, description: newDesc })
                        }}
                      >
                        <Delete fontSize='small' />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  size='small'
                  startIcon={<Add />}
                  onClick={() => {
                    const newDesc = [...(editingTax.description ?? row.description), '']
                    setEditingTax({ ...editingTax, description: newDesc })
                  }}
                >
                  {safeDictionary?.navigation?.addDescription || 'Add Description'}
                </Button>
              </Box>
            )
          }
          const descriptions = info.getValue()
          // Helper function to preserve multiple spaces in display
          const preserveSpaces = (text: string) => {
            // Replace multiple consecutive spaces with non-breaking spaces
            // This preserves the visual appearance of multiple spaces
            return text.replace(/  +/g, (match) => '\u00A0'.repeat(match.length))
          }
          return (
            <Box>
              {descriptions.map((desc, index) => (
                <Chip 
                  key={index} 
                  label={preserveSpaces(desc)} 
                  size='small' 
                  className='mr-1 mb-1' 
                />
              ))}
            </Box>
          )
        },
        enableSorting: false
      }),
      taxColumnHelper.display({
        id: 'actions',
        header: safeDictionary?.navigation?.actions || 'Actions',
        cell: info => {
          const row = info.row.original
          const isEditing = editingTaxId === row.id
          
          if (isEditing) {
            return (
              <Box display='flex' gap={1}>
                <IconButton
                  size='small'
                  color='primary'
                  onClick={() => handleUpdateTax(row.id, editingTax)}
                  disabled={loading}
                >
                  <Check />
                </IconButton>
                <IconButton
                  size='small'
                  color='secondary'
                  onClick={() => {
                    setEditingTaxId(null)
                    setEditingTax({})
                  }}
                  disabled={loading}
                >
                  <Close />
                </IconButton>
              </Box>
            )
          }
          
          return (
            <Box display='flex' gap={1}>
              <IconButton
                size='small'
                color='primary'
                onClick={() => {
                  setEditingTaxId(row.id)
                  setEditingTax({ 
                    name: row.name, 
                    description: [...row.description],
                    company: row.company,
                    bank: row.bank,
                    accounting_account: row.accounting_account
                  })
                }}
              >
                <Edit />
              </IconButton>
              <IconButton
                size='small'
                color='error'
                onClick={() => handleDeleteTax(row.id)}
                disabled={loading}
              >
                <Delete />
              </IconButton>
            </Box>
          )
        }
      })
    ],
    [taxColumnHelper, safeDictionary, editingTaxId, editingTax, loading]
  )

  // Tax Rule Columns
  const taxRuleColumns = useMemo(
    () => [
      taxRuleColumnHelper.accessor('tax_type', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
{safeDictionary?.navigation?.taxType || 'Tax Type'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => {
          const row = info.row.original
          const isEditing = editingTaxRuleId === row.id
          if (isEditing) {
            return (
              <Box onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                <CustomTextField
                  size='small'
                  value={editingTaxRule.tax_type ?? row.tax_type}
                  onChange={e => setEditingTaxRule({ ...editingTaxRule, tax_type: e.target.value })}
                  onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                  onFocus={e => e.stopPropagation()}
                  autoFocus
                  sx={{ minWidth: 150 }}
                />
              </Box>
            )
          }
          return <Chip label={row.tax_type} color='primary' size='small' />
        },
        enableSorting: true
      }),
      taxRuleColumnHelper.accessor('calculation_type', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
{safeDictionary?.navigation?.calculationType || 'Calculation Type'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => {
          const row = info.row.original
          const isEditing = editingTaxRuleId === row.id
          const value = info.getValue() as string
          
          if (isEditing) {
            return (
              <Box onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                <FormControl size='small' sx={{ minWidth: 150 }}>
                  <Select
                    value={editingTaxRule.calculation_type ?? row.calculation_type}
                    onChange={e => {
                      const newType = e.target.value as 'percentage' | 'flat' | 'formula'
                      const updated: Partial<TaxRule> = { calculation_type: newType }
                      // Clear the opposite field when changing type
                      if (newType === 'formula') {
                        updated.rate = 0
                        // Keep formula if it exists
                      } else {
                        updated.formula = ''
                        // Keep rate if it exists
                      }
                      setEditingTaxRule({ ...editingTaxRule, ...updated })
                    }}
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <MenuItem value='percentage'>{safeDictionary?.navigation?.percentage || 'Percentage'}</MenuItem>
                    <MenuItem value='flat'>{safeDictionary?.navigation?.flat || 'Flat'}</MenuItem>
                    <MenuItem value='formula'>{safeDictionary?.navigation?.formula || 'Formula'}</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )
          }
          
          let translatedValue = value
          if (value === 'percentage') {
            translatedValue = safeDictionary?.navigation?.percentage || 'Percentage'
          } else if (value === 'flat') {
            translatedValue = safeDictionary?.navigation?.flat || 'Flat'
          } else if (value === 'formula') {
            translatedValue = safeDictionary?.navigation?.formula || 'Formula'
          }
          return <Chip label={translatedValue} color='default' size='small' />
        },
        enableSorting: true
      }),
      taxRuleColumnHelper.accessor('rate', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
{safeDictionary?.navigation?.rate || 'Rate'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => {
          const row = info.row.original
          const isEditing = editingTaxRuleId === row.id
          const calcType = editingTaxRule.calculation_type ?? row.calculation_type
          
          if (isEditing && calcType !== 'formula') {
            return (
              <Box onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                <CustomTextField
                  size='small'
                  type='number'
                  value={editingTaxRule.rate !== undefined ? editingTaxRule.rate : row.rate}
                  onChange={e => setEditingTaxRule({ ...editingTaxRule, rate: parseFloat(e.target.value) || 0 })}
                  onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                  onFocus={e => e.stopPropagation()}
                  sx={{ minWidth: 100 }}
                />
              </Box>
            )
          }
          // Show rate value only if not formula type
          if (calcType !== 'formula') {
            return `${row.rate}`
          }
          return '-' // Show dash when formula type (rate not applicable)
        },
        enableSorting: true
      }),
      taxRuleColumnHelper.accessor('formula', {
        header: safeDictionary?.navigation?.formula || 'Formula',
        cell: info => {
          const row = info.row.original
          const isEditing = editingTaxRuleId === row.id
          const calcType = editingTaxRule.calculation_type ?? row.calculation_type
          
          if (isEditing && calcType === 'formula') {
            return (
              <Box onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                <CustomTextField
                  size='small'
                  value={editingTaxRule.formula !== undefined ? editingTaxRule.formula : (row.formula || '')}
                  onChange={e => setEditingTaxRule({ ...editingTaxRule, formula: e.target.value })}
                  onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                  onFocus={e => e.stopPropagation()}
                  sx={{ minWidth: 200 }}
                />
              </Box>
            )
          }
          // Show formula value only if formula type
          if (calcType === 'formula') {
            return row.formula || ''
          }
          return '-' // Show dash when not formula type (formula not applicable)
        },
        enableSorting: false
      }),
      taxRuleColumnHelper.accessor('payment_class', {
        header: safeDictionary?.navigation?.paymentClass || 'Payment Class',
        cell: info => {
          const row = info.row.original
          const isEditing = editingTaxRuleId === row.id
          const codeOrId = info.getValue() as unknown as string | number
          
          if (isEditing) {
            // Get payment classes for the selected bank
            const bankPaymentClasses = paymentClasses.filter(pc => {
              // Filter by selected bank if available
              return true // Show all for now, can be filtered by bank if needed
            })
            
            return (
              <Box onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                <FormControl size='small' sx={{ minWidth: 150 }}>
                  <Select
                    value={editingTaxRule.payment_class !== undefined ? String(editingTaxRule.payment_class) : String(codeOrId)}
                    onChange={async e => {
                      const code = String(e.target.value || '')
                      setEditingTaxRule({ ...editingTaxRule, payment_class: code, payment_status: 0 })
                      // Load payment statuses for selected class
                      try {
                        const statuses = await paymentStatusService.getPaymentStatusesByClass(code)
                        const filtered = statuses.filter(s => s.payment_class === code)
                        setPaymentStatuses(filtered)
                      } catch (err) {
                        console.error('Error loading payment statuses for class:', code, err)
                      }
                    }}
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                  >
                    {bankPaymentClasses.map(pc => (
                      <MenuItem key={pc.code} value={pc.code}>
                        {pc.name || pc.code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )
          }
          
          const cls = paymentClasses.find(c => c.code === String(codeOrId))
          return cls?.name || String(codeOrId)
        },
        enableSorting: true
      }),
      taxRuleColumnHelper.accessor('payment_status', {
        header: safeDictionary?.navigation?.paymentStatus || 'Payment Status',
        cell: info => {
          const row = info.row.original
          const isEditing = editingTaxRuleId === row.id
          const id = info.getValue()
          
          if (isEditing) {
            // Get payment statuses for the selected payment class
            const paymentClassCode = String(editingTaxRule.payment_class ?? row.payment_class)
            const availableStatuses = paymentStatuses.filter(ps => ps.payment_class === paymentClassCode)
            
            // If no statuses found for the class, show all bank payment statuses
            const statusesToShow = availableStatuses.length > 0 ? availableStatuses : bankPaymentStatuses
            
            return (
              <Box onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                <FormControl size='small' sx={{ minWidth: 150 }}>
                  <Select
                    value={editingTaxRule.payment_status !== undefined ? editingTaxRule.payment_status : id}
                    onChange={e => setEditingTaxRule({ ...editingTaxRule, payment_status: Number(e.target.value) })}
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                  >
                    {statusesToShow.map(ps => (
                      <MenuItem key={ps.id} value={ps.id}>
                        {ps.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )
          }
          
          const status =
            paymentStatuses.find(s => s.id === id) ||
            bankPaymentStatuses.find(s => s.id === id) ||
            allBankPaymentStatuses.find(s => s.id === id)
          return status?.name || String(id)
        },
        enableSorting: true
      }),
      taxRuleColumnHelper.display({
        id: 'actions',
        header: safeDictionary?.navigation?.actions || 'Actions',
        cell: info => {
          const row = info.row.original
          const isEditing = editingTaxRuleId === row.id
          
          if (isEditing) {
            return (
              <Box display='flex' gap={1}>
                <IconButton
                  size='small'
                  color='primary'
                  onClick={() => handleUpdateTaxRule(row.id, editingTaxRule)}
                  disabled={loading}
                >
                  <Check />
                </IconButton>
                <IconButton
                  size='small'
                  color='secondary'
                  onClick={() => {
                    setEditingTaxRuleId(null)
                    setEditingTaxRule({})
                  }}
                  disabled={loading}
                >
                  <Close />
                </IconButton>
              </Box>
            )
          }
          
          return (
            <Box display='flex' gap={1}>
              <IconButton
                size='small'
                color='primary'
                onClick={async () => {
                  setEditingTaxRuleId(row.id)
                  setEditingTaxRule({
                    convention: row.convention,
                    tax_type: row.tax_type,
                    calculation_type: row.calculation_type,
                    rate: row.rate,
                    formula: row.formula,
                    payment_class: row.payment_class,
                    payment_status: row.payment_status
                  })
                  // Load payment statuses for the selected payment class
                  try {
                    const paymentClassCode = String(row.payment_class)
                    const statuses = await paymentStatusService.getPaymentStatusesByClass(paymentClassCode)
                    const filtered = statuses.filter(s => s.payment_class === paymentClassCode)
                    setPaymentStatuses(filtered)
                  } catch (err) {
                    console.error('Error loading payment statuses for class:', row.payment_class, err)
                  }
                }}
              >
                <Edit />
              </IconButton>
              <IconButton
                size='small'
                color='error'
                onClick={() => handleDeleteTaxRule(row.id)}
                disabled={loading}
              >
                <Delete />
              </IconButton>
            </Box>
          )
        }
      })
    ],
    [taxRuleColumnHelper, paymentStatuses, paymentClasses, bankPaymentStatuses, safeDictionary, editingTaxRuleId, editingTaxRule, loading]
  )

  // Opening Balance Columns
  const openingBalanceColumns = useMemo(
    () => [
      openingBalanceColumnHelper.accessor('name', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {safeDictionary?.navigation?.name || 'Name'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => {
          const row = info.row.original
          const isEditing = editingOpeningBalanceId === row.id
          if (isEditing) {
            return (
              <CustomTextField
                size='small'
                value={editingOpeningBalance.name ?? row.name ?? ''}
                onChange={e => setEditingOpeningBalance({ ...editingOpeningBalance, name: e.target.value })}
                sx={{ minWidth: 200 }}
              />
            )
          }
          return row.name || '-'
        },
        enableSorting: true
      }),
      openingBalanceColumnHelper.accessor('amount', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {safeDictionary?.navigation?.amount || 'Amount'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => {
          const row = info.row.original
          const isEditing = editingOpeningBalanceId === row.id
          if (isEditing) {
            return (
              <CustomTextField
                size='small'
                type='number'
                value={editingOpeningBalance.amount !== undefined ? editingOpeningBalance.amount : row.amount ?? 0}
                onChange={e => setEditingOpeningBalance({ ...editingOpeningBalance, amount: parseFloat(e.target.value) || 0 })}
                sx={{ minWidth: 150 }}
              />
            )
          }
          return row.amount ? `${row.amount}` : '0'
        },
        enableSorting: true
      }),
      openingBalanceColumnHelper.accessor('description', {
        header: ({ column }) => (
          <Box style={{ fontWeight: 700 }}>
            {safeDictionary?.navigation?.description || 'Description'}
          </Box>
        ),
        cell: info => {
          const row = info.row.original
          const isEditing = editingOpeningBalanceId === row.id
          if (isEditing) {
            return (
              <CustomTextField
                size='small'
                value={editingOpeningBalance.description ?? row.description ?? ''}
                onChange={e => setEditingOpeningBalance({ ...editingOpeningBalance, description: e.target.value })}
                sx={{ minWidth: 200 }}
              />
            )
          }
          return row.description || '-'
        },
        enableSorting: false
      }),
      openingBalanceColumnHelper.display({
        id: 'actions',
        header: safeDictionary?.navigation?.actions || 'Actions',
        cell: info => {
          const row = info.row.original
          const isEditing = editingOpeningBalanceId === row.id
          
          if (isEditing) {
            return (
              <Box display='flex' gap={1}>
                <IconButton
                  size='small'
                  color='primary'
                  onClick={() => {
                    // TODO: Implement update handler when service is available
                    setEditingOpeningBalanceId(null)
                    setEditingOpeningBalance({})
                  }}
                  disabled={loading}
                >
                  <Check />
                </IconButton>
                <IconButton
                  size='small'
                  color='secondary'
                  onClick={() => {
                    setEditingOpeningBalanceId(null)
                    setEditingOpeningBalance({})
                  }}
                  disabled={loading}
                >
                  <Close />
                </IconButton>
              </Box>
            )
          }
          
          return (
            <Box display='flex' gap={1}>
              <IconButton
                size='small'
                color='primary'
                onClick={() => {
                  setEditingOpeningBalanceId(row.id)
                  setEditingOpeningBalance({ 
                    name: row.name,
                    amount: row.amount,
                    description: row.description
                  })
                }}
              >
                <Edit />
              </IconButton>
              <IconButton
                size='small'
                color='error'
                onClick={() => {
                  if (window.confirm(safeDictionary?.navigation?.confirmDeleteOpeningBalance || 'Are you sure you want to delete this opening balance?')) {
                    // TODO: Implement delete handler when service is available
                  }
                }}
                disabled={loading}
              >
                <Delete />
              </IconButton>
            </Box>
          )
        }
      })
    ],
    [openingBalanceColumnHelper, safeDictionary, editingOpeningBalanceId, editingOpeningBalance, loading]
  )

  // React Tables
  const conventionTable = useReactTable({
    data: conventions,
    columns: conventionColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: conventionSearch,
      sorting: conventionSorting
    },
    onGlobalFilterChange: setConventionSearch,
    onSortingChange: setConventionSorting,
    filterFns: {
      fuzzy: () => false
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  const taxTable = useReactTable({
    data: taxes,
    columns: taxColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: taxSearch,
      sorting: taxSorting
    },
    onGlobalFilterChange: setTaxSearch,
    onSortingChange: setTaxSorting,
    filterFns: {
      fuzzy: () => false
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  // Filter tax rules by payment status name
  const filteredTaxRules = useMemo(() => {
    if (!taxRulePaymentStatusFilter || taxRulePaymentStatusFilter === '') {
      return taxRules
    }
    const filterId = typeof taxRulePaymentStatusFilter === 'string' ? Number(taxRulePaymentStatusFilter) : taxRulePaymentStatusFilter
    // Find the selected payment status to get its name
    const selectedStatus = bankPaymentStatuses.find(s => s.id === filterId)
    if (!selectedStatus) {
      return taxRules
    }
    // Find all payment status IDs that have the same name (case-insensitive)
    const statusName = selectedStatus.name.toLowerCase().trim()
    const matchingStatusIds = allBankPaymentStatuses
      .filter(s => s.name.toLowerCase().trim() === statusName)
      .map(s => s.id)
    // Filter tax rules that match any of the payment status IDs with this name
    return taxRules.filter(rule => matchingStatusIds.includes(Number(rule.payment_status)))
  }, [taxRules, taxRulePaymentStatusFilter, bankPaymentStatuses, allBankPaymentStatuses])

  const taxRuleTable = useReactTable({
    data: filteredTaxRules,
    columns: taxRuleColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: taxRuleSearch,
      sorting: taxRuleSorting
    },
    onGlobalFilterChange: setTaxRuleSearch,
    onSortingChange: setTaxRuleSorting,
    filterFns: {
      fuzzy: () => false
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  const openingBalanceTable = useReactTable({
    data: openingBalances,
    columns: openingBalanceColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: openingBalanceSearch,
      sorting: openingBalanceSorting
    },
    onGlobalFilterChange: setOpeningBalanceSearch,
    onSortingChange: setOpeningBalanceSorting,
    filterFns: {
      fuzzy: () => false
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  if (dictionaryLoading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Grid>
      </Grid>
    )
  }


  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mb-4'>
          {safeDictionary?.navigation?.conventionParameters || 'Convention Parameters'}
        </Typography>
        <Typography color='text.secondary' className='mb-6'>
          {safeDictionary?.navigation?.conventionParametersDescription || 'Manage convention parameters, taxes, and tax rules'}
        </Typography>

        {error && (
          <Alert severity='error' className='mb-4' onClose={() => setError('')}>
            {error}
          </Alert>
        )}

         {success && (
           <Alert severity='success' className='mb-4' onClose={() => setSuccess('')}>
             {success}
           </Alert>
         )}

         

         {/* Selection Card */}
        <Card className='mb-6'>
          <CardHeader title={safeDictionary?.navigation?.selectCompanyAndBank || 'Select Company and Bank'} />
          <Box sx={{ p: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" key={`company-${companies.length}`}>
                  <InputLabel 
                    id="company-select-label" 
                    shrink
                    sx={{ 
                      pr: 2, // Add padding-right for label space
                      '&.MuiInputLabel-shrink': {
                        pr: 1 // Less padding when shrunk
                      }
                    }}
                  >
                    {safeDictionary?.navigation?.company || 'Company'}
                  </InputLabel>
                  <Select
                    labelId="company-select-label"
                    value={selectedCompany}
                    label={safeDictionary?.navigation?.company || 'Company'}
                    onChange={e => {
                      const value = e.target.value
                      console.log('Company selected:', value, 'Type:', typeof value)
                      setSelectedCompany(value as string)
                    }}
                    displayEmpty
                    disabled={loadingSelectors || companies.length === 0}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          zIndex: 9999
                        }
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>{loadingSelectors ? (safeDictionary?.navigation?.loadingCompanies || 'Loading companies...') : companies.length === 0 ? (safeDictionary?.navigation?.noCompaniesFound || 'No companies found') : (safeDictionary?.navigation?.selectCompany || 'Select a company')}</em>
                    </MenuItem>
                    {companies.map(company => (
                      <MenuItem key={company.code} value={company.code}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" key={`bank-${banks.length}`}>
                  <InputLabel 
                    id="bank-select-label" 
                    shrink
                    sx={{ 
                      pr: 2, // Add padding-right for label space
                      '&.MuiInputLabel-shrink': {
                        pr: 1 // Less padding when shrunk
                      }
                    }}
                  >
                    {safeDictionary?.navigation?.bank || 'Bank'}
                  </InputLabel>
                  <Select
                    labelId="bank-select-label"
                    value={selectedBank}
                    label={safeDictionary?.navigation?.bank || 'Bank'}
                    onChange={e => {
                      const value = e.target.value
                      console.log('Bank selected:', value, 'Type:', typeof value)
                      setSelectedBank(value as string)
                    }}
                    displayEmpty
                    disabled={loadingSelectors || banks.length === 0}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          zIndex: 9999
                        }
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>{loadingSelectors ? (safeDictionary?.navigation?.loadingBanks || 'Loading banks...') : banks.length === 0 ? (safeDictionary?.navigation?.noBanksFound || 'No banks found') : (safeDictionary?.navigation?.selectBank || 'Select a bank')}</em>
                    </MenuItem>
                    {banks.map(bank => (
                      <MenuItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Data Tables Card */}
        {selectedCompany && selectedBank && (
          <Card>
            <CardHeader
              title={safeDictionary?.navigation?.conventionParametersData || 'Convention Parameters Data'}
              action={
                <Box>
                  <Button
                    variant='contained'
                    startIcon={<Add />}
                    onClick={openConventionDialog}
                    className='mr-2'
                  >
{safeDictionary?.navigation?.addConvention || 'Add Convention'}
                  </Button>
                  <Button
                    variant='contained'
                    startIcon={<Add />}
                    onClick={openTaxDialog}
                    className='mr-2'
                  >
                    {safeDictionary?.navigation?.addTax || 'Add Tax'}
                  </Button>
                  <Button
                    variant='contained'
                    startIcon={<Add />}
                    onClick={openTaxRuleDialog}
                    className='mr-2'
                  >
{safeDictionary?.navigation?.addTaxRule || 'Add Tax Rule'}
                  </Button>
                </Box>
              }
            />
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label={safeDictionary?.navigation?.conventions || 'Conventions'} />
                <Tab label={safeDictionary?.navigation?.taxes || 'Taxes'} />
                <Tab label={safeDictionary?.navigation?.taxRules || 'Tax Rules'} />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box className='mb-4'>
                <CustomTextField
                  fullWidth
                  placeholder={safeDictionary?.navigation?.searchConventions || 'Search conventions...'}
                  value={conventionSearch}
                  onChange={e => setConventionSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              {loading ? (
                <Box display='flex' justifyContent='center' p={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <div className='overflow-x-auto'>
                    <table className={styles.table}>
                      <thead>
                        {conventionTable.getHeaderGroups().map(headerGroup => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                              <th
                                key={header.id}
                                style={{
                                  cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                  userSelect: 'none'
                                }}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {conventionTable.getRowModel().rows.map(row => (
                          <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <TablePaginationComponent table={conventionTable as any} dictionary={safeDictionary} />
                </>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box className='mb-4'>
                <CustomTextField
                  fullWidth
                  placeholder={safeDictionary?.navigation?.searchTaxes || 'Search taxes...'}
                  value={taxSearch}
                  onChange={e => setTaxSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              {loading ? (
                <Box display='flex' justifyContent='center' p={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <div className='overflow-x-auto'>
                    <table className={styles.table}>
                      <thead>
                        {taxTable.getHeaderGroups().map(headerGroup => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                              <th
                                key={header.id}
                                style={{
                                  cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                  userSelect: 'none'
                                }}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {taxTable.getRowModel().rows.map(row => (
                          <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                              <td 
                                key={cell.id}
                                onClick={e => {
                                  // Don't stop propagation for action cells, allow clicks on inputs
                                  const isActionCell = cell.column.id === 'actions'
                                  const isEditing = editingTaxId === row.original.id
                                  if (!isActionCell && !isEditing) {
                                    // Allow row clicks only when not editing
                                  }
                                }}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <TablePaginationComponent table={taxTable as any} dictionary={safeDictionary} />
                </>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box className='mb-4' sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <CustomTextField
                  sx={{ flex: 1 }}
                  placeholder={safeDictionary?.navigation?.searchTaxRules || 'Search tax rules...'}
                  value={taxRuleSearch}
                  onChange={e => setTaxRuleSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
                <FormControl sx={{ minWidth: 300 }} variant="outlined">
                  <InputLabel 
                    id="payment-status-filter-label"
                    shrink
                  >
                    {safeDictionary?.navigation?.paymentStatus || 'Payment Status'}
                  </InputLabel>
                  <Select
                    labelId="payment-status-filter-label"
                    value={taxRulePaymentStatusFilter}
                    onChange={e => setTaxRulePaymentStatusFilter(e.target.value === '' ? '' : Number(e.target.value))}
                    label={safeDictionary?.navigation?.paymentStatus || 'Payment Status'}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>{safeDictionary?.navigation?.allPaymentStatuses || 'All Payment Statuses'}</em>
                    </MenuItem>
                    {bankPaymentStatuses.map(status => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {loading ? (
                <Box display='flex' justifyContent='center' p={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <div className='overflow-x-auto'>
                    <table className={styles.table}>
                      <thead>
                        {taxRuleTable.getHeaderGroups().map(headerGroup => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                              <th
                                key={header.id}
                                style={{
                                  cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                  userSelect: 'none'
                                }}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {taxRuleTable.getRowModel().rows.map(row => (
                          <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                              <td 
                                key={cell.id}
                                onClick={e => {
                                  // Don't stop propagation for action cells, allow clicks on inputs
                                  const isActionCell = cell.column.id === 'actions'
                                  const isEditing = editingTaxRuleId === row.original.id
                                  if (!isActionCell && !isEditing) {
                                    // Allow row clicks only when not editing
                                  }
                                }}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <TablePaginationComponent table={taxRuleTable as any} dictionary={safeDictionary} />
                </>
              )}
            </TabPanel>
          </Card>
        )}

        {/* Convention Dialog */}
        <Dialog
          fullWidth
          open={conventionDialogOpen}
          onClose={() => {
            setConventionDialogOpen(false)
            setConventionDialogError('')
            setConventionFieldErrors({})
          }}
          maxWidth='sm'
          scroll='body'
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
          <DialogCloseButton onClick={() => setConventionDialogOpen(false)} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
          <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
            {safeDictionary?.navigation?.addConvention || 'Add Convention'}
            <Typography component='span' className='flex flex-col text-center'>
              {safeDictionary?.navigation?.addNewConventionToSystem || 'Add a new convention to the system'}
            </Typography>
          </DialogTitle>
          <form onSubmit={e => { e.preventDefault(); handleCreateConvention() }}>
            <DialogContent className='pbs-0 sm:pli-16'>
              <Box className='flex flex-col gap-6'>
                {conventionDialogError && (
                  <Alert severity='error' onClose={() => setConventionDialogError('')}>
                    {conventionDialogError}
                  </Alert>
                )}
                <CustomTextField
                  fullWidth
                  required
                  label={safeDictionary?.navigation?.name || 'Name'}
                  value={conventionForm.name}
                  onChange={e => {
                    setConventionForm({ ...conventionForm, name: e.target.value })
                    if (conventionFieldErrors.name) {
                      setConventionFieldErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.name
                        return newErrors
                      })
                    }
                  }}
                  error={!!conventionFieldErrors.name}
                  helperText={conventionFieldErrors.name}
                />
                <FormControl fullWidth error={!!conventionFieldErrors.is_active}>
                  <InputLabel>{safeDictionary?.navigation?.isActive || 'Is Active'}</InputLabel>
                  <Select
                    value={conventionForm.is_active ? 'true' : 'false'}
                    onChange={e => {
                      setConventionForm({ ...conventionForm, is_active: e.target.value === 'true' })
                      if (conventionFieldErrors.is_active) {
                        setConventionFieldErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.is_active
                          return newErrors
                        })
                      }
                    }}
                    label={safeDictionary?.navigation?.isActive || 'Is Active'}
                  >
                    <MenuItem value='true'>{safeDictionary?.navigation?.active || 'Active'}</MenuItem>
                    <MenuItem value='false'>{safeDictionary?.navigation?.inactive || 'Inactive'}</MenuItem>
                  </Select>
                  {conventionFieldErrors.is_active && (
                    <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                      {conventionFieldErrors.is_active}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16 gap-4'>
              <Button variant='outlined' color='secondary' onClick={() => setConventionDialogOpen(false)}>
                {safeDictionary?.navigation?.cancel || 'Cancel'}
              </Button>
              <Button type='submit' variant='contained' disabled={loading}>
                {safeDictionary?.navigation?.create || 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Tax Dialog */}
        <Dialog
          fullWidth
          open={taxDialogOpen}
          onClose={() => {
            setTaxDialogOpen(false)
            setTaxDialogError('')
            setTaxFieldErrors({})
          }}
          maxWidth='sm'
          scroll='body'
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
          <DialogCloseButton onClick={() => setTaxDialogOpen(false)} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
          <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
            {safeDictionary?.navigation?.addTax || 'Add Tax'}
            <Typography component='span' className='flex flex-col text-center'>
              {safeDictionary?.navigation?.addNewTaxToSystem || 'Add a new tax to the system'}
            </Typography>
          </DialogTitle>
          <form onSubmit={e => { e.preventDefault(); handleCreateTax() }}>
            <DialogContent className='pbs-0 sm:pli-16'>
              <Box className='flex flex-col gap-6'>
                {taxDialogError && (
                  <Alert severity='error' onClose={() => setTaxDialogError('')}>
                    {taxDialogError}
                  </Alert>
                )}
                <CustomTextField
                  fullWidth
                  required
                  label={safeDictionary?.navigation?.name || 'Name'}
                  value={taxForm.name}
                  onChange={e => {
                    setTaxForm({ ...taxForm, name: e.target.value })
                    if (taxFieldErrors.name) {
                      setTaxFieldErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.name
                        return newErrors
                      })
                    }
                  }}
                  error={!!taxFieldErrors.name}
                  helperText={taxFieldErrors.name}
                />
                <CustomTextField
                  fullWidth
                  label={safeDictionary?.navigation?.accountingAccount || 'Accounting Account'}
                  value={taxForm.accounting_account || ''}
                  onChange={e => {
                    setTaxForm({ ...taxForm, accounting_account: e.target.value })
                    if (taxFieldErrors.accounting_account) {
                      setTaxFieldErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.accounting_account
                        return newErrors
                      })
                    }
                  }}
                  error={!!taxFieldErrors.accounting_account}
                  helperText={taxFieldErrors.accounting_account}
                />
                <Box>
                  <Typography variant='body2' className='mb-2'>
                    {safeDictionary?.navigation?.description || 'Description'}
                  </Typography>
                  {taxForm.description.map((desc, index) => (
                    <Box key={index} className='flex gap-2 mb-2'>
                      <CustomTextField
                        fullWidth
                        value={desc}
                        onChange={e => {
                          const newDescriptions = [...taxForm.description]
                          newDescriptions[index] = e.target.value
                          setTaxForm({ ...taxForm, description: newDescriptions })
                          if (taxFieldErrors.description) {
                            setTaxFieldErrors(prev => {
                              const newErrors = { ...prev }
                              delete newErrors.description
                              return newErrors
                            })
                          }
                        }}
                        placeholder={`${safeDictionary?.navigation?.description || 'Description'} ${index + 1}`}
                        error={!!taxFieldErrors.description && index === 0}
                        helperText={taxFieldErrors.description && index === 0 ? taxFieldErrors.description : ''}
                      />
                      {taxForm.description.length > 1 && (
                        <Button
                          variant='outlined'
                          color='error'
                          onClick={() => {
                            const newDescriptions = taxForm.description.filter((_, i) => i !== index)
                            setTaxForm({ ...taxForm, description: newDescriptions })
                          }}
                        >
                          <Delete />
                        </Button>
                      )}
                    </Box>
                  ))}
                  <Button
                    variant='outlined'
                    startIcon={<Add />}
                    onClick={() => setTaxForm({ ...taxForm, description: [...taxForm.description, ''] })}
                    className='mt-2'
                  >
                    {safeDictionary?.navigation?.addDescription || 'Add Description'}
                  </Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16 gap-4'>
              <Button variant='outlined' color='secondary' onClick={() => setTaxDialogOpen(false)}>
                {safeDictionary?.navigation?.cancel || 'Cancel'}
              </Button>
              <Button type='submit' variant='contained' disabled={loading}>
                {safeDictionary?.navigation?.create || 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Tax Rule Dialog */}
        <Dialog
          fullWidth
          open={taxRuleDialogOpen}
          onClose={() => {
            setTaxRuleDialogOpen(false)
            setTaxRuleDialogError('')
            setTaxRuleFieldErrors({})
          }}
          maxWidth='md'
          scroll='body'
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
          <DialogCloseButton onClick={() => setTaxRuleDialogOpen(false)} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
          <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
            {safeDictionary?.navigation?.addTaxRule || 'Add Tax Rule'}
            <Typography component='span' className='flex flex-col text-center'>
              {safeDictionary?.navigation?.addNewTaxRuleToSystem || 'Add a new tax rule to the system'}
            </Typography>
          </DialogTitle>
          <form onSubmit={e => { e.preventDefault(); handleCreateTaxRule() }}>
            <DialogContent className='pbs-0 sm:pli-16'>
              <Box className='flex flex-col gap-6'>
                {taxRuleDialogError && (
                  <Alert severity='error' onClose={() => setTaxRuleDialogError('')}>
                    {taxRuleDialogError}
                  </Alert>
                )}
                <FormControl fullWidth required error={!!taxRuleFieldErrors.convention}>
                  <InputLabel>{safeDictionary?.navigation?.convention || 'Convention'}</InputLabel>
                  <Select
                    value={taxRuleForm.convention}
                    onChange={e => {
                      setTaxRuleForm({ ...taxRuleForm, convention: Number(e.target.value) })
                      if (taxRuleFieldErrors.convention) {
                        setTaxRuleFieldErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.convention
                          return newErrors
                        })
                      }
                    }}
                    label={safeDictionary?.navigation?.convention || 'Convention'}
                  >
                    {conventions.map(convention => (
                      <MenuItem key={convention.id} value={convention.id}>
                        {convention.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {taxRuleFieldErrors.convention && (
                    <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                      {taxRuleFieldErrors.convention}
                    </Typography>
                  )}
                </FormControl>
                <FormControl fullWidth required error={!!taxRuleFieldErrors.payment_class}>
                  <InputLabel>{safeDictionary?.navigation?.paymentClass || 'Payment Class'}</InputLabel>
                  <Select
                    value={taxRuleForm.payment_class}
                    onChange={async e => {
                      const code = String(e.target.value || '')
                      setTaxRuleForm({ ...taxRuleForm, payment_class: code, payment_status: 0 })
                      if (taxRuleFieldErrors.payment_class) {
                        setTaxRuleFieldErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.payment_class
                          return newErrors
                        })
                      }
                      // Load payment statuses for selected class
                      try {
                        const statuses = await paymentStatusService.getPaymentStatusesByClass(code)
                        // Some APIs may return more; filter by class to be safe
                        const filtered = statuses.filter(s => s.payment_class === code)
                        setPaymentStatuses(filtered)
                      } catch (err) {
                        console.error('Error loading payment statuses for class:', code, err)
                        setPaymentStatuses([])
                      }
                    }}
                    label={safeDictionary?.navigation?.paymentClass || 'Payment Class'}
                  >
                    {paymentClasses.map(pc => (
                      <MenuItem key={pc.code} value={pc.code}>
                        {pc.name || pc.code}
                      </MenuItem>
                    ))}
                  </Select>
                  {taxRuleFieldErrors.payment_class && (
                    <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                      {taxRuleFieldErrors.payment_class}
                    </Typography>
                  )}
                </FormControl>
                <FormControl fullWidth required error={!!taxRuleFieldErrors.payment_status}>
                  <InputLabel>{safeDictionary?.navigation?.paymentStatus || 'Payment Status'}</InputLabel>
                  <Select
                    value={taxRuleForm.payment_status}
                    onChange={e => {
                      setTaxRuleForm({ ...taxRuleForm, payment_status: Number(e.target.value) })
                      if (taxRuleFieldErrors.payment_status) {
                        setTaxRuleFieldErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.payment_status
                          return newErrors
                        })
                      }
                    }}
                    label={safeDictionary?.navigation?.paymentStatus || 'Payment Status'}
                  >
                    {paymentStatuses.map(ps => (
                      <MenuItem key={ps.id} value={ps.id}>
                        {ps.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {taxRuleFieldErrors.payment_status && (
                    <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                      {taxRuleFieldErrors.payment_status}
                    </Typography>
                  )}
                </FormControl>
                <CustomTextField
                  fullWidth
                  required
                  label={safeDictionary?.navigation?.taxType || 'Tax Type'}
                  value={taxRuleForm.tax_type}
                  onChange={e => {
                    setTaxRuleForm({ ...taxRuleForm, tax_type: e.target.value })
                    if (taxRuleFieldErrors.tax_type) {
                      setTaxRuleFieldErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.tax_type
                        return newErrors
                      })
                    }
                  }}
                  error={!!taxRuleFieldErrors.tax_type}
                  helperText={taxRuleFieldErrors.tax_type}
                />
                <FormControl fullWidth required error={!!taxRuleFieldErrors.calculation_type}>
                  <InputLabel>{safeDictionary?.navigation?.calculationType || 'Calculation Type'}</InputLabel>
                  <Select
                    value={taxRuleForm.calculation_type}
                    onChange={e => {
                      const val = e.target.value as 'percentage' | 'flat' | 'formula'
                      // Reset irrelevant fields on change
                      if (val === 'formula') {
                        setTaxRuleForm(prev => ({ ...prev, calculation_type: val, rate: 0 }))
                      } else {
                        setTaxRuleForm(prev => ({ ...prev, calculation_type: val, formula: '' }))
                      }
                      if (taxRuleFieldErrors.calculation_type) {
                        setTaxRuleFieldErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.calculation_type
                          return newErrors
                        })
                      }
                    }}
                    label={safeDictionary?.navigation?.calculationType || 'Calculation Type'}
                  >
                    <MenuItem value='percentage'>{safeDictionary?.navigation?.percentage || 'Percentage'}</MenuItem>
                    <MenuItem value='flat'>{safeDictionary?.navigation?.flat || 'Flat'}</MenuItem>
                    <MenuItem value='formula'>{safeDictionary?.navigation?.formula || 'Formula'}</MenuItem>
                  </Select>
                  {taxRuleFieldErrors.calculation_type && (
                    <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                      {taxRuleFieldErrors.calculation_type}
                    </Typography>
                  )}
                </FormControl>
                {taxRuleForm.calculation_type !== 'formula' && (
                  <CustomTextField
                    fullWidth
                    required
                    type='number'
                    label={safeDictionary?.navigation?.rate || 'Rate'}
                    value={taxRuleForm.rate}
                    onChange={e => {
                      setTaxRuleForm({ ...taxRuleForm, rate: parseFloat(e.target.value) || 0 })
                      if (taxRuleFieldErrors.rate) {
                        setTaxRuleFieldErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.rate
                          return newErrors
                        })
                      }
                    }}
                    error={!!taxRuleFieldErrors.rate}
                    helperText={taxRuleFieldErrors.rate}
                  />
                )}
                {taxRuleForm.calculation_type === 'formula' && (
                  <CustomTextField
                    fullWidth
                    required
                    label={safeDictionary?.navigation?.formula || 'Formula'}
                    value={taxRuleForm.formula || ''}
                    onChange={e => {
                      setTaxRuleForm({ ...taxRuleForm, formula: e.target.value })
                      if (taxRuleFieldErrors.formula) {
                        setTaxRuleFieldErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.formula
                          return newErrors
                        })
                      }
                    }}
                    placeholder={safeDictionary?.navigation?.formulaPlaceholder || 'e.g., amount * 0.1'}
                    error={!!taxRuleFieldErrors.formula}
                    helperText={taxRuleFieldErrors.formula}
                  />
                )}
              </Box>
            </DialogContent>
            <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16 gap-4'>
              <Button variant='outlined' color='secondary' onClick={() => setTaxRuleDialogOpen(false)}>
                {safeDictionary?.navigation?.cancel || 'Cancel'}
              </Button>
              <Button type='submit' variant='contained' disabled={loading}>
                {safeDictionary?.navigation?.create || 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Grid>
    </Grid>
  )
}

export default ConventionParametersPage

