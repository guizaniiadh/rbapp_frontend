'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

import {
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Link
} from '@mui/material'
import { Edit, Delete, Search, Add, ArrowBack, AccountBalance, ArrowUpward, ArrowDownward } from '@mui/icons-material'

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
import { paymentClassService } from '@/services/paymentClass.service'
import { paymentStatusService } from '@/services/paymentStatus.service'
import { paymentIdentificationService } from '@/services/paymentIdentification.service'
import { bankService } from '@/services/bank.service'

// Type Imports
import type { PaymentClass, CreatePaymentClassDto } from '@/types/paymentClass'
import type { PaymentStatus, CreatePaymentStatusDto } from '@/types/paymentStatus'
import type { PaymentIdentification, CreatePaymentIdentificationDto } from '@/types/paymentIdentification'
import type { Bank } from '@/types/bank'

// Style Imports
import styles from '@core/styles/table.module.css'

// Dictionary imports
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

// Column Helpers
const paymentClassColumnHelper = createColumnHelper<PaymentClass>()
const paymentStatusColumnHelper = createColumnHelper<PaymentStatus>()
const paymentIdentificationColumnHelper = createColumnHelper<PaymentIdentification>()

const PaymentManagement = () => {
  const params = useParams()
  const router = useRouter()
  const lang = params.lang as Locale
  
  // Dictionary state
  const [dictionary, setDictionary] = useState<any>(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(true)
  
  const [currentView, setCurrentView] = useState<'classes' | 'statuses'>('classes')
  const [selectedPaymentClass, setSelectedPaymentClass] = useState<PaymentClass | null>(null)
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus | null>(null)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [paymentClasses, setPaymentClasses] = useState<PaymentClass[]>([])
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>([])
  const [paymentIdentifications, setPaymentIdentifications] = useState<PaymentIdentification[]>([])
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dialog states
  const [paymentClassDialogOpen, setPaymentClassDialogOpen] = useState(false)
  const [paymentStatusDialogOpen, setPaymentStatusDialogOpen] = useState(false)
  const [paymentIdentificationDialogOpen, setPaymentIdentificationDialogOpen] = useState(false)
  
  // Delete dialog states
  const [deletePaymentClassDialogOpen, setDeletePaymentClassDialogOpen] = useState(false)
  const [deletePaymentStatusDialogOpen, setDeletePaymentStatusDialogOpen] = useState(false)
  const [deletePaymentIdentificationDialogOpen, setDeletePaymentIdentificationDialogOpen] = useState(false)
  const [paymentClassToDelete, setPaymentClassToDelete] = useState<string | null>(null)
  const [paymentStatusToDelete, setPaymentStatusToDelete] = useState<number | null>(null)
  const [paymentIdentificationToDelete, setPaymentIdentificationToDelete] = useState<number | null>(null)
  
  // Dialog-specific error states
  const [paymentClassDialogError, setPaymentClassDialogError] = useState('')
  const [paymentStatusDialogError, setPaymentStatusDialogError] = useState('')
  const [paymentIdentificationDialogError, setPaymentIdentificationDialogError] = useState('')
  const [editingPaymentClass, setEditingPaymentClass] = useState<PaymentClass | null>(null)
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<PaymentStatus | null>(null)
  const [editingPaymentIdentification, setEditingPaymentIdentification] = useState<PaymentIdentification | null>(null)

  // Form states
  const [paymentClassForm, setPaymentClassForm] = useState<CreatePaymentClassDto>({
    code: '',
    name: ''
  })
  const [paymentStatusForm, setPaymentStatusForm] = useState<CreatePaymentStatusDto>({
    line: 0,
    name: '',
    payment_class: '',
    accounting_account: ''
  })
  const [paymentIdentificationForm, setPaymentIdentificationForm] = useState<CreatePaymentIdentificationDto>({
    description: '',
    payment_status: 0,
    debit: false,
    credit: false,
    bank: '',
    grouped: false
  })

  // Search states
  const [paymentClassSearch, setPaymentClassSearch] = useState('')
  const [paymentStatusSearch, setPaymentStatusSearch] = useState('')
  const [paymentIdentificationSearch, setPaymentIdentificationSearch] = useState('')

  // Sorting states
  const [paymentClassSorting, setPaymentClassSorting] = useState<SortingState>([])
  const [paymentStatusSorting, setPaymentStatusSorting] = useState<SortingState>([])
  const [paymentIdentificationSorting, setPaymentIdentificationSorting] = useState<SortingState>([])

  // Handler functions with useCallback
  const handleDeletePaymentClass = useCallback((code: string) => {
    setPaymentClassToDelete(code)
    setDeletePaymentClassDialogOpen(true)
  }, [])

  const handleConfirmDeletePaymentClass = useCallback(async () => {
    if (!paymentClassToDelete) return

    try {
      setLoading(true)
      await paymentClassService.deletePaymentClass(paymentClassToDelete)
      setSuccess(dictionary?.navigation?.paymentClassDeletedSuccessfully || 'Payment class deleted successfully')
      setDeletePaymentClassDialogOpen(false)
      setPaymentClassToDelete(null)
      loadPaymentClasses()
    } catch (err) {
      setError(dictionary?.navigation?.failedToDeletePaymentClass || 'Failed to delete payment class')
      console.error('Error deleting payment class:', err)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentClassToDelete, dictionary])

  const handleDeletePaymentStatus = useCallback((id: number) => {
    setPaymentStatusToDelete(id)
    setDeletePaymentStatusDialogOpen(true)
  }, [])

  const handleConfirmDeletePaymentStatus = useCallback(
    async () => {
      if (!paymentStatusToDelete) return

      try {
        setLoading(true)
        await paymentStatusService.deletePaymentStatus(paymentStatusToDelete)
        setSuccess(dictionary?.navigation?.paymentStatusDeletedSuccessfully || 'Payment status deleted successfully')
        setDeletePaymentStatusDialogOpen(false)
        setPaymentStatusToDelete(null)
        if (selectedPaymentClass) {
          loadPaymentStatuses(selectedPaymentClass.code)
        }
      } catch (err) {
        setError(dictionary?.navigation?.failedToDeletePaymentStatus || 'Failed to delete payment status')
        console.error('Error deleting payment status:', err)
      } finally {
        setLoading(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [paymentStatusToDelete, selectedPaymentClass, dictionary]
  )

  const handleDeletePaymentIdentification = useCallback((id: number) => {
    setPaymentIdentificationToDelete(id)
    setDeletePaymentIdentificationDialogOpen(true)
  }, [])

  const handleConfirmDeletePaymentIdentification = useCallback(
    async () => {
      if (!paymentIdentificationToDelete) return

      try {
        setLoading(true)
        await paymentIdentificationService.deletePaymentIdentification(paymentIdentificationToDelete)
        setSuccess(dictionary?.navigation?.paymentIdentificationDeletedSuccessfully || 'Payment identification deleted successfully')
        setDeletePaymentIdentificationDialogOpen(false)
        setPaymentIdentificationToDelete(null)
        if (selectedPaymentStatus && selectedBank) {
          loadPaymentIdentifications(selectedPaymentStatus.id, selectedBank.code)
        }
      } catch (err) {
        setError(dictionary?.navigation?.failedToDeletePaymentIdentification || 'Failed to delete payment identification')
        console.error('Error deleting payment identification:', err)
      } finally {
        setLoading(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [paymentIdentificationToDelete, selectedPaymentStatus, selectedBank, dictionary]
  )

  const openPaymentClassDialog = useCallback((paymentClass?: PaymentClass) => {
    if (paymentClass) {
      setEditingPaymentClass(paymentClass)
      setPaymentClassForm({
        code: paymentClass.code,
        name: paymentClass.name
      })
    } else {
      setEditingPaymentClass(null)
      setPaymentClassForm({ code: '', name: '' })
    }
    setPaymentClassDialogError('')
    setPaymentClassDialogOpen(true)
  }, [])

  const openPaymentStatusDialog = useCallback(
    (paymentStatus?: PaymentStatus) => {
      if (paymentStatus) {
        setEditingPaymentStatus(paymentStatus)
        setPaymentStatusForm({
          line: paymentStatus.line,
          name: paymentStatus.name,
          payment_class: paymentStatus.payment_class,
          accounting_account: paymentStatus.accounting_account || ''
        })
      } else {
        setEditingPaymentStatus(null)
        setPaymentStatusForm({
          line: 0,
          name: '',
          payment_class: selectedPaymentClass?.code || '',
          accounting_account: ''
        })
      }
      setPaymentStatusDialogError('')
      setPaymentStatusDialogOpen(true)
    },
    [selectedPaymentClass]
  )

  const openPaymentIdentificationDialog = useCallback(
    (paymentIdentification?: PaymentIdentification) => {
      if (paymentIdentification) {
        setEditingPaymentIdentification(paymentIdentification)
        setPaymentIdentificationForm({
          description: paymentIdentification.description,
          payment_status: paymentIdentification.payment_status,
          debit: paymentIdentification.debit,
          credit: paymentIdentification.credit,
          bank: paymentIdentification.bank,
          grouped: paymentIdentification.grouped
        })
      } else {
        setEditingPaymentIdentification(null)
        setPaymentIdentificationForm({
          description: '',
          payment_status: selectedPaymentStatus?.id || 0,
          debit: false,
          credit: false,
          bank: selectedBank?.code || '',
          grouped: false
        })
      }
      setPaymentIdentificationDialogError('')
      setPaymentIdentificationDialogOpen(true)
    },
    [selectedPaymentStatus, selectedBank]
  )

  // Payment Class Columns
  const paymentClassColumns = useMemo(
    () => [
      paymentClassColumnHelper.accessor('code', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1}>
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
      paymentClassColumnHelper.accessor('name', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1}>
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
      paymentClassColumnHelper.display({
        id: 'actions',
        header: dictionary?.navigation?.actions || 'Actions',
        cell: ({ row }) => (
          <Box>
            <IconButton
              onClick={e => {
                e.stopPropagation()
                openPaymentClassDialog(row.original)
              }}
            >
              <Edit />
            </IconButton>
            <IconButton
              onClick={e => {
                e.stopPropagation()
                handleDeletePaymentClass(row.original.code)
              }}
            >
              <Delete />
            </IconButton>
          </Box>
        )
      })
    ],
    [paymentClassColumnHelper, openPaymentClassDialog, handleDeletePaymentClass, dictionary]
  )

  // Load data
  const loadPaymentClasses = async () => {
    try {
      setLoading(true)
      const data = await paymentClassService.getPaymentClasses()
      setPaymentClasses(data)
    } catch (err: any) {
      const detail = err?.message || err?.response?.data?.message || ''
      const baseMessage =
        dictionary?.navigation?.failedToLoadPaymentClasses || 'Failed to load payment classes'
      setError(detail ? `${baseMessage}: ${detail}` : baseMessage)
      console.error('Error loading payment classes:', err)

      // If it's a network error, provide more specific guidance
      if (err?.code === 'ECONNREFUSED' || err?.message?.includes('No response')) {
        setError(
          dictionary?.navigation?.cannotConnectToServer ||
            'Cannot connect to server. Please ensure the backend server is running.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const loadPaymentStatuses = async (paymentClassCode: string) => {
    try {
      setLoading(true)
      const data = await paymentStatusService.getPaymentStatusesByClass(paymentClassCode)

      // Filter the data by payment class since the API returns all statuses
      const filteredData = data.filter(status => status.payment_class === paymentClassCode)

      setPaymentStatuses(filteredData)
    } catch (err: any) {
      const detail = err?.message || err?.response?.data?.message || ''
      const baseMessage =
        dictionary?.navigation?.failedToLoadPaymentStatuses || 'Failed to load payment statuses'
      setError(detail ? `${baseMessage}: ${detail}` : baseMessage)
      console.error('Error loading payment statuses:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadBanks = async () => {
    try {
      setLoading(true)
      const data = await bankService.getBanks()
      setBanks(data)
    } catch (err: any) {
      const detail = err?.message || err?.response?.data?.message || ''
      const baseMessage = dictionary?.navigation?.failedToLoadBanks || 'Failed to load banks'
      setError(detail ? `${baseMessage}: ${detail}` : baseMessage)
      console.error('Error loading banks:', err)

      // If it's a network error, provide more specific guidance
      if (err?.code === 'ECONNREFUSED' || err?.message?.includes('No response')) {
        setError(
          dictionary?.navigation?.cannotConnectToServer ||
            'Cannot connect to server. Please ensure the backend server is running.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const loadPaymentIdentifications = async (paymentStatusId: number, bankCode: string) => {
    try {
      setLoading(true)
      const data = await paymentIdentificationService.getPaymentIdentificationsByStatusAndBank(
        paymentStatusId,
        bankCode
      )
      setPaymentIdentifications(data)
    } catch (err: any) {
      const detail = err?.message || err?.response?.data?.message || ''
      const baseMessage =
        dictionary?.navigation?.failedToLoadPaymentIdentifications ||
        'Failed to load payment identifications'
      setError(detail ? `${baseMessage}: ${detail}` : baseMessage)
      console.error('Error loading payment identifications:', err)
    } finally {
      setLoading(false)
    }
  }

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

  useEffect(() => {
    loadPaymentClasses()
    loadBanks()
  }, [])

  // Handle URL parameter for payment class navigation
  useEffect(() => {
    if (paymentClasses.length > 0) {
      const urlParams = new URLSearchParams(window.location.search)
      const paymentClassCode = urlParams.get('paymentClass')
      
      if (paymentClassCode) {
        const paymentClass = paymentClasses.find(pc => pc.code === paymentClassCode)
        if (paymentClass && (!selectedPaymentClass || selectedPaymentClass.code !== paymentClassCode)) {
          setSelectedPaymentClass(paymentClass)
          setCurrentView('statuses')
          loadPaymentStatuses(paymentClass.code)
        }
      } else if (currentView === 'statuses' && selectedPaymentClass) {
        // If we're on statuses view but no URL parameter, keep the URL in sync
        const url = `${window.location.pathname}?paymentClass=${encodeURIComponent(selectedPaymentClass.code)}`
        window.history.replaceState({}, '', url)
      }
    }
  }, [paymentClasses, selectedPaymentClass, currentView])

  // Payment Class operations
  const handleCreatePaymentClass = async () => {
    try {
      setLoading(true)
      setPaymentClassDialogError('')
      await paymentClassService.createPaymentClass(paymentClassForm)
      setSuccess(dictionary?.navigation?.paymentClassCreatedSuccessfully || 'Payment class created successfully')
      setPaymentClassDialogOpen(false)
      setPaymentClassForm({ code: '', name: '' })
      loadPaymentClasses()
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || dictionary?.navigation?.failedToCreatePaymentClass || 'Failed to create payment class'
      setPaymentClassDialogError(errorMessage)
      console.error('Error creating payment class:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePaymentClass = async () => {
    if (!editingPaymentClass) return

    try {
      setLoading(true)
      setPaymentClassDialogError('')
      await paymentClassService.updatePaymentClass(editingPaymentClass.code, paymentClassForm)
      setSuccess(dictionary?.navigation?.paymentClassUpdatedSuccessfully || 'Payment class updated successfully')
      setPaymentClassDialogOpen(false)
      setEditingPaymentClass(null)
      setPaymentClassForm({ code: '', name: '' })
      loadPaymentClasses()
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || dictionary?.navigation?.failedToUpdatePaymentClass || 'Failed to update payment class'
      setPaymentClassDialogError(errorMessage)
      console.error('Error updating payment class:', err)
    } finally {
      setLoading(false)
    }
  }

  // Payment Status operations
  const handleCreatePaymentStatus = async () => {
    try {
      setLoading(true)
      setPaymentStatusDialogError('')
      await paymentStatusService.createPaymentStatus(paymentStatusForm)
      setSuccess(dictionary?.navigation?.paymentStatusCreatedSuccessfully || 'Payment status created successfully')
      setPaymentStatusDialogOpen(false)
      setPaymentStatusForm({ line: 0, name: '', payment_class: selectedPaymentClass?.code || '', accounting_account: '' })
      if (selectedPaymentClass) {
        loadPaymentStatuses(selectedPaymentClass.code)
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || dictionary?.navigation?.failedToCreatePaymentStatus || 'Failed to create payment status'
      setPaymentStatusDialogError(errorMessage)
      console.error('Error creating payment status:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePaymentStatus = async () => {
    if (!editingPaymentStatus) return

    try {
      setLoading(true)
      setPaymentStatusDialogError('')
      await paymentStatusService.updatePaymentStatus(editingPaymentStatus.id, paymentStatusForm)
      setSuccess(dictionary?.navigation?.paymentStatusUpdatedSuccessfully || 'Payment status updated successfully')
      setPaymentStatusDialogOpen(false)
      setEditingPaymentStatus(null)
      setPaymentStatusForm({ line: 0, name: '', payment_class: selectedPaymentClass?.code || '', accounting_account: '' })
      if (selectedPaymentClass) {
        loadPaymentStatuses(selectedPaymentClass.code)
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || dictionary?.navigation?.failedToUpdatePaymentStatus || 'Failed to update payment status'
      setPaymentStatusDialogError(errorMessage)
      console.error('Error updating payment status:', err)
    } finally {
      setLoading(false)
    }
  }

  // Payment Identification operations
  const handleCreatePaymentIdentification = async () => {
    try {
      setLoading(true)
      setPaymentIdentificationDialogError('')
      await paymentIdentificationService.createPaymentIdentification(paymentIdentificationForm)
      setSuccess(dictionary?.navigation?.paymentIdentificationCreatedSuccessfully || 'Payment identification created successfully')
      setPaymentIdentificationDialogOpen(false)
      setPaymentIdentificationForm({
        description: '',
        payment_status: 0,
        debit: false,
        credit: false,
        bank: '',
        grouped: false
      })
      if (selectedPaymentStatus && selectedBank) {
        loadPaymentIdentifications(selectedPaymentStatus.id, selectedBank.code)
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || dictionary?.navigation?.failedToCreatePaymentIdentification || 'Failed to create payment identification'
      setPaymentIdentificationDialogError(errorMessage)
      console.error('Error creating payment identification:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePaymentIdentification = async () => {
    if (!editingPaymentIdentification) return

    try {
      setLoading(true)
      setPaymentIdentificationDialogError('')
      await paymentIdentificationService.updatePaymentIdentification(
        editingPaymentIdentification.line,
        paymentIdentificationForm
      )
      setSuccess(dictionary?.navigation?.paymentIdentificationUpdatedSuccessfully || 'Payment identification updated successfully')
      setPaymentIdentificationDialogOpen(false)
      setEditingPaymentIdentification(null)
      setPaymentIdentificationForm({
        description: '',
        payment_status: 0,
        debit: false,
        credit: false,
        bank: '',
        grouped: false
      })
      if (selectedPaymentStatus && selectedBank) {
        loadPaymentIdentifications(selectedPaymentStatus.id, selectedBank.code)
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || dictionary?.navigation?.failedToUpdatePaymentIdentification || 'Failed to update payment identification'
      setPaymentIdentificationDialogError(errorMessage)
      console.error('Error updating payment identification:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToClasses = () => {
    setCurrentView('classes')
    setSelectedPaymentClass(null)
    setPaymentStatuses([])
    // Remove URL parameter when going back to classes
    const url = window.location.pathname
    window.history.replaceState({}, '', url)
  }

  const handlePaymentStatusClick = (paymentStatus: PaymentStatus) => {
    setSelectedPaymentStatus(paymentStatus)
    setSelectedBank(null)
    setPaymentIdentifications([])
  }

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank)
    if (selectedPaymentStatus) {
      const url = `/${lang}/admin/parameters/payment-identifications?paymentStatusId=${selectedPaymentStatus.id}&bankCode=${bank.code}`
      
      // Use replace instead of push to avoid adding to history and reduce page reload effect
      // The payment identifications page uses useSearchParams to reactively update without full reload
      router.replace(url)
    }
  }

  // Payment Status Columns
  const paymentStatusColumns = useMemo(
    () => [
      paymentStatusColumnHelper.accessor('line', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1}>
{dictionary?.navigation?.line || 'Line'}
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
      paymentStatusColumnHelper.accessor('name', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1}>
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
      paymentStatusColumnHelper.accessor('accounting_account', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1}>
            {dictionary?.navigation?.accountingAccount || 'Accounting Account'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => {
          const value = info.getValue()
          return value || '-'
        },
        enableSorting: true
      }),
      paymentStatusColumnHelper.display({
        id: 'bankSelection',
        header: dictionary?.navigation?.selectBank || 'Select Bank',
        cell: ({ row }) => {
          const isSelected = selectedPaymentStatus?.id === row.original.id
          return (
            <Box>
              {isSelected ? (
                <FormControl size='small' sx={{ minWidth: 200 }}>
                  <InputLabel>{dictionary?.navigation?.bank || 'Bank'}</InputLabel>
                  <Select
                    value={selectedBank?.code || ''}
                    label={dictionary?.navigation?.bank || 'Bank'}
                    onChange={e => {
                      const bankCode = e.target.value as string
                      const bank = banks.find(b => b.code === bankCode)
                      if (bank) {
                        handleBankSelect(bank)
                      }
                    }}
                  >
                    {banks.map(bank => (
                      <MenuItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Typography variant='body2' color='text.secondary'>
{dictionary?.navigation?.clickRowToSelectBank || 'Click row to select bank'}
                </Typography>
              )}
            </Box>
          )
        },
        enableSorting: false
      }),
      paymentStatusColumnHelper.display({
        id: 'actions',
        header: dictionary?.navigation?.actions || 'Actions',
        cell: ({ row }) => (
          <Box>
            <IconButton onClick={() => openPaymentStatusDialog(row.original)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDeletePaymentStatus(row.original.id)}>
              <Delete />
            </IconButton>
          </Box>
        )
      })
    ],
    [
      paymentStatusColumnHelper,
      openPaymentStatusDialog,
      handleDeletePaymentStatus,
      selectedPaymentStatus,
      selectedBank,
      banks,
      handleBankSelect,
      dictionary
    ]
  )

  // React Tables
  const paymentClassTable = useReactTable({
    data: paymentClasses,
    columns: paymentClassColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: paymentClassSearch,
      sorting: paymentClassSorting
    },
    onGlobalFilterChange: setPaymentClassSearch,
    onSortingChange: setPaymentClassSorting,
    filterFns: {
      fuzzy: () => false
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  const paymentStatusTable = useReactTable({
    data: paymentStatuses,
    columns: paymentStatusColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: paymentStatusSearch,
      sorting: paymentStatusSorting
    },
    onGlobalFilterChange: setPaymentStatusSearch,
    onSortingChange: setPaymentStatusSorting,
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
        {/* Breadcrumbs - First line */}
        <Breadcrumbs className='mb-4'>
          <Link component='button' variant='body1' onClick={() => setCurrentView('classes')} className='cursor-pointer' color='primary'>
            {dictionary?.navigation?.reconciliationParameters || 'Reconciliation Parameters'}
          </Link>
          {currentView === 'classes' && (
            <Typography color='text.primary'>{dictionary?.navigation?.paymentClasses || 'Payment Classes'}</Typography>
          )}
          {currentView === 'statuses' && selectedPaymentClass && (
            <Link component='button' variant='body1' onClick={handleBackToClasses} className='cursor-pointer'>
              {dictionary?.navigation?.paymentClasses || 'Payment Classes'}
            </Link>
          )}
          {currentView === 'statuses' && selectedPaymentClass && (
            <Typography color='text.primary'>{dictionary?.navigation?.paymentStatuses || 'Payment Statuses'}</Typography>
          )}
        </Breadcrumbs>

        <Typography color='text.secondary' className='mb-6'>
          {dictionary?.navigation?.reconciliationParametersDescription || 'Manage payment classes and their associated statuses'}
        </Typography>

        {error && (
          <Alert
            severity='error'
            className='mb-4'
            onClose={() => setError('')}
            action={
              error.includes('Cannot connect to server') ? (
                <Button
                  color='inherit'
                  size='small'
                  onClick={() => {
                    setError('')
                    loadPaymentClasses()
                    loadBanks()
                  }}
                >
{dictionary?.navigation?.retry || 'Retry'}
                </Button>
              ) : null
            }
          >
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
            title={
              currentView === 'classes' ? (
                <Typography variant="h6" color="primary.main">
                  {dictionary?.navigation?.paymentClasses || 'Payment Classes'}
                </Typography>
              ) : (
                <Typography variant="h6" component="span">
                  {selectedPaymentClass?.name} -{' '}
                  <Typography variant="h6" component="span" color="primary.main">
                    {dictionary?.navigation?.paymentStatuses || 'Payment Statuses'}
                  </Typography>
                </Typography>
              )
            }
            action={
              <Box>
                {currentView === 'statuses' && (
                  <Button variant='outlined' startIcon={<ArrowBack />} onClick={handleBackToClasses} className='mr-2'>
{dictionary?.navigation?.backToClasses || 'Back to Classes'}
                  </Button>
                )}
                {currentView === 'classes' && (
                  <Button variant='contained' startIcon={<Add />} onClick={() => openPaymentClassDialog()}>
{dictionary?.navigation?.addPaymentClass || 'Add Payment Class'}
                  </Button>
                )}
                {currentView === 'statuses' && (
                  <Button variant='contained' startIcon={<Add />} onClick={() => openPaymentStatusDialog()}>
{dictionary?.navigation?.addPaymentStatus || 'Add Payment Status'}
                  </Button>
                )}
              </Box>
            }
          />

          {currentView === 'classes' ? (
            <>
              <Box sx={{ px: 6, pt: 2, pb: 0 }}>
                <CustomTextField
                  fullWidth
                  placeholder={dictionary?.navigation?.searchPaymentClasses || 'Search payment classes...'}
                  value={paymentClassSearch}
                  onChange={e => setPaymentClassSearch(e.target.value)}
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
                  <div className='overflow-x-auto' style={{ marginTop: '16px' }}>
                    <table className={styles.table}>
                      <thead>
                        {paymentClassTable.getHeaderGroups().map(headerGroup => (
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
                        {paymentClassTable.getRowModel().rows.map(row => (
                          <tr
                            key={row.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedPaymentClass(row.original)
                              setCurrentView('statuses')
                              loadPaymentStatuses(row.original.code)
                              // Update URL to include payment class parameter for persistence
                              const url = `${window.location.pathname}?paymentClass=${encodeURIComponent(row.original.code)}`
                              window.history.pushState({}, '', url)
                            }}
                          >
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <TablePaginationComponent table={paymentClassTable as any} dictionary={dictionary} />
                </>
              )}
            </>
          ) : currentView === 'statuses' ? (
            <>
              <Box sx={{ px: 6, pt: 2, pb: 0 }}>
                <CustomTextField
                  fullWidth
                  placeholder={dictionary?.navigation?.searchPaymentStatuses || 'Search payment statuses...'}
                  value={paymentStatusSearch}
                  onChange={e => setPaymentStatusSearch(e.target.value)}
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
                  <div className='overflow-x-auto' style={{ marginTop: '16px' }}>
                    <table className={styles.table}>
                      <thead>
                        {paymentStatusTable.getHeaderGroups().map(headerGroup => (
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
                        {paymentStatusTable.getRowModel().rows.map(row => (
                          <tr
                            key={row.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handlePaymentStatusClick(row.original)}
                          >
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <TablePaginationComponent table={paymentStatusTable as any} dictionary={dictionary} />
                </>
              )}
            </>
          ) : null}
        </Card>
      </Grid>

      {/* Payment Class Dialog */}
      <Dialog
        fullWidth
        open={paymentClassDialogOpen}
        onClose={() => setPaymentClassDialogOpen(false)}
        maxWidth='sm'
        scroll='body'
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={() => setPaymentClassDialogOpen(false)} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          {editingPaymentClass ? (dictionary?.navigation?.editPaymentClass || 'Edit Payment Class') : (dictionary?.navigation?.addNewPaymentClass || 'Add New Payment Class')}
          <Typography component='span' className='flex flex-col text-center'>
            {editingPaymentClass ? (dictionary?.navigation?.updatePaymentClassInformation || 'Update payment class information') : (dictionary?.navigation?.addNewPaymentClassToSystem || 'Add a new payment class to the system')}
          </Typography>
        </DialogTitle>
        <form onSubmit={e => e.preventDefault()}>
          <DialogContent className='pbs-0 sm:pli-16'>
            <Box className='flex flex-col gap-6'>
              {paymentClassDialogError && (
                <Alert severity='error' onClose={() => setPaymentClassDialogError('')}>
                  {paymentClassDialogError}
                </Alert>
              )}
              <CustomTextField
                fullWidth
                label={dictionary?.navigation?.code || 'Code'}
                value={paymentClassForm.code}
                onChange={e => setPaymentClassForm({ ...paymentClassForm, code: e.target.value })}
              />
              <CustomTextField
                fullWidth
                label={dictionary?.navigation?.name || 'Name'}
                value={paymentClassForm.name}
                onChange={e => setPaymentClassForm({ ...paymentClassForm, name: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions className='gap-2 pbs-0 sm:pbe-16 sm:pli-16'>
            <Button variant='outlined' color='secondary' onClick={() => setPaymentClassDialogOpen(false)}>
              {dictionary?.navigation?.cancel || 'Cancel'}
            </Button>
            <Button
              variant='contained'
              onClick={editingPaymentClass ? handleUpdatePaymentClass : handleCreatePaymentClass}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : editingPaymentClass ? (dictionary?.navigation?.update || 'Update') : (dictionary?.navigation?.create || 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Payment Status Dialog */}
      <Dialog
        fullWidth
        open={paymentStatusDialogOpen}
        onClose={() => setPaymentStatusDialogOpen(false)}
        maxWidth='sm'
        scroll='body'
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={() => setPaymentStatusDialogOpen(false)} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          {editingPaymentStatus ? (dictionary?.navigation?.editPaymentStatus || 'Edit Payment Status') : (dictionary?.navigation?.addNewPaymentStatus || 'Add New Payment Status')}
          <Typography component='span' className='flex flex-col text-center'>
            {editingPaymentStatus ? (dictionary?.navigation?.updatePaymentStatusInformation || 'Update payment status information') : (dictionary?.navigation?.addNewPaymentStatusToSystem || 'Add a new payment status to the system')}
          </Typography>
        </DialogTitle>
        <form onSubmit={e => e.preventDefault()}>
          <DialogContent className='pbs-0 sm:pli-16'>
            <Box className='flex flex-col gap-6'>
              {paymentStatusDialogError && (
                <Alert severity='error' onClose={() => setPaymentStatusDialogError('')}>
                  {paymentStatusDialogError}
                </Alert>
              )}
              <CustomTextField
                fullWidth
                label={dictionary?.navigation?.line || 'Line'}
                type='number'
                value={paymentStatusForm.line || ''}
                onChange={e => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                  setPaymentStatusForm({ ...paymentStatusForm, line: isNaN(value) ? 0 : value })
                }}
              />
              <CustomTextField
                fullWidth
                label={dictionary?.navigation?.name || 'Name'}
                value={paymentStatusForm.name}
                onChange={e => setPaymentStatusForm({ ...paymentStatusForm, name: e.target.value })}
              />
              <CustomTextField
                fullWidth
                label={dictionary?.navigation?.accountingAccount || 'Accounting Account'}
                value={paymentStatusForm.accounting_account || ''}
                onChange={e => setPaymentStatusForm({ ...paymentStatusForm, accounting_account: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>{dictionary?.navigation?.paymentClass || 'Payment Class'}</InputLabel>
                <Select
                  value={paymentStatusForm.payment_class}
                  label={dictionary?.navigation?.paymentClass || 'Payment Class'}
                  onChange={e => setPaymentStatusForm({ ...paymentStatusForm, payment_class: e.target.value })}
                >
                  {paymentClasses.map(paymentClass => (
                    <MenuItem key={paymentClass.code} value={paymentClass.code}>
                      {paymentClass.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions className='gap-2 pbs-0 sm:pbe-16 sm:pli-16'>
            <Button variant='outlined' color='secondary' onClick={() => setPaymentStatusDialogOpen(false)}>
              {dictionary?.navigation?.cancel || 'Cancel'}
            </Button>
            <Button
              variant='contained'
              onClick={editingPaymentStatus ? handleUpdatePaymentStatus : handleCreatePaymentStatus}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : editingPaymentStatus ? (dictionary?.navigation?.update || 'Update') : (dictionary?.navigation?.create || 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Payment Identification Dialog */}
      <Dialog
        fullWidth
        open={paymentIdentificationDialogOpen}
        onClose={() => setPaymentIdentificationDialogOpen(false)}
        maxWidth='sm'
        scroll='body'
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={() => setPaymentIdentificationDialogOpen(false)} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          {editingPaymentIdentification ? 'Edit Payment Identification' : 'Add New Payment Identification'}
          <Typography component='span' className='flex flex-col text-center'>
            {editingPaymentIdentification
              ? 'Update payment identification information'
              : 'Add a new payment identification to the system'}
          </Typography>
        </DialogTitle>
        <form onSubmit={e => e.preventDefault()}>
          <DialogContent className='pbs-0 sm:pli-16'>
            <Box className='flex flex-col gap-6'>
              {paymentIdentificationDialogError && (
                <Alert severity='error' onClose={() => setPaymentIdentificationDialogError('')}>
                  {paymentIdentificationDialogError}
                </Alert>
              )}
              <CustomTextField
                fullWidth
                label='Description'
                value={paymentIdentificationForm.description}
                onChange={e =>
                  setPaymentIdentificationForm({ ...paymentIdentificationForm, description: e.target.value })
                }
              />
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentIdentificationForm.payment_status}
                  label='Payment Status'
                  onChange={e =>
                    setPaymentIdentificationForm({
                      ...paymentIdentificationForm,
                      payment_status: e.target.value as number
                    })
                  }
                >
                  {paymentStatuses.map(status => (
                    <MenuItem key={status.id} value={status.id}>
                      {status.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Bank</InputLabel>
                <Select
                  value={paymentIdentificationForm.bank}
                  label='Bank'
                  onChange={e => setPaymentIdentificationForm({ ...paymentIdentificationForm, bank: e.target.value })}
                >
                  {banks.map(bank => (
                    <MenuItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box display='flex' gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Debit</InputLabel>
                  <Select
                    value={String(paymentIdentificationForm.debit)}
                    label='Debit'
                    onChange={e =>
                      setPaymentIdentificationForm({ ...paymentIdentificationForm, debit: e.target.value === 'true' })
                    }
                  >
                    <MenuItem value='true'>Yes</MenuItem>
                    <MenuItem value='false'>No</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Credit</InputLabel>
                  <Select
                    value={String(paymentIdentificationForm.credit)}
                    label='Credit'
                    onChange={e =>
                      setPaymentIdentificationForm({ ...paymentIdentificationForm, credit: e.target.value === 'true' })
                    }
                  >
                    <MenuItem value='true'>Yes</MenuItem>
                    <MenuItem value='false'>No</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <FormControl fullWidth>
                <InputLabel>Grouped</InputLabel>
                <Select
                  value={String(paymentIdentificationForm.grouped)}
                  label='Grouped'
                  onChange={e =>
                    setPaymentIdentificationForm({ ...paymentIdentificationForm, grouped: e.target.value === 'true' })
                  }
                >
                  <MenuItem value='true'>Yes</MenuItem>
                  <MenuItem value='false'>No</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions className='gap-2 pbs-0 sm:pbe-16 sm:pli-16'>
            <Button variant='outlined' color='secondary' onClick={() => setPaymentIdentificationDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='contained'
              onClick={
                editingPaymentIdentification ? handleUpdatePaymentIdentification : handleCreatePaymentIdentification
              }
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : editingPaymentIdentification ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Payment Class Confirmation Dialog */}
      <Dialog
        fullWidth
        open={deletePaymentClassDialogOpen}
        onClose={() => {
          setDeletePaymentClassDialogOpen(false)
          setPaymentClassToDelete(null)
        }}
        maxWidth='xs'
        scroll='body'
        closeAfterTransition={false}
      >
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='tabler-alert-circle text-[88px] mbe-6 text-error' />
          <Typography variant='h4' className='mbe-2'>
            {dictionary?.navigation?.confirmDeletePaymentClass?.replace('{paymentClassName}', paymentClassToDelete || '') || 'Are you sure you want to delete this payment class?'}
          </Typography>
          <Typography color='text.primary'>
            {dictionary?.navigation?.confirmDeletePaymentClassMessage || 'You won\'t be able to revert this action!'}
          </Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              setDeletePaymentClassDialogOpen(false)
              setPaymentClassToDelete(null)
            }}
          >
            {dictionary?.navigation?.cancel || 'Cancel'}
          </Button>
          <Button variant='contained' color='error' onClick={handleConfirmDeletePaymentClass} disabled={loading}>
            {dictionary?.navigation?.delete || 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Payment Status Confirmation Dialog */}
      <Dialog
        fullWidth
        open={deletePaymentStatusDialogOpen}
        onClose={() => {
          setDeletePaymentStatusDialogOpen(false)
          setPaymentStatusToDelete(null)
        }}
        maxWidth='xs'
        scroll='body'
        closeAfterTransition={false}
      >
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='tabler-alert-circle text-[88px] mbe-6 text-error' />
          <Typography variant='h4' className='mbe-2'>
            {dictionary?.navigation?.confirmDeletePaymentStatus?.replace('{paymentStatusName}', paymentStatuses.find(s => s.id === paymentStatusToDelete)?.name || String(paymentStatusToDelete || '')) || 'Are you sure you want to delete this payment status?'}
          </Typography>
          <Typography color='text.primary'>
            {dictionary?.navigation?.confirmDeletePaymentStatusMessage || 'You won\'t be able to revert this action!'}
          </Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              setDeletePaymentStatusDialogOpen(false)
              setPaymentStatusToDelete(null)
            }}
          >
            {dictionary?.navigation?.cancel || 'Cancel'}
          </Button>
          <Button variant='contained' color='error' onClick={handleConfirmDeletePaymentStatus} disabled={loading}>
            {dictionary?.navigation?.delete || 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Payment Identification Confirmation Dialog */}
      <Dialog
        fullWidth
        open={deletePaymentIdentificationDialogOpen}
        onClose={() => {
          setDeletePaymentIdentificationDialogOpen(false)
          setPaymentIdentificationToDelete(null)
        }}
        maxWidth='xs'
        scroll='body'
        closeAfterTransition={false}
      >
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='tabler-alert-circle text-[88px] mbe-6 text-error' />
          <Typography variant='h4' className='mbe-2'>
            {dictionary?.navigation?.confirmDeletePaymentIdentification?.replace('{paymentIdentificationDescription}', paymentIdentifications.find(i => i.id === paymentIdentificationToDelete)?.description || String(paymentIdentificationToDelete || '')) || 'Are you sure you want to delete this payment identification?'}
          </Typography>
          <Typography color='text.primary'>
            {dictionary?.navigation?.confirmDeletePaymentIdentificationMessage || 'You won\'t be able to revert this action!'}
          </Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              setDeletePaymentIdentificationDialogOpen(false)
              setPaymentIdentificationToDelete(null)
            }}
          >
            {dictionary?.navigation?.cancel || 'Cancel'}
          </Button>
          <Button variant='contained' color='error' onClick={handleConfirmDeletePaymentIdentification} disabled={loading}>
            {dictionary?.navigation?.delete || 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default PaymentManagement
