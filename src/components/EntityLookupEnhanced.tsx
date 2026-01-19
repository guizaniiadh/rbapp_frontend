'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'next/navigation'
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import {
  Box,
  Modal,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  IconButton,
  InputAdornment,
  MenuItem,
  useTheme
} from '@mui/material'
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  FilterList as FilterIcon,
  ArrowUpward,
  ArrowDownward,
  Check as CheckIcon,
  Clear as ClearIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material'

// Third-party Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type PaginationState
} from '@tanstack/react-table'

import styles from './EntityLookup.module.css'

// Types
export interface EntityLookupProps {
  componentName: string
  apiURI: string
  columnDefs?: Array<{
    headerName: string
    field: string
    width?: number
    flex?: number
  }>
  field?: string
  selectedItem?: string
  size?: 'sm' | 'md' | 'lg'
  lookupSize?: 'sm' | 'lg' | 'xl'
  title?: string
  onItemSelected?: (data: any, fieldName: string) => void
  disabled?: boolean
  placeholder?: string
  filterParams?: { [key: string]: any }
  parentEntityId?: string
  hoverBorderColor?: string
}

export interface LookupData {
  [key: string]: any
}

// Table data type
type TableData = {
  [key: string]: any
}

// Helper function to capitalize only the first character
const capitalizeFirst = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Filter translations
const filterTranslations = {
  fr: {
    filter: 'Filtrer...',
    applyFilter: 'Appliquer le filtre',
    equals: 'Égal à',
    notEqual: 'Pas égal à',
    lessThan: 'Moins que',
    greaterThan: 'Plus que',
    lessThanOrEqual: 'Moins que ou égal',
    greaterThanOrEqual: 'Plus que ou égal',
    inRange: 'Dans la gamme',
    contains: 'Contient',
    notContains: 'Ne contient pas',
    startsWith: 'Commence par',
    endsWith: 'Termine par',
    andCondition: 'ET',
    orCondition: 'OU',
    search: 'Recherche...',
    noResults: 'Aucun résultat trouvé',
    loading: 'Chargement...',
    refresh: 'Actualiser',
    close: 'Fermer',
    openInNewTab: 'Ouvrir dans un nouvel onglet',
    resize: 'Redimensionner'
  },
  en: {
    filter: 'Filter...',
    applyFilter: 'Apply filter',
    equals: 'Equals',
    notEqual: 'Not equal',
    lessThan: 'Less than',
    greaterThan: 'Greater than',
    lessThanOrEqual: 'Less than or equal',
    greaterThanOrEqual: 'Greater than or equal',
    inRange: 'In range',
    contains: 'Contains',
    notContains: 'Does not contain',
    startsWith: 'Starts with',
    endsWith: 'Ends with',
    andCondition: 'AND',
    orCondition: 'OR',
    search: 'Search...',
    noResults: 'No results found',
    loading: 'Loading...',
    refresh: 'Refresh',
    close: 'Close',
    openInNewTab: 'Open in new tab',
    resize: 'Resize'
  }
}

// UI translations (dialog title, common column headers, misc)
const uiTranslations = {
  fr: {
    selectEntity: (name: string) => {
      // Special case for "Agence" - use "une" instead of direct article
      if (name.toLowerCase() === 'agence') {
        return `Sélectionner une ${name}`
      }
      // Special case for "Bank" - use "une Banque" in French
      if (name.toLowerCase() === 'bank' || name.toLowerCase() === 'banque') {
        return `Sélectionner une Banque`
      }
      return `Sélectionner ${name}`
    },
    selected: 'Sélectionnée',
    clickToAdd: 'Cliquer pour ajouter',
    home: 'Accueil',
    administration: 'Administration',
    companies: 'Sociétés',
    company: 'Société',
    users: 'Utilisateurs',
    user: 'Utilisateur',
    headers: {
      id: 'Identifiant',
      name: 'Nom',
      email: 'E-mail',
      status: 'Statut',
      selected: 'Sélectionnée',
      code: 'Code',
      address: 'Adresse',
      city: 'Ville',
      website: 'Site web'
    }
  },
  en: {
    selectEntity: (name: string) => `Select ${name}`,
    selected: 'Selected',
    clickToAdd: 'Click to add',
    home: 'Home',
    administration: 'Administration',
    companies: 'Companies',
    company: 'Company',
    users: 'Users',
    user: 'User',
    headers: {
      id: 'Id',
      name: 'Name',
      email: 'Email',
      status: 'Status',
      selected: 'Selected',
      code: 'Code',
      address: 'Address',
      city: 'City',
      website: 'Website'
    }
  }
}

const getHeaderTranslation = (key: string, lang: 'fr' | 'en') => {
  const normalized = (key || '').trim().toLowerCase()
  const map = uiTranslations[lang].headers
  return map[normalized as keyof typeof map] || capitalizeFirst(key)
}

// Entity name translations used in the dialog title
const entityNameTranslations: Record<'fr' | 'en', Record<string, string>> = {
  en: {
    user: 'User',
    agency: 'Agency'
  },
  fr: {
    user: 'Utilisateur',
    agency: 'Agence'
  }
}

