'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

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
import { Edit, Delete, Search, Add, ArrowBack, ArrowUpward, ArrowDownward } from '@mui/icons-material'

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
import { paymentIdentificationService } from '@/services/paymentIdentification.service'
import { paymentStatusService } from '@/services/paymentStatus.service'
import { bankService } from '@/services/bank.service'
import { paymentClassService } from '@/services/paymentClass.service'

// Type Imports
import type { PaymentIdentification, CreatePaymentIdentificationDto } from '@/types/paymentIdentification'
import type { PaymentStatus } from '@/types/paymentStatus'
import type { Bank } from '@/types/bank'
import type { PaymentClass } from '@/types/paymentClass'

// Style Imports
import styles from '@core/styles/table.module.css'

// Dictionary imports
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

const PaymentIdentificationsPage = () => {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const lang = (params.lang as Locale) || 'en'
  
  // Dictionary state
  const [dictionary, setDictionary] = useState<any>(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(true)
  
  // Get parameters from URL using useSearchParams for reactive updates
  const [paymentStatusId, setPaymentStatusId] = useState<number | null>(null)
  const [bankCode, setBankCode] = useState<string | null>(null)
  const [paymentIdentifications, setPaymentIdentifications] = useState<PaymentIdentification[]>([])
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [paymentClass, setPaymentClass] = useState<PaymentClass | null>(null)
  const [bank, setBank] = useState<Bank | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIdentification, setEditingIdentification] = useState<PaymentIdentification | null>(null)
  const [dialogError, setDialogError] = useState('')
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paymentIdentificationToDelete, setPaymentIdentificationToDelete] = useState<number | null>(null)

  // Form states
  const [form, setForm] = useState<CreatePaymentIdentificationDto>({
    description: '',
    payment_status: 0,
    debit: false,
    credit: false,
    bank: '',
    grouped: false
  })

  // Search and sorting states
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  // Column Helper
  const columnHelper = createColumnHelper<PaymentIdentification>()

  // Fallback dictionary if loading failed
  const safeDictionary = dictionary || { navigation: {} }

  // Load data
  const loadPaymentIdentifications = useCallback(async () => {
    if (!paymentStatusId || !bankCode) {
      console.log('❌ Missing parameters:', { paymentStatusId, bankCode })
      return
    }

    console.log('🔄 Loading payment identifications with:', { paymentStatusId, bankCode })

    try {
      setLoading(true)
      const data = await paymentIdentificationService.getPaymentIdentificationsByStatusAndBank(
        paymentStatusId,
        bankCode
      )
      console.log('✅ Loaded payment identifications:', data)
      setPaymentIdentifications(data)
    } catch (err) {
      setError('Failed to load payment identifications')
      console.error('Error loading payment identifications:', err)
    } finally {
      setLoading(false)
    }
  }, [paymentStatusId, bankCode])

  const loadPaymentStatus = async () => {
    if (!paymentStatusId) return

    try {
      const data = await paymentStatusService.getPaymentStatuses()
      const status = data.find(s => s.id === paymentStatusId)
      if (status) {
        setPaymentStatus(status)
        // Load payment class when status is loaded
        if (status.payment_class) {
          loadPaymentClass(status.payment_class)
        }
      }
    } catch (err) {
      console.error('Error loading payment status:', err)
    }
  }

  const loadPaymentClass = async (paymentClassCode: string) => {
    try {
      const data = await paymentClassService.getPaymentClassByCode(paymentClassCode)
      setPaymentClass(data)
    } catch (err) {
      console.error('Error loading payment class:', err)
    }
  }

  const loadBank = async () => {
    if (!bankCode) return

    try {
      const data = await bankService.getBanks()
      const bankData = data.find(b => b.code === bankCode)
      if (bankData) {
        setBank(bankData)
      }
    } catch (err) {
      console.error('Error loading bank:', err)
    }
  }

  // Parse URL parameters reactively using useSearchParams
  useEffect(() => {
    const statusId = searchParams.get('paymentStatusId')
    const bank = searchParams.get('bankCode')

    if (statusId) {
      const parsedId = parseInt(statusId)
      if (!isNaN(parsedId) && parsedId !== paymentStatusId) {
        setPaymentStatusId(parsedId)
      }
    } else if (paymentStatusId !== null) {
      setPaymentStatusId(null)
    }
    
    if (bank && bank !== bankCode) {
      setBankCode(bank)
    } else if (!bank && bankCode !== null) {
      setBankCode(null)
    }
  }, [searchParams, paymentStatusId, bankCode])

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
    if (paymentStatusId && bankCode) {
      loadPaymentStatus()
      loadBank()
      loadPaymentIdentifications()
    }
  }, [paymentStatusId, bankCode])

  // Handler functions
  const handleDelete = useCallback((line: number) => {
    if (!line || line === undefined) {
      setError('Cannot delete: No valid identifier found')
      return
    }
    setPaymentIdentificationToDelete(line)
    setDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(
    async () => {
      if (!paymentIdentificationToDelete || paymentIdentificationToDelete === undefined) {
        setError('Cannot delete: No valid identifier found')
        return
      }

      try {
        setLoading(true)
        await paymentIdentificationService.deletePaymentIdentification(paymentIdentificationToDelete)
        setSuccess(safeDictionary?.navigation?.paymentIdentificationDeletedSuccessfully || 'Payment identification deleted successfully')
        setDeleteDialogOpen(false)
        setPaymentIdentificationToDelete(null)
        // Reload the data to refresh the table
        await loadPaymentIdentifications()
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } catch (err: any) {
        console.error('Error deleting payment identification:', err)
        setError(`${safeDictionary?.navigation?.failedToDeletePaymentIdentification || 'Failed to delete payment identification'}: ${err.response?.data?.detail || err.message}`)
      } finally {
        setLoading(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [paymentIdentificationToDelete, safeDictionary]
  )

  const openDialog = useCallback(
    (identification?: PaymentIdentification) => {
      if (identification) {
        setEditingIdentification(identification)
        setForm({
          description: identification.description,
          payment_status: identification.payment_status,
          debit: identification.debit,
          credit: identification.credit,
          bank: identification.bank,
          grouped: identification.grouped || false
        })
      } else {
        setEditingIdentification(null)
        setForm({
          description: '',
          payment_status: paymentStatusId || 0,
          debit: false,
          credit: false,
          bank: bankCode || '',
          grouped: false
        })
      }
      setDialogError('')
      setDialogOpen(true)
    },
    [paymentStatusId, bankCode]
  )

  const handleCreate = useCallback(async () => {
    // Validate debit/credit mutual exclusivity
    if (form.debit === form.credit) {
      setDialogError(safeDictionary?.navigation?.debitCreditValidationError || 'Debit and credit cannot have the same value. One must be True and the other False.')
      return
    }

    try {
      setLoading(true)
      setDialogError('')
      await paymentIdentificationService.createPaymentIdentification(form)
      setSuccess(safeDictionary?.navigation?.paymentIdentificationCreatedSuccessfully || 'Payment identification created successfully')
      setDialogOpen(false)
      setForm({
        description: '',
        payment_status: paymentStatusId || 0,
        debit: false,
        credit: false,
        bank: bankCode || '',
        grouped: false
      })
      await loadPaymentIdentifications()
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Error creating payment identification:', err)
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || safeDictionary?.navigation?.failedToCreatePaymentIdentification || 'Failed to create payment identification'
      if (err.response?.data && typeof err.response.data === 'object' && !err.response.data.detail && !err.response.data.message) {
        setDialogError(`${safeDictionary?.navigation?.failedToCreatePaymentIdentification || 'Failed to create payment identification'}: ${JSON.stringify(err.response.data)}`)
      } else {
        setDialogError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [form, paymentStatusId, bankCode, loadPaymentIdentifications, safeDictionary])

  const handleUpdate = useCallback(async () => {
    if (!editingIdentification) return

    // Validate debit/credit mutual exclusivity
    if (form.debit === form.credit) {
      setDialogError(safeDictionary?.navigation?.debitCreditValidationError || 'Debit and credit cannot have the same value. One must be True and the other False.')
      return
    }

    try {
      setLoading(true)
      setDialogError('')
      await paymentIdentificationService.updatePaymentIdentification(editingIdentification.line, form)
      setSuccess(safeDictionary?.navigation?.paymentIdentificationUpdatedSuccessfully || 'Payment identification updated successfully')
      setDialogOpen(false)
      setEditingIdentification(null)
      setForm({
        description: '',
        payment_status: paymentStatusId || 0,
        debit: false,
        credit: false,
        bank: bankCode || '',
        grouped: false
      })
      await loadPaymentIdentifications()
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Error updating payment identification:', err)
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || safeDictionary?.navigation?.failedToUpdatePaymentIdentification || 'Failed to update payment identification'
      if (err.response?.data && typeof err.response.data === 'object' && !err.response.data.detail && !err.response.data.message) {
        setDialogError(`${safeDictionary?.navigation?.failedToUpdatePaymentIdentification || 'Failed to update payment identification'}: ${JSON.stringify(err.response.data)}`)
      } else {
        setDialogError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [editingIdentification, form, paymentStatusId, bankCode, loadPaymentIdentifications, safeDictionary])

  // Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('description', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1}>
{safeDictionary?.navigation?.description || 'Description'}
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
      columnHelper.accessor('debit', {
        header: safeDictionary?.navigation?.debit || 'Debit',
        cell: info => (
          <Chip
            label={info.getValue() ? (safeDictionary?.navigation?.yes || 'Yes') : (safeDictionary?.navigation?.no || 'No')}
            color={info.getValue() ? 'primary' : 'default'}
            size='small'
            sx={{
              backgroundColor: info.getValue() ? 'primary.main' : 'grey.300',
              color: info.getValue() ? 'primary.contrastText' : 'text.secondary',
              '&:hover': {
                backgroundColor: info.getValue() ? 'primary.dark' : 'grey.400'
              }
            }}
          />
        ),
        enableSorting: true
      }),
      columnHelper.accessor('credit', {
        header: safeDictionary?.navigation?.credit || 'Credit',
        cell: info => (
          <Chip
            label={info.getValue() ? (safeDictionary?.navigation?.yes || 'Yes') : (safeDictionary?.navigation?.no || 'No')}
            color={info.getValue() ? 'primary' : 'default'}
            size='small'
            sx={{
              backgroundColor: info.getValue() ? 'primary.main' : 'grey.300',
              color: info.getValue() ? 'primary.contrastText' : 'text.secondary',
              '&:hover': {
                backgroundColor: info.getValue() ? 'primary.dark' : 'grey.400'
              }
            }}
          />
        ),
        enableSorting: true
      }),
      columnHelper.accessor('grouped', {
        header: safeDictionary?.navigation?.grouped || 'Grouped',
        cell: info => {
          const value = info.getValue()
          return (
            <Chip
              label={value ? (safeDictionary?.navigation?.yes || 'Yes') : (safeDictionary?.navigation?.no || 'No')}
              color={value ? 'primary' : 'default'}
              size='small'
              sx={{
                backgroundColor: value ? 'primary.main' : 'grey.300',
                color: value ? 'primary.contrastText' : 'text.secondary',
                '&:hover': {
                  backgroundColor: value ? 'primary.dark' : 'grey.400'
                }
              }}
            />
          )
        },
        enableSorting: true
      }),
      columnHelper.display({
        id: 'actions',
        header: safeDictionary?.navigation?.actions || 'Actions',
        cell: ({ row }) => (
          <Box>
            <IconButton onClick={() => openDialog(row.original)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDelete(row.original.line)}>
              <Delete />
            </IconButton>
          </Box>
        ),
        enableSorting: false
      })
    ],
    [columnHelper, openDialog, handleDelete, safeDictionary]
  )

  // React Table
  const table = useReactTable({
    data: paymentIdentifications,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: search,
      sorting
    },
    onGlobalFilterChange: setSearch,
    onSortingChange: setSorting,
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

  if (!paymentStatusId || !bankCode) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Alert severity='error'>
{safeDictionary?.navigation?.paymentStatusAndBankRequired || 'Payment status and bank information is required to view payment identifications.'}
          </Alert>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs className='mb-4'>
          <Link 
            component='button' 
            variant='body1' 
            onClick={() => {
              const url = `/${lang}/admin/parameters/reconciliation`
              router.push(url)
            }} 
            className='cursor-pointer' 
            color='primary'
          >
            {safeDictionary?.navigation?.reconciliationParameters || 'Reconciliation Parameters'}
          </Link>
          {paymentClass && (
            <Link 
              component='button' 
              variant='body1' 
              onClick={() => {
                const url = `/${lang}/admin/parameters/reconciliation`
                router.push(url)
              }} 
              className='cursor-pointer'
            >
              {safeDictionary?.navigation?.paymentClasses || 'Payment Classes'}
            </Link>
          )}
          {paymentStatus && paymentClass && (
            <Link 
              component='button' 
              variant='body1' 
              onClick={() => {
                const url = `/${lang}/admin/parameters/reconciliation?paymentClass=${encodeURIComponent(paymentClass.code)}`
                router.push(url)
              }} 
              className='cursor-pointer'
            >
              {safeDictionary?.navigation?.paymentStatuses || 'Payment Statuses'}
            </Link>
          )}
          <Typography color='text.primary'>
            {safeDictionary?.navigation?.paymentIdentifications || 'Payment Identifications'}
          </Typography>
        </Breadcrumbs>

        <Typography color='text.secondary' className='mb-6'>
          {safeDictionary?.navigation?.reconciliationParametersDescription || 'Manage payment classes, their statuses and their associated identifications'}
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
            title={
              <Typography variant="h6" component="span">
                {paymentStatus?.name} - {bank?.name} -{' '}
                <Typography variant="h6" component="span" color="primary.main">
                  {safeDictionary?.navigation?.paymentIdentifications || 'Payment Identifications'}
                </Typography>
              </Typography>
            }
            action={
              <Box>
                <Button
                  variant='outlined'
                  startIcon={<ArrowBack />}
                  onClick={() => {
                    if (paymentClass?.code) {
                      router.push(`/${lang}/admin/parameters/reconciliation?paymentClass=${paymentClass.code}`)
                    } else {
                      router.push(`/${lang}/admin/parameters/reconciliation`)
                    }
                  }}
                  className='mr-2'
                >
{safeDictionary?.navigation?.backToStatuses || 'Back to Statuses'}
                </Button>
                <Button variant='contained' startIcon={<Add />} onClick={() => openDialog()}>
{safeDictionary?.navigation?.addIdentification || 'Add Identification'}
                </Button>
              </Box>
            }
          />
          <CardContent>
            <Box className='mb-4'>
              <CustomTextField
                fullWidth
                placeholder={safeDictionary?.navigation?.searchPaymentIdentifications || 'Search payment identifications...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
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
                      {table.getHeaderGroups().map(headerGroup => (
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
                      {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePaginationComponent table={table as any} dictionary={safeDictionary} />
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Dialog */}
      <Dialog
        fullWidth
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth='sm'
        scroll='body'
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={() => setDialogOpen(false)} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          {editingIdentification ? (safeDictionary?.navigation?.editPaymentIdentification || 'Edit Payment Identification') : (safeDictionary?.navigation?.addNewPaymentIdentification || 'Add New Payment Identification')}
          <Typography component='span' className='flex flex-col text-center'>
            {editingIdentification ? (safeDictionary?.navigation?.updatePaymentIdentificationInformation || 'Update payment identification information') : (safeDictionary?.navigation?.addNewPaymentIdentification || 'Add a new payment identification')}
          </Typography>
        </DialogTitle>
        <form onSubmit={e => e.preventDefault()}>
          <DialogContent className='pbs-0 sm:pli-16'>
            <Box className='flex flex-col gap-6'>
              {dialogError && (
                <Alert severity='error' onClose={() => setDialogError('')}>
                  {dialogError}
                </Alert>
              )}
              <CustomTextField
                fullWidth
                label={safeDictionary?.navigation?.description || 'Description'}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>{safeDictionary?.navigation?.debit || 'Debit'}</InputLabel>
                <Select
                  value={String(form.debit)}
                  label={safeDictionary?.navigation?.debit || 'Debit'}
                  onChange={e => setForm({ ...form, debit: e.target.value === 'true' })}
                >
                  <MenuItem value='true'>{safeDictionary?.navigation?.yes || 'Yes'}</MenuItem>
                  <MenuItem value='false'>{safeDictionary?.navigation?.no || 'No'}</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>{safeDictionary?.navigation?.credit || 'Credit'}</InputLabel>
                <Select
                  value={String(form.credit)}
                  label={safeDictionary?.navigation?.credit || 'Credit'}
                  onChange={e => setForm({ ...form, credit: e.target.value === 'true' })}
                >
                  <MenuItem value='true'>{safeDictionary?.navigation?.yes || 'Yes'}</MenuItem>
                  <MenuItem value='false'>{safeDictionary?.navigation?.no || 'No'}</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>{safeDictionary?.navigation?.grouped || 'Grouped'}</InputLabel>
                <Select
                  value={String(form.grouped)}
                  label={safeDictionary?.navigation?.grouped || 'Grouped'}
                  onChange={e => setForm({ ...form, grouped: e.target.value === 'true' })}
                >
                  <MenuItem value='true'>{safeDictionary?.navigation?.yes || 'Yes'}</MenuItem>
                  <MenuItem value='false'>{safeDictionary?.navigation?.no || 'No'}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions className='gap-2 pbs-0 sm:pbe-16 sm:pli-16'>
            <Button variant='outlined' color='secondary' onClick={() => setDialogOpen(false)}>
{safeDictionary?.navigation?.cancel || 'Cancel'}
            </Button>
            <Button
              variant='contained'
              onClick={editingIdentification ? handleUpdate : handleCreate}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : editingIdentification ? (safeDictionary?.navigation?.update || 'Update') : (safeDictionary?.navigation?.create || 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Payment Identification Confirmation Dialog */}
      <Dialog
        fullWidth
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setPaymentIdentificationToDelete(null)
        }}
        maxWidth='xs'
        scroll='body'
        closeAfterTransition={false}
      >
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='tabler-alert-circle text-[88px] mbe-6 text-error' />
          <Typography variant='h4' className='mbe-2'>
            {safeDictionary?.navigation?.confirmDeletePaymentIdentification?.replace('{paymentIdentificationDescription}', paymentIdentifications.find(i => i.line === paymentIdentificationToDelete)?.description || String(paymentIdentificationToDelete || '')) || 'Are you sure you want to delete this payment identification?'}
          </Typography>
          <Typography color='text.primary'>
            {safeDictionary?.navigation?.confirmDeletePaymentIdentificationMessage || 'You won\'t be able to revert this action!'}
          </Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              setDeleteDialogOpen(false)
              setPaymentIdentificationToDelete(null)
            }}
          >
            {safeDictionary?.navigation?.cancel || 'Cancel'}
          </Button>
          <Button variant='contained' color='error' onClick={handleConfirmDelete} disabled={loading}>
            {safeDictionary?.navigation?.delete || 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default PaymentIdentificationsPage
