'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'

// Dictionary imports
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

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
  MenuItem
} from '@mui/material'
import { Edit, Delete, Search, AccountBalance, Business, ArrowUpward, ArrowDownward } from '@mui/icons-material'

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
import { bankService } from '@/services/bank.service'
import { agencyService } from '@/services/agency.service'

// Type Imports
import type { Bank, CreateBankDto } from '@/types/bank'
import type { Agency, CreateAgencyDto } from '@/types/agency'

// Style Imports
import styles from '@core/styles/table.module.css'

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

const ComptesBancairesPage = () => {
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as Locale
  const [tabValue, setTabValue] = useState(0)
  
  // Check URL hash to set initial tab (for navigation from lookup dialogs)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash === '#agencies') {
        setTabValue(1)
      }
    }
  }, [])
  
  // Dictionary state
  const [dictionary, setDictionary] = useState<any>(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(true)
  const [banks, setBanks] = useState<Bank[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dialog states
  const [bankDialogOpen, setBankDialogOpen] = useState(false)
  const [agencyDialogOpen, setAgencyDialogOpen] = useState(false)
  const [agencyDialogError, setAgencyDialogError] = useState('') // Error state for agency dialog
  const [deleteAgencyDialogOpen, setDeleteAgencyDialogOpen] = useState(false)
  const [agencyToDelete, setAgencyToDelete] = useState<string | null>(null)
  const [editingBank, setEditingBank] = useState<Bank | null>(null)
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null)

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

  // Form states
  const [bankForm, setBankForm] = useState<CreateBankDto & { code?: string }>({
    code: '',
    name: '',
    address: '',
    website: ''
  })

  const [agencyForm, setAgencyForm] = useState<CreateAgencyDto & { bank: number | string }>({
    code: '',
    bank: 0,
    name: '',
    address: '',
    city: ''
  })

  // Search states
  const [bankSearch, setBankSearch] = useState('')
  const [agencySearch, setAgencySearch] = useState('')

  // Sorting states
  const [bankSorting, setBankSorting] = useState<SortingState>([])
  const [agencySorting, setAgencySorting] = useState<SortingState>([])

  // Logo dimensions state - stores aspect ratio info for each logo
  const [logoDimensions, setLogoDimensions] = useState<Record<string, { width: number; height: number; aspectRatio: 'landscape' | 'portrait' | 'square' }>>({})

  // Handler functions with useCallback
  const handleDeleteBank = useCallback(async (code: string) => {
    if (!confirm('Are you sure you want to delete this bank?')) return

    try {
      setLoading(true)
      await bankService.deleteBank(code)
      setSuccess('Bank deleted successfully')
      loadBanks()
    } catch (err) {
      setError('Failed to delete bank')
      console.error('Error deleting bank:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDeleteAgencyClick = useCallback((code: string) => {
    setAgencyToDelete(code)
    setDeleteAgencyDialogOpen(true)
  }, [])

  const handleConfirmDeleteAgency = useCallback(async () => {
    if (!agencyToDelete) return

    try {
      setLoading(true)
      setDeleteAgencyDialogOpen(false)
      // Agencies use code as the primary identifier (like banks)
      // Use the code directly, don't try to parse it as a number
      await agencyService.deleteAgency(agencyToDelete)
      setSuccess(dictionary?.navigation?.agencyDeletedSuccessfully || 'Agency deleted successfully')
      setAgencyToDelete(null)
      loadAgencies()
    } catch (err: any) {
      // Extract error message from API response
      let errorMessage = dictionary?.navigation?.failedToDeleteAgency || 'Failed to delete agency'
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message
        }
      } else if (err?.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      console.error('Error deleting agency:', err)
    } finally {
      setLoading(false)
    }
  }, [agencyToDelete, dictionary])

  const openBankDialog = useCallback((bank?: Bank) => {
    if (bank) {
      setEditingBank(bank)
      setBankForm({
        code: bank.code,
        name: bank.name,
        address: bank.address,
        website: bank.website
      })
    } else {
      setEditingBank(null)
      setBankForm({ code: '', name: '', address: '', website: '' })
    }

    setBankDialogOpen(true)
  }, [])

  const openAgencyDialog = useCallback((agency?: Agency) => {
    if (agency) {
      setEditingAgency(agency)
      setAgencyForm({
        code: agency.code,
        bank: agency.bank,
        name: agency.name,
        address: agency.address,
        city: agency.city
      })
    } else {
      setEditingAgency(null)
      setAgencyForm({ code: '', bank: 0, name: '', address: '', city: '' })
    }

    setAgencyDialogError('') // Clear error when opening dialog
    setAgencyDialogOpen(true)
  }, [])

  // Column Helpers
  const bankColumnHelper = createColumnHelper<Bank>()
  const agencyColumnHelper = createColumnHelper<Agency>()

  // Bank Columns
  const bankColumns = useMemo(
    () => [
      bankColumnHelper.display({
        id: 'logo',
        header: () => '', // Empty header
        cell: ({ row }) => {
          const logoUrl = row.original.logo_url || row.original.logo
          const logoKey = `${row.original.code}-${logoUrl || 'no-logo'}`
          const dimensions = logoDimensions[logoKey]
          
          if (logoUrl) {
            // Determine max dimensions based on aspect ratio
            let maxWidth = 120
            let maxHeight = 120
            let width = 'auto'
            let height = 'auto'
            
            if (dimensions) {
              if (dimensions.aspectRatio === 'landscape') {
                // Landscape: constrain width
                maxWidth = 80
                maxHeight = 80
                width = '80px'
                height = 'auto'
              } else if (dimensions.aspectRatio === 'portrait') {
                // Portrait: constrain height
                maxWidth = 80
                maxHeight = 80
                width = 'auto'
                height = '80px'
              } else {
                // Square: use current approach
                maxWidth = 80
                maxHeight = 80
                width = 'auto'
                height = 'auto'
              }
            } else {
              // Default max dimensions when no dimensions available
              maxWidth = 80
              maxHeight = 80
            }
            
            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 'auto',
                  padding: '0 !important',
                  marginRight: '-8px'
                }}
              >
                <img
                  src={logoUrl}
                  alt={`${row.original.name} logo`}
                  style={{
                    maxWidth: `${Math.min(maxWidth, 80)}px`,
                    maxHeight: `${maxHeight}px`,
                    width,
                    height,
                    objectFit: 'contain',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                  onLoad={(e) => {
                    const img = e.currentTarget
                    const naturalWidth = img.naturalWidth
                    const naturalHeight = img.naturalHeight
                    
                    if (naturalWidth && naturalHeight) {
                      let aspectRatio: 'landscape' | 'portrait' | 'square'
                      if (naturalWidth > naturalHeight) {
                        aspectRatio = 'landscape'
                      } else if (naturalHeight > naturalWidth) {
                        aspectRatio = 'portrait'
                      } else {
                        aspectRatio = 'square'
                      }
                      
                      setLogoDimensions(prev => ({
                        ...prev,
                        [logoKey]: {
                          width: naturalWidth,
                          height: naturalHeight,
                          aspectRatio
                        }
                      }))
                    }
                  }}
                  onError={(e) => {
                    // Hide image on error
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </Box>
            )
          }
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 'auto',
                color: 'text.secondary',
                padding: '0 !important',
                marginRight: '-8px'
              }}
            >
              -
            </Box>
          )
        },
        enableSorting: false
      }),
      bankColumnHelper.accessor('code', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {dictionary?.navigation?.code || 'Code'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => <Chip label={info.getValue()} color='primary' size='small' />,
        enableSorting: true
      }),
      bankColumnHelper.accessor('name', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {dictionary?.navigation?.name || 'Name'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => info.getValue(),
        enableSorting: true
      }),
      bankColumnHelper.accessor('address', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {dictionary?.navigation?.address || 'Address'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => info.getValue(),
        enableSorting: true
      }),
      bankColumnHelper.accessor('website', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {dictionary?.navigation?.website || 'Website'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => {
          const website = info.getValue()

          return website ? (
            <a 
              href={website} 
              target='_blank' 
              rel='noopener noreferrer'
              onClick={(e) => e.stopPropagation()}
            >
              {website}
            </a>
          ) : (
            '-'
          )
        },
        enableSorting: true
      })
    ],
    [bankColumnHelper, logoDimensions]
  )

  // Agency Columns
  const agencyColumns = useMemo(
    () => [
      agencyColumnHelper.accessor('code', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {dictionary?.navigation?.code || 'Code'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => <Chip label={info.getValue()} color='secondary' size='small' />,
        enableSorting: true
      }),
      agencyColumnHelper.accessor('bank', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {dictionary?.navigation?.bank || 'Bank'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => {
          const bankId = info.getValue()
          // Find the bank name from the banks array
          const bank = banks.find(b => b.code === bankId.toString())
          return bank ? (
            <Chip 
              label={bank.name} 
              color='primary' 
              size='small'
              icon={<AccountBalance />}
            />
          ) : (
            <Chip 
              label={`Bank ID: ${bankId}`} 
              color='primary' 
              size='small'
            />
          )
        },
        enableSorting: true
      }),
      agencyColumnHelper.accessor('name', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {dictionary?.navigation?.name || 'Name'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => info.getValue(),
        enableSorting: true
      }),
      agencyColumnHelper.accessor('address', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {dictionary?.navigation?.address || 'Address'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => info.getValue(),
        enableSorting: true
      }),
      agencyColumnHelper.accessor('city', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {dictionary?.navigation?.city || 'City'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => info.getValue(),
        enableSorting: true
      }),
    ],
    [agencyColumnHelper, openAgencyDialog, handleDeleteAgencyClick, banks]
  )

  // React Tables
  const bankTable = useReactTable({
    data: banks,
    columns: bankColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: bankSearch,
      sorting: bankSorting
    },
    onGlobalFilterChange: setBankSearch,
    onSortingChange: setBankSorting,
    filterFns: {
      fuzzy: () => false
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  const agencyTable = useReactTable({
    data: agencies,
    columns: agencyColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: agencySearch,
      sorting: agencySorting
    },
    onGlobalFilterChange: setAgencySearch,
    onSortingChange: setAgencySorting,
    filterFns: {
      fuzzy: () => false
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  // Load data
  const loadBanks = async () => {
    try {
      setLoading(true)

      const data = await bankService.getBanks()

      setBanks(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : dictionary?.navigation?.unknownError || 'Unknown error'
      setError(dictionary?.navigation?.failedToLoadBanks 
        ? `${dictionary.navigation.failedToLoadBanks}: ${errorMsg}`
        : `Failed to load banks: ${errorMsg}`)
      console.error('Error loading banks:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadAgencies = async () => {
    try {
      setLoading(true)

      const data = await agencyService.getAgencies()

      setAgencies(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : dictionary?.navigation?.unknownError || 'Unknown error'
      setError(dictionary?.navigation?.failedToLoadAgencies 
        ? `${dictionary.navigation.failedToLoadAgencies}: ${errorMsg}`
        : `Failed to load agencies: ${errorMsg}`)
      console.error('Error loading agencies:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanks()
    loadAgencies()
  }, [])

  // Bank operations
  const handleCreateBank = async () => {
    // Validation
    if (!bankForm.code || !bankForm.code.trim()) {
      setError(dictionary?.navigation?.codeRequired || 'Code is required')
      return
    }
    if (!bankForm.name || !bankForm.name.trim()) {
      setError(dictionary?.navigation?.nameRequired || 'Name is required')
      return
    }

    try {
      setLoading(true)
      setError('')
      // Include code in the create payload
      await bankService.createBank({ ...bankForm, code: bankForm.code } as any)
      setSuccess(dictionary?.navigation?.bankCreatedSuccessfully || 'Bank created successfully')
      setBankDialogOpen(false)
      setBankForm({ code: '', name: '', address: '', website: '' })
      loadBanks()
    } catch (err: any) {
      let errorMessage = dictionary?.navigation?.failedToCreateBank || 'Failed to create bank'
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message
        } else if (Object.keys(err.response.data).length > 0) {
          const validationErrors = Object.entries(err.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ')
          errorMessage = `Validation errors: ${validationErrors}`
        }
      } else if (err?.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      console.error('Error creating bank:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBank = async () => {
    if (!editingBank) return

    // Validation
    if (!bankForm.name || !bankForm.name.trim()) {
      setError(dictionary?.navigation?.nameRequired || 'Name is required')
      return
    }

    try {
      setLoading(true)
      setError('')
      await bankService.updateBank(editingBank.code, bankForm)
      setSuccess(dictionary?.navigation?.bankUpdatedSuccessfully || 'Bank updated successfully')
      setBankDialogOpen(false)
      setEditingBank(null)
      setBankForm({ code: '', name: '', address: '', website: '' })
      loadBanks()
    } catch (err: any) {
      let errorMessage = dictionary?.navigation?.failedToUpdateBank || 'Failed to update bank'
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message
        } else if (Object.keys(err.response.data).length > 0) {
          const validationErrors = Object.entries(err.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ')
          errorMessage = `Validation errors: ${validationErrors}`
        }
      } else if (err?.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      console.error('Error updating bank:', err)
    } finally {
      setLoading(false)
    }
  }

  // Agency operations
  const handleCreateAgency = async () => {
    // Validation
    if (!agencyForm.code || !agencyForm.code.trim()) {
      setAgencyDialogError(dictionary?.navigation?.codeRequired || 'Code is required')
      return
    }
    if (!agencyForm.bank || agencyForm.bank === 0) {
      setAgencyDialogError(dictionary?.navigation?.bankRequired || 'Bank is required')
      return
    }
    if (!agencyForm.name || !agencyForm.name.trim()) {
      setAgencyDialogError(dictionary?.navigation?.nameRequired || 'Name is required')
      return
    }

    try {
      setLoading(true)
      setAgencyDialogError('')
      console.log('Creating agency with data:', agencyForm)
      await agencyService.createAgency(agencyForm)
      setSuccess(dictionary?.navigation?.agencyCreatedSuccessfully || 'Agency created successfully')
      setAgencyDialogOpen(false)
      setAgencyForm({ code: '', bank: 0, name: '', address: '', city: '' })
      loadAgencies()
    } catch (err: any) {
      console.error('Error creating agency - Full error:', err)
      console.error('Error response:', err?.response)
      console.error('Error response data:', err?.response?.data)
      
      let errorMessage = dictionary?.navigation?.failedToCreateAgency || 'Failed to create agency'
      
      // Check for original axios error structure first
      if (err?.response?.data) {
        const errorData = err.response.data
        console.error('Error data structure:', errorData)
        
        if (typeof errorData === 'string') {
          errorMessage = errorData
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (Object.keys(errorData).length > 0) {
          // Handle validation errors - show field-specific errors
          const validationErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : String(messages)
              return `${field}: ${msg}`
            })
            .join('; ')
          errorMessage = `Validation errors: ${validationErrors}`
        }
      } 
      // Check for modified error from interceptor
      else if (err?.message) {
        // Check if error message contains "No Agency matches"
        if (err.message.includes('No Agency matches') || err.message.includes('no agency matches')) {
          errorMessage = dictionary?.navigation?.noAgencyMatches || 'No Agency matches the given query'
        } else {
          errorMessage = err.message
        }
      }
      
      setAgencyDialogError(errorMessage)
      console.error('Final error message:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAgency = async () => {
    if (!editingAgency) return

    // Validation
    if (!agencyForm.code || !agencyForm.code.trim()) {
      setAgencyDialogError(dictionary?.navigation?.codeRequired || 'Code is required')
      return
    }
    if (!agencyForm.bank || agencyForm.bank === 0) {
      setAgencyDialogError(dictionary?.navigation?.bankRequired || 'Bank is required')
      return
    }
    if (!agencyForm.name || !agencyForm.name.trim()) {
      setAgencyDialogError(dictionary?.navigation?.nameRequired || 'Name is required')
      return
    }

    try {
      setLoading(true)
      setAgencyDialogError('')
      
      // Agencies use code as the primary identifier (like banks)
      // Always use the ORIGINAL code to identify which agency to update
      // The form data contains the new code (if changed), which will update the agency's code
      const originalCode = editingAgency.code
      
      if (!originalCode) {
        throw new Error('Agency code not found')
      }
      
      // Prepare update data - include the new code if it changed
      const updateData = { ...agencyForm }
      
      console.log('Updating agency with original code:', originalCode, 'and data:', updateData)
      await agencyService.updateAgency(originalCode, updateData)
      setSuccess(dictionary?.navigation?.agencyUpdatedSuccessfully || 'Agency updated successfully')
      setAgencyDialogOpen(false)
      setEditingAgency(null)
      setAgencyForm({ code: '', bank: 0, name: '', address: '', city: '' })
      loadAgencies()
    } catch (err: any) {
      let errorMessage = dictionary?.navigation?.failedToUpdateAgency || 'Failed to update agency'
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          // Check if error message contains "No Agency matches"
          if (err.response.data.includes('No Agency matches') || err.response.data.includes('no agency matches')) {
            errorMessage = dictionary?.navigation?.noAgencyMatches || 'No Agency matches the given query'
          } else {
            errorMessage = err.response.data
          }
        } else if (err.response.data.detail) {
          // Check if detail contains "No Agency matches"
          if (err.response.data.detail.includes('No Agency matches') || err.response.data.detail.includes('no agency matches')) {
            errorMessage = dictionary?.navigation?.noAgencyMatches || 'No Agency matches the given query'
          } else {
            errorMessage = err.response.data.detail
          }
        } else if (err.response.data.message) {
          // Check if message contains "No Agency matches"
          if (err.response.data.message.includes('No Agency matches') || err.response.data.message.includes('no agency matches')) {
            errorMessage = dictionary?.navigation?.noAgencyMatches || 'No Agency matches the given query'
          } else {
            errorMessage = err.response.data.message
          }
        } else if (Object.keys(err.response.data).length > 0) {
          const validationErrors = Object.entries(err.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ')
          errorMessage = `Validation errors: ${validationErrors}`
        }
      } else if (err?.message) {
        // Check if error message contains "No Agency matches"
        if (err.message.includes('No Agency matches') || err.message.includes('no agency matches')) {
          errorMessage = dictionary?.navigation?.noAgencyMatches || 'No Agency matches the given query'
        } else {
          errorMessage = err.message
        }
      }
      setAgencyDialogError(errorMessage)
      console.error('Error updating agency:', err)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while dictionary is loading
  if (dictionaryLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }


  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mb-4'>
          {dictionary?.navigation?.bankAccounts || 'Comptes bancaires'}
        </Typography>
        <Typography color='text.secondary' className='mb-6'>
          {dictionary?.navigation?.banksAgenciesManagement || 'Gestion des banques et agences'}
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

        <Card>
          <CardHeader
            title={dictionary?.navigation?.banksAgenciesManagement || 'Banks & Agencies Management'}
            action={
              <Box>
                <Button
                  variant='contained'
                  startIcon={<AccountBalance />}
                  onClick={() => router.push(`/${params?.lang || 'fr'}/admin/banques/banque-details/new`)}
                  className='mr-2'
                >
                  {dictionary?.navigation?.addBank || 'Add Bank'}
                </Button>
                <Button 
                  variant='contained' 
                  startIcon={<Business />} 
                  onClick={() => router.push(`/${params?.lang || 'fr'}/admin/agences/agence-details/new`)}
                >
                  {dictionary?.navigation?.addAgency || 'Add Agency'}
                </Button>
              </Box>
            }
          />
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label={dictionary?.navigation?.banks || 'Banks'} />
              <Tab label={dictionary?.navigation?.agencies || 'Agencies'} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box className='mb-4'>
              <CustomTextField
                fullWidth
                placeholder={dictionary?.navigation?.searchBanks || 'Search banks...'}
                value={bankSearch}
                onChange={e => setBankSearch(e.target.value)}
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
                      {bankTable.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th
                              key={header.id}
                              className="bold-header"
                              style={{
                                cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                userSelect: 'none',
                                fontWeight: '700',
                                fontFamily: 'Montserrat, sans-serif'
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
                      {bankTable.getRowModel().rows.map(row => (
                        <tr 
                          key={row.id}
                          onClick={(e) => {
                            // Don't navigate if clicking on interactive elements
                            const target = e.target as HTMLElement
                            if (target.tagName === 'A' || target.closest('a') || target.tagName === 'BUTTON' || target.closest('button')) {
                              return
                            }
                            
                            const bankCode = row.original.code
                            if (!bankCode) {
                              console.warn('Bank code is missing')
                              return
                            }
                            
                            const lang = params?.lang || 'fr'
                            const path = `/${lang}/admin/banques/banque-details/${bankCode}`
                            
                            console.log('Navigating to bank details:', bankCode, 'Path:', path)
                            
                            // Use window.location.href for reliable navigation
                            window.location.href = path
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePaginationComponent table={bankTable as any} dictionary={dictionary} />
              </>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box className='mb-4'>
              <CustomTextField
                fullWidth
                placeholder={dictionary?.navigation?.searchAgencies || 'Search agencies...'}
                value={agencySearch}
                onChange={e => setAgencySearch(e.target.value)}
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
                      {agencyTable.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th
                              key={header.id}
                              className="bold-header"
                              style={{
                                cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                userSelect: 'none',
                                fontWeight: '700',
                                fontFamily: 'Montserrat, sans-serif'
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
                      {agencyTable.getRowModel().rows.map(row => (
                        <tr
                          key={row.id}
                          onClick={() => {
                            console.log('Navigating to agency details:', row.original.code)
                            router.push(`/${params?.lang || 'fr'}/admin/agences/agence-details/${row.original.code}`)
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePaginationComponent table={agencyTable as any} dictionary={dictionary} />
              </>
            )}
          </TabPanel>
        </Card>
      </Grid>

      {/* Bank Dialog */}
      <Dialog
        fullWidth
        open={bankDialogOpen}
        onClose={() => setBankDialogOpen(false)}
        maxWidth='sm'
        scroll='body'
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={() => setBankDialogOpen(false)} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          {editingBank ? (dictionary?.navigation?.editBank || 'Edit Bank') : (dictionary?.navigation?.addNewBank || 'Add New Bank')}
          <Typography component='span' className='flex flex-col text-center'>
            {editingBank ? (dictionary?.navigation?.updateBankInformation || 'Update bank information') : (dictionary?.navigation?.addNewBankToSystem || 'Add a new bank to the system')}
          </Typography>
        </DialogTitle>
        <form onSubmit={e => { e.preventDefault(); editingBank ? handleUpdateBank() : handleCreateBank() }}>
          <DialogContent className='pbs-0 sm:pli-16'>
            <Box className='flex flex-col gap-6'>
              <CustomTextField
                fullWidth
                required
                label={dictionary?.navigation?.code || 'Code'}
                value={bankForm.code || ''}
                onChange={e => setBankForm({ ...bankForm, code: e.target.value })}
                disabled={!!editingBank}
                helperText={editingBank ? dictionary?.navigation?.codeCannotBeChanged || 'Code cannot be changed' : ''}
              />
              <CustomTextField
                fullWidth
                required
                label={dictionary?.navigation?.bankName || 'Bank Name'}
                value={bankForm.name}
                onChange={e => setBankForm({ ...bankForm, name: e.target.value })}
              />
              <CustomTextField
                fullWidth
                label={dictionary?.navigation?.address || 'Address'}
                value={bankForm.address}
                onChange={e => setBankForm({ ...bankForm, address: e.target.value })}
              />
              <CustomTextField
                fullWidth
                label={dictionary?.navigation?.website || 'Website'}
                value={bankForm.website}
                onChange={e => setBankForm({ ...bankForm, website: e.target.value })}
                type="url"
              />
            </Box>
          </DialogContent>
          <DialogActions className='gap-2 pbs-0 sm:pbe-16 sm:pli-16'>
            <Button variant='outlined' color='secondary' onClick={() => setBankDialogOpen(false)}>
              {dictionary?.navigation?.cancel || 'Cancel'}
            </Button>
            <Button variant='contained' onClick={editingBank ? handleUpdateBank : handleCreateBank} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : editingBank ? (dictionary?.navigation?.update || 'Update') : (dictionary?.navigation?.create || 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Agency Dialog */}
      <Dialog
        fullWidth
        open={agencyDialogOpen}
        onClose={() => {
          setAgencyDialogOpen(false)
          setAgencyDialogError('') // Clear error when closing dialog
        }}
        maxWidth='sm'
        scroll='body'
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={() => {
          setAgencyDialogOpen(false)
          setAgencyDialogError('') // Clear error when closing dialog
        }} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          {editingAgency ? (dictionary?.navigation?.editAgency || 'Edit Agency') : (dictionary?.navigation?.addNewAgency || 'Add New Agency')}
          <Typography component='span' className='flex flex-col text-center'>
            {editingAgency ? (dictionary?.navigation?.updateAgencyInformation || 'Update agency information') : (dictionary?.navigation?.addNewAgencyToSystem || 'Add a new agency to the system')}
          </Typography>
        </DialogTitle>
        <form onSubmit={e => { e.preventDefault(); editingAgency ? handleUpdateAgency() : handleCreateAgency() }}>
          <DialogContent className='pbs-0 sm:pli-16'>
            {agencyDialogError && (
              <Alert severity='error' sx={{ mb: 3 }} onClose={() => setAgencyDialogError('')}>
                {agencyDialogError}
              </Alert>
            )}
            <Box className='flex flex-col gap-6'>
              <CustomTextField
                fullWidth
                required
                label={dictionary?.navigation?.code || 'Code'}
                value={agencyForm.code}
                onChange={e => setAgencyForm({ ...agencyForm, code: e.target.value })}
              />
              <FormControl fullWidth required>
                <InputLabel>{dictionary?.navigation?.bank || 'Bank'}</InputLabel>
                <Select
                  value={agencyForm.bank}
                  label={dictionary?.navigation?.bank || 'Bank'}
                  onChange={e => setAgencyForm({ ...agencyForm, bank: e.target.value as number })}
                >
                  <MenuItem value={0}>
                    <em>{dictionary?.navigation?.selectBank || 'Select Bank'}</em>
                  </MenuItem>
                  {banks.map(bank => {
                    // Use bank code as ID if it's numeric, otherwise try to use it as string ID
                    // The backend might use code as ID or have a separate ID field
                    const bankId = !isNaN(Number(bank.code)) ? Number(bank.code) : bank.code
                    return (
                      <MenuItem key={bank.code} value={bankId}>
                        {bank.name} ({bank.code})
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
              <CustomTextField
                fullWidth
                required
                label={dictionary?.navigation?.agencyName || 'Agency Name'}
                value={agencyForm.name}
                onChange={e => setAgencyForm({ ...agencyForm, name: e.target.value })}
              />
              <CustomTextField
                fullWidth
                label={dictionary?.navigation?.address || 'Address'}
                value={agencyForm.address}
                onChange={e => setAgencyForm({ ...agencyForm, address: e.target.value })}
              />
              <CustomTextField
                fullWidth
                label={dictionary?.navigation?.city || 'City'}
                value={agencyForm.city}
                onChange={e => setAgencyForm({ ...agencyForm, city: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions className='gap-2 pbs-0 sm:pbe-16 sm:pli-16'>
            <Button variant='outlined' color='secondary' onClick={() => setAgencyDialogOpen(false)}>
              {dictionary?.navigation?.cancel || 'Cancel'}
            </Button>
            <Button
              variant='contained'
              onClick={editingAgency ? handleUpdateAgency : handleCreateAgency}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : editingAgency ? (dictionary?.navigation?.update || 'Update') : (dictionary?.navigation?.create || 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Agency Confirmation Dialog */}
      <Dialog
        fullWidth
        open={deleteAgencyDialogOpen}
        onClose={() => {
          setDeleteAgencyDialogOpen(false)
          setAgencyToDelete(null)
        }}
        maxWidth='xs'
        scroll='body'
        closeAfterTransition={false}
      >
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='tabler-alert-circle text-[88px] mbe-6 text-error' />
          <Typography variant='h4' className='mbe-2'>
            {(() => {
              const agencyToDeleteObj = agencies.find(a => a.code === agencyToDelete)
              const agencyName = agencyToDeleteObj?.name || agencyToDelete || ''
              return dictionary?.navigation?.confirmDeleteAgency?.replace('{agencyName}', agencyName) || 'Are you sure?'
            })()}
          </Typography>
          <Typography color='text.primary'>
            {dictionary?.navigation?.confirmDeleteAgencyMessage || 'You won\'t be able to revert this action!'}
          </Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              setDeleteAgencyDialogOpen(false)
              setAgencyToDelete(null)
            }}
          >
            {dictionary?.navigation?.cancel || 'Cancel'}
          </Button>
          <Button variant='contained' color='error' onClick={handleConfirmDeleteAgency} disabled={loading}>
            {dictionary?.navigation?.delete || 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default ComptesBancairesPage