const EntityLookupEnhanced: React.FC<EntityLookupProps> = ({
  componentName = 'Entity',
  apiURI = '/api/entities',
  columnDefs = [],
  field = 'name',
  selectedItem = '',
  size = 'md',
  lookupSize = 'lg',
  title,
  onItemSelected,
  disabled = false,
  placeholder,
  filterParams,
  parentEntityId,
  hoverBorderColor = 'var(--mui-palette-primary-main, #7367f0)'
}) => {
  // State management
  const [modalOpen, setModalOpen] = useState(false)
  const [data, setData] = useState<TableData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const params = useParams()
  const theme = useTheme()
  const language = (params?.lang as 'fr' | 'en') || 'fr' // Get language from URL params
  
  // Get dictionary for translations
  const [dictionary, setDictionary] = useState<any>(null)
  const lowercaseComponent = componentName.toLowerCase()
  const isUserLookup = lowercaseComponent === 'user'
  const missingParentEntity = isUserLookup && (!parentEntityId || parentEntityId === 'create')
  const computedDisabled = disabled || missingParentEntity
  const defaultSaveWarning =
    language === 'fr'
      ? "Veuillez enregistrer la société avant d'assigner des utilisateurs."
      : 'Please save the company before assigning users.'
  const saveParentWarning =
    dictionary?.navigation?.saveCompanyBeforeAssignUsers || defaultSaveWarning
  const dictionaryEntityName =
    dictionary?.navigation?.[lowercaseComponent] ||
    dictionary?.navigation?.[`${lowercaseComponent}Name`]
  const translatedEntityName =
    dictionaryEntityName ||
    entityNameTranslations[language]?.[lowercaseComponent] ||
    componentName
  const selectEntityWord =
    dictionary?.navigation?.selectEntity ||
    (language === 'fr' ? 'Sélectionner' : 'Select')
  const selectKey =
    'select' +
    lowercaseComponent.charAt(0).toUpperCase() +
    lowercaseComponent.slice(1)
  const dictionarySelectSpecific = dictionary?.navigation?.[selectKey]
  const computedPlaceholder =
    placeholder ||
    dictionarySelectSpecific ||
    `${selectEntityWord} ${translatedEntityName}`.trim()
  const defaultAssignUserError =
    language === 'fr'
      ? "Échec de l'affectation de l'utilisateur."
      : 'Failed to assign user.'
  const defaultRemoveUserError =
    language === 'fr'
      ? "Échec de la suppression de l'utilisateur."
      : 'Failed to remove user.'
  const assignUserErrorMessage =
    dictionary?.navigation?.failedToAssignUser || defaultAssignUserError
  const removeUserErrorMessage =
    dictionary?.navigation?.failedToRemoveUser || defaultRemoveUserError
  const clickToAddLabel =
    dictionary?.navigation?.clickToAdd ||
    uiTranslations[language].clickToAdd
  
  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionaryClient(language)
      setDictionary(dict)
    }
    loadDictionary()
  }, [language])
  
  // Filter state
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: { type: string; value: string } }>({})
  const [filterInputs, setFilterInputs] = useState<{ [key: string]: string }>({})
  
  // Ensure all state objects are properly initialized
  const safeActiveFilters = activeFilters || {}
  const safeFilterInputs = filterInputs || {}
  
  // Auto-expand search input
  const searchInputRef = useRef<HTMLTextAreaElement | null>(null)
  
  // Ref for filter dropdown to get its width
  const filterDropdownRef = useRef<HTMLDivElement | null>(null)
  
  // Ref for filter controls to handle outside clicks
  const filterControlsRef = useRef<HTMLDivElement | null>(null)

  const handleAutoExpand = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const el = searchInputRef.current
    if (el) {
      el.style.height = 'auto'                 // reset height
      el.style.height = el.scrollHeight + 'px' // grow to fit content
    }
  }

  // Filter functions
  const handleFilterClick = (columnId: string, event: React.MouseEvent<HTMLElement>) => {
    try {
      // If no filter is active, create one with default "contains" type
      if (!safeActiveFilters[columnId]) {
        setActiveFilters(prev => ({
          ...(prev || {}),
          [columnId]: { type: 'contains', value: '' }
        }))
        setFilterInputs(prev => ({
          ...(prev || {}),
          [columnId]: ''
        }))
      } else {
        // If filter is already active, clear it
        clearFilter(columnId)
      }
    } catch (error) {
      console.error('Error in handleFilterClick:', error)
    }
  }


  const handleFilterInputChange = (columnId: string, value: string) => {
    try {
      setFilterInputs(prev => ({
        ...(prev || {}),
        [columnId]: value
      }))
      
      // Update the active filter with the new value
      setActiveFilters(prev => ({
        ...(prev || {}),
        [columnId]: { 
          type: prev[columnId]?.type || 'contains', 
          value: value 
        }
      }))
    } catch (error) {
      console.error('Error in handleFilterInputChange:', error)
    }
  }

  const clearFilter = (columnId: string) => {
    try {
      setActiveFilters(prev => {
        const newFilters = { ...(prev || {}) }
        delete newFilters[columnId]
        return newFilters
      })
      setFilterInputs(prev => {
        const newInputs = { ...(prev || {}) }
        delete newInputs[columnId]
        return newInputs
      })
    } catch (error) {
      console.error('Error in clearFilter:', error)
    }
  }

  // Handle clicking outside filter controls to close them
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element
    
    // Don't close if no filters are active
    if (Object.keys(safeActiveFilters).length === 0) return
    
    // Don't close if clicking on filter controls
    if (filterControlsRef.current && filterControlsRef.current.contains(target)) return
    
    // Don't close if clicking on filter icon
    if (target.closest('[data-filter-icon]')) return
    
    // Don't close if clicking on MUI dropdown elements
    if (target.closest('.MuiMenu-root') || 
        target.closest('.MuiPopover-root') || 
        target.closest('.MuiPaper-root') ||
        target.closest('.MuiSelect-root')) return
    
    // Close all filters
    setActiveFilters({})
    setFilterInputs({})
  }

  // Add event listener for outside clicks
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [safeActiveFilters])
  // Convert selectedItem to string if it's an array or other type
  const normalizeValue = (value: any): string => {
    if (!value) return ''
    if (typeof value === 'string') {
      // If it's a string, it might be a bank code - try to resolve it if it's a Bank lookup
      if (componentName.toLowerCase() === 'bank' && value) {
        // For bank lookups, if we get a code string, we should try to resolve it
        // But we'll return it as-is for now since we don't have access to bank list here
        // The parent component should pass the bank object with name
        return value
      }
      return value
    }
    if (Array.isArray(value)) {
      // If array of objects, extract names/usernames
      return value.map((item: any) => {
        if (typeof item === 'string') return item
        if (item?.first_name && item?.last_name) return `${item.first_name} ${item.last_name}`
        return item?.username || item?.name || item?.code || String(item)
      }).join(', ')
    }
    // Handle objects - for Bank lookup, prefer name over code
    if (typeof value === 'object' && value !== null) {
      // For Bank objects, use name if available, otherwise code
      if (componentName.toLowerCase() === 'bank') {
        // For banks, always prefer name
        if (value.name) return value.name
        if (value.code) return value.code
      } else {
        // For other entities, try name first
        if (value.name) return value.name
        if (value.code) return value.code
      }
      // For other objects, try common name fields
      return value.username || value.first_name || value.last_name || String(value)
    }
    // For other types, convert to string
    return String(value)
  }

  const [localValue, setLocalValue] = useState<string>(normalizeValue(selectedItem))
  const [currentLookupSize, setCurrentLookupSize] = useState<'sm' | 'lg' | 'xl'>(lookupSize as 'sm' | 'lg' | 'xl')
  const [resolvedBankName, setResolvedBankName] = useState<string | null>(null)
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  // Resolve bank name if we only have a code
  useEffect(() => {
    const resolveBankName = async () => {
      // Only for Bank lookups
      if (componentName.toLowerCase() === 'bank' && selectedItem) {
        // If selectedItem is a string (code) or object without name, try to resolve it
        if (typeof selectedItem === 'string' || (typeof selectedItem === 'object' && selectedItem && !selectedItem.name)) {
          try {
            const { bankService } = await import('@/services/bank.service')
            const banks = await bankService.getBanks()
            const bankCode = typeof selectedItem === 'string' ? selectedItem : selectedItem.code
            const bank = banks.find(b => b.code === String(bankCode))
            if (bank && bank.name) {
              setResolvedBankName(bank.name)
            } else {
              setResolvedBankName(null)
            }
          } catch (err) {
            console.warn('Could not resolve bank name:', err)
            setResolvedBankName(null)
          }
        } else if (typeof selectedItem === 'object' && selectedItem && selectedItem.name) {
          // Already has name, use it
          setResolvedBankName(selectedItem.name)
        } else {
          setResolvedBankName(null)
        }
      } else {
        setResolvedBankName(null)
      }
    }
    
    resolveBankName()
  }, [selectedItem, componentName])

  // Update local value when selectedItem prop changes
  useEffect(() => {
    // Debug: Log the selectedItem for bank lookups
    if (componentName.toLowerCase() === 'bank') {
      console.log('🏦 Bank Lookup Debug:', {
        selectedItem,
        type: typeof selectedItem,
        resolvedBankName,
        normalized: normalizeValue(selectedItem)
      })
    }
    
    // For Bank lookups, use resolved name if available
    if (componentName.toLowerCase() === 'bank' && resolvedBankName) {
      setLocalValue(resolvedBankName)
    } else {
      setLocalValue(normalizeValue(selectedItem))
    }
  }, [selectedItem, resolvedBankName, componentName])

  // Create columns from columnDefs
  const columns = useMemo<ColumnDef<TableData>[]>(() => {
    if (columnDefs.length === 0) {
      return [
        { accessorKey: 'id', header: getHeaderTranslation('id', language) },
        { accessorKey: 'name', header: getHeaderTranslation('name', language) },
        { accessorKey: 'email', header: getHeaderTranslation('email', language) },
        { accessorKey: 'status', header: getHeaderTranslation('status', language) },
        { 
          id: 'selected',
          header: getHeaderTranslation('selected', language),
        cell: ({ row }) => {
          const currentItems = localValue && typeof localValue === 'string' ? localValue.split(', ').filter(u => u.trim()) : []
          const itemName = (() => {
            // For agencies, use name or code
            if (componentName.toLowerCase() === 'agency') {
              return row.original.name || row.original.code || `Agency ${row.original.id}`
            }
            // For banks, use full name
            else if (componentName.toLowerCase() === 'bank') {
              return row.original.name || row.original.code || ''
            }
            // For users, use first_name + last_name or username
            else if (componentName.toLowerCase() === 'user') {
              return row.original.first_name && row.original.last_name 
                ? `${row.original.first_name} ${row.original.last_name}` 
                : row.original.username || row.original.name || row.original.title || ''
            }
            // For other entities, use name or title
            else {
              return row.original.name || row.original.title || row.original.username || ''
            }
          })()
          const isSelected = currentItems.includes(itemName)
            
            return (
              <Box display="flex" alignItems="center" justifyContent="center">
                {isSelected ? (
                  <Chip 
                    label={uiTranslations[language].selected}
                    size="small" 
                    color="primary" 
                    variant="filled"
                    sx={{ 
                      fontSize: '0.857rem', // 13.7px - small font size
                      height: '20px',
                      fontFamily: "'Montserrat', Helvetica, Arial, serif",
                      fontWeight: 500
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    fontSize: '0.857rem', // 13.7px - small font size
                    fontFamily: "'Montserrat', Helvetica, Arial, serif",
                    fontWeight: 400
                  }}>
                    {clickToAddLabel}
                  </Typography>
                )}
              </Box>
            )
          }
        }
      ]
    }
    
    return [
      ...columnDefs.map(col => ({
        accessorKey: col.field,
        header: getHeaderTranslation(col.headerName, language),
        cell: ({ getValue }: { getValue: () => any }) => {
          const value = getValue()
          return (
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'visible',
                textOverflow: 'clip',
                maxWidth: 'none'
              }}
            >
              {String(value || '')}
            </Typography>
          )
        }
      })),
      { 
        id: 'selected',
        header: getHeaderTranslation('selected', language),
        cell: ({ row }) => {
          const currentItems = localValue && typeof localValue === 'string' ? localValue.split(', ').filter(u => u.trim()) : []
          const itemName = (() => {
            // For agencies, use name or code
            if (componentName.toLowerCase() === 'agency') {
              return row.original.name || row.original.code || `Agency ${row.original.id}`
            }
            // For banks, use full name
            else if (componentName.toLowerCase() === 'bank') {
              return row.original.name || row.original.code || ''
            }
            // For users, use first_name + last_name or username
            else if (componentName.toLowerCase() === 'user') {
              return row.original.first_name && row.original.last_name 
                ? `${row.original.first_name} ${row.original.last_name}` 
                : row.original.username || row.original.name || row.original.title || ''
            }
            // For other entities, use name or title
            else {
              return row.original.name || row.original.title || row.original.username || ''
            }
          })()
          const isSelected = currentItems.includes(itemName)
          
          return (
            <Box display="flex" alignItems="center" justifyContent="center">
              {isSelected ? (
                <Chip 
                  label={uiTranslations[language].selected}
                  size="small" 
                  color="primary" 
                  variant="filled"
                  sx={{ 
                    fontSize: '0.857rem', // 13.7px - small font size
                    height: '20px',
                    fontFamily: "'Montserrat', Helvetica, Arial, serif",
                    fontWeight: 500
                  }}
                />
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    fontSize: '0.857rem', // 13.7px - small font size
                    fontFamily: "'Montserrat', Helvetica, Arial, serif",
                    fontWeight: 400
                  }}>
                    {clickToAddLabel}
                  </Typography>
                )}
            </Box>
          )
        }
      }
    ]
  }, [columnDefs, localValue])

  // React Table configuration
  // Custom filter function
  const customFilterFn = (row: any, columnId: string, filterValue: any) => {
    const cellValue = row.getValue(columnId)
    const activeFilter = activeFilters[columnId]
    
    if (!activeFilter || !activeFilter.value) return true
    
    const filterType = activeFilter.type
    const filterValueStr = activeFilter.value.toLowerCase()
    const cellValueStr = String(cellValue || '').toLowerCase()
    
    switch (filterType) {
      case 'equals':
        return cellValueStr === filterValueStr
      case 'notEqual':
        return cellValueStr !== filterValueStr
      case 'contains':
        return cellValueStr.includes(filterValueStr)
      case 'notContains':
        return !cellValueStr.includes(filterValueStr)
      case 'startsWith':
        return cellValueStr.startsWith(filterValueStr)
      case 'endsWith':
        return cellValueStr.endsWith(filterValueStr)
      case 'lessThan':
        return Number(cellValue) < Number(filterValueStr)
      case 'greaterThan':
        return Number(cellValue) > Number(filterValueStr)
      default:
        return true
    }
  }

  // Apply custom filters to data
  const filteredData = useMemo(() => {
    try {
      if (!data || !Array.isArray(data)) return []
      if (!safeActiveFilters || Object.keys(safeActiveFilters).length === 0) return data
      
      return data.filter(row => {
        if (!row || typeof row !== 'object') return false
        
        return Object.keys(safeActiveFilters).every(columnId => {
          const activeFilter = safeActiveFilters[columnId]
          if (!activeFilter || !activeFilter.value) return true
          
          const cellValue = row[columnId]
          const filterType = activeFilter.type
          const filterValueStr = String(activeFilter.value || '').toLowerCase()
          const cellValueStr = String(cellValue || '').toLowerCase()
          
          switch (filterType) {
            case 'equals':
              return cellValueStr === filterValueStr
            case 'notEqual':
              return cellValueStr !== filterValueStr
            case 'contains':
              return cellValueStr.includes(filterValueStr)
            case 'notContains':
              return !cellValueStr.includes(filterValueStr)
            case 'startsWith':
              return cellValueStr.startsWith(filterValueStr)
            case 'endsWith':
              return cellValueStr.endsWith(filterValueStr)
            case 'lessThan':
              return Number(cellValue) < Number(filterValueStr)
            case 'greaterThan':
              return Number(cellValue) > Number(filterValueStr)
            default:
              return true
          }
        })
      })
    } catch (error) {
      console.error('Error in filteredData:', error)
      return data || []
    }
  }, [data, safeActiveFilters])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination,
      globalFilter: searchQuery
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setSearchQuery,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(filteredData.length / pagination.pageSize),
    filterFns: {
      fuzzy: (row: any, columnId: string, filterValue: any) => {
        return true // We handle filtering in filteredData
      }
    }
  })

  const getData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use the configured apiClient instead of fetch
      const { default: apiClient } = await import('@/lib/api-client')
      
      // Build API URL with filter parameters
      let apiUrl = apiURI
      if (filterParams) {
        const params = new URLSearchParams()
        Object.entries(filterParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value))
          }
        })
        if (params.toString()) {
          apiUrl += `?${params.toString()}`
        }
      }
      
      // Debug: Log the API URL and filter parameters
      console.log(`🔍 ${componentName} Lookup Debug:`)
      console.log('- API URI:', apiURI)
      console.log('- Filter Params:', filterParams)
      console.log('- Final API URL:', apiUrl)
      
      // Test: Also try calling without filter to see total items
      if (filterParams && Object.keys(filterParams).length > 0) {
        try {
          const testResponse = await apiClient.get(apiURI)
          console.log(`🧪 Test - All ${componentName}s (no filter):`)
          console.log(`- Total ${componentName.toLowerCase()}s without filter:`, testResponse.data?.length || 0)
        } catch (testErr) {
          console.log('🧪 Test failed:', testErr)
        }
      }
      
      // Make API call using the configured apiClient
      const response = await apiClient.get(apiUrl)
      console.log('📊 API Response Debug:')
      console.log('- Response status:', response.status)
      console.log('- Response data:', response.data)
      console.log(`- Number of ${componentName.toLowerCase()}s returned:`, response.data?.length || 0)
      
      // Log each item to see their details
      if (response.data && Array.isArray(response.data)) {
        console.log(`🏦 ${componentName} Details:`)
        response.data.forEach((item, index) => {
          console.log(`${componentName} ${index + 1}:`, {
            id: item.id,
            name: item.name,
            code: item.code,
            email: item.email,
            username: item.username,
            first_name: item.first_name,
            last_name: item.last_name
          })
        })
      }
      setData(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
      console.error('Error loading lookup data:', err)
    } finally {
      setLoading(false)
    }
  }

  const openModal = () => {
    if (computedDisabled) {
      if (missingParentEntity) {
        setError(saveParentWarning)
      }
      return
    }

    setModalOpen(true)
    setSearchQuery('')
    getData()
  }

  const closeModal = () => {
    setModalOpen(false)
    setSearchQuery('')
    setError(null)
  }

  const changeModalSize = () => {
    const sizes = ['sm', 'lg', 'xl']
    const currentIndex = sizes.indexOf(currentLookupSize)
    const nextIndex = (currentIndex + 1) % sizes.length
    setCurrentLookupSize(sizes[nextIndex] as 'sm' | 'lg' | 'xl')
  }

  const openInNewTab = () => {
    // Map entity types to their list page routes
    const entityRouteMap: { [key: string]: string } = {
      'bank': `/${params?.lang || 'fr'}/admin/banques/comptes-bancaires`,
      'banque': `/${params?.lang || 'fr'}/admin/banques/comptes-bancaires`,
      // Agencies are shown in tab 1 of the banks page
      'agency': `/${params?.lang || 'fr'}/admin/banques/comptes-bancaires#agencies`,
      'agence': `/${params?.lang || 'fr'}/admin/banques/comptes-bancaires#agencies`,
      'user': `/${params?.lang || 'fr'}/admin/users`,
      'company': `/${params?.lang || 'fr'}/admin/companies`,
      'entreprise': `/${params?.lang || 'fr'}/admin/companies`,
    }
    
    const entityKey = componentName.toLowerCase()
    const url = entityRouteMap[entityKey] || `/${params?.lang || 'fr'}/admin/${entityKey}`
    
    // Open in new tab
    window.open(url, '_blank')
  }

  const refresh = () => {
    getData()
  }

  // Handle removing an item from the entity
  const handleRemoveItem = async (itemName: string) => {
    try {
      setLoading(true)
      
      if (lowercaseComponent === 'user') {
        if (missingParentEntity) {
          setError(saveParentWarning)
          return
        }
        const companyId = parentEntityId || window.location.pathname.split('/').pop() || '1'
        
        // Find the user ID from the current data
        const user = data.find(u => {
          const displayName = u.first_name && u.last_name 
            ? `${u.first_name} ${u.last_name}` 
            : u.username || u.name || u.title || ''
          return displayName === itemName
        })
        
        if (user) {
          // Call API to remove user from company
          const { companyService } = await import('@/services/company.service')
          const response = await companyService.removeUserFromCompany(companyId, user.id)
          
          console.log('User removed successfully:', response)
          
          // Remove user from local display
          const currentItems = localValue ? localValue.split(', ').filter(u => u.trim()) : []
          const updatedItems = currentItems.filter(u => u !== itemName)
          const displayValue = updatedItems.join(', ')
          
          setLocalValue(displayValue)
          
          if (onItemSelected) {
            onItemSelected({ 
              displayValue: displayValue,
              isRemove: true,
              removedItem: itemName,
              apiResponse: response
            }, field)
          }
        }
      } else {
        // For agencies and other entities, just remove from local display
        const currentItems = localValue ? localValue.split(', ').filter(u => u.trim()) : []
        const updatedItems = currentItems.filter(u => u !== itemName)
        const displayValue = updatedItems.join(', ')
        
        setLocalValue(displayValue)
        
        if (onItemSelected) {
          onItemSelected({ 
            displayValue: displayValue,
            isRemove: true,
            removedItem: itemName
          }, field)
        }
      }
    } catch (error) {
      console.error(`Error removing ${componentName.toLowerCase()}:`, error)
      setError(lowercaseComponent === 'user' ? removeUserErrorMessage : `Failed to remove ${componentName.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRowDoubleClick = async (item: TableData) => {
    // Get current selected items (if any)
    const currentItems = localValue ? localValue.split(', ').filter(u => u.trim()) : []
    
    // Get the new item's display name based on entity type
    const newItemName = (() => {
      // For agencies, use name or code
      if (componentName.toLowerCase() === 'agency') {
        return item.name || item.code || `Agency ${item.id}`
      }
      // For users, use first_name + last_name or username
      else if (componentName.toLowerCase() === 'user') {
        return item.first_name && item.last_name 
          ? `${item.first_name} ${item.last_name}` 
          : item.username || item.name || item.title || item.id || ''
      }
      // For other entities, use name or title
      else {
        return item.name || item.title || item.username || item.id || ''
      }
    })()
    
    // Check if item is already selected
    if (currentItems.includes(newItemName)) {
      console.log('Item already selected:', newItemName)
      return
    }
    
    try {
      // Show loading state
      setLoading(true)
      
      // For agencies, we don't need to call any API - just add to the list
      // The relationship is already established by the bank filter
      if (componentName.toLowerCase() === 'agency') {
        // Append new agency to existing agencies
        const updatedItems = [...currentItems, newItemName]
        const displayValue = updatedItems.join(', ')
        
        setLocalValue(displayValue)
        setModalOpen(false)
        
        if (onItemSelected) {
          onItemSelected({ 
            ...item, 
            displayValue: displayValue,
            isAppend: true
          }, field)
        }
      } else if (lowercaseComponent === 'user') {
        if (missingParentEntity) {
          setError(saveParentWarning)
          setLoading(false)
          return
        }
        const companyId = parentEntityId || window.location.pathname.split('/').pop() || '1'
        
        // Call API to assign user to company
        const { companyService } = await import('@/services/company.service')
        const response = await companyService.assignUserToCompany(companyId, item.id)
        
        console.log('User assigned successfully:', response)
        
        // Append new user to existing users
        const updatedUsers = [...currentItems, newItemName]
        const displayValue = updatedUsers.join(', ')
        
        setLocalValue(displayValue)
        setModalOpen(false)
        
        if (onItemSelected) {
          onItemSelected({ 
            ...item, 
            displayValue: displayValue,
            isAppend: true,
            apiResponse: response
          }, field)
        }
      } else {
        // For other entities (like Bank), use single selection
        // For banks, prefer name over code for display
        const displayName = componentName.toLowerCase() === 'bank' 
          ? (item.name || item.code || '')
          : newItemName
        
        setLocalValue(displayName)
        setModalOpen(false)
        
        if (onItemSelected) {
          // For banks, pass the bank object with name for proper display
          const itemToPass = componentName.toLowerCase() === 'bank'
            ? { ...item, displayValue: displayName, name: item.name || item.code }
            : { ...item, displayValue: displayName, isAppend: true }
          
          onItemSelected(itemToPass, field)
        }
      }
    } catch (error) {
      console.error(`Error assigning ${componentName.toLowerCase()} to entity:`, error)
      setError(lowercaseComponent === 'user' ? assignUserErrorMessage : `Failed to assign ${componentName.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  const getInputSize = () => {
    switch (size) {
      case 'sm': return 'small'
      case 'lg': return 'medium'
      default: return 'medium'
    }
  }

  const getModalWidth = () => {
    switch (currentLookupSize) {
      case 'sm': return '400px'
      case 'lg': return '800px'
      case 'xl': return '1200px'
      default: return '800px'
    }
  }

  const getModalHeight = () => {
    switch (currentLookupSize) {
      case 'sm': return '500px'
      case 'lg': return '600px'
      case 'xl': return '700px'
      default: return '600px'
    }
  }

  return (
    <>
      {/* Input Field - Display selected users as chips */}
      <Box className={styles.inputGroup}>
        <Box 
          className={styles.inputWrapper}
          onClick={!computedDisabled ? openModal : undefined}
          style={{ cursor: computedDisabled ? 'not-allowed' : 'pointer' }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 0.5, 
            padding: '6px 12px', // Same padding as regular inputs
            paddingRight: '2.5rem', // Make room for search icon and divider
            minHeight: '30px', // Allow expansion beyond 30px
            alignItems: localValue ? 'flex-start' : 'center',
            width: '100%',
            maxWidth: 'calc(100% - 2.5rem)', // Prevent overflow into search icon area
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '0.357rem',
            backgroundColor: theme.palette.background.paper,
            boxSizing: 'border-box',
            cursor: computedDisabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            overflow: 'visible', // Allow content to expand beyond container
            position: 'relative',
            color: localValue ? theme.palette.text.primary : theme.palette.text.secondary,
            '&:hover': {
              borderColor: computedDisabled ? theme.palette.divider : hoverBorderColor
            },
            '&:focus-within': {
              borderColor: computedDisabled ? theme.palette.divider : hoverBorderColor,
              boxShadow: computedDisabled ? 'none' : `0 3px 10px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)'}`
            }
          }}>
            {localValue && typeof localValue === 'string'
              ? localValue.split(', ').filter(u => u.trim()).map((userName, index) => (
                  <Chip
                    key={index}
                    label={userName}
                    size="small"
                    onDelete={!computedDisabled ? () => handleRemoveItem(userName) : undefined}
                    color="primary"
                    variant="filled"
                    sx={{ 
                      fontSize: '0.857rem', // 13.7px - small font size
                      height: '20px',
                      fontFamily: "'Montserrat', Helvetica, Arial, serif",
                      fontWeight: 400,
                      '& .MuiChip-deleteIcon': {
                        fontSize: '0.875rem' // 14px for delete icon
                      }
                    }}
                  />
                ))
              : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: '0.85rem',
                    fontFamily: "'Montserrat', Helvetica, Arial, serif",
                    fontWeight: 400,
                    opacity: 0.8
                  }}
                >
                  {computedPlaceholder}
                </Typography>
              )}
          </Box>
          <Box className={styles.searchIconContainer}>
            <SearchIcon 
              className={styles.searchIcon}
              onClick={!computedDisabled ? openModal : undefined}
              style={{ cursor: computedDisabled ? 'not-allowed' : 'pointer' }}
            />
          </Box>
        </Box>
        {missingParentEntity && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
            {saveParentWarning}
          </Typography>
        )}
      </Box>

      {/* Enhanced Modal with React Table */}
      {modalOpen && (
        <Modal
          open={modalOpen}
          onClose={closeModal}
          aria-labelledby="lookup-modal-title"
          aria-describedby="lookup-modal-description"
          className={styles.modal}
          disableEscapeKeyDown={false}
          disableAutoFocus={false}
          disableEnforceFocus={false}
          disableRestoreFocus={false}
          hideBackdrop={false}
          keepMounted={false}
          closeAfterTransition={false}
          componentsProps={{
            backdrop: {
              style: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }}
        >
          <Paper 
              className={styles.modalContent} 
              sx={{ 
                width: getModalWidth(), 
                height: getModalHeight(),
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
          {/* Modal Header */}
          <Box className={styles.modalHeader}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography id="lookup-modal-title" variant="h6" component="h2" className={styles.modalTitle}>
                {(() => {
                  if (title) return title
                  const key = (componentName || '').trim().toLowerCase()
                  const translatedName = entityNameTranslations[language][key] || componentName
                  return uiTranslations[language].selectEntity(translatedName)
                })()}
              </Typography>
              
            </Box>
            <Box className={styles.headerActions}>
              <Tooltip title={filterTranslations[language].openInNewTab}>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={openInNewTab}
                  size="small"
                  className={styles.btnIcon}
                  sx={{ mr: 0.5 }}
                >
                  <OpenInNewIcon />
                </Button>
              </Tooltip>
              <Tooltip title={filterTranslations[language].resize}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={changeModalSize}
                  size="small"
                  className={styles.btnIcon}
                  sx={{ mr: 0.5 }}
                >
                  {currentLookupSize === 'xl' ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </Button>
              </Tooltip>
              <Tooltip title={filterTranslations[language].close}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={closeModal}
                  size="small"
                  className={styles.btnIcon}
                >
                  <CloseIcon />
                </Button>
              </Tooltip>
            </Box>
          </Box>

          {/* Modal Body */}
          <Box className={styles.modalBody} sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Search and Refresh - Matching Vue.js Layout */}
            <Box className={styles.searchSection}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={10}>
                  <Box className={styles.searchInput}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      placeholder={filterTranslations[language].search}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        handleAutoExpand(e)
                      }}
                      inputRef={searchInputRef}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={2} className={styles.textRight}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={refresh}
                    className={styles.refreshButton}
                    size="small"
                  >
                    <RefreshIcon />
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Data Grid */}
            <Box className={styles.gridContainer} sx={{ flex: 1, overflow: 'hidden' }}>
              {loading ? (
                <Box className={styles.loadingContainer}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : data.length === 0 ? (
                <Box className={styles.noDataContainer}>
                  <Typography className={styles.noDataText}>
                    {filterTranslations[language].noResults}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ height: '100%', overflow: 'auto' }}>
                  <TableContainer 
                    component={Paper} 
                    elevation={0} 
                    sx={{ 
                      height: '100%',
                      overflow: 'auto',
                      '& .MuiTableCell-root': {
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        textOverflow: 'clip'
                      }
                    }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        {table.getHeaderGroups().map(headerGroup => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                              <TableCell
                                key={header.id}
                                className={styles.filterCell}
                                sx={{
                                  fontWeight: 700,
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.08)'
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Box sx={{ flex: 1 }}>
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                  </Box>
                                  
                                  {/* Filter Icon */}
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleFilterClick(header.id, e)}
                                    data-filter-icon
                                    sx={{ 
                                      ml: 1,
                                      p: 0.5,
                                      '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.1)'
                                      }
                                    }}
                                  >
                                    <Box 
                                      className={`${styles.filterIcon} ${safeActiveFilters[header.id] ? styles.active : ''}`}
                                      sx={{ 
                                        fontSize: 16,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '1px'
                                      }}
                                    >
                                      <Box sx={{ width: '8px', height: '1px', backgroundColor: 'currentColor' }} />
                                      <Box sx={{ width: '8px', height: '1px', backgroundColor: 'currentColor' }} />
                                      <Box sx={{ width: '8px', height: '1px', backgroundColor: 'currentColor' }} />
                                    </Box>
                                  </IconButton>
                                </Box>
                                
                                {/* Filter Controls (when active) */}
                                {safeActiveFilters[header.id] && (
                                  <Box 
                                    className={styles.filterControlsVertical}
                                    ref={filterControlsRef}
                                  >
                                    {/* Filter Type Dropdown */}
                                    <TextField
                                      select
                                      size="small"
                                      value={safeActiveFilters[header.id]?.type || ''}
                                      onChange={(e) => {
                                        const newType = e.target.value
                                        setActiveFilters(prev => ({
                                          ...(prev || {}),
                                          [header.id]: { 
                                            type: newType, 
                                            value: safeFilterInputs[header.id] || '' 
                                          }
                                        }))
                                        
                                        // Also update the filter input to trigger filtering
                                        setFilterInputs(prev => ({
                                          ...(prev || {}),
                                          [header.id]: safeFilterInputs[header.id] || ''
                                        }))
                                      }}
                                      className={styles.filterTypeDropdownSmall}
                                      ref={filterDropdownRef}
                                      SelectProps={{
                                        MenuProps: {
                                          PaperProps: {
                                            style: {
                                              width: filterDropdownRef.current?.offsetWidth || 'auto',
                                              minWidth: filterDropdownRef.current?.offsetWidth || 'auto',
                                              maxWidth: filterDropdownRef.current?.offsetWidth || 'auto'
                                            }
                                          },
                                          anchorOrigin: {
                                            vertical: 'bottom',
                                            horizontal: 'left'
                                          },
                                          transformOrigin: {
                                            vertical: 'top',
                                            horizontal: 'left'
                                          }
                                        }
                                      }}
                                    >
                                      <MenuItem value="equals">{filterTranslations[language].equals}</MenuItem>
                                      <MenuItem value="notEqual">{filterTranslations[language].notEqual}</MenuItem>
                                      <MenuItem value="contains">{filterTranslations[language].contains}</MenuItem>
                                      <MenuItem value="notContains">{filterTranslations[language].notContains}</MenuItem>
                                      <MenuItem value="startsWith">{filterTranslations[language].startsWith}</MenuItem>
                                      <MenuItem value="endsWith">{filterTranslations[language].endsWith}</MenuItem>
                                      <MenuItem value="lessThan">{filterTranslations[language].lessThan}</MenuItem>
                                      <MenuItem value="greaterThan">{filterTranslations[language].greaterThan}</MenuItem>
                                    </TextField>
                                    
                                    {/* Filter Value Input */}
                                    <TextField
                                      size="small"
                                      placeholder={filterTranslations[language].filter}
                                      value={safeFilterInputs[header.id] || ''}
                                      onChange={(e) => handleFilterInputChange(header.id, e.target.value)}
                                      className={styles.filterValueInputSmall}
                                      InputProps={{
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <IconButton
                                              size="small"
                                              onClick={() => clearFilter(header.id)}
                                              sx={{ p: 0.25 }}
                                            >
                                              <ClearIcon sx={{ fontSize: 12 }} />
                                            </IconButton>
                                          </InputAdornment>
                                        )
                                      }}
                                    />
                                    
                                  </Box>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableHead>
                      <TableBody>
                        {table.getRowModel().rows.map((row, index) => {
                          // Check if this item is already selected
                          const currentItems = localValue ? localValue.split(', ').filter(u => u.trim()) : []
                          const itemName = (() => {
                            // For agencies, use name or code
                            if (componentName.toLowerCase() === 'agency') {
                              return row.original.name || row.original.code || `Agency ${row.original.id}`
                            }
                            // For banks, use full name
                            else if (componentName.toLowerCase() === 'bank') {
                              return row.original.name || row.original.code || ''
                            }
                            // For users, use first_name + last_name or username
                            else if (componentName.toLowerCase() === 'user') {
                              return row.original.first_name && row.original.last_name 
                                ? `${row.original.first_name} ${row.original.last_name}` 
                                : row.original.username || row.original.name || row.original.title || ''
                            }
                            // For other entities, use name or title
                            else {
                              return row.original.name || row.original.title || row.original.username || ''
                            }
                          })()
                          const isSelected = currentItems.includes(itemName)
                          
                          return (
                            <TableRow
                              key={row.id}
                              hover
                              onDoubleClick={() => handleRowDoubleClick(row.original)}
                              sx={{
                                cursor: 'pointer',
                                backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                                '&:hover': {
                                  backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                                },
                                '&:nth-of-type(odd)': {
                                  backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.02)'
                                }
                              }}
                            >
                              {row.getVisibleCells().map(cell => (
                                <TableCell 
                                  key={cell.id}
                                  sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'visible',
                                    textOverflow: 'clip',
                                    maxWidth: 'none'
                                  }}
                                >
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
            {/* Fixed Footer Pagination (outside scroll area) */}
            <Box className={styles.pagination} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Left: Showing X to Y of Z entries */}
              <Typography variant="body2" sx={{ fontSize: '0.857rem', color: 'var(--muted-1)' }}>
                {(() => {
                  const pageIndex = table.getState().pagination.pageIndex
                  const pageSize = table.getState().pagination.pageSize
                  const total = table.getFilteredRowModel().rows.length
                  const from = total === 0 ? 0 : pageIndex * pageSize + 1
                  const to = Math.min(total, (pageIndex + 1) * pageSize)
                  return language === 'fr'
                    ? `Affichage de ${from} à ${to} sur ${total} entrées`
                    : `Showing ${from} to ${to} of ${total} entries`
                })()}
              </Typography>

              {/* Right: Pager controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => table.setPageIndex(0)}
                  disabled={table.getState().pagination.pageIndex === 0}
                  sx={{ borderRadius: 1, border: '1px solid var(--card-border)', bgcolor: 'rgba(0,0,0,0.03)' }}
                >
                  <FirstPageIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  sx={{ borderRadius: 1, border: '1px solid var(--card-border)', bgcolor: 'rgba(0,0,0,0.03)' }}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <Box sx={{ 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: 1, 
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText', 
                  fontSize: '0.857rem', 
                  minWidth: 32, 
                  textAlign: 'center', 
                  boxShadow: (theme) => `0 6px 10px ${theme.palette.primary.main}25`
                }}>
                  {table.getState().pagination.pageIndex + 1}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  sx={{ borderRadius: 1, border: '1px solid var(--card-border)', bgcolor: 'rgba(0,0,0,0.03)' }}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => table.setPageIndex(Math.max(0, Math.ceil(table.getFilteredRowModel().rows.length / table.getState().pagination.pageSize) - 1))}
                  disabled={table.getState().pagination.pageIndex >= Math.ceil(table.getFilteredRowModel().rows.length / table.getState().pagination.pageSize) - 1}
                  sx={{ borderRadius: 1, border: '1px solid var(--card-border)', bgcolor: 'rgba(0,0,0,0.03)' }}
                >
                  <LastPageIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
          </Paper>
        </Modal>
      )}
    </>
  )
}

export default EntityLookupEnhanced
