'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'

// Dictionary imports
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

import {
  Typography,
  Grid,
  Card,
  CardHeader,
  Button,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  Chip
} from '@mui/material'
import { Search, Business, ArrowUpward, ArrowDownward } from '@mui/icons-material'

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
import TablePaginationComponent from '@/components/TablePaginationComponent'

// Service Imports
import { companyService } from '@/services/company.service'

// Type Imports
import type { Company } from '@/types/company'

// Style Imports
import styles from '@core/styles/table.module.css'

// Context Imports
import { useTableColumnVisibility } from '@/contexts/tableColumnVisibilityContext'

const CompanyListPage = () => {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const lang = params.lang as Locale
  
  // Dictionary state
  const [dictionary, setDictionary] = useState<any>(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(true)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Search state
  const [companySearch, setCompanySearch] = useState('')

  // Sorting state
  const [companySorting, setCompanySorting] = useState<SortingState>([])

  // Logo dimensions state - stores aspect ratio info for each logo
  const [logoDimensions, setLogoDimensions] = useState<Record<string, { width: number; height: number; aspectRatio: 'landscape' | 'portrait' | 'square' }>>({})

  // Table column visibility
  const { registerTable, unregisterTable, isColumnVisible } = useTableColumnVisibility()

  // Column Helper
  const companyColumnHelper = createColumnHelper<Company>()

  // Company Columns
  const companyColumns = useMemo(
    () => [
      companyColumnHelper.display({
        id: 'logo',
        meta: { visible: isColumnVisible('company-list', 'logo', pathname) },
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
                maxWidth = 120
                maxHeight = 120
                width = '120px'
                height = 'auto'
              } else if (dimensions.aspectRatio === 'portrait') {
                // Portrait: constrain height
                maxWidth = 120
                maxHeight = 120
                width = 'auto'
                height = '120px'
              } else {
                // Square: use current approach
                maxWidth = 120
                maxHeight = 120
                width = 'auto'
                height = 'auto'
              }
            }
            
            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 120,
                  height: 'auto',
                  padding: '0 !important'
                }}
              >
                <img
                  src={logoUrl}
                  alt={`${row.original.name} logo`}
                  style={{
                    maxWidth: `${maxWidth}px`,
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
                width: 120,
                height: 'auto',
                color: 'text.secondary',
                padding: '0 !important'
              }}
            >
              -
            </Box>
          )
        },
        enableSorting: false
      }),
      companyColumnHelper.accessor('code', {
        id: 'code',
        meta: { visible: isColumnVisible('company-list', 'code', pathname) },
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
      companyColumnHelper.accessor('name', {
        id: 'name',
        meta: { visible: isColumnVisible('company-list', 'name', pathname) },
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
      companyColumnHelper.accessor('users', {
        id: 'users',
        meta: { visible: isColumnVisible('company-list', 'users', pathname) },
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
            {dictionary?.navigation?.users || 'Users'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: info => {
          const users = info.getValue()
          console.log('Users cell render - users value:', users, 'type:', typeof users, 'isArray:', Array.isArray(users))
          
          if (typeof users === 'string' && users.trim() !== '') {
            // If users is a comma-separated string, split and display as chips
            const userList = users.split(',').map(u => u.trim()).filter(Boolean)
            return (
              <Box display='flex' gap={0.5} flexWrap='wrap'>
                {userList.map((user, index) => (
                  <Chip key={index} label={user} color='primary' size='small' />
                ))}
              </Box>
            )
          } else if (Array.isArray(users) && users.length > 0) {
            const userChips = users.map((u: any, index: number) => {
              let label = 'User'
              if (typeof u === 'string') {
                label = u
              } else if (u && typeof u === 'object') {
                label = u.username || u.email || (u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : 'User')
              }
              return (
                <Chip key={index} label={label} color='primary' size='small' />
              )
            }).filter(Boolean)
            
            return (
              <Box display='flex' gap={0.5} flexWrap='wrap'>
                {userChips}
              </Box>
            )
          }
          return '-'
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const usersA = rowA.original.users
          const usersB = rowB.original.users
          
          // Get user count or string length for comparison
          const countA = typeof usersA === 'string' 
            ? usersA.length 
            : Array.isArray(usersA) 
              ? usersA.length 
              : 0
          const countB = typeof usersB === 'string' 
            ? usersB.length 
            : Array.isArray(usersB) 
              ? usersB.length 
              : 0
          
          // If counts are equal, compare by first user name or string value
          if (countA === countB) {
            const strA = typeof usersA === 'string' 
              ? usersA 
              : Array.isArray(usersA) && usersA.length > 0
                ? (usersA[0]?.username || usersA[0]?.email || '')
                : ''
            const strB = typeof usersB === 'string' 
              ? usersB 
              : Array.isArray(usersB) && usersB.length > 0
                ? (usersB[0]?.username || usersB[0]?.email || '')
                : ''
            return strA.localeCompare(strB)
          }
          
          return countA - countB
        }
      })
    ],
    [companyColumnHelper, dictionary, isColumnVisible, pathname]
  )

  // Filter columns based on visibility
  const visibleColumns = useMemo(() => {
    return companyColumns.filter(col => {
      // Get column ID from the column definition
      const columnId = (col as any).id || (col as any).accessorKey
      if (!columnId) return true // Show column if no ID found (shouldn't happen)
      return isColumnVisible('company-list', columnId, pathname || '')
    })
  }, [companyColumns, isColumnVisible, pathname])

  // React Table
  const companyTable = useReactTable({
    data: companies,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: companySearch,
      sorting: companySorting
    },
    onGlobalFilterChange: setCompanySearch,
    onSortingChange: setCompanySorting,
    filterFns: {
      fuzzy: () => false
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  // Helper function to translate error messages
  const translateError = (message: string): string => {
    if (!message || !dictionary?.navigation) return message
    
    // Translate common error messages
    const errorTranslations: { [key: string]: string } = {
      'Failed to load companies': dictionary.navigation.failedToLoadCompanies || 'Échec du chargement des entreprises',
      'failed to load companies': dictionary.navigation.failedToLoadCompanies || 'Échec du chargement des entreprises',
      'Network Error': dictionary.navigation.networkError || 'Erreur réseau',
      'network error': dictionary.navigation.networkError || 'Erreur réseau',
      'No response from server': dictionary.navigation.noResponseFromServer || 'Aucune réponse du serveur - veuillez vérifier votre connexion',
      'no response from server': dictionary.navigation.noResponseFromServer || 'Aucune réponse du serveur - veuillez vérifier votre connexion',
      'Cannot connect to server': dictionary.navigation.cannotConnectToServer || 'Impossible de se connecter au serveur. Veuillez vérifier que le serveur backend est en cours d\'exécution.',
      'cannot connect to server': dictionary.navigation.cannotConnectToServer || 'Impossible de se connecter au serveur. Veuillez vérifier que le serveur backend est en cours d\'exécution.',
      'Unknown error': dictionary.navigation.unknownError || 'Erreur inconnue',
      'unknown error': dictionary.navigation.unknownError || 'Erreur inconnue'
    }
    
    // Check for exact matches first (case-insensitive)
    const messageLower = message.toLowerCase().trim()
    for (const [en, fr] of Object.entries(errorTranslations)) {
      if (messageLower === en.toLowerCase()) {
        return fr
      }
    }
    
    // Check for partial matches
    let translated = message
    Object.entries(errorTranslations).forEach(([en, fr]) => {
      const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      if (regex.test(translated)) {
        translated = translated.replace(regex, fr)
      }
    })
    
    return translated
  }

  // Load companies data
  const loadCompanies = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Try to load from real API first
      try {
        // Use getCompaniesWithUsers to get companies with users included
        const companiesWithUsers = await companyService.getCompaniesWithUsers()
        console.log('Loaded companies with users:', companiesWithUsers)
        if (companiesWithUsers.length > 0) {
          console.log('First company:', companiesWithUsers[0])
          console.log('First company users:', companiesWithUsers[0]?.users)
          console.log('First company users type:', typeof companiesWithUsers[0]?.users)
          console.log('First company users isArray:', Array.isArray(companiesWithUsers[0]?.users))
        }
        setCompanies(companiesWithUsers)
      } catch (apiError: any) {
        console.warn('API not available, trying basic companies endpoint:', apiError)
        // Fallback to basic companies endpoint
        try {
          const basicCompanies = await companyService.getCompanies()
          setCompanies(basicCompanies)
        } catch (basicError: any) {
          console.error('Failed to load companies:', basicError)
          const errorMsg = basicError?.response?.data?.detail || basicError?.message || dictionary?.navigation?.failedToLoadCompanies || 'Failed to load companies'
          setError(translateError(errorMsg))
        }
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.message || dictionary?.navigation?.failedToLoadCompanies || 'Failed to load companies'
      setError(translateError(errorMsg))
      console.error('Error loading companies:', err)
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

  useEffect(() => {
    loadCompanies()
  }, [])

  // Register company table with theme customizer
  useEffect(() => {
    if (dictionary && pathname) {
      registerTable('company-list', dictionary?.navigation?.companiesManagement || 'Companies Management', [
        { id: 'logo', label: dictionary?.navigation?.logo || 'Logo' },
        { id: 'code', label: dictionary?.navigation?.code || 'Code' },
        { id: 'name', label: dictionary?.navigation?.name || 'Name' },
        { id: 'users', label: dictionary?.navigation?.users || 'Users' }
      ], 1, pathname)
    }
    return () => {
      if (pathname) {
        unregisterTable('company-list', pathname)
      }
    }
  }, [dictionary, pathname, registerTable, unregisterTable])

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
          {dictionary?.navigation?.companyList || 'Company List'}
        </Typography>
        <Typography color='text.secondary' className='mb-6'>
          {dictionary?.navigation?.companyManagement || 'Manage companies and their users'}
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
            title={dictionary?.navigation?.companiesManagement || 'Companies Management'}
            action={
              <Button
                variant='contained'
                startIcon={<Business />}
                onClick={() => router.push(`/${params?.lang || 'fr'}/admin/company/company-details-new/new`)}
              >
                {dictionary?.navigation?.addCompany || 'Add Company'}
              </Button>
            }
          />
          
          <Box sx={{ p: 3 }}>
            <Box className='mb-4'>
              <CustomTextField
                fullWidth
                placeholder={dictionary?.navigation?.searchCompanies || 'Search companies...'}
                value={companySearch}
                onChange={e => setCompanySearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start' sx={{ pl: 2 }}>
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
                      {companyTable.getHeaderGroups().map(headerGroup => (
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
                      {companyTable.getRowModel().rows.map(row => (
                        <tr 
                          key={row.id}
                          onClick={(e) => {
                            // Prevent navigation if clicking on interactive elements
                            const target = e.target as HTMLElement
                            if (target.tagName === 'BUTTON' || 
                                target.closest('button') || 
                                target.tagName === 'A' || 
                                target.closest('a') ||
                                target.closest('.MuiChip-root')) {
                              e.stopPropagation()
                              return
                            }
                            
                            const companyCode = row.original.code
                            if (companyCode) {
                              try {
                                console.log('Navigating to company details:', companyCode)
                                const lang = params?.lang || 'fr'
                                const path = `/${lang}/admin/company/company-details-new/${companyCode}`
                                console.log('Navigation path:', path)
                                router.push(path).catch((err) => {
                                  console.error('Router push error:', err)
                                  // Fallback to window.location if router.push fails
                                  window.location.href = path
                                })
                              } catch (error) {
                                console.error('Navigation error:', error)
                                // Fallback navigation
                                const lang = params?.lang || 'fr'
                                const path = `/${lang}/admin/company/company-details-new/${row.original.code}`
                                window.location.href = path
                              }
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td 
                              key={cell.id}
                              style={cell.column.id === 'logo' ? { paddingTop: '0.5rem', paddingBottom: '0.5rem', verticalAlign: 'middle' } : {}}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePaginationComponent table={companyTable as any} dictionary={dictionary} />
              </>
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CompanyListPage
