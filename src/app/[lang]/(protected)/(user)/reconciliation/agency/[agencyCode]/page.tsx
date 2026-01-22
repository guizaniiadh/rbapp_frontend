'use client'

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
import type { ReactNode } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { keyframes } from '@emotion/react'

import {
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Button,
  Snackbar,
  Radio,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  ButtonGroup,
  Popper,
  ClickAwayListener,
  Fade,
  MenuList,
  Tooltip
} from '@mui/material'
import { Checkbox } from '@mui/material'
import { 
  CheckCircle, 
  Pending, 
  AccountBalance,
  Receipt,
  Business,
  Search as SearchIcon,
  AccountBalanceWallet,
  AttachMoney,
  CurrencyExchange,
  Payments,
  AccountCircle,
  Savings,
  CreditCard,
  MonetizationOn,
  TrendingUp,
  Calculate,
  AccountBalanceOutlined,
  Wallet,
  LocalAtm,
  Money,
  FileDownload,
  PlayArrow,
  Stop,
  Flag,
  Difference,
  CompareArrows,
  TrendingDown,
  ArrowForward,
  ArrowBack,
  SwapHoriz,
  SwapVert,
  FirstPage,
  LastPage,
  SkipNext,
  SkipPrevious,
  Fullscreen,
  FullscreenExit,
  ArrowDropDown,
  OpenInFull,
  AspectRatio,
  ZoomInMap,
  ZoomOutMap,
  FitScreen,
  CropFree,
  Circle,
  Warning,
  ReportProblem,
  ErrorOutline,
  RemoveCircleOutline,
  SwapCalls,
  Compare,
  IndeterminateCheckBox
} from '@mui/icons-material'

// Component Imports
import FileUpload from '@/components/FileUpload'
import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import type { ShortcutsType } from '@components/layout/shared/ShortcutsDropdown'
import Table3DSheet from '@/components/reconciliation/Table3DSheet'
import { ResizableTableCell } from '@/components/reconciliation/ResizableTableCell'

// Service Imports
import { bankLedgerEntryService } from '@/services/bankLedgerEntry.service'
import { recoBankTransactionService } from '@/services/recoBankTransaction.service'
import { recoCustomerTransactionService } from '@/services/recoCustomerTransaction.service'
import { customerLedgerEntryService } from '@/services/customerLedgerEntry.service'
import { agencyService } from '@/services/agency.service'
import { companyService } from '@/services/company.service'
import { bankService } from '@/services/bank.service'
import { paymentStatusService } from '@/services/paymentStatus.service'
import { paymentClassService } from '@/services/paymentClass.service'
import { taxComparisonService } from '@/services/taxComparison.service'
import { taxExtractionService } from '@/services/taxExtraction.service'
import apiClient from '@/lib/api-client'

// Type Imports
import type { BankLedgerEntry } from '@/types/bankLedgerEntry'
import type { CustomerLedgerEntry } from '@/types/customerLedgerEntry'
import type { Agency } from '@/types/agency'
import type { Company } from '@/types/company'
import type { Bank } from '@/types/bank'
import type { PaymentClass } from '@/types/paymentClass'

// Dictionary imports
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

// Context imports
import { useTableColumnVisibility } from '@/contexts/tableColumnVisibilityContext'

// Excel export
import * as XLSX from 'xlsx'

// Memoized checkbox component for instant performance
const MemoizedCheckbox = memo(({ 
  idx, 
  checked, 
  onSelection 
}: { 
  idx: number, 
  checked: boolean, 
  onSelection: (idx: number) => void 
}) => (
  <TableCell 
    align="center" 
    onClick={(e) => {
      e.stopPropagation()
      e.preventDefault()
      onSelection(idx)
    }}
    sx={{ 
      cursor: 'pointer',
      padding: '4px',
      position: 'sticky',
      left: 0,
      top: '32px',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      zIndex: 4,
      width: '50px',
      minWidth: '50px',
      maxWidth: '50px',
      textAlign: 'center',
      transition: 'background-color 0.2s ease',
      'tr:hover &': {
        backgroundColor: '#f5f5f5 !important'
      }
    }}
  >
    <Checkbox 
      key={`checkbox-${idx}`}
      size="small"
      checked={checked}
      sx={{ 
        padding: '4px',
        pointerEvents: 'none',
        '&.Mui-checked': {
          color: 'success.main'
        }
      }}
    />
  </TableCell>
))

// Memoized checkbox component for unmatched transactions with advanced optimizations
const MemoizedUnmatchedCheckbox = memo(({ 
  txId, 
  checked, 
  onSelection,
  backgroundColor
}: { 
  txId: string | number, 
  checked: boolean, 
  onSelection: (txId: string | number) => void,
  backgroundColor: string
}) => {
  // Memoize the click handler to prevent recreation on every render
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onSelection(txId)
  }, [txId, onSelection])

  // Memoize the checkbox change handler
  const handleCheckboxChange = useCallback(() => {
    onSelection(txId)
  }, [txId, onSelection])

  // Memoize the checkbox click handler
  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  return (
    <TableCell 
      align="center" 
      onClick={handleClick}
      sx={{ 
        cursor: 'pointer',
        padding: '4px',
        position: 'sticky',
        left: 0,
        top: '32px',
        backgroundColor: backgroundColor,
        zIndex: 4,
        width: '50px',
        minWidth: '50px',
        maxWidth: '50px',
        textAlign: 'center',
        verticalAlign: 'middle',
        transition: 'background-color 0.2s ease',
        'tr:hover &': {
          backgroundColor: '#f5f5f5 !important'
        }
      }}
    >
      <Checkbox 
        size="small"
        checked={checked}
        onChange={handleCheckboxChange}
        onClick={handleCheckboxClick}
        sx={{ 
          padding: '4px',
          '&.Mui-checked': {
            color: 'success.main'
          }
        }}
      />
    </TableCell>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for even better performance
  return (
    prevProps.txId === nextProps.txId &&
    prevProps.checked === nextProps.checked &&
    prevProps.backgroundColor === nextProps.backgroundColor &&
    prevProps.onSelection === nextProps.onSelection
  )
})

const MATCH_TABLE_DATA_COLUMNS = 23

// Memoized checkbox component for reconciliation tables
const MemoizedReconciliationCheckbox = memo(({ 
  txId, 
  checked, 
  onSelection,
  backgroundColor = '#ffffff',
  isPulsing = false,
  pulseAnimation
}: { 
  txId: string | number, 
  checked: boolean, 
  onSelection: (txId: string | number) => void,
  backgroundColor?: string,
  isPulsing?: boolean,
  pulseAnimation?: string
}) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onSelection(txId)
  }, [txId, onSelection])

  return (
    <TableCell 
      align="center" 
      onClick={handleClick}
      sx={{ 
        cursor: 'pointer',
        padding: '4px',
        position: 'sticky',
        left: 0,
        top: '32px',
        backgroundColor: backgroundColor,
        zIndex: 4,
        width: '50px',
        minWidth: '50px',
        maxWidth: '50px',
        textAlign: 'center',
        verticalAlign: 'middle',
        height: '32px',
        transition: isPulsing ? 'all 0.3s ease-in-out' : 'background-color 0.2s ease',
        animation: isPulsing && pulseAnimation ? `${pulseAnimation} 1.5s ease-in-out infinite` : 'none',
        boxShadow: isPulsing ? '0 2px 8px rgba(76, 175, 80, 0.4)' : 'none',
        borderLeft: isPulsing ? '3px solid #4caf50' : 'none',
        'tr:hover &': {
          backgroundColor: 'transparent !important'
        }
      }}
    >
      <Checkbox 
        size="small"
        checked={checked}
        onClick={(e) => e.stopPropagation()}
        sx={{ 
          padding: '4px',
          '&.Mui-checked': {
            color: 'success.main'
          }
        }}
      />
    </TableCell>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.txId === nextProps.txId &&
    prevProps.checked === nextProps.checked &&
    prevProps.backgroundColor === nextProps.backgroundColor &&
    prevProps.onSelection === nextProps.onSelection &&
    prevProps.isPulsing === nextProps.isPulsing &&
    prevProps.pulseAnimation === nextProps.pulseAnimation
  )
})

type InlineTaxRow = {
  id: string
  name: string
  type: string
  formattedValue: string | number
  status: string | null
}

const normalizeNumericValue = (value: any): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const stringValue = String(value).trim()
  if (!stringValue || stringValue === '-') return null
  let normalized = stringValue.replace(/\s/g, '')
  if (normalized.includes('.') && normalized.includes(',')) {
    normalized = normalized.replace(/,/g, '')
  } else if (!normalized.includes('.') && normalized.includes(',')) {
    normalized = normalized.replace(/,/g, '.')
  }
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

// Calculate tax difference (écart)
const calculateTaxDifference = (bankValue: string, customerValue: string): number | null => {
  const bankNum = normalizeNumericValue(bankValue)
  const customerNum = normalizeNumericValue(customerValue)
  
  if (bankNum === null && customerNum === null) return null
  if (bankNum === null) return customerNum
  if (customerNum === null) return bankNum
  
  return bankNum - customerNum
}

const formatTaxValue = (value: any): string => {
  const normalized = normalizeNumericValue(value)
  if (normalized === null) {
    if (value === null || value === undefined || value === '') {
      return '-'
    }
    return String(value)
  }
  return normalized.toLocaleString('fr-FR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })
}

// Format numeric values for the High Matches section:
// - Thousands separator as narrow space (from fr-FR locale)
// - Decimal separator forced to '.'
// - 3 decimal digits
const formatHighMatchAmount = (value: any): string => {
  const normalized = normalizeNumericValue(value)
  if (normalized === null) {
    if (value === null || value === undefined || value === '') {
      return ''
    }
    return String(value)
  }

  return normalized
    .toLocaleString('fr-FR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    })
    .replace(',', '.')
}

// Keyframes animation for customer transaction highlight effect
const pulseGreenAnimation = keyframes`
  0%, 100% {
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
    border-left-width: 3px;
  }
  50% {
    box-shadow: 0 4px 16px rgba(76, 175, 80, 0.6);
    border-left-width: 5px;
  }
`

const pulseBlueAnimation = keyframes`
  0%, 100% {
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
    border-left-width: 3px;
  }
  50% {
    box-shadow: 0 4px 16px rgba(76, 175, 80, 0.6);
    border-left-width: 5px;
  }
`

export default function ReconciliationPage() {
  console.log('🔵 ReconciliationPage component rendered')
  const params = useParams()
  const pathname = usePathname()
  const agencyCode = params.agencyCode as string
  const lang = params.lang as Locale
  const { accessToken } = useAuth()

  // Dictionary state
  const [dictionary, setDictionary] = useState<any>(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(true)

  // Table column visibility
  const { registerTable, unregisterTable, unregisterTablesByPathname, isColumnVisible } = useTableColumnVisibility()

  // Calculator state (opened from search shortcuts)
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [calculatorExpression, setCalculatorExpression] = useState('')
  const [calculatorResult, setCalculatorResult] = useState<string>('')
  const [calculatorError, setCalculatorError] = useState<string>('')

  // Helper function to translate axios error messages to French
  const translateAxiosError = (errorMessage: string): string => {
    if (!errorMessage) return dictionary?.navigation?.unknownError || 'Erreur inconnue'
    
    // Normalize the error message (trim and lowercase for comparison)
    const normalizedMsg = errorMessage.trim()
    
    // Translate common axios error messages
    const errorTranslations: { [key: string]: string } = {
      'Request failed with status code 404': 'Requête échouée avec le code d\'état 404 - Ressource non trouvée',
      'Request failed with status code 400': 'Requête échouée avec le code d\'état 400 - Requête invalide',
      'Request failed with status code 401': 'Requête échouée avec le code d\'état 401 - Authentification requise',
      'Request failed with status code 403': 'Requête échouée avec le code d\'état 403 - Accès refusé',
      'Request failed with status code 500': 'Requête échouée avec le code d\'état 500 - Erreur serveur',
      'Request failed with status code 502': 'Requête échouée avec le code d\'état 502 - Mauvaise passerelle',
      'Request failed with status code 503': 'Requête échouée avec le code d\'état 503 - Service indisponible',
      'Network Error': 'Erreur réseau - Vérifiez votre connexion',
      'timeout of': 'Délai d\'attente dépassé',
      'No response from server': 'Aucune réponse du serveur',
      'Request setup error': 'Erreur de configuration de la requête',
      'No response from server - please check your connection': 'Aucune réponse du serveur - Veuillez vérifier votre connexion'
    }
    
    // Check for exact matches first (case-insensitive)
    const exactMatch = Object.entries(errorTranslations).find(([en]) => 
      normalizedMsg.toLowerCase() === en.toLowerCase()
    )
    if (exactMatch) {
      return exactMatch[1]
    }
    
    // Check for "Request failed with status code" pattern (most common axios error)
    const statusCodeMatch = normalizedMsg.match(/Request failed with status code (\d+)/i)
    if (statusCodeMatch) {
      const statusCode = statusCodeMatch[1]
      const statusMessages: { [key: string]: string } = {
        '404': 'Ressource non trouvée (404)',
        '400': 'Requête invalide (400)',
        '401': 'Authentification requise (401)',
        '403': 'Accès refusé (403)',
        '500': 'Erreur serveur interne (500)',
        '502': 'Mauvaise passerelle (502)',
        '503': 'Service indisponible (503)'
      }
      if (statusMessages[statusCode]) {
        return `Requête échouée: ${statusMessages[statusCode]}`
      }
      return `Requête échouée avec le code d'état ${statusCode}`
    }
    
    // Check for partial matches (e.g., contains "Request failed with status code")
    if (normalizedMsg.toLowerCase().includes('request failed with status code')) {
      const statusCodeMatch2 = normalizedMsg.match(/status code (\d+)/i)
      if (statusCodeMatch2) {
        const statusCode = statusCodeMatch2[1]
        const statusMessages: { [key: string]: string } = {
          '404': 'Ressource non trouvée (404)',
          '400': 'Requête invalide (400)',
          '401': 'Authentification requise (401)',
          '403': 'Accès refusé (403)',
          '500': 'Erreur serveur interne (500)',
          '502': 'Mauvaise passerelle (502)',
          '503': 'Service indisponible (503)'
        }
        if (statusMessages[statusCode]) {
          return `Requête échouée: ${statusMessages[statusCode]}`
        }
        return `Requête échouée avec le code d'état ${statusCode}`
      }
    }
    
    // Check for other partial matches
    for (const [en, fr] of Object.entries(errorTranslations)) {
      if (normalizedMsg.toLowerCase().includes(en.toLowerCase())) {
        return fr
      }
    }
    
    // Check for generic status code patterns
    const genericStatusCodeMatch = normalizedMsg.match(/status code (\d+)/i)
    if (genericStatusCodeMatch) {
      const statusCode = genericStatusCodeMatch[1]
      const statusMessages: { [key: string]: string } = {
        '404': 'Ressource non trouvée (404)',
        '400': 'Requête invalide (400)',
        '401': 'Authentification requise (401)',
        '403': 'Accès refusé (403)',
        '500': 'Erreur serveur interne (500)',
        '502': 'Mauvaise passerelle (502)',
        '503': 'Service indisponible (503)'
      }
      if (statusMessages[statusCode]) {
        return `Erreur: ${statusMessages[statusCode]}`
      }
      return `Erreur avec le code d'état ${statusCode}`
    }
    
    // Return original message if no translation found
    return errorMessage
  }

  // Helper function to format text with first character uppercase and rest lowercase
  const formatHeaderText = (text: string) => {
    if (!text) return ''
    const formatted = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    console.log('formatHeaderText:', { original: text, formatted })
    return formatted
  }

  // Helper function to preserve multiple spaces in display
  // HTML collapses multiple spaces by default, so we replace them with non-breaking spaces
  const preserveSpaces = (text: string | null | undefined): string => {
    if (!text) return ''
    // Replace multiple consecutive spaces with non-breaking spaces
    // This preserves the visual appearance of multiple spaces
    return text.replace(/  +/g, (match) => '\u00A0'.repeat(match.length))
  }

  // Test the function
  console.log('Testing formatHeaderText:', {
    test1: formatHeaderText('OPERATION DATE'),
    test2: formatHeaderText('Payment Class'),
    test3: formatHeaderText('TOTAL AMOUNT')
  })

  // Custom styles for table headers - using multiple approaches
  const headerStyles = {
    fontWeight: 'bold !important',
    fontSize: '0.8125rem !important',
    letterSpacing: '0.2px !important',
    lineHeight: '1.8462 !important',
    textTransform: 'none !important', // Override the global capitalize
    fontFamily: 'inherit !important',
    // Additional forceful styles
    '& *': {
      fontWeight: 'bold !important'
    },
    '& strong': {
      fontWeight: 'bold !important'
    }
  }

  // State
  const [agency, setAgency] = useState<Agency | null>(null)
  const [bankCode, setBankCode] = useState<string | null>(null)
  const [bank, setBank] = useState<Bank | null>(null)
  const [failedBankLogos, setFailedBankLogos] = useState<Set<string>>(new Set())
  const [bankLogoAspectRatio, setBankLogoAspectRatio] = useState<'landscape' | 'portrait' | 'square' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [criticalError, setCriticalError] = useState('')
  
  // Data states
  const [bankEntries, setBankEntries] = useState<BankLedgerEntry[]>([])
  const [customerEntries, setCustomerEntries] = useState<CustomerLedgerEntry[]>([])
  
  // Processing states
  const [bankProcessed, setBankProcessed] = useState(false)
  const [customerProcessed, setCustomerProcessed] = useState(false)
  // Session-scoped processed flags (only true when uploads in THIS session finished)
  const [bankSessionProcessed, setBankSessionProcessed] = useState(false)
  const [customerSessionProcessed, setCustomerSessionProcessed] = useState(false)
  const [bankProcessing, setBankProcessing] = useState(false)
  const [customerProcessing, setCustomerProcessing] = useState(false)
  const [bankProgress, setBankProgress] = useState(0)
  const [customerProgress, setCustomerProgress] = useState(0)
  const [reconciliationReady, setReconciliationReady] = useState(false)
  const [reconciliationComplete, setReconciliationComplete] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [companyLocked, setCompanyLocked] = useState<boolean>(false)
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set())
  const [bankImportBatchId, setBankImportBatchId] = useState<number | null>(null)
  const [bankTransactions, setBankTransactions] = useState<any[]>([])
  
  // Debug: Log when bankTransactions changes
  useEffect(() => {
    console.log('🔄 ========== bankTransactions state changed ==========')
    console.log('🔄 bankTransactions state changed:', {
      count: bankTransactions.length,
      timestamp: new Date().toISOString(),
      sample: bankTransactions.slice(0, 3).map((tx: any) => ({
        id: tx.id,
        internal_number: tx.internal_number,
        type: tx.type
      }))
    })
  }, [bankTransactions])
  
  // Column resizing state for bank ledger entries table
  const [bankColumnWidths, setBankColumnWidths] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bank-ledger-column-widths')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return {}
        }
      }
    }
    return {}
  })
  
  // Column resizing state for customer ledger entries table
  const [customerColumnWidths, setCustomerColumnWidths] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customer-ledger-column-widths')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return {}
        }
      }
    }
    return {}
  })
  
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const [resizingTable, setResizingTable] = useState<'bank' | 'customer' | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)
  
  // Column resize handlers
  const handleResizeStart = useCallback((columnKey: string, startX: number, startWidth: number, tableType: 'bank' | 'customer') => {
    setResizingColumn(columnKey)
    setResizingTable(tableType)
    setResizeStartX(startX)
    setResizeStartWidth(startWidth)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleResize = useCallback((e: MouseEvent) => {
    if (!resizingColumn || !resizingTable) return
    
    const newWidth = Math.max(80, resizeStartWidth + (e.clientX - resizeStartX))
    
    if (resizingTable === 'bank') {
      setBankColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth
      }))
    } else {
      setCustomerColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth
      }))
    }
  }, [resizingColumn, resizingTable, resizeStartX, resizeStartWidth])

  const handleResizeEnd = useCallback((e?: MouseEvent) => {
    if (!resizingColumn || !resizingTable) return
    
    // Calculate final width
    const finalWidth = e 
      ? Math.max(80, resizeStartWidth + (e.clientX - resizeStartX))
      : resizingTable === 'bank' 
        ? (bankColumnWidths[resizingColumn] || resizeStartWidth)
        : (customerColumnWidths[resizingColumn] || resizeStartWidth)
    
    // Save to localStorage
    if (resizingTable === 'bank') {
      const updatedWidths = {
        ...bankColumnWidths,
        [resizingColumn]: finalWidth
      }
      setBankColumnWidths(updatedWidths)
      localStorage.setItem('bank-ledger-column-widths', JSON.stringify(updatedWidths))
    } else {
      const updatedWidths = {
        ...customerColumnWidths,
        [resizingColumn]: finalWidth
      }
      setCustomerColumnWidths(updatedWidths)
      localStorage.setItem('customer-ledger-column-widths', JSON.stringify(updatedWidths))
    }
    
    setResizingColumn(null)
    setResizingTable(null)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [resizingColumn, resizingTable, bankColumnWidths, customerColumnWidths, resizeStartX, resizeStartWidth])

  // Set up resize event listeners
  useEffect(() => {
    if (resizingColumn) {
      const onMouseMove = (e: MouseEvent) => handleResize(e)
      const onMouseUp = (e: MouseEvent) => handleResizeEnd(e)
      
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
      return () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }
    }
  }, [resizingColumn, handleResize, handleResizeEnd])
  
  const [beginningBalance, setBeginningBalance] = useState<number | null>(null)
  const [beginningBalanceExtracted, setBeginningBalanceExtracted] = useState(false)
  const [beginningBalanceInput, setBeginningBalanceInput] = useState<string>('')
  const [beginningBalanceInputError, setBeginningBalanceInputError] = useState<string>('')
  const [statementEndingBalance, setStatementEndingBalance] = useState<number | null>(null)
  const [statementEndingBalanceInput, setStatementEndingBalanceInput] = useState<string>('')
  const [statementEndingBalanceInputError, setStatementEndingBalanceInputError] = useState<string>('')
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceInput, setBalanceInput] = useState<string>('')
  const [balanceInputError, setBalanceInputError] = useState<string>('')
  const [endingBalance, setEndingBalance] = useState<number | null>(null)
  const [endingBalanceInput, setEndingBalanceInput] = useState<string>('')
  const [endingBalanceInputError, setEndingBalanceInputError] = useState<string>('')
  const [totalDifference, setTotalDifference] = useState<number | null>(null)
  const [totalDifferenceInput, setTotalDifferenceInput] = useState<string>('')
  const [totalDifferenceInputError, setTotalDifferenceInputError] = useState<string>('')
  
  // Écart (gap/difference) state
  const [ecart, setEcart] = useState<number | null>(null)
  const [ecartInput, setEcartInput] = useState<string>('')
  const [ecartInputError, setEcartInputError] = useState<string>('')
  
  // Solde (running balance) state
  const [currentSolde, setCurrentSolde] = useState<number | null>(null)
  const [clickedTransactionIds, setClickedTransactionIds] = useState<(number | string)[]>([])
  
  // Matched bank transactions sum state
  const [matchedSum, setMatchedSum] = useState<{
    total_sum: string
    total_sum_decimal: number
    count: number
    message: string
  } | null>(null)
  
  // Icon selection states
  const [selectedIcons, setSelectedIcons] = useState({
    beginningBalance: 'CreditCard' as string,
    statementEndingBalance: 'Wallet' as string,
    balance: 'SwapVert' as string,
    totalDifference: 'SwapHoriz' as string,
    ecart: 'CompareArrows' as string,
    endingBalance: 'Flag' as string
  })
  
  
  const [customerImportBatchId, setCustomerImportBatchId] = useState<number | null>(null)
  const [customerTransactions, setCustomerTransactions] = useState<any[]>([])
  const [paymentStatusMap, setPaymentStatusMap] = useState<Record<number, string>>({})
  const [matchingSummary, setMatchingSummary] = useState<any | null>(null)
  const [highMatches, setHighMatches] = useState<any[]>([])
  const [isHighMatchesFullscreen, setIsHighMatchesFullscreen] = useState(false)
  const [isReconciliationTablesFullscreen, setIsReconciliationTablesFullscreen] = useState(false)
  const [selectAllMenuOpen, setSelectAllMenuOpen] = useState(false)
  const selectAllMenuAnchorRef = useRef<HTMLButtonElement>(null)
  const [matchingLoading, setMatchingLoading] = useState(false)
  const [matchingProgress, setMatchingProgress] = useState(0)
  const [taxComparisonResults, setTaxComparisonResults] = useState<any[]>([])
  const [taxComparisonLoading, setTaxComparisonLoading] = useState(false)
  const [taxComparisonProgress, setTaxComparisonProgress] = useState(0)
  // Tax data caching
  const [cachedBankTaxes, setCachedBankTaxes] = useState<Record<number, any[]>>({})
  const [cachedCustomerTaxes, setCachedCustomerTaxes] = useState<Record<number, any[]>>({})
  // Hide/show missing taxes
  const [hideMissingTaxes, setHideMissingTaxes] = useState(false)
  // Selection state - using ref for instant updates
  const selectedHighMatchesRef = useRef<boolean[]>([])
  const [selectedHighMatches, setSelectedHighMatches] = useState<boolean[]>([])

  useEffect(() => {
    selectedHighMatchesRef.current = new Array(highMatches.length).fill(false)
    setSelectedHighMatches([...selectedHighMatchesRef.current])
  }, [highMatches])

  const selectedHighMatchCount = useMemo(() => selectedHighMatches.filter(Boolean).length, [selectedHighMatches])

  const allHighMatchesSelected = useMemo(
    () => highMatches.length > 0 && selectedHighMatchCount === highMatches.length,
    [highMatches.length, selectedHighMatchCount]
  )

  // Reconciliation tables selection state
  const [selectedBankTransactions, setSelectedBankTransactions] = useState<Set<number>>(new Set())
  const [selectedCustomerTransactions, setSelectedCustomerTransactions] = useState<Set<string | number>>(new Set())
  // Advanced search state
  const [searchQuery, setSearchQuery] = useState('')
  // Unmatched transactions search and filter state
  const [bankSearchQuery, setBankSearchQuery] = useState('')
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [bankPaymentClassFilter, setBankPaymentClassFilter] = useState<string>('')
  const [customerPaymentClassFilter, setCustomerPaymentClassFilter] = useState<string>('')
  
  
  const [paymentClasses, setPaymentClasses] = useState<PaymentClass[]>([])

  // Assign internal number dialog state
  const [assignInternalNumberOpen, setAssignInternalNumberOpen] = useState(false)
  const [assignInternalNumberValue, setAssignInternalNumberValue] = useState('')
  const [assignInternalNumberError, setAssignInternalNumberError] = useState<string | null>(null)
  const [assignInternalNumberLoading, setAssignInternalNumberLoading] = useState(false)
  
  // Sort transactions by operation date (ascending)
  const sortTransactionsByOperationDate = useCallback((items: any[], isBank: boolean = true) => {
    return [...items].sort((a, b) => {
      const dateA = isBank ? a?.operation_date : a?.accounting_date
      const dateB = isBank ? b?.operation_date : b?.accounting_date
      
      // Handle null/undefined dates - put them at the end
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      
      // Compare dates (assuming they're in ISO format or comparable string format)
      const dateAValue = new Date(dateA).getTime()
      const dateBValue = new Date(dateB).getTime()
      
      // If dates are invalid, fall back to string comparison
      if (isNaN(dateAValue) || isNaN(dateBValue)) {
        return String(dateA || '').localeCompare(String(dateB || ''))
      }
      
      return dateAValue - dateBValue
    })
  }, [])

  // Sort bank transactions: group by internal_number, then origine first within each group
  const sortBankTransactionsWithGrouping = useCallback((items: any[]) => {
    console.log('🔍 ========== sortBankTransactionsWithGrouping CALLED ==========')
    console.log('🔍 sortBankTransactionsWithGrouping - Starting sort')
    console.log('📊 Total items to sort:', items.length)
    
    if (items.length === 0) {
      console.log('⚠️ No items to sort, returning empty array')
      return []
    }
    
    // Log sample of first few transactions to see structure
    if (items.length > 0) {
      console.log('📋 Sample transactions (first 5):', items.slice(0, 5).map((tx: any, idx: number) => ({
        index: idx,
        id: tx.id,
        internal_number: tx.internal_number,
        internal_number_type: typeof tx.internal_number,
        type: tx.type,
        operation_date: tx.operation_date,
        label: tx.label?.substring(0, 30)
      })))
      
      // Count transactions by internal_number
      const internalNumberGroups = items.reduce((acc: any, tx: any) => {
        const key = tx?.internal_number ?? 'NO_INTERNAL_NUMBER'
        if (!acc[key]) acc[key] = []
        acc[key].push({ id: tx.id, type: tx.type })
        return acc
      }, {})
      console.log('📦 Grouping by internal_number:', Object.keys(internalNumberGroups).map(key => ({
        internal_number: key,
        count: internalNumberGroups[key].length,
        types: [...new Set(internalNumberGroups[key].map((t: any) => t.type))]
      })))
    }
    
    const sorted = [...items].sort((a, b) => {
      // Primary: Group by internal_number
      const internalNumA = a?.internal_number ?? null
      const internalNumB = b?.internal_number ?? null
      
      // Log comparison for debugging (only first few to avoid spam)
      const shouldLog = items.indexOf(a) < 3 && items.indexOf(b) < 3
      if (shouldLog) {
        console.log('🔀 Comparing:', {
          a: { id: a.id, internal_number: internalNumA, type: a.type },
          b: { id: b.id, internal_number: internalNumB, type: b.type }
        })
      }
      
      // If both have internal_number, compare them
      if (internalNumA !== null && internalNumB !== null) {
        const numDiff = String(internalNumA).localeCompare(String(internalNumB))
        if (shouldLog) {
          console.log('  → Both have internal_number, diff:', numDiff)
        }
        if (numDiff !== 0) return numDiff
        // Same internal_number - continue to check origine within this group
      } else if (internalNumA !== null && internalNumB === null) {
        if (shouldLog) {
          console.log('  → A has internal_number, B doesn\'t - A comes first')
        }
        return -1 // A has internal_number, B doesn't - A comes first
      } else if (internalNumA === null && internalNumB !== null) {
        if (shouldLog) {
          console.log('  → B has internal_number, A doesn\'t - B comes first')
        }
        return 1 // B has internal_number, A doesn't - B comes first
      } else {
        if (shouldLog) {
          console.log('  → Both have no internal_number - maintain order')
        }
        // Both have no internal_number - maintain original order
        return 0
      }
      
      // Secondary: Within same internal_number group, origine first
      const typeA = a?.type || ''
      const typeB = b?.type || ''
      const isOrigineA = typeA === 'origine'
      const isOrigineB = typeB === 'origine'
      
      if (shouldLog) {
        console.log('  → Same internal_number, checking type:', { isOrigineA, isOrigineB })
      }
      
      if (isOrigineA && !isOrigineB) {
        if (shouldLog) {
          console.log('  → A is origine, B is not - A comes first in group')
        }
        return -1 // A is origine, B is not - A comes first in the group
      }
      if (!isOrigineA && isOrigineB) {
        if (shouldLog) {
          console.log('  → B is origine, A is not - B comes first in group')
        }
        return 1  // B is origine, A is not - B comes first in the group
      }
      
      // Both are same type (both origine or both not origine), maintain order
      if (shouldLog) {
        console.log('  → Both same type - maintain order')
      }
      return 0
    })
    
    // Log result grouping
    console.log('✅ Sorting complete')
    console.log('📊 Result grouping (first 10):', sorted.slice(0, 10).map((tx: any, idx: number) => ({
      position: idx,
      id: tx.id,
      internal_number: tx.internal_number,
      type: tx.type
    })))
    
    // Verify grouping
    const resultGroups = sorted.reduce((acc: any, tx: any, idx: number) => {
      const key = tx?.internal_number ?? 'NO_INTERNAL_NUMBER'
      if (!acc[key]) {
        acc[key] = { positions: [], types: [] }
      }
      acc[key].positions.push(idx)
      acc[key].types.push(tx.type)
      return acc
    }, {})
    
    console.log('✅ Final grouping verification:', Object.keys(resultGroups).map(key => ({
      internal_number: key,
      positions: resultGroups[key].positions.slice(0, 5), // First 5 positions
      types: resultGroups[key].types.slice(0, 5), // First 5 types
      total: resultGroups[key].positions.length
    })))
    
    console.log('🔍 sortBankTransactionsWithGrouping - Sorting complete')
    return sorted
  }, [])

  // Sort matches by bank operation date (ascending)
  const sortMatchesByBankOperationDate = useCallback((matches: any[]) => {
    return [...matches].sort((a, b) => {
      const dateA = a?.bank_operation_date
      const dateB = b?.bank_operation_date
      
      // Handle null/undefined dates - put them at the end
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      
      // Compare dates (assuming they're in ISO format or comparable string format)
      const dateAValue = new Date(dateA).getTime()
      const dateBValue = new Date(dateB).getTime()
      
      // If dates are invalid, fall back to string comparison
      if (isNaN(dateAValue) || isNaN(dateBValue)) {
        return String(dateA || '').localeCompare(String(dateB || ''))
      }
      
      return dateAValue - dateBValue
    })
  }, [])
  
  // Filtered uploaded transactions for fullscreen view
  const filteredBankTransactions = useMemo(() => {
    console.log('🚀 filteredBankTransactions useMemo - EXECUTING', {
      bankTransactionsCount: bankTransactions.length,
      bankPaymentClassFilter,
      bankSearchQuery
    })
    let filtered = [...bankTransactions]
    
    // Filter by payment class
    if (bankPaymentClassFilter) {
      filtered = filtered.filter((tx: any) => {
        const pc = tx.payment_class?.code || tx.payment_class_id || tx.payment_class
        return String(pc) === String(bankPaymentClassFilter)
      })
    }
    
    // Filter by search
    if (bankSearchQuery.trim()) {
      const searchLower = bankSearchQuery.toLowerCase()
      filtered = filtered.filter((tx: any) => {
        const searchableText = [
          tx.operation_date,
          tx.label,
          tx.value_date,
          tx.ref,
          tx.date_ref,
          tx.document_reference,
          tx.payment_class?.name || tx.payment_class,
          tx.payment_status?.name || tx.payment_status
        ].filter(Boolean).join(' ').toLowerCase()
        return searchableText.includes(searchLower)
      })
    }
    
    // Return filtered transactions without sorting by internal_number or date_ref
    return filtered
  }, [bankTransactions, bankPaymentClassFilter, bankSearchQuery])
  
  // Pre-compute lookup maps for origine transactions from sorted API data
  // Maps internal_number -> origine transaction ID and ref -> origine transaction ID
  const origineTransactionLookup = useMemo(() => {
    const internalNumberMap = new Map<string, number>()
    const refMap = new Map<string, number>()
    
    console.log('🗺️ [Lookup Map Creation] Building origine transaction lookup maps from', filteredBankTransactions.length, 'transactions')
    
    // Build lookup maps from filteredBankTransactions (which comes from sorted API)
    filteredBankTransactions.forEach((tx: any) => {
      const isOrigin = tx.is_origine === true || tx.is_origine === 'true' || tx.is_origine === 1
      if (isOrigin) {
        // Map internal_number to origine ID
        if (tx.internal_number) {
          internalNumberMap.set(tx.internal_number, tx.id)
          console.log(`  📌 Mapped internal_number "${tx.internal_number}" → origine ID ${tx.id} (label: ${tx.label})`)
        }
        // Map ref to origine ID
        if (tx.ref) {
          refMap.set(tx.ref, tx.id)
          console.log(`  📌 Mapped ref "${tx.ref}" → origine ID ${tx.id} (label: ${tx.label})`)
        }
      }
    })
    
    console.log('✅ [Lookup Map Creation] Complete:', {
      internalNumberMapSize: internalNumberMap.size,
      refMapSize: refMap.size,
      internalNumbers: Array.from(internalNumberMap.entries()),
      refs: Array.from(refMap.entries())
    })
    
    return { internalNumberMap, refMap }
  }, [filteredBankTransactions])
  
  const filteredCustomerTransactions = useMemo(() => {
    let filtered = [...customerTransactions]
    
    // Filter by payment class
    if (customerPaymentClassFilter) {
      filtered = filtered.filter((tx: any) => {
        const pc = tx.payment_class?.code || tx.payment_class_id || tx.payment_class
        return String(pc) === String(customerPaymentClassFilter)
      })
    }
    
    // Filter by search
    if (customerSearchQuery.trim()) {
      const searchLower = customerSearchQuery.toLowerCase()
      filtered = filtered.filter((tx: any) => {
        const searchableText = [
          tx.accounting_date,
          tx.description,
          tx.document_number,
          tx.external_doc_number,
          tx.payment_type,
          tx.payment_status?.name || tx.payment_status
        ].filter(Boolean).join(' ').toLowerCase()
        return searchableText.includes(searchLower)
      })
    }
    
    // Sort by accounting date (ascending) - equivalent to operation date for customer transactions
    return sortTransactionsByOperationDate(filtered, false)
  }, [customerTransactions, customerPaymentClassFilter, customerSearchQuery, sortTransactionsByOperationDate])
  
  // Check if all bank transactions are selected
  const allBankTransactionsSelected = useMemo(
    () => {
      if (filteredBankTransactions.length === 0) return false
      return filteredBankTransactions.every((tx: any) => selectedBankTransactions.has(tx.id))
    },
    [filteredBankTransactions, selectedBankTransactions]
  )
  
  // Check if all customer transactions are selected
  const allCustomerTransactionsSelected = useMemo(
    () => {
      if (filteredCustomerTransactions.length === 0) return false
      return filteredCustomerTransactions.every((tx: any) => selectedCustomerTransactions.has(tx.id))
    },
    [filteredCustomerTransactions, selectedCustomerTransactions]
  )
  
  // Handle individual bank transaction selection
  const handleBankTransactionSelection = useCallback((transactionId: string | number) => {
    const id = typeof transactionId === 'string' ? Number(transactionId) : transactionId
    setSelectedBankTransactions(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])
  
  // Handle individual customer transaction selection
  const handleCustomerTransactionSelection = useCallback((transactionId: string | number) => {
    // If it's a string that starts with "tax-", keep it as string (tax row ID)
    // Otherwise, convert to number (regular transaction ID)
    const id = typeof transactionId === 'string' && transactionId.startsWith('tax-') 
      ? transactionId 
      : (typeof transactionId === 'string' ? Number(transactionId) : transactionId)
    setSelectedCustomerTransactions(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])
  
  // Handle select all bank transactions
  const handleSelectAllBankTransactions = useCallback(() => {
    setSelectedBankTransactions(prev => {
      const allIds = new Set(filteredBankTransactions.map((tx: any) => tx.id))
      const allSelected = filteredBankTransactions.length > 0 && prev.size === filteredBankTransactions.length && 
        filteredBankTransactions.every((tx: any) => prev.has(tx.id))
      if (allSelected) {
        return new Set()
      } else {
        return allIds
      }
    })
  }, [filteredBankTransactions])
  
  // Handle select all customer transactions
  const handleSelectAllCustomerTransactions = useCallback(() => {
    setSelectedCustomerTransactions(prev => {
      const allIds = new Set(filteredCustomerTransactions.map((tx: any) => tx.id))
      const allSelected = filteredCustomerTransactions.length > 0 && prev.size === filteredCustomerTransactions.length && 
        filteredCustomerTransactions.every((tx: any) => prev.has(tx.id))
      if (allSelected) {
        return new Set()
      } else {
        return allIds
      }
    })
  }, [filteredCustomerTransactions])
  
  // Handle select all bank transactions (all)
  const handleSelectAllBank = useCallback(() => {
    const allIds = new Set(filteredBankTransactions.map((tx: any) => tx.id))
    setSelectedBankTransactions(allIds)
    setSelectAllMenuAnchor(null)
  }, [filteredBankTransactions])
  
  // Handle select none bank transactions
  const handleSelectNoneBank = useCallback(() => {
    setSelectedBankTransactions(new Set())
    setSelectAllMenuAnchor(null)
  }, [])
  
  // Unmatched transactions data
  const [unmatchedBankTransactions, setUnmatchedBankTransactions] = useState<any[]>([])
  const [unmatchedBankCount, setUnmatchedBankCount] = useState<number | null>(null)
  const [unmatchedCustomerTransactions, setUnmatchedCustomerTransactions] = useState<any[]>([])
  
  // Filtered unmatched bank transactions with optimized performance
  const filteredUnmatchedBankTransactions = useMemo(() => {
    console.log('🔄 Filtering bank transactions:', {
      total: unmatchedBankTransactions.length,
      searchQuery: bankSearchQuery,
      paymentClassFilter: bankPaymentClassFilter
    })
    
    // First, keep only bank transactions of type 'origine'
    const origineOnly = unmatchedBankTransactions.filter((tx: any) => tx.type === 'origine')

    const trimmedSearch = bankSearchQuery.trim()
    // Early return for no filters
    if (!trimmedSearch && !bankPaymentClassFilter) {
      return origineOnly
    }
    
    // Pre-compute search string once
    const hasSearch = trimmedSearch.length > 0
    const searchLower = hasSearch ? trimmedSearch.toLowerCase() : ''
    const hasPaymentClass = bankPaymentClassFilter.length > 0
    
    let paymentClassLogged = false // Track if we've logged a transaction with payment_class
    const selectedBankClassName = (paymentClasses.find(pc => pc.code === bankPaymentClassFilter)?.name || '').toString()
    const filtered = origineOnly.filter((tx: any, index: number) => {
      // Payment class filter (faster, check first)
      if (hasPaymentClass) {
        // For unmatched bank transactions, payment class is in payment_class fields
        // Check code, name, id, and direct value (payment_class might be an object or string)
        const txPaymentClassCode = tx.payment_class?.code || tx.payment_class?.name || tx.payment_class_id || tx.payment_class
        
        // Debug log: first transaction and first transaction WITH payment_class
        if (index === 0) {
          console.log('🔍 First bank transaction (may be null):', {
            filter: bankPaymentClassFilter,
            hasPaymentClass: !!tx.payment_class,
            txPaymentClassCode,
            payment_class: tx.payment_class,
            payment_class_type: typeof tx.payment_class,
            payment_class_name: tx.payment_class?.name,
            payment_class_code: tx.payment_class?.code,
            payment_class_id: tx.payment_class_id,
            tableDisplayValue: tx.payment_class?.name || tx.payment_class || tx.payment_class_id || ''
          })
        }
        
        // Find and log first transaction that HAS payment_class populated
        if (tx.payment_class && tx.payment_class !== null && !paymentClassLogged) {
          console.log('🔍 Bank transaction WITH payment_class:', {
            filter: bankPaymentClassFilter,
            txPaymentClassCode,
            payment_class: tx.payment_class,
            payment_class_type: typeof tx.payment_class,
            payment_class_name: tx.payment_class?.name,
            payment_class_code: tx.payment_class?.code,
            payment_class_id: tx.payment_class_id,
            tableDisplayValue: tx.payment_class?.name || tx.payment_class || tx.payment_class_id || '',
            fullTx: tx
          })
          paymentClassLogged = true // Mark as logged to avoid spam
        }
        
        // If transaction has no payment class data, exclude it from filtered results
        if (!txPaymentClassCode) {
          return false
        }
        
        const normTx = String(txPaymentClassCode || '').trim().toLowerCase()
        const normCode = String(bankPaymentClassFilter).trim().toLowerCase()
        const normName = selectedBankClassName.trim().toLowerCase()
        const matchesPaymentClass = normTx === normCode || (normName && normTx === normName)
        
        // Debug log first transaction to see structure
        if (index === 0) {
          console.log('🔍 Sample bank transaction payment class:', {
            filter: bankPaymentClassFilter,
            txPaymentClassCode,
            payment_class: tx.payment_class,
            payment_class_id: tx.payment_class_id,
            matches: matchesPaymentClass
          })
        }
        
        if (!matchesPaymentClass) return false
      }
      
      // Search filter (only if search query exists)
      if (hasSearch) {
        const matches = (tx.operation_date && String(tx.operation_date).toLowerCase().includes(searchLower)) ||
          (tx.label && String(tx.label).toLowerCase().includes(searchLower)) ||
          (tx.value_date && String(tx.value_date).toLowerCase().includes(searchLower)) ||
          (tx.amount && String(tx.amount).includes(trimmedSearch)) ||
          (tx.payment_class?.name && String(tx.payment_class.name).toLowerCase().includes(searchLower)) ||
          (tx.payment_status?.name && String(tx.payment_status.name).toLowerCase().includes(searchLower)) ||
          (tx.type && String(tx.type).toLowerCase().includes(searchLower)) ||
          (tx.ref && String(tx.ref).toLowerCase().includes(searchLower)) ||
          (tx.date_ref && String(tx.date_ref).toLowerCase().includes(searchLower)) ||
          (tx.document_reference && String(tx.document_reference).toLowerCase().includes(searchLower))
        return matches
      }
      
      return true
    })
    
    console.log('✅ Filtered bank transactions result:', filtered.length)
    // Sort by operation date (ascending)
    return sortTransactionsByOperationDate(filtered, true)
  }, [unmatchedBankTransactions, bankSearchQuery, bankPaymentClassFilter, paymentClasses, sortTransactionsByOperationDate])

  // Total number of bank tax rows for CURRENT unmatched bank transactions (for display)
  const unmatchedBankTaxCount = useMemo(() => {
    let count = 0
    Object.values(cachedBankTaxes || {}).forEach(taxes => {
      if (Array.isArray(taxes)) {
        count += taxes.length
      } else if (taxes) {
        count += 1
      }
    })
    return count
  }, [cachedBankTaxes])

  // Combine origine bank transactions and orphan bank taxes into a single display list
  const unmatchedBankDisplayRows = useMemo(() => {
    // Start with filtered origine bank transactions (one row per transaction)
    const origineRows = filteredUnmatchedBankTransactions.map((tx: any) => ({
      ...tx,
      __rowType: 'origine' as const
    }))

    // Build a set of origine bank transaction IDs
    const origineIds = new Set<number>(origineRows.map((tx: any) => tx.id))

    // Collect orphan bank tax rows: taxes whose bank_transaction_id has no origine row
    const orphanTaxRows: any[] = []

    Object.entries(cachedBankTaxes || {}).forEach(([bankIdStr, taxes]) => {
      const bankId = Number(bankIdStr)
      if (origineIds.has(bankId)) return

      const taxArray = Array.isArray(taxes) ? taxes : [taxes]
      taxArray.forEach((tax: any, idx: number) => {
        const rawValue =
          tax.value ??
          tax.tax_amount ??
          tax.amount ??
          tax.tax_value ??
          tax.bank_tax ??
          0

        orphanTaxRows.push({
          __rowType: 'orphanTax' as const,
          id: `orphan-${bankId}-${idx}`,
          bank_transaction_id: bankId,
          // Use tax fields "as they are" from DB
          operation_date: tax.operation_date || null,
          label:
            tax.label ||
            tax.tax_name ||
            tax.tax_type ||
            tax.name ||
            `${dictionary?.navigation?.taxName || 'Tax'} ${idx + 1}`,
          debit: null,
          credit: null,
          amount: rawValue,
          payment_class: tax.payment_class || null,
          payment_status: tax.payment_status || null,
          type: tax.type || tax.tax_type || 'tax',
          ref: tax.ref || '',
          date_ref: tax.date_ref || '',
          document_reference: tax.document_reference || ''
        })
      })
    })

    console.log('🔍 Building unmatched bank display rows:', {
      origineCount: origineRows.length,
      orphanTaxRows: orphanTaxRows.length
    })

    // Combine and sort by operation date (ascending)
    const combined = [...origineRows, ...orphanTaxRows]
    return sortTransactionsByOperationDate(combined, true)
  }, [filteredUnmatchedBankTransactions, cachedBankTaxes, dictionary, sortTransactionsByOperationDate])
  
  const filteredUnmatchedCustomerTransactions = useMemo(() => {
    console.log('🔄 Filtering customer transactions:', {
      total: unmatchedCustomerTransactions.length,
      searchQuery: customerSearchQuery,
      paymentClassFilter: customerPaymentClassFilter
    })
    
    const trimmedSearch = customerSearchQuery.trim()
    // Early return for no filters
    if (!trimmedSearch && !customerPaymentClassFilter) {
      return unmatchedCustomerTransactions
    }
    
    // Pre-compute search string once
    const hasSearch = trimmedSearch.length > 0
    const searchLower = hasSearch ? trimmedSearch.toLowerCase() : ''
    const hasPaymentClass = customerPaymentClassFilter.length > 0
    
    const filtered = unmatchedCustomerTransactions.filter((tx: any, index: number) => {
      // Payment class filter (faster, check first)
      if (hasPaymentClass) {
        // For unmatched customer transactions, payment class is stored in payment_type field
        // Also check payment_class fields in case they exist
        const txPaymentClassCode = tx.payment_type || tx.payment_class?.code || tx.payment_class?.name || tx.payment_class_id || tx.payment_class
        
        // Debug log first transaction to see full structure
        if (index === 0) {
          console.log('🔍 Full customer transaction structure:', {
            filter: customerPaymentClassFilter,
            txPaymentClassCode,
            payment_class: tx.payment_class,
            payment_class_type: typeof tx.payment_class,
            payment_class_name: tx.payment_class?.name,
            payment_class_code: tx.payment_class?.code,
            payment_class_id: tx.payment_class_id,
            payment_class_id_type: typeof tx.payment_class_id,
            allKeys: Object.keys(tx).filter(k => k.toLowerCase().includes('payment') || k.toLowerCase().includes('class')),
            // Check ALL fields that might contain payment class
            payment_type: tx.payment_type,
            payment_status: tx.payment_status,
            // Also check what the table displays
            tableDisplayValue: tx.payment_class?.name || tx.payment_class || tx.payment_class_id || '',
            // Show full transaction to see what fields exist
            fullTx: tx
          })
        }
        
        // If transaction has no payment class data, exclude it from filtered results
        // (we want to show only transactions that match the selected payment class)
        if (!txPaymentClassCode) {
          return false
        }
        
        const matchesPaymentClass = String(txPaymentClassCode) === String(customerPaymentClassFilter)
        
        // Debug log first transaction to see structure
        if (index === 0) {
          console.log('🔍 Sample customer transaction payment class:', {
            filter: customerPaymentClassFilter,
            txPaymentClassCode,
            payment_class: tx.payment_class,
            payment_class_id: tx.payment_class_id,
            matches: matchesPaymentClass
          })
        }
        
        if (!matchesPaymentClass) return false
      }
      
      // Search filter (only if search query exists)
      if (hasSearch) {
        const matches = (tx.accounting_date && String(tx.accounting_date).toLowerCase().includes(searchLower)) ||
          (tx.description && String(tx.description).toLowerCase().includes(searchLower)) ||
          (tx.amount && String(tx.amount).includes(trimmedSearch)) ||
          (tx.total_amount && String(tx.total_amount).includes(trimmedSearch)) ||
          (tx.payment_status?.name && String(tx.payment_status.name).toLowerCase().includes(searchLower)) ||
          (tx.payment_type && String(tx.payment_type).toLowerCase().includes(searchLower)) ||
          (tx.due_date && String(tx.due_date).toLowerCase().includes(searchLower)) ||
          (tx.external_doc_number && String(tx.external_doc_number).toLowerCase().includes(searchLower)) ||
          (tx.document_number && String(tx.document_number).toLowerCase().includes(searchLower))
        return matches
      }
      
      return true
    })
    
    console.log('✅ Filtered customer transactions result:', filtered.length)
    // Sort by accounting date (ascending) - equivalent to operation date for customer transactions
    return sortTransactionsByOperationDate(filtered, false)
  }, [unmatchedCustomerTransactions, customerSearchQuery, customerPaymentClassFilter, sortTransactionsByOperationDate])

  // Total number of customer tax rows for CURRENT unmatched customer transactions (for display)
  const unmatchedCustomerTaxCount = useMemo(() => {
    let count = 0
    Object.values(cachedCustomerTaxes || {}).forEach(taxes => {
      if (Array.isArray(taxes)) {
        count += taxes.length
      } else if (taxes) {
        count += 1
      }
    })
    return count
  }, [cachedCustomerTaxes])

const sortTransactionsByDbOrder = useCallback((items: any[]) => {
  const getOrderValue = (item: any) => {
    const raw =
      item?.order_index ??
      item?.sequence ??
      item?.position ??
      item?.line_number ??
      item?.row_number ??
      item?.id ??
      0
    return typeof raw === 'number' ? raw : Number(raw) || 0
  }
  return [...items].sort((a, b) => getOrderValue(a) - getOrderValue(b))
}, [])
  const [unmatchedLoading, setUnmatchedLoading] = useState(false)
  
  // Selection state for unmatched transactions
  const [selectedUnmatchedBank, setSelectedUnmatchedBank] = useState<number | null>(null)
  const [selectedUnmatchedCustomer, setSelectedUnmatchedCustomer] = useState<number | null>(null)
  
  // Function to translate server messages
  const translateServerMessage = (message: string, dict: any) => {
    if (!dict?.navigation) return message
    
    // MatchBankTransactionTaxesView hasn't been run message
    if (message.includes('MatchBankTransactionTaxesView') && (message.includes("hasn't been run") || message.includes('has not been run'))) {
      return dict.navigation.matchBankTransactionTaxesNotRun || message
    }
    
    // Bank ledger success messages
    if (message.includes('Successfully processed') && message.includes('transactions')) {
      const match = message.match(/Successfully processed (\d+) transactions/)
      if (match) {
        const count = match[1]
        return dict.navigation.successfullyProcessedTransactions?.replace('{count}', count) || message
      }
    }
    
    // Customer ledger success messages
    if (message.includes('Successfully processed') && message.includes('customer transactions')) {
      const match = message.match(/Successfully processed (\d+) customer transactions/)
      if (match) {
        const count = match[1]
        return dict.navigation.successfullyProcessedCustomerTransactions?.replace('{count}', count) || message
      }
    }
    
    // Generic success messages
    if (message.includes('Successfully processed')) {
      return dict.navigation.successfullyProcessed || message
    }
    
    return message
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

  // Handle unmatched bank transaction selection - optimized with useCallback
  const handleUnmatchedBankSelection = useCallback<(bankId: number | string) => void>((bankId) => {
    const normalizedId = typeof bankId === 'string' ? Number(bankId) : bankId
    if (Number.isNaN(normalizedId)) return
    setSelectedUnmatchedBank(selectedUnmatchedBank === normalizedId ? null : normalizedId)
  }, [selectedUnmatchedBank])
  
  // Handle unmatched customer transaction selection - optimized with useCallback
  const handleUnmatchedCustomerSelection = useCallback<(customerId: number | string) => void>((customerId) => {
    const normalizedId = typeof customerId === 'string' ? Number(customerId) : customerId
    if (Number.isNaN(normalizedId)) return
    setSelectedUnmatchedCustomer(selectedUnmatchedCustomer === normalizedId ? null : normalizedId)
  }, [selectedUnmatchedCustomer])

  // Handle finish session
  const handleFinishSession = async () => {
    const errors: string[] = []

    try {
      // Clear all tax comparison data from the database (TRUNCATE TABLE)
      if (!bankCode) {
        throw new Error(dictionary?.navigation?.bankCodeNotAvailable || 'Code banque non disponible')
      }
      await taxComparisonService.clearAll(bankCode)
      console.log('✅ Tax comparison table cleared successfully')
    } catch (err: any) {
      const rawErrorMsg = err?.response?.data?.message || err?.message || (dictionary?.navigation?.unknownError || 'Erreur inconnue')
      const errorMsg = translateAxiosError(rawErrorMsg)
      console.error('❌ Failed to clear tax comparison data:', err)
      const label = dictionary?.navigation?.taxComparison || 'Comparaison fiscale'
      errors.push(`${label}: ${errorMsg}`)
    }

    try {
      // Clear all customer tax rows from the database (TRUNCATE TABLE)
      await taxExtractionService.clearCustomerTaxRows()
      console.log('✅ Customer tax rows table cleared successfully')
    } catch (err: any) {
      const rawErrorMsg = err?.response?.data?.message || err?.message || (dictionary?.navigation?.unknownError || 'Erreur inconnue')
      const errorMsg = translateAxiosError(rawErrorMsg)
      console.error('❌ Failed to clear customer tax rows:', err)
      const label = dictionary?.navigation?.customerTaxRows || 'Lignes fiscales client'
      errors.push(`${label}: ${errorMsg}`)
    }

    try {
      // Clear all reco customer transactions from the database (TRUNCATE TABLE)
      await recoCustomerTransactionService.clearAll()
      console.log('✅ Reco customer transactions table cleared successfully')
    } catch (err: any) {
      const rawErrorMsg = err?.response?.data?.message || err?.message || (dictionary?.navigation?.unknownError || 'Erreur inconnue')
      const errorMsg = translateAxiosError(rawErrorMsg)
      console.error('❌ Failed to clear reco customer transactions:', err)
      const label = dictionary?.navigation?.recoCustomerTransactions || 'Transactions client de rapprochement'
      errors.push(`${label}: ${errorMsg}`)
    }

    try {
      // Clear all reco bank transactions from the database (TRUNCATE TABLE)
      await recoBankTransactionService.clearAll()
      console.log('✅ Reco bank transactions table cleared successfully')
    } catch (err: any) {
      const rawErrorMsg = err?.response?.data?.message || err?.message || (dictionary?.navigation?.unknownError || 'Erreur inconnue')
      const errorMsg = translateAxiosError(rawErrorMsg)
      console.error('❌ Failed to clear reco bank transactions:', err)
      const label = dictionary?.navigation?.recoBankTransactions || 'Transactions bancaires de rapprochement'
      errors.push(`${label}: ${errorMsg}`)
    }

    // Show errors to user if any occurred
    if (errors.length > 0) {
      const errorMessage = dictionary?.navigation?.failedToClearSomeTables || 'Échec du vidage de certaines tables'
      setError(`${errorMessage}: ${errors.join('; ')}`)
      console.error('❌ Errors during table clearing:', errors)
    }

    // Reset all states to start a new session
    setReconciliationComplete(false)
    setReconciliationReady(false)
    setBankProcessed(false)
    setCustomerProcessed(false)
    setBankSessionProcessed(false)
    setCustomerSessionProcessed(false)
    setBankTransactions([])
    setCustomerTransactions([])
    setBankImportBatchId(null)
    setCustomerImportBatchId(null)
    setMatchingSummary(null)
    setHighMatches([])
    setTaxComparisonResults([])
    selectedHighMatchesRef.current = []
    setSelectedHighMatches([])
    setSelectedUnmatchedCustomer(null)
    setSelectedUnmatchedBank(null)
    setUnmatchedBankTransactions([])
    setUnmatchedCustomerTransactions([])
    setUnmatchedLoading(false)
    setError('')
    setSuccess('')
    setNotificationMessage('')
    setNotificationOpen(false)
    
    // Reset beginning balance for new session
    setBeginningBalance(null)
    setBeginningBalanceExtracted(false)
    setBeginningBalanceInput('')
    setBeginningBalanceInputError('')
    // Reset new balance sections
    setStatementEndingBalance(null)
    setStatementEndingBalanceInput('')
    setStatementEndingBalanceInputError('')
    setBalance(null)
    setBalanceInput('')
    setBalanceInputError('')
    setEndingBalance(null)
    setEndingBalanceInput('')
    setEndingBalanceInputError('')
    setTotalDifference(null)
    setTotalDifferenceInput('')
    setTotalDifferenceInputError('')
    
    // Show success message
    setSuccess(dictionary?.navigation?.sessionFinished || 'Session finished successfully. You can now start a new reconciliation.')
  }

  // Load unmatched transactions after reconciliation is complete
  const loadUnmatchedTransactions = useCallback(async () => {
    try {
      console.log('🔄 Loading unmatched transactions after reconciliation...')
      setUnmatchedLoading(true)
      
      // Load unmatched bank transactions from RecoBankTransaction API
      const unmatchedBankTxs = await recoBankTransactionService.getUnmatched()
      console.log('✅ Unmatched reco bank transactions count:', unmatchedBankTxs?.length || 0)
      
      // Filter to only origine transactions for count (UI count = only origine)
      const origineOnly = unmatchedBankTxs.filter((tx: any) => tx.type === 'origine')
      console.log('✅ Origine unmatched transactions count:', origineOnly.length)
      
      setUnmatchedBankTransactions(unmatchedBankTxs || [])
      
      // Load unmatched bank transactions count from RecoBankTransaction API
      // but override with origine-only count for display
      await recoBankTransactionService.getUnmatchedCount()
      setUnmatchedBankCount(origineOnly.length)
      
      // Load bank taxes using the new /with-taxes/ endpoint
      console.log('🔄 Loading bank transactions with taxes for unmatched view using /with-taxes/ endpoint...')
      const withTaxes = await recoBankTransactionService.getWithTaxes()
      const bankTaxesCache: Record<number, any[]> = {}
      
      withTaxes.transactions_with_taxes.forEach(item => {
        const bankTx = item.bank_transaction
        const taxes = item.taxes || []
        if (!bankTx || !bankTx.id) return
        if (!taxes.length) return
        
        // Cache all taxes by bank transaction id (we'll decide later which ones are "origines" vs "orphan" taxes)
        bankTaxesCache[bankTx.id] = Array.isArray(taxes) ? taxes : [taxes]
      })
      
      if (Object.keys(bankTaxesCache).length > 0) {
        // Replace with the latest snapshot for this unmatched view
        setCachedBankTaxes(bankTaxesCache)
        console.log('✅ Cached bank taxes for unmatched bank transactions:', Object.keys(bankTaxesCache).length)
      } else {
        console.log('ℹ️ No bank taxes found for unmatched bank transactions from /with-taxes/')
      }
      
      // Load unmatched customer transactions using RecoCustomerTransaction API
      // Get transactions that don't have a matched_bank_transaction (null)
      const unmatchedCustomerTxs = await recoCustomerTransactionService.getTransactions({
        has_matched_bank_transaction: 'false'
      })
      console.log('✅ Customer unmatched transactions count:', unmatchedCustomerTxs?.length || 0)
      setUnmatchedCustomerTransactions(unmatchedCustomerTxs || [])

      // Load customer taxes for unmatched customer transactions
      try {
        console.log('🔄 Loading customer taxes for unmatched customer transactions...')
        const { taxExtractionService } = await import('@/services/taxExtraction.service')

        const customerTaxesCache: Record<number, any[]> = {}
        const transactions = unmatchedCustomerTxs || []

        // Fetch in small batches to avoid overloading the API
        const batchSize = 10
        for (let i = 0; i < transactions.length; i += batchSize) {
          const batch = transactions.slice(i, i + batchSize)
          const batchResults = await Promise.all(
            batch.map(async (tx: any) => {
              try {
                const resp = await taxExtractionService.getCustomerTaxRowsByTransaction(tx.id)
                return { id: tx.id, taxes: resp.extracted_taxes || [] }
              } catch (err) {
                console.error('❌ Error loading customer taxes for unmatched transaction:', tx.id, err)
                return { id: tx.id, taxes: [] }
              }
            })
          )

          batchResults.forEach(({ id, taxes }) => {
            if (taxes.length) {
              customerTaxesCache[id] = taxes
            }
          })
        }

        if (Object.keys(customerTaxesCache).length > 0) {
          setCachedCustomerTaxes(prev => ({ ...prev, ...customerTaxesCache }))
          console.log('✅ Cached customer taxes for unmatched transactions:', Object.keys(customerTaxesCache).length)
        } else {
          console.log('ℹ️ No customer taxes found for unmatched customer transactions')
        }
      } catch (taxErr) {
        console.error('❌ Failed to load customer taxes for unmatched transactions:', taxErr)
      }
    } catch (err) {
      console.error('❌ Error loading unmatched transactions:', err)
      setUnmatchedBankTransactions([])
      setUnmatchedBankCount(null)
      setUnmatchedCustomerTransactions([])
    } finally {
      setUnmatchedLoading(false)
    }
  }, [agencyCode])


  // Helpers to filter any array of objects by any field
  const objectMatchesQuery = useCallback((obj: any, query: string) => {
    if (!query) return true
    // Fallback simple check (kept for potential reuse elsewhere)
    return JSON.stringify(obj).toLowerCase().includes(query)
  }, [])

  // Build a compact searchable string for a match row
  const buildMatchSearchString = useCallback((m: any): string => {
    const fields = [
      m.bank_label, m.bank_operation_date, m.bank_value_date, m.bank_debit, m.bank_credit, m.bank_amount,
      m.bank_payment_class, m.bank_payment_status, m.bank_type, m.bank_ref, m.bank_date_ref, m.bank_accounting_account,
      m.customer_description, m.customer_accounting_date, m.customer_debit, m.customer_credit, m.customer_amount,
      m.customer_total_amount, m.customer_payment_status, m.customer_payment_type, m.customer_due_date,
      m.customer_external_doc_number, m.customer_document_number, m.score
    ]
    return fields.filter(v => v !== undefined && v !== null).join(' ').toLowerCase()
  }, [])

  // Check if taxes match for a given transaction pair
  const getTaxMatchStatus = useCallback((bankTransactionId: number, customerTransactionId: number) => {
    const taxResult = taxComparisonResults.find(tax => 
      tax.matched_bank_transaction_id === bankTransactionId && 
      tax.customer_transaction_id === customerTransactionId
    )
    if (!taxResult) return null
    const status = taxResult.status
    // Normalize backend 'matched' to 'match' for UI coloring
    return status === 'matched' ? 'match' : status
  }, [taxComparisonResults])

  const getInlineTaxData = useCallback((match: any): { bankRows: InlineTaxRow[]; customerRows: InlineTaxRow[] } => {
    const comparisonRows = taxComparisonResults.filter(tax => 
      tax.matched_bank_transaction_id === match.bank_transaction_id &&
      tax.customer_transaction_id === match.customer_transaction_id
    )

    const statusLookup = new Map<string, string>()
    comparisonRows.forEach(row => {
      if (row.tax_type) {
        statusLookup.set(row.tax_type.toLowerCase(), row.status)
      }
    })

    const mergeComparisonRows = (rows: InlineTaxRow[], side: 'bank' | 'customer') => {
      comparisonRows.forEach((row, idx) => {
        const sourceValue = side === 'bank'
          ? row.bank_tax
          : (row.tax_type === 'AGIOS' ? row.customer_total_tax : row.customer_tax)
        if (sourceValue === null || sourceValue === undefined || sourceValue === '') return
        // Only process rows that have a proper tax_type (no generic fallback)
        if (!row.tax_type || row.tax_type.trim() === '') return
        const taxName = row.tax_type
        const normalizedKey = taxName.toLowerCase()
        const existing = rows.find(taxRow => taxRow.name.toLowerCase() === normalizedKey)
        if (existing) {
          if (!existing.status && row.status) {
            existing.status = row.status
          }
          if ((!existing.formattedValue || existing.formattedValue === '-') && sourceValue) {
            existing.formattedValue = formatTaxValue(sourceValue)
          }
          if (!existing.type && row.status) {
            existing.type = row.status
          }
          return
        }
        rows.push({
          id: `${side}-${match.bank_transaction_id}-${match.customer_transaction_id}-comparison-${row.id || idx}`,
          name: taxName,
          type: row.status || '',
          formattedValue: formatTaxValue(sourceValue),
          status: row.status || null
        })
      })
    }

    const bankRows: InlineTaxRow[] = []
    const customerRows: InlineTaxRow[] = []

    mergeComparisonRows(bankRows, 'bank')
    mergeComparisonRows(customerRows, 'customer')

    return {
      bankRows,
      customerRows
    }
  }, [taxComparisonResults])

  // Get tax comparison data for a bank-customer transaction pair (for reconciliation tables)
  const getTaxComparisonForPair = useCallback((bankTxId: number, customerTxId: number): { bankRows: InlineTaxRow[]; customerRows: InlineTaxRow[] } => {
    const comparisonRows = taxComparisonResults.filter(tax => 
      tax.matched_bank_transaction_id === bankTxId &&
      tax.customer_transaction_id === customerTxId
    )

    const statusLookup = new Map<string, string>()
    comparisonRows.forEach(row => {
      if (row.tax_type) {
        statusLookup.set(row.tax_type.toLowerCase(), row.status)
      }
    })

    const mergeComparisonRows = (rows: InlineTaxRow[], side: 'bank' | 'customer') => {
      comparisonRows.forEach((row, idx) => {
        const sourceValue = side === 'bank'
          ? row.bank_tax
          : (row.tax_type === 'AGIOS' ? row.customer_total_tax : row.customer_tax)
        if (sourceValue === null || sourceValue === undefined || sourceValue === '') return
        if (!row.tax_type || row.tax_type.trim() === '') return
        const taxName = row.tax_type
        const normalizedKey = taxName.toLowerCase()
        const existing = rows.find(taxRow => taxRow.name.toLowerCase() === normalizedKey)
        if (existing) {
          if (!existing.status && row.status) {
            existing.status = row.status
          }
          if ((!existing.formattedValue || existing.formattedValue === '-') && sourceValue) {
            existing.formattedValue = formatTaxValue(sourceValue)
          }
          if (!existing.type && row.status) {
            existing.type = row.status
          }
          return
        }
        rows.push({
          id: `${side}-${bankTxId}-${customerTxId}-comparison-${row.id || idx}`,
          name: taxName,
          type: row.status || '',
          formattedValue: formatTaxValue(sourceValue),
          status: row.status || null
        })
      })
    }

    const bankRows: InlineTaxRow[] = []
    const customerRows: InlineTaxRow[] = []

    mergeComparisonRows(bankRows, 'bank')
    mergeComparisonRows(customerRows, 'customer')

    return {
      bankRows,
      customerRows
    }
  }, [taxComparisonResults])

  // Calculate total tax difference directly from the comparison API results
  // This sums the `difference` field returned by the tax comparison API
  const computedTotalTaxDifference = useMemo(() => {
    if (!taxComparisonResults.length) return null

    let total = 0
    let hasAny = false

    taxComparisonResults.forEach((tax: any) => {
      // Respect the "hideMissingTaxes" toggle so the total matches what's visible in tax tables
      if (hideMissingTaxes && tax.status === 'missing') {
        return
      }

      const diff = normalizeNumericValue(tax.difference)
      if (diff !== null) {
        total += diff
        hasAny = true
      }
    })

    if (!hasAny) return null

    return total
  }, [taxComparisonResults, hideMissingTaxes])

  // Keep the "Total différence" section in sync with the computed total
  useEffect(() => {
    if (computedTotalTaxDifference === null) {
      setTotalDifference(null)
      setTotalDifferenceInput('')
      return
    }

    setTotalDifference(computedTotalTaxDifference)

    // Format total difference with French grouping but dot as decimal separator.
    // Example: "123 743.876"
    const formattedTotal = computedTotalTaxDifference
      .toLocaleString('fr-FR', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
        useGrouping: true
      })
      .replace(/\u00A0/g, ' ')
      .replace(',', '.')

    setTotalDifferenceInput(formattedTotal)
  }, [computedTotalTaxDifference])

  const renderTaxSection = useCallback((title: string, rows: InlineTaxRow[], accentColor: string) => {
    return (
      <Box
        sx={{
          border: '1px solid #dfe7df',
          borderRadius: 2,
          p: 2,
          backgroundColor: '#ffffff'
        }}
      >
        <Typography variant="subtitle2" sx={{ color: accentColor, mb: 1 }}>
          {title}
        </Typography>
        {rows.length > 0 ? (
          <TableContainer component={Box} sx={{ maxHeight: 240, '& .MuiTableCell-root': { borderBottom: '1px solid #f1f1f1' } }}>
            <Table size="small" stickyHeader={false}>
              <TableHead>
                <TableRow>
                  <TableCell>{dictionary?.navigation?.taxName || 'Tax Name'}</TableCell>
                  <TableCell align="right">{dictionary?.navigation?.value || 'Value'}</TableCell>
                  <TableCell>{dictionary?.navigation?.type || 'Type'}</TableCell>
                  <TableCell>{dictionary?.navigation?.status || 'Status'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{row.formattedValue}</TableCell>
                    <TableCell>{row.type || '-'}</TableCell>
                    <TableCell>
                      {row.status ? (
                        <Chip 
                          size="small" 
                          label={dictionary?.navigation?.[row.status] || row.status} 
                          color={row.status === 'matched' || row.status === 'match' ? 'success' : row.status === 'mismatch' ? 'error' : 'warning'} 
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {dictionary?.navigation?.noTaxesAvailable || 'No tax rows available for this transaction'}
          </Typography>
        )}
      </Box>
    )
  }, [dictionary])

  // Reconciliation table relationship state
  const [highlightedBankTransaction, setHighlightedBankTransaction] = useState<number | null>(null)
  const [highlightedCustomerTransaction, setHighlightedCustomerTransaction] = useState<number | null>(null)
  const [highlightedCustomerTransactions, setHighlightedCustomerTransactions] = useState<Set<number>>(new Set())
  const bankTransactionRefs = useRef<Record<number, HTMLTableRowElement | null>>({})
  const customerTransactionRefs = useRef<Record<number, HTMLTableRowElement | null>>({})
  
  // Refs for table scroll containers (regular view)
  const bankTableScrollRef = useRef<HTMLDivElement | null>(null)
  const customerTableScrollRef = useRef<HTMLDivElement | null>(null)
  
  // Refs for table scroll containers (fullscreen view)
  const bankTableScrollFullscreenRef = useRef<HTMLDivElement | null>(null)
  const customerTableScrollFullscreenRef = useRef<HTMLDivElement | null>(null)
  
  // State to store saved scroll positions and table state
  const [savedTableState, setSavedTableState] = useState<{
    bankScrollTop: number
    bankScrollLeft: number
    customerScrollTop: number
    customerScrollLeft: number
  } | null>(null)
  
  // Function to save current table state (scroll positions)
  const saveTableState = useCallback(() => {
    // Get the actual scrollable element - TableContainer with component={Paper} creates a scrollable div
    const bankScroll = bankTableScrollRef.current
    const customerScroll = customerTableScrollRef.current
    
    // Find the actual scrollable element (could be the ref itself or a child)
    const getScrollElement = (element: HTMLElement | null): HTMLElement | null => {
      if (!element) return null
      
      // Check if element itself is scrollable
      const style = window.getComputedStyle(element)
      const isScrollable = 
        (style.overflowY === 'auto' || style.overflowY === 'scroll' || 
         style.overflowX === 'auto' || style.overflowX === 'scroll') &&
        (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)
      
      if (isScrollable) {
        return element
      }
      
      // Otherwise, find the first scrollable child by checking computed styles
      for (const child of Array.from(element.children)) {
        const el = child as HTMLElement
        const childStyle = window.getComputedStyle(el)
        const childIsScrollable = 
          (childStyle.overflowY === 'auto' || childStyle.overflowY === 'scroll' || 
           childStyle.overflowX === 'auto' || childStyle.overflowX === 'scroll') &&
          (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
        
        if (childIsScrollable) {
          return el
        }
      }
      
      // Fallback: return the element itself if no scrollable child found
      return element
    }
    
    const bankScrollEl = getScrollElement(bankScroll)
    const customerScrollEl = getScrollElement(customerScroll)
    
    if (bankScrollEl || customerScrollEl) {
      setSavedTableState({
        bankScrollTop: bankScrollEl?.scrollTop || 0,
        bankScrollLeft: bankScrollEl?.scrollLeft || 0,
        customerScrollTop: customerScrollEl?.scrollTop || 0,
        customerScrollLeft: customerScrollEl?.scrollLeft || 0
      })
      console.log('💾 Saved table state:', {
        bankScrollTop: bankScrollEl?.scrollTop || 0,
        bankScrollLeft: bankScrollEl?.scrollLeft || 0,
        customerScrollTop: customerScrollEl?.scrollTop || 0,
        customerScrollLeft: customerScrollEl?.scrollLeft || 0
      })
    }
  }, [])
  
  // Function to restore table state (scroll positions)
  const restoreTableState = useCallback((isFullscreen: boolean) => {
    if (!savedTableState) return
    
    const bankScroll = isFullscreen ? bankTableScrollFullscreenRef.current : bankTableScrollRef.current
    const customerScroll = isFullscreen ? customerTableScrollFullscreenRef.current : customerTableScrollRef.current
    
    // Find the actual scrollable element
    const getScrollElement = (element: HTMLElement | null): HTMLElement | null => {
      if (!element) return null
      
      // Check if element itself is scrollable
      const style = window.getComputedStyle(element)
      const isScrollable = 
        (style.overflowY === 'auto' || style.overflowY === 'scroll' || 
         style.overflowX === 'auto' || style.overflowX === 'scroll') &&
        (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)
      
      if (isScrollable) {
        return element
      }
      
      // Otherwise, find the first scrollable child by checking computed styles
      for (const child of Array.from(element.children)) {
        const el = child as HTMLElement
        const childStyle = window.getComputedStyle(el)
        const childIsScrollable = 
          (childStyle.overflowY === 'auto' || childStyle.overflowY === 'scroll' || 
           childStyle.overflowX === 'auto' || childStyle.overflowX === 'scroll') &&
          (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
        
        if (childIsScrollable) {
          return el
        }
      }
      
      // Fallback: return the element itself if no scrollable child found
      return element
    }
    
    // Use requestAnimationFrame with setTimeout to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      setTimeout(() => {
        const bankScrollEl = getScrollElement(bankScroll)
        const customerScrollEl = getScrollElement(customerScroll)
        
        if (bankScrollEl) {
          bankScrollEl.scrollTop = savedTableState.bankScrollTop
          bankScrollEl.scrollLeft = savedTableState.bankScrollLeft
          console.log('📖 Restored bank scroll:', {
            top: savedTableState.bankScrollTop,
            left: savedTableState.bankScrollLeft,
            actualTop: bankScrollEl.scrollTop,
            actualLeft: bankScrollEl.scrollLeft
          })
        }
        if (customerScrollEl) {
          customerScrollEl.scrollTop = savedTableState.customerScrollTop
          customerScrollEl.scrollLeft = savedTableState.customerScrollLeft
          console.log('📖 Restored customer scroll:', {
            top: savedTableState.customerScrollTop,
            left: savedTableState.customerScrollLeft,
            actualTop: customerScrollEl.scrollTop,
            actualLeft: customerScrollEl.scrollLeft
          })
        }
      }, 200)
    })
  }, [savedTableState])
  
  // Function to save state from fullscreen view
  const saveFullscreenTableState = useCallback(() => {
    // Get the actual scrollable element from fullscreen view
    const bankScroll = bankTableScrollFullscreenRef.current
    const customerScroll = customerTableScrollFullscreenRef.current
    
    // Find the actual scrollable element
    const getScrollElement = (element: HTMLElement | null): HTMLElement | null => {
      if (!element) return null
      
      // Check if element itself is scrollable
      const style = window.getComputedStyle(element)
      const isScrollable = 
        (style.overflowY === 'auto' || style.overflowY === 'scroll' || 
         style.overflowX === 'auto' || style.overflowX === 'scroll') &&
        (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)
      
      if (isScrollable) {
        return element
      }
      
      // Otherwise, find the first scrollable child by checking computed styles
      for (const child of Array.from(element.children)) {
        const el = child as HTMLElement
        const childStyle = window.getComputedStyle(el)
        const childIsScrollable = 
          (childStyle.overflowY === 'auto' || childStyle.overflowY === 'scroll' || 
           childStyle.overflowX === 'auto' || childStyle.overflowX === 'scroll') &&
          (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
        
        if (childIsScrollable) {
          return el
        }
      }
      
      // Fallback: return the element itself if no scrollable child found
      return element
    }
    
    const bankScrollEl = getScrollElement(bankScroll)
    const customerScrollEl = getScrollElement(customerScroll)
    
    if (bankScrollEl || customerScrollEl) {
      setSavedTableState({
        bankScrollTop: bankScrollEl?.scrollTop || 0,
        bankScrollLeft: bankScrollEl?.scrollLeft || 0,
        customerScrollTop: customerScrollEl?.scrollTop || 0,
        customerScrollLeft: customerScrollEl?.scrollLeft || 0
      })
      console.log('💾 Saved fullscreen table state:', {
        bankScrollTop: bankScrollEl?.scrollTop || 0,
        bankScrollLeft: bankScrollEl?.scrollLeft || 0,
        customerScrollTop: customerScrollEl?.scrollTop || 0,
        customerScrollLeft: customerScrollEl?.scrollLeft || 0
      })
    }
  }, [])
  
  // Handle fullscreen toggle with state preservation
  const handleReconciliationTablesFullscreenToggle = useCallback(() => {
    if (!isReconciliationTablesFullscreen) {
      // Opening fullscreen - save current state from normal view first, then toggle
      saveTableState()
      // Use setTimeout to ensure state is saved before toggling
      setTimeout(() => {
        setIsReconciliationTablesFullscreen(true)
      }, 50)
    } else {
      // Closing fullscreen - save current state from fullscreen view first, then close
      saveFullscreenTableState()
      // Use setTimeout to ensure state is saved before closing
      setTimeout(() => {
        setIsReconciliationTablesFullscreen(false)
      }, 50)
    }
  }, [isReconciliationTablesFullscreen, saveTableState, saveFullscreenTableState])
  
  // Restore state when fullscreen opens
  useEffect(() => {
    if (isReconciliationTablesFullscreen && savedTableState) {
      // Delay restoration to ensure DOM is ready
      const timer = setTimeout(() => {
        restoreTableState(true)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isReconciliationTablesFullscreen, savedTableState, restoreTableState])
  
  // Restore state when fullscreen closes
  useEffect(() => {
    if (!isReconciliationTablesFullscreen && savedTableState) {
      // Delay restoration to ensure DOM is ready
      const timer = setTimeout(() => {
        restoreTableState(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isReconciliationTablesFullscreen, savedTableState, restoreTableState])

  // Create mapping between bank and customer transactions using highMatches
  const bankToCustomerMap = useMemo(() => {
    const map: Record<number, number[]> = {}
    highMatches.forEach((match: any) => {
      const bankId = Number(match.bank_transaction_id)
      const customerId = Number(match.customer_transaction_id)
      if (bankId && customerId) {
        if (!map[bankId]) {
          map[bankId] = []
        }
        if (!map[bankId].includes(customerId)) {
          map[bankId].push(customerId)
        }
      }
    })
    return map
  }, [highMatches])

  const customerToBankMap = useMemo(() => {
    const map: Record<number, number | null> = {}
    highMatches.forEach((match: any) => {
      const bankId = Number(match.bank_transaction_id)
      const customerId = Number(match.customer_transaction_id)
      if (bankId && customerId) {
        // Customer to bank is one-to-one, so we just take the first match
        if (!map[customerId]) {
          map[customerId] = bankId
        }
      }
    })
    return map
  }, [highMatches])

  // Get linked customer transaction IDs for a bank transaction
  const getLinkedCustomerTransactions = useCallback((bankTransactionId: number): number[] => {
    return bankToCustomerMap[bankTransactionId] || []
  }, [bankToCustomerMap])

  // Get linked bank transaction ID for a customer transaction
  const getLinkedBankTransaction = useCallback((customerTransactionId: number): number | null => {
    return customerToBankMap[customerTransactionId] || null
  }, [customerToBankMap])

  // Calculate écart from comparison API for the clicked transaction
  const computedEcart = useMemo(() => {
    console.log('🔵 computedEcart useMemo called:', {
      taxComparisonResultsLength: taxComparisonResults.length,
      clickedTransactionIdsLength: clickedTransactionIds.length,
      clickedTransactionIds,
      taxComparisonResultsCount: taxComparisonResults.length
    })
    
    if (!taxComparisonResults.length || clickedTransactionIds.length === 0) {
      console.log('❌ Early return - no taxComparisonResults or no clickedTransactionIds')
      return null
    }

    // Get the last clicked transaction (most recent)
    const lastClickedId = clickedTransactionIds[clickedTransactionIds.length - 1]
    
    console.log('🔍 Computing écart for clicked transaction:', {
      lastClickedId,
      clickedTransactionIds,
      taxComparisonResultsCount: taxComparisonResults.length
    })

    // Check if it's a tax row (customer tax transaction)
    if (typeof lastClickedId === 'string' && lastClickedId.startsWith('tax-')) {
      console.log('🔵 Processing tax row:', { lastClickedId })
      // Extract customer transaction ID and tax index from tax row ID
      const match = lastClickedId.match(/^tax-(\d+)-(\d+)$/)
      if (match) {
        const customerTxId = Number(match[1])
        const taxIdx = Number(match[2])
        console.log('🔵 Extracted IDs:', { customerTxId, taxIdx })
        
        const linkedBankId = getLinkedBankTransaction(customerTxId)
        console.log('🔵 Linked bank ID:', { linkedBankId, customerTxId })
        if (linkedBankId) {
          // Get all customer taxes from taxComparisonResults (same source used for rendering)
          const allCustomerTaxes = taxComparisonResults.filter(tax => 
            tax.customer_transaction_id === customerTxId
          )
          
          // Get matching bank taxes for comparison
          const matchingBankTaxes = taxComparisonResults.filter(tax => 
            tax.matched_bank_transaction_id === linkedBankId &&
            tax.customer_transaction_id === customerTxId
          )
          
          console.log('🔵 Customer taxes from taxComparisonResults:', {
            linkedBankId,
            customerTxId,
            allCustomerTaxesCount: allCustomerTaxes.length,
            matchingBankTaxesCount: matchingBankTaxes.length,
            allCustomerTaxes: allCustomerTaxes.map((t: any, idx: number) => ({
              idx,
              tax_type: t.tax_type,
              difference: t.difference,
              customer_transaction_id: t.customer_transaction_id,
              matched_bank_transaction_id: t.matched_bank_transaction_id
            }))
          })

          // Get cached customer taxes to filter out duplicates (same logic as rendering)
          const cachedCustTaxes = cachedCustomerTaxes[customerTxId] || []
          const cachedTaxTypes = new Set(cachedCustTaxes.map(t => 
            (t.tax_type || t.tax_name || t.label || '').toLowerCase()
          ))
          
          // Filter customer taxes the same way as rendering (exclude cached ones to avoid duplicates)
          const customerTaxes = allCustomerTaxes.filter(tax => {
            const taxType = (tax.tax_type || '').toLowerCase()
            return !cachedTaxTypes.has(taxType)
          })
          
          console.log('🔵 Filtered customer taxes (after excluding cached):', {
            customerTxId,
            customerTaxesCount: customerTaxes.length,
            taxIdx,
            hasTaxAtIndex: !!customerTaxes[taxIdx],
            customerTaxes: customerTaxes.map((t: any, idx: number) => ({
              idx,
              tax_type: t.tax_type,
              difference: t.difference
            }))
          })
          
          if (customerTaxes[taxIdx]) {
            const tax = customerTaxes[taxIdx]
            const taxType = (tax.tax_type || '').toUpperCase()
            console.log('🔵 Tax at index:', { taxIdx, taxType, tax })
            
            // Find the matching tax in matchingBankTaxes (should be the same one)
            const matchingTax = matchingBankTaxes.find((t: any) => 
              (t.tax_type || '').toUpperCase() === taxType
            )
            
            console.log('🔵 Matching tax search:', {
              taxType,
              matchingTax: matchingTax ? {
                id: matchingTax.id,
                tax_type: matchingTax.tax_type,
                difference: matchingTax.difference
              } : null,
              allTaxTypesInMatchingBankTaxes: matchingBankTaxes.map((t: any) => (t.tax_type || '').toUpperCase())
            })

            // Use the tax's own difference value (it's already in taxComparisonResults)
            const differenceValue = tax.difference !== null && tax.difference !== undefined && tax.difference !== '' 
              ? tax.difference 
              : (matchingTax?.difference !== null && matchingTax?.difference !== undefined && matchingTax?.difference !== '' 
                  ? matchingTax.difference 
                  : null)

            if (differenceValue !== null) {
              const écart = normalizeNumericValue(differenceValue)
              console.log('✅✅✅ Found écart for customer tax row:', {
                customerTxId,
                taxIdx,
                taxType,
                difference: differenceValue,
                écart,
                source: tax.difference !== null ? 'from tax' : 'from matchingTax'
              })
              return écart
            } else {
              console.log('⚠️⚠️⚠️ No difference value found for customer tax row:', {
                customerTxId,
                taxIdx,
                taxType,
                taxDifference: tax.difference,
                matchingTaxDifference: matchingTax?.difference
              })
            }
          } else {
            console.log('⚠️⚠️⚠️ No tax at index:', { customerTxId, taxIdx, customerTaxesCount: customerTaxes.length })
          }
        } else {
          console.log('⚠️⚠️⚠️ No linked bank ID found:', { customerTxId })
        }
      } else {
        console.log('⚠️⚠️⚠️ Tax row ID match failed:', { lastClickedId })
      }
      console.log('❌❌❌ Returning null for tax row')
      return null
    }

    // Check if it's a bank non-origine transaction
    const clickedTxId = typeof lastClickedId === 'string' ? Number(lastClickedId) : lastClickedId
    const clickedBankTx = filteredBankTransactions.find((tx: any) => tx.id === clickedTxId)
    
    if (clickedBankTx) {
      const isOrigin = clickedBankTx.is_origine === true || clickedBankTx.is_origine === 'true' || clickedBankTx.is_origine === 1
      const hasExplicitField = clickedBankTx.is_non_origine_in_group === true || clickedBankTx.is_non_origine_in_group === 'true' || clickedBankTx.is_non_origine_in_group === 1
      const isNonOriginInGroup = hasExplicitField || 
        (!isOrigin && clickedBankTx.internal_number && clickedBankTx.internal_number !== null && clickedBankTx.internal_number !== '' && clickedBankTx.group_size && clickedBankTx.group_size > 1)

      console.log('🔍 Checking bank transaction:', {
        clickedTxId,
        isOrigin,
        hasExplicitField,
        isNonOriginInGroup,
        type: clickedBankTx.type,
        internal_number: clickedBankTx.internal_number,
        ref: clickedBankTx.ref,
        group_size: clickedBankTx.group_size
      })

      if (isNonOriginInGroup) {
        // Find the origine transaction ID
        let origineBankId: number | null = null
        
        if (clickedBankTx.internal_number && origineTransactionLookup.internalNumberMap.has(clickedBankTx.internal_number)) {
          origineBankId = origineTransactionLookup.internalNumberMap.get(clickedBankTx.internal_number)!
        } else if (clickedBankTx.ref && origineTransactionLookup.refMap.has(clickedBankTx.ref)) {
          origineBankId = origineTransactionLookup.refMap.get(clickedBankTx.ref)!
        }

        console.log('🔍 Found origine transaction ID:', {
          origineBankId,
          taxType: (clickedBankTx.type || '').toUpperCase(),
          internalNumberMapSize: origineTransactionLookup.internalNumberMap.size,
          refMapSize: origineTransactionLookup.refMap.size
        })

        if (origineBankId !== null) {
          // Get difference for this specific non-origine transaction
          const taxType = (clickedBankTx.type || '').toUpperCase()
          const matchingComparison = taxComparisonResults.find(tax => 
            tax.matched_bank_transaction_id === origineBankId &&
            (tax.tax_type || '').toUpperCase() === taxType
          )

          console.log('🔍 Matching comparison result:', {
            matchingComparison: matchingComparison ? {
              id: matchingComparison.id,
              tax_type: matchingComparison.tax_type,
              difference: matchingComparison.difference,
              matched_bank_transaction_id: matchingComparison.matched_bank_transaction_id
            } : null,
            allComparisonsForOrigine: taxComparisonResults.filter(tax => tax.matched_bank_transaction_id === origineBankId).map(tax => ({
              id: tax.id,
              tax_type: tax.tax_type,
              difference: tax.difference
            }))
          })

          if (matchingComparison && matchingComparison.difference !== null && matchingComparison.difference !== undefined && matchingComparison.difference !== '') {
            const écart = normalizeNumericValue(matchingComparison.difference)
            console.log('✅ Found écart for bank non-origine transaction:', {
              clickedTxId,
              origineBankId,
              taxType,
              difference: matchingComparison.difference,
              écart
            })
            return écart
          } else {
            console.log('⚠️ No matching comparison found for bank non-origine transaction:', {
              clickedTxId,
              origineBankId,
              taxType,
              availableTaxTypes: taxComparisonResults.filter(tax => tax.matched_bank_transaction_id === origineBankId).map(tax => tax.tax_type)
            })
          }
        } else {
          console.log('⚠️ Could not find origine transaction ID for:', {
            clickedTxId,
            internal_number: clickedBankTx.internal_number,
            ref: clickedBankTx.ref
          })
        }
      } else {
        console.log('⚠️ Transaction is not a non-origine transaction:', {
          clickedTxId,
          isOrigin,
          hasExplicitField
        })
      }
    } else {
      console.log('⚠️ Clicked transaction not found in filteredBankTransactions:', clickedTxId)
    }

    console.log('❌ No écart found for clicked transaction:', lastClickedId)
    return null
  }, [taxComparisonResults, filteredBankTransactions, filteredCustomerTransactions, cachedCustomerTaxes, origineTransactionLookup, getLinkedBankTransaction, clickedTransactionIds])

  // Keep the "Écart" section in sync with the computed écart
  useEffect(() => {
    console.log('🔄🔄🔄 Écart useEffect triggered:', {
      computedEcart,
      type: typeof computedEcart,
      isNull: computedEcart === null,
      isUndefined: computedEcart === undefined
    })
    
    if (computedEcart === null || computedEcart === undefined) {
      console.log('❌❌❌ Écart is null/undefined, clearing input')
      setEcart(null)
      setEcartInput('')
      return
    }

    setEcart(computedEcart)

    // Format the écart value with proper sign and spacing.
    // Example: "123 743.876"
    const formattedEcart = computedEcart
      .toLocaleString('fr-FR', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
        useGrouping: true
      })
      .replace(/\u00A0/g, ' ')
      .replace(',', '.')
    
    console.log('✅✅✅ Setting écart input:', {
      computedEcart,
      formattedEcart,
      ecartInputWillBe: formattedEcart
    })
    
    setEcartInput(formattedEcart)
  }, [computedEcart])

  // Determine écart color based on value
  const ecartColor = useMemo(() => {
    if (ecart === null || ecart === undefined) return 'text.secondary'
    if (ecart === 0) return 'success.main' // Green for exactly zero
    if (ecart > 0) return 'warning.main' // Orange for positive
    return 'error.main' // Red for negative
  }, [ecart])

  // Check if a bank transaction has linked customer transactions
  const hasLinkedCustomerTransactions = useCallback((bankTransactionId: number): boolean => {
    return !!bankToCustomerMap[bankTransactionId] && bankToCustomerMap[bankTransactionId].length > 0
  }, [bankToCustomerMap])
  
  // Handle select matched (rapprochées) bank transactions
  const handleSelectMatchedBank = useCallback(() => {
    const matchedIds = filteredBankTransactions
      .filter((tx: any) => {
        // Check if transaction has linked customer transactions using bankToCustomerMap
        return bankToCustomerMap[tx.id] && bankToCustomerMap[tx.id].length > 0
      })
      .map((tx: any) => tx.id)
    setSelectedBankTransactions(new Set(matchedIds))
    setSelectAllMenuAnchor(null)
  }, [filteredBankTransactions, bankToCustomerMap])
  
  // Handle select unmatched (non rapprochées) bank transactions
  const handleSelectUnmatchedBank = useCallback(() => {
    const unmatchedIds = filteredBankTransactions
      .filter((tx: any) => {
        // Check if transaction does NOT have linked customer transactions using bankToCustomerMap
        return !bankToCustomerMap[tx.id] || bankToCustomerMap[tx.id].length === 0
      })
      .map((tx: any) => tx.id)
    setSelectedBankTransactions(new Set(unmatchedIds))
    setSelectAllMenuAnchor(null)
  }, [filteredBankTransactions, bankToCustomerMap])

  // Check if a customer transaction has a linked bank transaction
  const hasLinkedBankTransaction = useCallback((customerTransactionId: number): boolean => {
    return !!customerToBankMap[customerTransactionId]
  }, [customerToBankMap])

  // Check if a bank transaction has multiple customer transactions (one-to-many)
  const isOneToManyRelationship = useCallback((bankTransactionId: number): boolean => {
    const linkedCustomers = bankToCustomerMap[bankTransactionId]
    return !!linkedCustomers && linkedCustomers.length > 1
  }, [bankToCustomerMap])

  // Get all customer transactions in the same group (same bank transaction)
  const getGroupedCustomerTransactions = useCallback((customerTransactionId: number): number[] => {
    const bankId = customerToBankMap[customerTransactionId]
    if (!bankId) return []
    return bankToCustomerMap[bankId] || []
  }, [customerToBankMap, bankToCustomerMap])

  // Check if a customer transaction is part of a one-to-many group
  const isPartOfOneToManyGroup = useCallback((customerTransactionId: number): boolean => {
    const bankId = customerToBankMap[customerTransactionId]
    if (!bankId) return false
    const linkedCustomers = bankToCustomerMap[bankId]
    return !!linkedCustomers && linkedCustomers.length > 1
  }, [customerToBankMap, bankToCustomerMap])

  // Helper function to scroll to an element, handling different scroll containers
  const scrollToElement = useCallback((element: HTMLElement | null) => {
    if (!element) return
    
    // Try scrollIntoView first (works if element is in viewport or same scroll container)
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    
    // Also try to find and scroll parent scroll containers
    let parent = element.parentElement
    while (parent) {
      const overflowY = window.getComputedStyle(parent).overflowY
      if (overflowY === 'auto' || overflowY === 'scroll') {
        const elementRect = element.getBoundingClientRect()
        const parentRect = parent.getBoundingClientRect()
        const scrollTop = parent.scrollTop + (elementRect.top - parentRect.top) - (parent.clientHeight / 2) + (elementRect.height / 2)
        parent.scrollTo({ top: scrollTop, behavior: 'smooth' })
        break
      }
      parent = parent.parentElement
    }
  }, [])

  // Helper function to scroll element2 to match element1's position (keep element1 position)
  const scrollToSameRowPosition = useCallback((element1: HTMLElement | null, element2: HTMLElement | null) => {
    if (!element1 || !element2) return
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Find scroll containers for both elements
      const findScrollContainer = (el: HTMLElement): HTMLElement | null => {
        let parent = el.parentElement
        while (parent) {
          const overflowY = window.getComputedStyle(parent).overflowY
          if (overflowY === 'auto' || overflowY === 'scroll') {
            return parent
          }
          parent = parent.parentElement
        }
        return null
      }
      
      const container1 = findScrollContainer(element1)
      const container2 = findScrollContainer(element2)
      
      if (container1 && container2) {
        // Get element1's current viewport position (keep it where it is)
        const rect1 = element1.getBoundingClientRect()
        const containerRect1 = container1.getBoundingClientRect()
        const element1RelativeY = rect1.top - containerRect1.top
        
        // Get element2's absolute position within its scrollable content
        const rect2 = element2.getBoundingClientRect()
        const containerRect2 = container2.getBoundingClientRect()
        const element2RelativeY = rect2.top - containerRect2.top
        const element2AbsoluteY = container2.scrollTop + element2RelativeY
        
        // Calculate the scroll position needed to align element2 to element1's relative position
        // We want: element2AbsoluteY - newScrollTop2 = element1RelativeY
        // Therefore: newScrollTop2 = element2AbsoluteY - element1RelativeY
        const maxScroll2 = container2.scrollHeight - container2.clientHeight
        let newScrollTop2 = element2AbsoluteY - element1RelativeY
        newScrollTop2 = Math.max(0, Math.min(newScrollTop2, maxScroll2))
        
        container2.scrollTo({ top: newScrollTop2, behavior: 'smooth' })
      } else {
        // Fallback: just scroll element2 to center
        scrollToElement(element2)
      }
    })
  }, [scrollToElement])

  // Helper function to center a group of elements (for one-to-many)
  // clickedElement is the one that was clicked - we keep its position and center the group around it
  const scrollToCenterGroup = useCallback((elements: HTMLElement[], clickedElement?: HTMLElement | null) => {
    if (elements.length === 0) return
    if (elements.length === 1) {
      if (clickedElement && clickedElement === elements[0]) {
        // Keep clicked element in place, don't scroll
        return
      }
      scrollToElement(elements[0])
      return
    }
    
    // If clicked element is in the group, center the group but keep clicked element visible
    if (clickedElement && elements.includes(clickedElement)) {
      // Find the middle element of the group
      const middleIndex = Math.floor(elements.length / 2)
      const middleElement = elements[middleIndex]
      
      // If clicked element is the middle one, don't scroll
      if (middleElement === clickedElement) {
        return
      }
      
      // Otherwise, center the group (which will keep clicked element visible)
      if (middleElement) {
        scrollToElement(middleElement)
      }
    } else {
      // No clicked element specified, just center the middle element
      const middleIndex = Math.floor(elements.length / 2)
      const middleElement = elements[middleIndex]
      if (middleElement) {
        scrollToElement(middleElement)
      }
    }
  }, [scrollToElement])

  // Helper function to check if a transaction should be highlighted (directly or via its origin)
  const shouldHighlightBankTransaction = useCallback((tx: any) => {
    // Direct highlight check
    const isDirectlyHighlighted = highlightedBankTransaction === tx.id
    
    // If it's already directly highlighted, return true
    if (isDirectlyHighlighted) return true
    
    // For non-origin transactions, check if their origin is highlighted
    if (tx.type !== 'origine' && tx.internal_number) {
      // Find the origin transaction with the same internal_number
      const originTx = filteredBankTransactions.find(
        (t: any) => t.internal_number === tx.internal_number && t.type === 'origine'
      )
      // Check if that origin is highlighted
      if (originTx && highlightedBankTransaction === originTx.id) {
        return true
      }
    }
    
    return false
  }, [highlightedBankTransaction, filteredBankTransactions])

  // Helper function to check if a transaction is highlighted via its origin (not directly)
  const isHighlightedViaOrigin = useCallback((tx: any) => {
    // Only for non-origin transactions
    if (tx.type === 'origine' || !tx.internal_number) return false
    
    // Find the origin transaction with the same internal_number
    const originTx = filteredBankTransactions.find(
      (t: any) => t.internal_number === tx.internal_number && t.type === 'origine'
    )
    // Check if that origin is highlighted
    return originTx ? highlightedBankTransaction === originTx.id : false
  }, [highlightedBankTransaction, filteredBankTransactions])

  // Handle bank transaction click - navigate to linked customer transactions
  const handleBankTransactionClick = useCallback((bankTxId: number) => {
    const linkedCustomerIds = getLinkedCustomerTransactions(bankTxId)
    const isOneToMany = isOneToManyRelationship(bankTxId)
    
    // Always highlight the clicked bank transaction briefly for visual feedback
    setHighlightedBankTransaction(bankTxId)
    
    // Update solde when clicking on bank transaction - calculate cumulative balance up to clicked transaction
    const bankTx = bankTransactions.find(tx => tx.id === bankTxId)
    if (bankTx) {
      setClickedTransactionIds(prev => {
        console.log('🟢🟢🟢 Bank transaction clicked:', {
          bankTxId,
          prevIds: prev,
          alreadyIncluded: prev.includes(bankTxId)
        })
        // If already clicked, don't add again
        if (prev.includes(bankTxId)) {
          return prev
        }
        const newIds = [...prev, bankTxId]
        console.log('✅✅✅ Adding bank transaction to clickedTransactionIds:', newIds)
        
        // Calculate cumulative solde: beginningBalance + sum of all transactions up to and including the clicked transaction
        // Find the position of the clicked transaction in the filtered/sorted list
        const clickedIndex = filteredBankTransactions.findIndex((tx: any) => tx.id === bankTxId)
        
        if (clickedIndex >= 0) {
          // Calculate cumulative balance: beginningBalance + credits - debits up to clicked transaction
          // Credits are added, debits are subtracted
          let cumulativeAmount = 0
          for (let i = 0; i <= clickedIndex; i++) {
            const tx = filteredBankTransactions[i]
            // Use debit and credit fields if available, otherwise use amount
            const debit = normalizeNumericValue(tx.debit) || 0
            const credit = normalizeNumericValue(tx.credit) || 0
            const amount = normalizeNumericValue(tx.amount) || 0
            
            // If debit and credit are available, use them (credit adds, debit subtracts)
            // Otherwise, use amount field (positive = credit, negative = debit)
            if (debit !== 0 || credit !== 0) {
              cumulativeAmount += credit - debit
            } else {
              cumulativeAmount += amount
            }
          }
          
          // Solde = beginningBalance + cumulative amount up to clicked transaction
          const initialBalance = beginningBalance !== null ? beginningBalance : 0
          const newSolde = initialBalance + cumulativeAmount
          setCurrentSolde(newSolde)
        } else {
          // Fallback: if transaction not found in filtered list, use simple addition
          const txAmount = normalizeNumericValue(bankTx.amount) || 0
          const currentSoldeValue = currentSolde !== null ? currentSolde : (beginningBalance !== null ? beginningBalance : 0)
          const newSolde = currentSoldeValue + txAmount
          setCurrentSolde(newSolde)
        }
        
        return newIds
      })
    }
    
    if (linkedCustomerIds.length > 0) {
      // Highlight all linked customer transactions (one-to-many support)
      setHighlightedCustomerTransactions(new Set(linkedCustomerIds))
      setHighlightedCustomerTransaction(null) // Clear single highlight
      
      // Get the bank transaction row
      const bankRow = bankTransactionRefs.current[bankTxId]
      
      if (isOneToMany && linkedCustomerIds.length > 1) {
        // One-to-many: center the group of customer transactions (keep bank position)
        setTimeout(() => {
          const customerRows = linkedCustomerIds
            .map(id => customerTransactionRefs.current[id])
            .filter((row): row is HTMLElement => row !== null)
          // Keep bank row position, center the customer group
          scrollToCenterGroup(customerRows)
        }, 100)
      } else {
        // One-to-one: align customer to bank's position (keep bank position)
        setTimeout(() => {
          requestAnimationFrame(() => {
            const customerRow = customerTransactionRefs.current[linkedCustomerIds[0]]
            if (bankRow && customerRow) {
              scrollToSameRowPosition(bankRow, customerRow)
            } else if (customerRow) {
              scrollToElement(customerRow)
            }
          })
        }, 150)
      }
      
      // Clear highlights after 5 seconds
      setTimeout(() => {
        setHighlightedBankTransaction(null)
        setHighlightedCustomerTransactions(new Set())
        setHighlightedCustomerTransaction(null)
      }, 5000)
    } else {
      // Clear highlight after 1 second if no matches
      setTimeout(() => {
        setHighlightedBankTransaction(null)
      }, 1000)
    }
  }, [getLinkedCustomerTransactions, isOneToManyRelationship, scrollToElement, scrollToSameRowPosition, scrollToCenterGroup, bankTransactions, filteredBankTransactions, currentSolde, beginningBalance])

  // Handle customer transaction click - navigate to linked bank transaction and group
  const handleCustomerTransactionClick = useCallback((customerTxId: number) => {
    const linkedBankId = getLinkedBankTransaction(customerTxId)
    
    // Always highlight the clicked customer transaction briefly for visual feedback
    setHighlightedCustomerTransaction(customerTxId)
    
    // Update solde when clicking on customer transaction
    const customerTx = customerTransactions.find(tx => tx.id === customerTxId)
    if (customerTx) {
      setClickedTransactionIds(prev => {
        console.log('🟢🟢🟢 Customer transaction clicked:', {
          customerTxId,
          prevIds: prev,
          alreadyIncluded: prev.includes(customerTxId)
        })
        // If already clicked, don't add again
        if (prev.includes(customerTxId)) {
          return prev
        }
        const newIds = [...prev, customerTxId]
        console.log('✅✅✅ Adding customer transaction to clickedTransactionIds:', newIds)
        
        // Calculate solde: beginningBalance + sum of all clicked transaction amounts
        const txAmount = normalizeNumericValue(customerTx.amount) || 0
        const currentSoldeValue = currentSolde !== null ? currentSolde : (beginningBalance !== null ? beginningBalance : 0)
        const newSolde = currentSoldeValue + txAmount
        setCurrentSolde(newSolde)
        
        return newIds
      })
    }
    
    if (linkedBankId) {
      // Check if this is part of a one-to-many relationship
      const groupedCustomers = getGroupedCustomerTransactions(customerTxId)
      const isOneToMany = isPartOfOneToManyGroup(customerTxId)
      
      // Get the customer transaction row
      const customerRow = customerTransactionRefs.current[customerTxId]
      const bankRow = bankTransactionRefs.current[linkedBankId]
      
      if (isOneToMany && groupedCustomers.length > 1) {
        // One-to-many: highlight bank transaction and ALL customer transactions in the group
        setHighlightedBankTransaction(linkedBankId)
        setHighlightedCustomerTransactions(new Set(groupedCustomers))
        setHighlightedCustomerTransaction(null) // Clear single highlight
        
        // Center the group of customer transactions (keep clicked customer position)
        setTimeout(() => {
          const customerRows = groupedCustomers
            .map(id => customerTransactionRefs.current[id])
            .filter((row): row is HTMLElement => row !== null)
          scrollToCenterGroup(customerRows, customerRow)
        }, 100)
      } else {
        // One-to-one: highlight only this customer transaction and the bank transaction
        setHighlightedCustomerTransaction(customerTxId)
        setHighlightedCustomerTransactions(new Set())
        setHighlightedBankTransaction(linkedBankId)
        
        // Align bank to customer's position (keep customer position)
        setTimeout(() => {
          requestAnimationFrame(() => {
            if (bankRow && customerRow) {
              scrollToSameRowPosition(customerRow, bankRow)
            } else if (bankRow) {
              scrollToElement(bankRow)
            }
          })
        }, 150)
      }
      
      // Clear highlights after 5 seconds
      setTimeout(() => {
        setHighlightedBankTransaction(null)
        setHighlightedCustomerTransaction(null)
        setHighlightedCustomerTransactions(new Set())
      }, 5000)
    } else {
      // Clear highlight after 1 second if no matches
      setTimeout(() => {
        setHighlightedCustomerTransaction(null)
      }, 1000)
    }
  }, [getLinkedBankTransaction, getGroupedCustomerTransactions, isPartOfOneToManyGroup, scrollToElement, scrollToSameRowPosition, scrollToCenterGroup, customerTransactions, currentSolde, beginningBalance])

  // Handle high match selection - INSTANT
  const handleHighMatchSelection = (index: number) => {
    if (selectedHighMatchesRef.current.length !== highMatches.length) {
      selectedHighMatchesRef.current = Array.from({ length: highMatches.length }, (_, idx) => selectedHighMatchesRef.current[idx] || false)
    }

    // Update ref immediately for instant visual feedback
    selectedHighMatchesRef.current[index] = !selectedHighMatchesRef.current[index]
    
    // Force immediate re-render
    setSelectedHighMatches([...selectedHighMatchesRef.current])
  }

  const handleToggleSelectAllHighMatches = useCallback(() => {
    if (!highMatches.length) return

    const total = highMatches.length
    const currentSelection = selectedHighMatchesRef.current.slice(0, total)
    const allSelected = currentSelection.length === total && currentSelection.every(Boolean)
    const newSelection = new Array(total).fill(!allSelected)

    selectedHighMatchesRef.current = newSelection
    setSelectedHighMatches([...newSelection])
  }, [highMatches])

  // Handle low match selection
  const handleLowMatchSelection = useCallback((index: number) => {
    // TODO: Implement low match selection when needed
    console.log('Low match selection not implemented yet:', index)
  }, [])

  // Handle approve selection
  const handleApproveSelection = useCallback(() => {
    const selectedHigh = selectedHighMatches
      .map((selected, idx) => selected ? highMatches[idx] : null)
      .filter(Boolean)
    
    console.log('Approving selections:')
    console.log('High matches:', selectedHigh.length, selectedHigh)
    
    // TODO: Implement approval logic here
    setNotificationMessage(dictionary?.approveSelection || `Approved ${selectedHigh.length} high matches`)
    setNotificationOpen(true)
    playNotificationSound()
  }, [selectedHighMatches, highMatches, dictionary])

  // Open details in a new tab for a specific match row
  const openHighMatchDetails = useCallback((m: any) => {
    // Encode cached tax data for the specific transactions
    const bankTaxesForTransaction = cachedBankTaxes[m.bank_transaction_id] || []
    const customerTaxesForTransaction = cachedCustomerTaxes[m.customer_transaction_id] || []
    
    // Find the transaction data from loaded arrays
    const bankTransactionData = bankTransactions.find(tx => tx.id === m.bank_transaction_id)
    const customerTransactionData = customerTransactions.find(tx => tx.id === m.customer_transaction_id)
    
    const cachedBankTaxesParam = encodeURIComponent(JSON.stringify({ [m.bank_transaction_id]: bankTaxesForTransaction }))
    const cachedCustomerTaxesParam = encodeURIComponent(JSON.stringify({ [m.customer_transaction_id]: customerTaxesForTransaction }))
    const cachedBankTransactionParam = bankTransactionData ? encodeURIComponent(JSON.stringify(bankTransactionData)) : ''
    const cachedCustomerTransactionParam = customerTransactionData ? encodeURIComponent(JSON.stringify(customerTransactionData)) : ''
    
    const url = `/${lang}/reconciliation/agency/${agencyCode}/details?bankId=${m.bank_transaction_id}&customerId=${m.customer_transaction_id}&score=${m.score}&cachedBankTaxes=${cachedBankTaxesParam}&cachedCustomerTaxes=${cachedCustomerTaxesParam}&cachedBankTransaction=${cachedBankTransactionParam}&cachedCustomerTransaction=${cachedCustomerTransactionParam}`
    window.open(url, '_blank')
  }, [lang, agencyCode, cachedBankTaxes, cachedCustomerTaxes, bankTransactions, customerTransactions])

  // Combine matches once and cache a __search string for each element when the dataset changes
  const combinedMatches = useMemo(() => {
    const combined = [...highMatches.map(m => ({ ...m, __confidence: 'high' }))]
    return combined.map(m => ({ ...m, __search: buildMatchSearchString(m) }))
  }, [highMatches, buildMatchSearchString])

  const filteredMatches = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase()
    if (!searchLower) return combinedMatches
    return combinedMatches.filter((m: any) => m.__search.includes(searchLower))
  }, [combinedMatches, searchQuery])
  
  // Notification state
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')

  // Calculator helpers
  const handleCalculatorClose = () => {
    setCalculatorOpen(false)
    setCalculatorError('')
  }

  const handleCalculatorEvaluate = () => {
    setCalculatorError('')
    setCalculatorResult('')

    const raw = calculatorExpression.trim()
    if (!raw) {
      return
    }

    try {
      // Allow digits, basic operators and parentheses. Replace ',' with '.'
      const sanitized = raw.replace(/[^0-9+\-*/().,]/g, '').replace(/,/g, '.')
      if (!sanitized) {
        throw new Error('empty')
      }

      // Evaluate safely in a restricted Function
      // eslint-disable-next-line no-new-func
      const fn = new Function(`"use strict"; return (${sanitized});`)
      const value = fn()

      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error('not-number')
      }

      setCalculatorResult(formatHighMatchAmount(value))
    } catch (err) {
      setCalculatorError(
        dictionary?.navigation?.invalidBeginningBalance || 'Veuillez entrer une expression valide'
      )
    }
  }

  // Handle export to Excel
  const handleExportToExcel = useCallback(() => {
    if (!highMatches.length) return

    // Prepare data for Excel export - match the table column labels exactly
    const exportData = highMatches.map((m: any) => {
      return {
        // Bank transaction columns (all with prefix)
        [`${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.operationDate || 'Operation Date'}`]: m.bank_operation_date || '',
        [`${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.label || 'Label'}`]: m.bank_label || '',
        [`${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.valueDate || 'Value Date'}`]: m.bank_value_date || '',
        [`${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.debit || 'Debit'}`]: m.bank_debit || '',
        [`${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.credit || 'Credit'}`]: m.bank_credit || '',
        [`${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.amount || 'Amount'}`]: m.bank_amount || '',
        [`${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.paymentClass || 'Payment Class'}`]: m.bank_payment_class || '',
        [`${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.paymentStatus || 'Payment Status'}`]: m.bank_payment_status || '',
        [`${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.type || 'Type'}`]: m.bank_type || '',
        [`${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.ref || 'Ref'}`]: m.bank_ref || '',
        [`${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.dateRef || 'Date Ref'}`]: m.bank_date_ref || '',
        [`${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.accountingAccount || 'Accounting Account'}`]: m.bank_accounting_account || '',
        // Customer transaction columns (all with prefix)
        [`${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.accountingDate || 'Accounting Date'}`]: m.customer_accounting_date || '',
        [`${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.description || 'Description'}`]: m.customer_description || '',
        [`${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.debit || 'Debit'}`]: m.customer_debit || '',
        [`${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.credit || 'Credit'}`]: m.customer_credit || '',
        [`${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.amount || 'Amount'}`]: m.customer_amount || '',
        [`${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.totalAmount || 'Total Amount'}`]: m.customer_total_amount || '',
        [`${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.paymentStatus || 'Payment Status'}`]: m.customer_payment_status || '',
        [`${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.paymentType || 'Payment Type'}`]: m.customer_payment_type || '',
        [`${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.dueDate || 'Due Date'}`]: m.customer_due_date || '',
        [`${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.externalDocNumber || 'External Doc Number'}`]: m.customer_external_doc_number || '',
        [`${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.documentNumber || 'Document Number'}`]: m.customer_document_number || '',
        // Match column (no prefix)
        [dictionary?.navigation?.score || 'Score']: m.score || ''
      }
    })

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, dictionary?.navigation?.highConfidenceMatches || 'High Confidence Matches')

    // Generate filename with current date
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `high-confidence-matches-${agencyCode}-${dateStr}.xlsx`

    // Write file
    XLSX.writeFile(wb, filename)

    // Show notification
    setNotificationMessage(dictionary?.navigation?.exportSuccess || `Exported ${highMatches.length} matches to Excel`)
    setNotificationOpen(true)
  }, [highMatches, dictionary, agencyCode])

  // Toggle hide/show missing taxes
  const handleToggleHideMissingTaxes = useCallback(() => {
    setHideMissingTaxes(prev => !prev)
  }, [])

  // Handle print reconciliation report
  const handlePrintReport = useCallback(() => {
    window.print()
  }, [])

  // Handle Assign Internal Number (shortcut)
  const handleOpenAssignInternalNumberDialog = useCallback(() => {
    if (!bankCode) {
      alert('Bank code not available. Please wait for agency to load.')
      return
    }
    if (selectedBankTransactions.size === 0) {
      alert('Please select at least one bank transaction in the reconciliation table.')
      return
    }
    setAssignInternalNumberValue('')
    setAssignInternalNumberError(null)
    setAssignInternalNumberOpen(true)
  }, [bankCode, selectedBankTransactions])

  const handleCloseAssignInternalNumberDialog = useCallback(() => {
    if (assignInternalNumberLoading) return
    setAssignInternalNumberOpen(false)
    setAssignInternalNumberError(null)
  }, [assignInternalNumberLoading])

  const handleConfirmAssignInternalNumber = useCallback(async () => {
    if (!bankCode) {
      setAssignInternalNumberError('Bank code not available.')
      return
    }
    const value = assignInternalNumberValue.trim()
    if (!value) {
      setAssignInternalNumberError('Please enter an internal number.')
      return
    }
    if (selectedBankTransactions.size === 0) {
      setAssignInternalNumberError('Please select at least one bank transaction.')
      return
    }

    try {
      setAssignInternalNumberLoading(true)
      setAssignInternalNumberError(null)

      const ids = Array.from(selectedBankTransactions)
      console.log('🔁 Assigning internal number to bank transactions:', { bankCode, ids, internal_number: value })

      await apiClient.post(`/api/${bankCode}/assign-internal-number/`, {
        bank_transaction_ids: ids,
        internal_number: value
      })

      alert(`Internal number "${value}" assigned to ${ids.length} bank transactions. Please refresh the data to see changes.`)
      setAssignInternalNumberOpen(false)
    } catch (err: any) {
      console.error('❌ Failed to assign internal number:', err)
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to assign internal number'
      setAssignInternalNumberError(msg)
    } finally {
      setAssignInternalNumberLoading(false)
    }
  }, [assignInternalNumberValue, bankCode, selectedBankTransactions])

  // Handle manual match - link one bank transaction to one customer transaction
  const handleManualMatch = useCallback(async () => {
    if (!bankCode) {
      alert('Bank code not available. Please wait for agency to load.')
      return
    }
    
    if (selectedBankTransactions.size !== 1) {
      alert('Please select exactly one bank transaction in the reconciliation table.')
      return
    }
    
    if (selectedCustomerTransactions.size !== 1) {
      alert('Please select exactly one customer transaction in the reconciliation table.')
      return
    }

    const bankTxId = Array.from(selectedBankTransactions)[0]
    const customerTxId = Array.from(selectedCustomerTransactions)[0]
    
    // Filter out tax row IDs (strings starting with "tax-")
    if (typeof customerTxId === 'string' && customerTxId.startsWith('tax-')) {
      alert('Please select a regular customer transaction, not a tax row.')
      return
    }

    const confirmed = confirm(
      `Link bank transaction ${bankTxId} to customer transaction ${customerTxId}? ` +
      `This will also link all customer transactions with the same document number.`
    )
    
    if (!confirmed) return

    try {
      console.log('🔗 Manual matching transactions:', { bankCode, bankTxId, customerTxId })

      const response = await apiClient.post(`/api/${bankCode}/manual-match-customer-bank-transactions/`, {
        reco_bank_transaction_id: bankTxId,
        reco_customer_transaction_id: customerTxId
      })

      console.log('✅ Manual match successful:', response.data)
      
      alert(
        `Successfully linked transactions!\n` +
        `Bank Transaction: ${bankTxId}\n` +
        `Customer Transaction: ${customerTxId}\n` +
        `Propagated to ${response.data.propagated_to_same_document || 0} additional customer transactions with the same document number.\n\n` +
        `Please refresh the data to see changes.`
      )

      // Clear selections after successful match
      setSelectedBankTransactions(new Set())
      setSelectedCustomerTransactions(new Set())
    } catch (err: any) {
      console.error('❌ Failed to manual match transactions:', err)
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to link transactions'
      alert(`Error: ${errorMsg}`)
    }
  }, [bankCode, selectedBankTransactions, selectedCustomerTransactions])

  // Shortcuts for the shortcuts dropdown (EN/FR fallbacks when dictionary not yet loaded)
  const shortcuts: ShortcutsType[] = useMemo(() => {
    const safeDict = dictionary?.navigation || {}
    const isFr = lang === 'fr'
    const t = (key: string, en: string, fr: string) => (safeDict as any)[key] ?? (isFr ? fr : en)
    return [
      {
        icon: 'tabler-file-download',
        title: t('exportXL', 'Export XL', 'Exporter XL'),
        subtitle: '',
        onClick: handleExportToExcel
      },
      {
        icon: hideMissingTaxes ? 'tabler-eye' : 'tabler-eye-off',
        title: hideMissingTaxes 
          ? t('showMissingTaxes', 'Show Missing Taxes', 'Afficher les taxes manquantes')
          : t('hideMissingTaxes', 'Hide Missing Taxes', 'Masquer les taxes manquantes'),
        subtitle: '',
        onClick: handleToggleHideMissingTaxes
      },
      {
        icon: 'tabler-hash',
        title: t('assignInternalNumber', 'Assign Internal Number', 'Assigner un numéro interne'),
        subtitle: '',
        onClick: handleOpenAssignInternalNumberDialog
      },
      {
        icon: 'tabler-link',
        title: t('manualMatch', 'Manual Match', 'Rapprochement manuel'),
        subtitle: '',
        onClick: handleManualMatch
      },
      {
        icon: 'tabler-calculator',
        title: t('calculator', 'Calculator', 'Calculatrice'),
        subtitle: '',
        onClick: () => setCalculatorOpen(true)
      },
      {
        icon: 'tabler-printer',
        title: t('printReport', 'Print Report', 'Imprimer le rapport'),
        subtitle: '',
        onClick: handlePrintReport
      },
      {
        url: '/apps/invoice/list',
        icon: 'tabler-file-dollar',
        title: t('invoiceApp', 'Invoice App', 'Application de facturation'),
        subtitle: ''
      },
      {
        url: '/apps/user/list',
        icon: 'tabler-user',
        title: t('users', 'Users', 'Utilisateurs'),
        subtitle: ''
      },
      {
        url: '/apps/roles',
        icon: 'tabler-users-group',
        title: t('roleManagement', 'Role Management', 'Gestion des rôles'),
        subtitle: ''
      },
      {
        url: '/',
        icon: 'tabler-device-desktop-analytics',
        title: t('dashboard', 'Dashboard', 'Tableau de bord'),
        subtitle: ''
      },
      {
        url: '/shared/pages/account-settings',
        icon: 'tabler-settings',
        title: t('settings', 'Settings', 'Paramètres'),
        subtitle: ''
      }
    ]
  }, [lang, dictionary, hideMissingTaxes, handleExportToExcel, handleToggleHideMissingTaxes, handleOpenAssignInternalNumberDialog, handlePrintReport, handleManualMatch])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      // Try Web Audio API first
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Resume audio context if suspended (required for user interaction)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          playSound(audioContext)
        }).catch(() => {
          console.log('Could not resume audio context, trying fallback')
          playFallbackSound()
        })
      } else {
        playSound(audioContext)
      }
    } catch (error) {
      console.log('Web Audio API failed, trying fallback:', error)
      playFallbackSound()
    }
  }, [])

  const playFallbackSound = () => {
    try {
      // Fallback: Create a data URL for a simple beep sound
      const sampleRate = 44100
      const duration = 0.5
      const frequency = 800
      const samples = Math.floor(sampleRate * duration)
      const buffer = new ArrayBuffer(44 + samples * 2)
      const view = new DataView(buffer)
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i))
        }
      }
      
      writeString(0, 'RIFF')
      view.setUint32(4, 36 + samples * 2, true)
      writeString(8, 'WAVE')
      writeString(12, 'fmt ')
      view.setUint32(16, 16, true)
      view.setUint16(20, 1, true)
      view.setUint16(22, 1, true)
      view.setUint32(24, sampleRate, true)
      view.setUint32(28, sampleRate * 2, true)
      view.setUint16(32, 2, true)
      view.setUint16(34, 16, true)
      writeString(36, 'data')
      view.setUint32(40, samples * 2, true)
      
      // Generate sine wave
      for (let i = 0; i < samples; i++) {
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3
        view.setInt16(44 + i * 2, sample * 32767, true)
      }
      
      const blob = new Blob([buffer], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.volume = 0.5
      audio.play().catch(() => {
        console.log('Fallback audio play failed')
      })
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)
    } catch (error) {
      console.log('Fallback sound failed:', error)
    }
  }

  const playSound = (audioContext: AudioContext) => {
    try {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Create a more noticeable sound pattern
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2)
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.3)
      
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('Could not play sound:', error)
    }
  }

  // Load agency information and bank code
  const loadAgency = useCallback(async () => {
    try {
      setLoading(true)
      const agencies = await agencyService.getAgencies()
      const foundAgency = agencies.find(a => a.code === agencyCode)
      
      if (!foundAgency) {
        const errorMsg = dictionary?.navigation?.agencyNotFound?.replace('{code}', agencyCode) || `Agence avec le code "${agencyCode}" introuvable`
        setCriticalError(errorMsg)
        return
      }
      
      setAgency(foundAgency)
      
      // Get and cache bank code for this agency
      try {
        const code = await agencyService.getBankCodeForAgency(agencyCode, foundAgency)
        setBankCode(code)
        console.log(`✅ Bank code loaded for agency ${agencyCode}:`, code)
        
        // Load bank data to get logo
        try {
          const bankData = await bankService.getBankByCode(code)
          setBank(bankData)
          console.log(`✅ Bank data loaded for code ${code}:`, bankData)
        } catch (bankDataErr) {
          console.warn('Could not load bank data (logo may not be available):', bankDataErr)
          // Don't set critical error for bank data, logo is optional
        }
      } catch (bankErr) {
        console.error('Error loading bank code:', bankErr)
        const rawErrorMsg = (bankErr as any)?.response?.data?.message || (bankErr instanceof Error ? bankErr.message : '') || (dictionary?.navigation?.unknownError || 'Erreur inconnue')
        const errorMsg = translateAxiosError(rawErrorMsg)
        setCriticalError(dictionary?.navigation?.failedToLoadBankCode?.replace('{error}', errorMsg) || `Échec du chargement du code banque pour l'agence: ${errorMsg}`)
      }
    } catch (err) {
      console.error('Error loading agency:', err)
      const rawErrorMsg = (err as any)?.response?.data?.message || (err instanceof Error ? err.message : '') || (dictionary?.navigation?.unknownError || 'Erreur inconnue')
      const errorMsg = translateAxiosError(rawErrorMsg)
      setCriticalError(dictionary?.navigation?.failedToLoadAgency?.replace('{error}', errorMsg) || `Échec du chargement de l'agence: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }, [agencyCode, dictionary])

  // Load existing entries for this agency
  const loadEntries = useCallback(async () => {
    if (!agencyCode) return
    
    try {
      // Load bank entries for this agency
      const bankData = await bankLedgerEntryService.getBankLedgerEntries({ agency: agencyCode })
      setBankEntries(bankData)
      // Only set processed state if not already processed (don't override upload completion)
      setBankProcessed(prev => prev || bankData.length > 0)

      // Load customer entries (filtered by company if needed)
      const customerData = await customerLedgerEntryService.getCustomerLedgerEntries()
      setCustomerEntries(customerData)
      // Only set processed state if not already processed (don't override upload completion)
      setCustomerProcessed(prev => prev || customerData.length > 0)
    } catch (err) {
      console.error('Error loading entries:', err)
      const rawErrorMsg = (err as any)?.response?.data?.message || (err instanceof Error ? err.message : '') || (dictionary?.navigation?.unknownError || 'Erreur inconnue')
      const errorMsg = translateAxiosError(rawErrorMsg)
      setError(dictionary?.navigation?.failedToLoadEntries?.replace('{error}', errorMsg) || `Échec du chargement des écritures: ${errorMsg}`)
    }
  }, [agencyCode, dictionary])

  // Load companies for customer upload mapping
  const loadCompanies = useCallback(async () => {
    try {
      const data = await companyService.getCompanies()
      setCompanies(data)
    } catch (err) {
      console.error('Error loading companies:', err)
    }
  }, [])

  // Preload payment status names (id -> name)
  const loadPaymentStatuses = useCallback(async () => {
    try {
      const statuses = await paymentStatusService.getPaymentStatuses()
      const map: Record<number, string> = {}
      statuses.forEach(s => { if (typeof s.id === 'number') map[s.id] = s.name })
      setPaymentStatusMap(map)
    } catch (err) {
      console.warn('Failed to load payment statuses:', err)
    }
  }, [])

  // Load payment classes for filters
  const loadPaymentClasses = useCallback(async () => {
    try {
      const classes = await paymentClassService.getPaymentClasses()
      setPaymentClasses(classes)
    } catch (err) {
      console.warn('Failed to load payment classes:', err)
    }
  }, [])

  // Simulate progress for matching process
  useEffect(() => {
    if (matchingLoading) {
      // Only reset to 0 when starting a new loading cycle
      setMatchingProgress(0)
      const interval = setInterval(() => {
        setMatchingProgress((prev) => {
          // Only increase, never decrease
          if (prev >= 90) {
            return 90 // Cap at 90% until process completes
          }
          // Faster at start, slower as it progresses
          const increment = prev < 30 ? 2 : prev < 60 ? 1.5 : 1
          const next = prev + increment
          // Ensure we never go backwards
          return Math.max(prev, Math.min(next, 90))
        })
      }, 200) // Update every 200ms

      return () => {
        clearInterval(interval)
        // Don't reset progress here - let it complete naturally
      }
    }
  }, [matchingLoading])

  // Simulate progress for tax comparison process
  useEffect(() => {
    if (taxComparisonLoading) {
      // Only reset to 0 when starting a new loading cycle
      setTaxComparisonProgress(0)
      const interval = setInterval(() => {
        setTaxComparisonProgress((prev) => {
          // Only increase, never decrease
          if (prev >= 90) {
            return 90
          }
          const increment = prev < 30 ? 2 : prev < 60 ? 1.5 : 1
          const next = prev + increment
          // Ensure we never go backwards
          return Math.max(prev, Math.min(next, 90))
        })
      }, 200)

      return () => {
        clearInterval(interval)
        // Don't reset progress here - let it complete naturally
      }
    }
  }, [taxComparisonLoading])

  // Run reconciliation (bank ↔ customer matching)
  const handleRunMatching = async () => {
    // Lock the beginning balance once reconciliation starts
    if (!beginningBalanceExtracted && beginningBalance !== null) {
      setBeginningBalanceExtracted(true)
    }

    try {
      setMatchingLoading(true)
      if (!bankCode) {
        throw new Error(dictionary?.navigation?.bankCodeNotAvailableWait || 'Code banque non disponible. Veuillez attendre le chargement de l\'agence.')
      }
      
      let result: {
        summary: {
          total_bank_transactions: number
          high_matches_count: number
          high_matches_percentage: number
          low_matches_count: number
          low_matches_percentage: number
        }
        high_matches: any[]
        low_matches: any[]
      }
      
      try {
        result = await bankLedgerEntryService.matchCustomerBankTransactions(bankCode)
      } catch (matchingError: any) {
        console.error('❌ Customer-bank matching failed:', matchingError)
        
        // Check if it's a 404 error with JSON body (backend returns 404 when no transactions match criteria)
        if (matchingError?.response?.status === 404) {
          const errorData = matchingError?.response?.data
          const errorMessage = errorData?.error || errorData?.message || ''
          const debugInfo = errorData?.debug_info || {}
          
          // Check if it's a "no transactions with type='origine'" error
          if (errorMessage && (
            errorMessage.includes('No bank transactions found') || 
            errorMessage.includes('type=\'origine\'') ||
            errorMessage.includes('Aucune transaction bancaire trouvée')
          )) {
            // This means matchTransactions didn't run successfully or transactions don't have type set
            const totalTransactions = debugInfo.total_bank_transactions || 0
            const transactionsWithType = debugInfo.transactions_with_type_origine || 0
            
            throw new Error(
              dictionary?.navigation?.noTransactionsWithType || 
              `Aucune transaction bancaire avec le type 'origine' trouvée. ` +
              `Total transactions: ${totalTransactions}, Transactions avec type 'origine': ${transactionsWithType}. ` +
              `Veuillez vérifier que l'étape de matching des transactions (matchTransactions) s'est exécutée correctement après le préprocessing.`
            )
          } else {
            // Actual endpoint not found error or other 404
            throw new Error(
              dictionary?.navigation?.matchingEndpointNotFound || 
              `L'endpoint de rapprochement n'est pas disponible. ` +
              `Le backend n'a pas de route pour: /api/${bankCode}/match-customer-bank-transactions/`
            )
          }
        } else {
          // Re-throw other errors
          throw matchingError
        }
      }

      // Hydrate missing fields using IDs returned by API
      const enrichMatch = async (m: any) => {
        const enriched: any = { ...m }
        let bank: any | null = null
        let cust: any | null = null

        // Fetch bank details if needed
        try {
          if (m.bank_transaction_id && (!m.bank_label || !m.bank_value_date || m.bank_debit === undefined || m.bank_credit === undefined)) {
            bank = await recoBankTransactionService.getTransactionById(Number(m.bank_transaction_id))
          }
        } catch (e) { /* ignore per-row errors */ }

        // Fetch customer details if needed
        try {
          if (m.customer_transaction_id && (!m.customer_description || m.customer_debit === undefined || m.customer_credit === undefined)) {
            cust = await recoCustomerTransactionService.getTransactionById(Number(m.customer_transaction_id))
          }
        } catch (e) { 
          console.warn(`Failed to load customer transaction details for ID ${m.customer_transaction_id}:`, e)
          // Continue processing without customer details
        }

        // Merge bank → enriched
        if (bank) {
          enriched.bank_operation_date = enriched.bank_operation_date || bank.operation_date
          enriched.bank_label = enriched.bank_label || bank.label
          enriched.bank_value_date = enriched.bank_value_date || bank.value_date
          enriched.bank_debit = enriched.bank_debit ?? bank.debit
          enriched.bank_credit = enriched.bank_credit ?? bank.credit
          enriched.bank_amount = enriched.bank_amount ?? bank.amount
          enriched.bank_payment_class = enriched.bank_payment_class || (bank.payment_class?.name || bank.payment_class)
          enriched.bank_payment_status = enriched.bank_payment_status || 
            (bank.payment_status?.name || 
             paymentStatusMap[Number(bank.payment_status_id)] || 
             paymentStatusMap[Number(bank.payment_status)] || 
             bank.payment_status || 
             bank.payment_status_id || 
             '')
          enriched.bank_type = enriched.bank_type || bank.type
          enriched.bank_ref = enriched.bank_ref || bank.ref
          enriched.bank_date_ref = enriched.bank_date_ref || bank.date_ref
          enriched.bank_document_reference = enriched.bank_document_reference || bank.document_reference
          enriched.bank_accounting_account = enriched.bank_accounting_account || bank.accounting_account
        }

        // Merge customer → enriched
        if (cust) {
          enriched.customer_accounting_date = enriched.customer_accounting_date || cust.accounting_date
          enriched.customer_description = enriched.customer_description || cust.description
          enriched.customer_debit = enriched.customer_debit ?? cust.debit_amount
          enriched.customer_credit = enriched.customer_credit ?? cust.credit_amount
          enriched.customer_amount = enriched.customer_amount ?? cust.amount
          enriched.customer_total_amount = enriched.customer_total_amount ?? cust.total_amount
          enriched.customer_payment_status = enriched.customer_payment_status || 
            (cust.payment_status?.name || 
             paymentStatusMap[Number(cust.payment_status_id)] || 
             paymentStatusMap[Number(cust.payment_status)] || 
             cust.payment_status || 
             cust.payment_status_id || 
             '')
          enriched.customer_payment_type = enriched.customer_payment_type || cust.payment_type
          enriched.customer_due_date = enriched.customer_due_date || cust.due_date
          enriched.customer_external_doc_number = enriched.customer_external_doc_number || cust.external_doc_number
          enriched.customer_document_number = enriched.customer_document_number || cust.document_number
        }

        // Backfill missing customer fields from matched bank when appropriate
        if (!enriched.customer_description && enriched.bank_label) {
          enriched.customer_description = enriched.bank_label
        }
        if ((enriched.customer_amount === undefined || enriched.customer_amount === null) && typeof enriched.bank_amount !== 'undefined') {
          enriched.customer_amount = enriched.bank_amount
        }
        if (!enriched.customer_external_doc_number && enriched.bank_ref) {
          enriched.customer_external_doc_number = enriched.bank_ref
        }
        if (!enriched.customer_due_date && enriched.bank_value_date) {
          enriched.customer_due_date = enriched.bank_value_date
        }
        if (!enriched.customer_payment_status && enriched.bank_payment_status) {
          enriched.customer_payment_status = enriched.bank_payment_status
        }
        if (!enriched.customer_payment_type && enriched.bank_type) {
          enriched.customer_payment_type = enriched.bank_type
        }

        return enriched
      }

      // Enrich in small concurrent batches to avoid flooding server
      const parallelize = async (arr: any[]) => {
        const out: any[] = []
        const batchSize = 10
        for (let i = 0; i < arr.length; i += batchSize) {
          const batch = arr.slice(i, i + batchSize)
          const enriched = await Promise.all(batch.map(enrichMatch))
          out.push(...enriched)
        }
        return out
      }

      // Extract high matches from the matching result and persist them to customer transactions
      const highMatchesFromResult = result.high_matches || []
      
      // Update customer transactions with matched bank transaction IDs
      if (highMatchesFromResult.length > 0) {
        try {
          console.log(`🔗 Linking ${highMatchesFromResult.length} customer transactions to bank transactions...`)
          const matchesToPersist = highMatchesFromResult
            .filter((m: any) => m.bank_transaction_id && m.customer_transaction_id)
            .map((m: any) => ({
              customer_transaction_id: Number(m.customer_transaction_id),
              bank_transaction_id: Number(m.bank_transaction_id)
            }))
          
          if (matchesToPersist.length > 0) {
            await recoCustomerTransactionService.bulkUpdateMatchedBankTransactions(matchesToPersist)
            console.log(`✅ Successfully linked ${matchesToPersist.length} customer transactions`)
          }
        } catch (error: any) {
          console.error('❌ Error linking customer transactions to bank transactions:', error)
          // Continue even if linking fails - we can still show the matches
        }
      }

      // Reload all customer transactions to reflect the updated matched_bank_transaction field
      if (customerImportBatchId) {
        try {
          const reloadedCustomerTransactions = await recoCustomerTransactionService.getTransactions({ 
            import_batch_id: customerImportBatchId 
          })
          setCustomerTransactions(sortTransactionsByOperationDate(reloadedCustomerTransactions, false))
          console.log(`✅ Reloaded ${reloadedCustomerTransactions.length} customer transactions with updated links`)
        } catch (error: any) {
          console.warn('⚠️ Failed to reload customer transactions after matching:', error)
          // Continue - we can still use the existing customer transactions
        }
      }

      // Fetch customer transactions that are matched to a bank transaction and build matches from there
      const matchedCustomerTransactions = await recoCustomerTransactionService.getTransactions({
        has_matched_bank_transaction: 'true'
      })

      const baseHighMatches = (matchedCustomerTransactions || [])
        .filter(tx => tx.matched_bank_transaction)
        .map(tx => ({
          bank_transaction_id: tx.matched_bank_transaction,
          customer_transaction_id: tx.id
        }))

      const enrichedHigh = await parallelize(baseHighMatches)

      setMatchingSummary(result.summary)
      // Hide missing taxes by default when matching completes
      setHideMissingTaxes(true)
      // Sort by bank operation date (ascending)
      setHighMatches(sortMatchesByBankOperationDate(enrichedHigh))
      
      // Fetch sum of matched bank transactions
      try {
        if (agency?.bank) {
          const bankCode = String(agency.bank)
          if (bankCode) {
            console.log('📊 Fetching sum of matched bank transactions...')
            const sumResult = await recoBankTransactionService.getSumMatchedTransactions(bankCode)
            setMatchedSum(sumResult)

            // Put the matched sum directly into the ending balance box.
            // Format with French locale (spaces as thousands separator, dot as decimal)
            try {
              const rawDecimal =
                typeof sumResult.total_sum_decimal === 'number'
                  ? sumResult.total_sum_decimal
                  : Number(sumResult.total_sum)

              if (!Number.isNaN(rawDecimal)) {
                setEndingBalance(rawDecimal)

                // Format with French locale (spaces as thousands separator), then use dot as decimal separator.
                // Example: "-136 956.369"
                const formatted = rawDecimal
                  .toLocaleString('fr-FR', {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                    useGrouping: true
                  })
                  .replace(',', '.')

                setEndingBalanceInput(formatted)
              }
            } catch (formatErr) {
              console.error('❌ Error formatting matched sum for ending balance input:', formatErr)
            }

            console.log('✅ Matched bank transactions sum:', sumResult)
          }
        }
      } catch (err) {
        console.error('❌ Error fetching matched bank transactions sum:', err)
        setMatchedSum(null)
      }
      
      // Auto-extract customer taxes and cache them
      try {
        // Get company_code and bank_code (required by API)
        // Every agency belongs to a bank, so we use agency.bank for bank_code
        if (!selectedCompany || !agency?.bank) {
          console.warn('Cannot extract taxes: missing company or bank information')
          console.log('Selected company:', selectedCompany, 'Agency bank:', agency?.bank)
          return
        }
        
        // Get bank code from agency - agency.bank is the bank code
        const bankCode = String(agency.bank)
        if (!bankCode) {
          console.warn('Invalid bank code from agency:', agency.bank)
          return
        }
        
        console.log('🔍 Auto-extracting customer taxes...')
        console.log('📋 Request Parameters:')
        console.log('  - Company Code:', selectedCompany)
        console.log('  - Bank Code:', bankCode)
        console.log('  - Agency Code:', agencyCode)
        console.log('  - Agency:', agency)
        console.log('  - Selected Company Object:', companies.find(c => c.code === selectedCompany))
        
        const { taxExtractionService } = await import('@/services/taxExtraction.service')
        
        try {
          if (!bankCode) {
            throw new Error(dictionary?.navigation?.bankCodeNotAvailable || 'Code banque non disponible')
          }
          const taxResult = await taxExtractionService.extractCustomerTaxes(selectedCompany, bankCode)
          
          console.log('✅ Tax Extraction Response:')
          console.log('  - Total taxes extracted:', taxResult.extracted_taxes?.length || 0)
          console.log('  - Extracted taxes:', taxResult.extracted_taxes)
          
          // Log tax details for debugging
          if (taxResult.extracted_taxes && taxResult.extracted_taxes.length > 0) {
            console.log('📊 Tax Details:')
            taxResult.extracted_taxes.forEach((tax: any, idx: number) => {
              console.log(`  Tax ${idx + 1}:`, {
                tax_name: tax.tax_name,
                value: tax.value,
                type: tax.type,
                transaction_reference: tax.transaction_reference,
                convention: tax.convention,
                tax_rule: tax.tax_rule,
                bank: tax.bank
              })
            })
            
            // Group by transaction to see which transactions got which taxes
            const taxesByTransaction = taxResult.extracted_taxes.reduce((acc: any, tax: any) => {
              const txRef = tax.transaction_reference || 'unknown'
              if (!acc[txRef]) acc[txRef] = []
              acc[txRef].push(tax)
              return acc
            }, {})
            console.log('📦 Taxes grouped by transaction:', taxesByTransaction)
          } else {
            console.warn('⚠️ No taxes extracted - check if convention exists and tax rules are configured')
          }
          
          // Cache customer taxes by transaction ID
          if (taxResult.extracted_taxes?.length > 0) {
            const customerTaxesCache: Record<number, any[]> = {}
            taxResult.extracted_taxes.forEach(tax => {
              const taxAny = tax as any
              const transactionId = taxAny.customer_transaction_id || taxAny.transaction_id
              if (transactionId) {
                if (!customerTaxesCache[transactionId]) {
                  customerTaxesCache[transactionId] = []
                }
                customerTaxesCache[transactionId].push(tax)
              }
            })
            setCachedCustomerTaxes(customerTaxesCache)
            console.log('✅ Customer taxes cached for', Object.keys(customerTaxesCache).length, 'transactions')
          } else {
            console.log('ℹ️ No customer taxes extracted')
          }
        } catch (taxErr: any) {
          console.error('❌ Auto tax extraction failed:')
          console.error('  - Error:', taxErr)
          console.error('  - Error message:', taxErr?.message)
          console.error('  - Error response:', taxErr?.response?.data)
          console.error('  - Error status:', taxErr?.response?.status)
          console.error('  - Request parameters sent:', {
            company_code: selectedCompany,
            bank_code: bankCode
          })
          
          if (taxErr?.response?.status === 400) {
            console.error('  - 400 Bad Request - Check if company_code and bank_code are correct')
            console.error('  - Response data:', taxErr?.response?.data)
          } else if (taxErr?.response?.status === 404) {
            console.error('  - 404 Not Found - No active convention found for this company+bank combination')
          }
        }
      } catch (taxExtractionErr: any) {
        console.warn('⚠️ Tax extraction outer error:', taxExtractionErr)
      }
      
      // Run tax matching and bank transaction tax matching
      // MUST run before tax-comparison to ensure origine transactions have internal_number
      try {
        if (!bankCode) {
          throw new Error(dictionary?.navigation?.bankCodeNotAvailable || 'Code banque non disponible')
        }
        if (!selectedCompany) {
          throw new Error(dictionary?.navigation?.companyCodeNotAvailable || 'Code entreprise non disponible. Veuillez sélectionner une entreprise d\'abord.')
        }
        console.log('🔄 Running tax matching...')
        const taxMatch = await bankLedgerEntryService.matchTaxes(bankCode, selectedCompany)
        console.groupCollapsed('🟦 Match Taxes Result')
        console.log(taxMatch)
        console.groupEnd()
        
        try {
          console.log('🔄 Running bank transaction tax matching...')
          const bankTaxMatch = await bankLedgerEntryService.matchBankTransactionTaxes(bankCode)
          console.groupCollapsed('🟦 Match Bank Transaction Taxes Result')
          console.log(bankTaxMatch)
          console.groupEnd()
          
          // Cache bank taxes by transaction ID
          if (bankTaxMatch && Array.isArray(bankTaxMatch)) {
            const bankTaxesCache: Record<number, any[]> = {}
            bankTaxMatch.forEach(tax => {
              if (tax.bank_transaction_id) {
                if (!bankTaxesCache[tax.bank_transaction_id]) {
                  bankTaxesCache[tax.bank_transaction_id] = []
                }
                bankTaxesCache[tax.bank_transaction_id].push(tax)
              }
            })
            setCachedBankTaxes(prev => ({ ...prev, ...bankTaxesCache }))
            console.log('✅ Bank taxes cached for', Object.keys(bankTaxesCache).length, 'transactions')
          }
        } catch (bankTaxErr) {
          console.warn('⚠️ Match bank transaction taxes API failed or unavailable:', bankTaxErr)
        }
      } catch (taxErr) {
        console.warn('⚠️ Match taxes API failed or unavailable:', taxErr)
      }
      
      // Auto-run tax comparison after tax matching
      // Needs internal_number from match-bank-transaction-taxes (step 4)
      try {
        if (!bankCode) {
          throw new Error(dictionary?.navigation?.bankCodeNotAvailable || 'Code banque non disponible')
        }
        console.log('🔄 Auto-running tax comparison...')
        setTaxComparisonLoading(true)
        const taxComparisonResult = await taxComparisonService.compareTaxes(bankCode)
        
        // DEBUG: Log raw API response to see actual structure
        console.log('🔍 RAW Tax Comparison API Response:', {
          message: taxComparisonResult.message,
          resultsCount: taxComparisonResult.results?.length || 0,
          sampleResults: taxComparisonResult.results?.slice(0, 10).map((r: any) => ({
            id: r.id,
            customer_transaction_id: r.customer_transaction_id,
            matched_bank_transaction_id: r.matched_bank_transaction_id,
            tax_type: r.tax_type,
            customer_tax: r.customer_tax,
            customer_total_tax: r.customer_total_tax,
            bank_tax: r.bank_tax,
            status: r.status,
            allKeys: Object.keys(r),
            fullObject: r
          }))
        })
        
        setTaxComparisonResults(taxComparisonResult.results || [])
        console.log('✅ Tax comparison completed:', taxComparisonResult.message)
        console.log('📊 Tax comparison results:', taxComparisonResult.results?.length || 0, 'comparisons')
        
        // Log detailed results for debugging
        if (taxComparisonResult.results && taxComparisonResult.results.length > 0) {
          console.table(taxComparisonResult.results.slice(0, 5)) // Show first 5 results
        }
      } catch (taxErr) {
        console.error('❌ Auto tax comparison failed:', taxErr)
        console.error('Tax comparison error details:', taxErr)
      } finally {
        // Set to 100% first, then stop loading after a brief delay
        setTaxComparisonProgress((prev) => Math.max(prev, 100))
        setTimeout(() => {
          setTaxComparisonLoading(false)
          // Reset progress after component unmounts or after delay
          setTimeout(() => setTaxComparisonProgress(0), 500)
        }, 300)
      }
      
      // Load unmatched transactions after reconciliation is complete
      console.log('🔄 Loading unmatched transactions after reconciliation...')
      await loadUnmatchedTransactions()
      
      // Fetch sorted and grouped bank transactions after matching completes
      // This endpoint returns transactions already sorted by operation_date and grouped by internal_number
      if (bankCode) {
        try {
          console.log('🔄 Fetching sorted and grouped bank transactions after reconciliation...')
          const sortedData = await recoBankTransactionService.getSortedTransactions(bankCode)
          console.log('✅ ========== Sorted Transactions Result ==========')
          console.log('✅ Total:', sortedData.total)
          console.log('✅ Grouped:', sortedData.grouped_count)
          console.log('✅ Ungrouped:', sortedData.ungrouped_count)
          console.log('✅ Bank:', sortedData.bank)
          console.log('✅ Bank Code:', sortedData.bank_code)
          console.log('✅ Transactions Count:', sortedData.transactions?.length || 0)
          
          // Log the full sorted data structure
          console.log('✅ Full sortedData object:', sortedData)
          
          // Log as JSON string for easy copying to backend
          console.log('✅ ========== Sorted Data as JSON (for backend) ==========')
          console.log(JSON.stringify(sortedData, null, 2))
          console.log('✅ ========== End JSON ==========')
          
          // Log sample transactions with key fields
          if (sortedData.transactions && Array.isArray(sortedData.transactions) && sortedData.transactions.length > 0) {
            console.log('✅ Sample sorted transactions (first 10):')
            console.table(sortedData.transactions.slice(0, 10).map((tx: any) => ({
              id: tx.id,
              internal_number: tx.internal_number,
              group_id: tx.group_id,
              is_origine: tx.is_origine,
              group_size: tx.group_size,
              type: tx.type,
              operation_date: tx.operation_date,
              label: tx.label?.substring(0, 40),
              amount: tx.amount,
              debit: tx.debit,
              credit: tx.credit
            })))
            
            // Log full first transaction for structure reference
            console.log('✅ Full first transaction structure:', JSON.stringify(sortedData.transactions[0], null, 2))
            
            // Log grouping analysis
            const grouped = sortedData.transactions.filter((tx: any) => tx.group_id && tx.group_id !== null)
            const ungrouped = sortedData.transactions.filter((tx: any) => !tx.group_id || tx.group_id === null)
            const origineCount = sortedData.transactions.filter((tx: any) => tx.is_origine === true).length
            
            console.log('✅ Grouping Analysis:')
            console.log('  - Grouped transactions:', grouped.length)
            console.log('  - Ungrouped transactions:', ungrouped.length)
            console.log('  - Origine transactions:', origineCount)
            console.log('  - Unique group_ids:', [...new Set(grouped.map((tx: any) => tx.group_id))].length)
          }
          
          console.log('✅ ========== End Sorted Transactions Result ==========')
          
          // Update bank transactions with sorted and grouped data
          if (sortedData.transactions && Array.isArray(sortedData.transactions)) {
            setBankTransactions(sortedData.transactions)
            console.log('✅ Bank transactions state updated with sorted and grouped data:', sortedData.transactions.length)
          }
        } catch (sortedErr: any) {
          console.error('❌ ========== Failed to fetch sorted transactions ==========')
          console.error('❌ Error:', sortedErr)
          console.error('❌ Error message:', sortedErr?.message)
          console.error('❌ Error response:', sortedErr?.response)
          console.error('❌ Error response data:', sortedErr?.response?.data)
          console.warn('⚠️ Continuing with existing transactions data')
          // Continue with existing transactions if sorted endpoint fails
        }
      }
      
      // Mark reconciliation as complete
      setReconciliationComplete(true)
      
      // Show success notification
      const translatedMessage = dictionary?.navigation?.reconciliationCompletedWithMatches || 'Reconciliation completed!'
      setNotificationMessage(translatedMessage)
      setNotificationOpen(true)
      playNotificationSound()
    } catch (err) {
      console.error('Error running customer-bank matching:', err)
      const rawErrorMsg = (err as any)?.response?.data?.message || (err as any)?.message || (dictionary?.navigation?.failedToRunMatching || 'Échec de l\'exécution du rapprochement')
      const errorMsg = translateAxiosError(rawErrorMsg)
      setError(errorMsg)
      
      // Show error notification
      setNotificationMessage(dictionary?.navigation?.reconciliationFailed || 'Le rapprochement a échoué. Veuillez réessayer.')
      setNotificationOpen(true)
      playNotificationSound()
    } finally {
      // Set to 100% first, then stop loading after a brief delay
      setMatchingProgress((prev) => Math.max(prev, 100))
      setTimeout(() => {
        setMatchingLoading(false)
        // Reset progress after component unmounts or after delay
        setTimeout(() => setMatchingProgress(0), 500)
      }, 300)
    }
  }

  // Handle bank ledger upload
  const handleBankUpload = async (file: File, name?: string) => {
    // Use window.console to ensure it's not stripped
    if (typeof window !== 'undefined') {
      window.console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨')
      window.console.log('🚨 handleBankUpload FUNCTION CALLED')
      window.console.log('🚨 File:', file?.name, 'Size:', file?.size)
      window.console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨')
      // Also try alert as a fallback test
      // window.alert('handleBankUpload called with file: ' + file?.name)
    }
    console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨')
    console.log('🚨 handleBankUpload FUNCTION CALLED')
    console.log('🚨 File:', file?.name, 'Size:', file?.size)
    console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨')
    try {
      setBankProcessing(true)
      setBankProgress(0)
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setBankProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const created = await bankLedgerEntryService.uploadDocument({ 
        file, 
        name, 
        agency: agencyCode 
      })
      console.groupCollapsed('🟦 Bank Upload Result')
      console.log('Entry:', created)
      console.groupEnd()
      
      // Kick off preprocessing and advance progress to 95%
      setBankProgress(95)
      if (!bankCode) {
        throw new Error(dictionary?.navigation?.bankCodeNotAvailableWait || 'Code banque non disponible. Veuillez attendre le chargement de l\'agence.')
      }
      
      let preprocess: { message: string; import_batch_id: number; transactions_count: number }
      try {
        preprocess = await bankLedgerEntryService.preprocess(created.id, bankCode)
      console.groupCollapsed('🟦 Bank Preprocess Result')
      console.log('Response:', preprocess)
      console.groupEnd()
      } catch (preprocessError: any) {
        console.error('❌ Bank ledger entry preprocess failed:', preprocessError)
        
        // Check if it's a 404 error (endpoint not found)
        if (preprocessError?.response?.status === 404) {
          const errorMessage = dictionary?.navigation?.preprocessEndpointNotFound || 
            `L'endpoint de préprocessing n'est pas disponible sur le serveur. ` +
            `Le backend n'a pas de route pour: /api/${bankCode}/bank-ledger-entries/${created.id}/preprocess/`
          throw new Error(errorMessage)
        }
        
        // Re-throw other errors
        throw preprocessError
      }
      // Run transaction matching after extraction
      // This is CRITICAL - it sets the transaction type to 'origine' which is required for reconciliation
      try {
        const matchResult = await bankLedgerEntryService.matchTransactions(bankCode, { agency: agencyCode, bank: String(agency?.bank ?? '') })
        console.groupCollapsed('🟦 Match Transactions Result')
        console.log(matchResult)
        console.groupEnd()
        
        // Verify that matchTransactions succeeded
        if (!matchResult || typeof matchResult.total_transactions_processed === 'undefined') {
          console.warn('⚠️ Match transactions returned unexpected result:', matchResult)
        }
      } catch (matchErr: any) {
        console.error('❌ Match transactions API failed - this is critical for setting transaction types:', matchErr)
        
        // Check if it's a 404 (endpoint not found)
        if (matchErr?.response?.status === 404) {
          console.error('❌ Match transactions endpoint not found. Transactions may not have type set, which will cause reconciliation to fail.')
          // Don't throw - allow upload to complete, but user will see error when trying to reconcile
        } else {
          // For other errors, log but don't block upload
          console.warn('⚠️ Match transactions failed, but continuing with upload. Reconciliation may fail if transaction types are not set.')
        }
      }
      
      // Match taxes (optional - can fail without blocking)
        try {
          if (!selectedCompany) {
          console.warn('⚠️ Company not selected, skipping tax matching')
        } else {
          const taxMatch = await bankLedgerEntryService.matchTaxes(bankCode, selectedCompany)
          console.groupCollapsed('🟦 Match Taxes Result')
          console.log(taxMatch)
          console.groupEnd()
        }
        } catch (taxErr) {
        console.warn('⚠️ Match taxes API failed or unavailable (non-critical):', taxErr)
      }
      setBankImportBatchId(preprocess.import_batch_id)
      
      // Fetch regular transactions during upload (not sorted yet)
      // Sorting will happen after reconciliation matching completes
      const txs = await recoBankTransactionService.getTransactions({ import_batch_id: preprocess.import_batch_id })
      
      console.groupCollapsed('🟦 Bank Transactions Fetch')
      console.log('Count:', txs.length)
      if (txs.length) {
        console.table(txs.slice(0, 10))
      }
      console.groupEnd()
      console.log('🟦 ========== Bank Transactions Loaded from API ==========')
      console.log('🟦 Bank Transactions Loaded from API')
      console.log('📊 Total transactions:', txs.length)
      if (txs.length > 0) {
        console.log('📋 Sample transactions (first 5):', txs.slice(0, 5).map((tx: any) => ({
          id: tx.id,
          internal_number: tx.internal_number,
          group_id: tx.group_id,
          is_origine: tx.is_origine,
          group_size: tx.group_size,
          type: tx.type,
          operation_date: tx.operation_date,
          label: tx.label?.substring(0, 30)
        })))
      }
      console.log('🟦 Bank Transactions Loaded from API - End')
      // Transactions are already sorted and grouped by the API - use them as-is
      setBankTransactions(txs)
      clearInterval(progressInterval)
      setBankProgress(100)
      console.log('🟦 Setting bankProcessed to true')
      setBankProcessed(true)
      setBankSessionProcessed(true)
      console.log('🟦 Bank processed set to true (session + global)')
      
      // Try to extract beginning balance automatically from the bank ledger file
      // using the beginning_balance_label configured in the bank settings
      // This is optional - if it fails (404/400), user can enter manually
      try {
        if (!bankCode) {
          throw new Error(dictionary?.navigation?.bankCodeNotAvailable || 'Code banque non disponible')
        }
        const balanceData = await bankLedgerEntryService.extractBeginningBalance(created.id, bankCode)
        if (balanceData && balanceData.beginning_balance !== null && balanceData.beginning_balance !== undefined) {
          const extractedBalance = balanceData.beginning_balance
          // Pre-fill the manual input field with the extracted value
          setBeginningBalance(extractedBalance)
          setBeginningBalanceInput(extractedBalance.toLocaleString('fr-FR', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
          }))
          console.log('🟦 Beginning balance extracted and pre-filled:', extractedBalance)
        }
      } catch (balanceErr: any) {
        // Silently handle 404/400 errors - this endpoint is optional
        // The api-client interceptor already suppresses logging for these errors
        // User can always enter the beginning balance manually
        if (balanceErr?.response?.status === 404 || balanceErr?.response?.status === 400) {
          console.info('ℹ️ Beginning balance extraction not available (endpoint not found or not configured). User will enter manually.')
        } else {
          // Only log unexpected errors (5xx, network errors, etc.)
          console.warn('⚠️ Failed to extract beginning balance (user can enter manually):', balanceErr)
        }
      }
      
      // Translate server success message
      const translatedMessage = translateServerMessage(preprocess.message, dictionary)
      setSuccess(translatedMessage)
      setError('') // Clear any previous upload errors
      setTimeout(() => setSuccess(''), 3000)
      
      // Reset progress after a delay
      setTimeout(() => {
        setBankProcessing(false)
        setBankProgress(0)
      }, 2000)
    } catch (err) {
      setBankProcessing(false)
      setBankProgress(0)
      const rawErrorMsg = (err as any)?.response?.data?.message || (err as any)?.response?.data?.detail || (err as any)?.message || (dictionary?.navigation?.failedToUploadBankLedgerEntry || 'Échec du téléchargement de l\'écriture bancaire')
      const errorMsg = translateAxiosError(rawErrorMsg)
      setError(errorMsg)
      console.error('Error uploading bank ledger entry:', err)
      throw err
    }
  }

  // Handle customer ledger upload
  const handleCustomerUpload = async (file: File, name?: string) => {
    try {
      if (!selectedCompany) {
        setError(dictionary?.navigation?.pleaseSelectCompanyBeforeUpload || 'Veuillez sélectionner une entreprise avant de télécharger les écritures client')
        return
      }
      // Lock company selection for this session once upload starts
      setCompanyLocked(true)
      setCustomerProcessing(true)
      setCustomerProgress(0)
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setCustomerProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // For customer ledger, we need to determine the company
      // This could be based on user's company or selected company
      const created = await customerLedgerEntryService.uploadDocument({ 
        file, 
        name, 
        company_code: selectedCompany
      })
      console.groupCollapsed('🟩 Customer Upload Result')
      console.log('Entry:', created)
      console.groupEnd()
      // Preprocess and fetch extracted transactions
      setCustomerProgress(95)
      if (!bankCode) {
        throw new Error(dictionary?.navigation?.bankCodeNotAvailableWait || 'Code banque non disponible. Veuillez attendre le chargement de l\'agence.')
      }
      if (!agencyCode) {
        throw new Error(dictionary?.navigation?.agencyCodeNotAvailableWait || 'Code agence non disponible. Veuillez attendre le chargement de l\'agence.')
      }
      
      let preprocess: { message: string; import_batch_id: number; transactions_count: number; agency_code?: string; total_rows_before_filter?: number; filtered_rows?: number }
      try {
        preprocess = await customerLedgerEntryService.preprocess(created.id, bankCode, agencyCode)
      console.groupCollapsed('🟩 Customer Preprocess Result')
      console.log('Response:', preprocess)
      console.groupEnd()
      } catch (preprocessError: any) {
        console.error('❌ Customer ledger entry preprocess failed:', preprocessError)
        
        // Check if it's a 404 error (endpoint not found)
        if (preprocessError?.response?.status === 404) {
          const errorMessage = dictionary?.navigation?.preprocessEndpointNotFound || 
            `L'endpoint de préprocessing n'est pas disponible sur le serveur. ` +
            `Le backend n'a pas de route pour: /api/${bankCode}/customer-ledger-entries/${created.id}/preprocess/`
          throw new Error(errorMessage)
        }
        
        // Re-throw other errors
        throw preprocessError
      }
      setCustomerImportBatchId(preprocess.import_batch_id)
      const txs = await recoCustomerTransactionService.getTransactions({ import_batch_id: preprocess.import_batch_id })
      console.groupCollapsed('🟩 Customer Transactions Fetch')
      console.log('Count:', txs.length)
      if (txs.length) {
        console.table(txs.slice(0, 10))
      }
      console.groupEnd()
      setCustomerTransactions(sortTransactionsByOperationDate(txs, false))
      clearInterval(progressInterval)
      setCustomerProgress(100)
      console.log('🟩 Setting customerProcessed to true')
      setCustomerProcessed(true)
      setCustomerSessionProcessed(true)
      console.log('🟩 Customer processed set to true (session + global)')
      // Translate server success message
      const translatedMessage = translateServerMessage(preprocess.message, dictionary)
      setSuccess(translatedMessage)
      setError('') // Clear any previous upload errors
      setTimeout(() => setSuccess(''), 3000)
      
      // Reset progress after a delay
      setTimeout(() => {
        setCustomerProcessing(false)
        setCustomerProgress(0)
      }, 2000)
    } catch (err) {
      setCustomerProcessing(false)
      setCustomerProgress(0)
      const rawErrorMsg = (err as any)?.response?.data?.message || (err as any)?.response?.data?.detail || (err as any)?.message || (typeof err === 'string' ? err : dictionary?.navigation?.failedToUploadCustomerLedgerEntry || 'Échec du téléchargement de l\'écriture client')
      const errorMsg = translateAxiosError(rawErrorMsg)
      setError(errorMsg)
      console.error('Error uploading customer ledger entry:', err)
      throw err
    }
  }

  // Check if reconciliation is ready (session-based only)
  useEffect(() => {
    const ready = bankSessionProcessed && customerSessionProcessed
    console.log('🔄 Reconciliation ready check (session-based):', { 
      bankSessionProcessed, 
      customerSessionProcessed, 
      ready,
      bankTransactions: bankTransactions.length,
      customerTransactions: customerTransactions.length
    })
    setReconciliationReady(ready)
  }, [bankSessionProcessed, customerSessionProcessed, bankTransactions.length, customerTransactions.length])

  // Load data on mount
  useEffect(() => {
    if (dictionary) {
      loadAgency()
      loadEntries()
      loadCompanies()
      loadPaymentStatuses()
      loadPaymentClasses()
    }
  }, [loadAgency, loadEntries, loadCompanies, loadPaymentStatuses, loadPaymentClasses, dictionary])

  // Register Bank Ledger Entries table
  useEffect(() => {
    if (dictionary && pathname) {
      registerTable('bank-ledger-entries', dictionary?.navigation?.bankLedgerEntries || 'Bank Ledger Entries', [
        { id: 'operation_date', label: dictionary?.navigation?.operationDate || 'Operation Date' },
        { id: 'label', label: dictionary?.navigation?.label || 'Label' },
        { id: 'value_date', label: dictionary?.navigation?.valueDate || 'Value Date' },
        { id: 'debit', label: dictionary?.navigation?.debit || 'Debit' },
        { id: 'credit', label: dictionary?.navigation?.credit || 'Credit' },
        { id: 'amount', label: dictionary?.navigation?.amount || 'Amount' },
        { id: 'payment_class', label: dictionary?.navigation?.paymentClass || 'Payment Class' },
        { id: 'payment_status', label: dictionary?.navigation?.paymentStatus || 'Payment Status' },
        { id: 'type', label: dictionary?.navigation?.type || 'Type' },
        { id: 'ref', label: dictionary?.navigation?.ref || 'Reference' },
        { id: 'date_ref', label: dictionary?.navigation?.dateRef || 'Date Reference' },
        { id: 'document_reference', label: dictionary?.navigation?.documentRef || 'Document Reference' },
        { id: 'accounting_account', label: dictionary?.navigation?.accountingAccount || 'Accounting Account' }
      ], 1, pathname)
    }
    return () => {
      if (pathname) {
        unregisterTable('bank-ledger-entries', pathname)
      }
    }
  }, [dictionary, pathname, registerTable, unregisterTable])

  // Register Customer Ledger Entries table
  useEffect(() => {
    if (dictionary && pathname) {
      registerTable('customer-ledger-entries', dictionary?.navigation?.customerLedgerEntries || 'Customer Ledger Entries', [
        { id: 'accounting_date', label: dictionary?.navigation?.accountingDate || 'Accounting Date' },
        { id: 'description', label: dictionary?.navigation?.description || 'Description' },
        { id: 'debit', label: dictionary?.navigation?.debit || 'Debit' },
        { id: 'credit', label: dictionary?.navigation?.credit || 'Credit' },
        { id: 'amount', label: dictionary?.navigation?.amount || 'Amount' },
        { id: 'total_amount', label: dictionary?.navigation?.totalAmount || 'Total Amount' },
        { id: 'payment_status', label: dictionary?.navigation?.paymentStatus || 'Payment Status' },
        { id: 'payment_type', label: dictionary?.navigation?.paymentType || 'Payment Type' },
        { id: 'due_date', label: dictionary?.navigation?.dueDate || 'Due Date' },
        { id: 'external_doc_number', label: dictionary?.navigation?.externalDocNumber || 'External Doc Number' },
        { id: 'document_number', label: dictionary?.navigation?.documentNumber || 'Document Number' }
      ], 2, pathname)
    }
    return () => {
      if (pathname) {
        unregisterTable('customer-ledger-entries', pathname)
      }
    }
  }, [dictionary, pathname, registerTable, unregisterTable])

  // Register Unmatched Bank Transactions table
  useEffect(() => {
    if (unmatchedBankDisplayRows.length > 0 && dictionary && pathname) {
      registerTable('unmatched-bank-transactions', dictionary?.navigation?.unmatchedBankTransactions || 'Unmatched Bank Transactions', [
        { id: 'operation_date', label: dictionary?.navigation?.operationDate || 'Operation Date' },
        { id: 'label', label: dictionary?.navigation?.label || 'Label' },
        { id: 'value_date', label: dictionary?.navigation?.valueDate || 'Value Date' },
        { id: 'debit', label: dictionary?.navigation?.debit || 'Debit' },
        { id: 'credit', label: dictionary?.navigation?.credit || 'Credit' },
        { id: 'amount', label: dictionary?.navigation?.amount || 'Amount' },
        { id: 'payment_class', label: dictionary?.navigation?.paymentClass || 'Payment Class' },
        { id: 'payment_status', label: dictionary?.navigation?.paymentStatus || 'Payment Status' },
        { id: 'type', label: dictionary?.navigation?.type || 'Type' },
        { id: 'ref', label: dictionary?.navigation?.ref || 'Reference' },
        { id: 'date_ref', label: dictionary?.navigation?.dateRef || 'Date Reference' },
        { id: 'document_reference', label: dictionary?.navigation?.documentRef || 'Document Reference' }
      ], 4, pathname)
    } else if (pathname) {
      unregisterTable('unmatched-bank-transactions', pathname)
    }
  }, [unmatchedBankDisplayRows.length, dictionary, pathname, registerTable, unregisterTable])

  // Register Unmatched Customer Transactions table
  useEffect(() => {
    if (filteredUnmatchedCustomerTransactions.length > 0 && dictionary && pathname) {
      registerTable('unmatched-customer-transactions', dictionary?.navigation?.unmatchedCustomerTransactions || 'Unmatched Customer Transactions', [
        { id: 'accounting_date', label: dictionary?.navigation?.accountingDate || 'Accounting Date' },
        { id: 'description', label: dictionary?.navigation?.description || 'Description' },
        { id: 'debit', label: dictionary?.navigation?.debit || 'Debit' },
        { id: 'credit', label: dictionary?.navigation?.credit || 'Credit' },
        { id: 'amount', label: dictionary?.navigation?.amount || 'Amount' },
        { id: 'total_amount', label: dictionary?.navigation?.totalAmount || 'Total Amount' },
        { id: 'payment_status', label: dictionary?.navigation?.paymentStatus || 'Payment Status' },
        { id: 'payment_type', label: dictionary?.navigation?.paymentType || 'Payment Type' },
        { id: 'due_date', label: dictionary?.navigation?.dueDate || 'Due Date' },
        { id: 'external_doc_number', label: dictionary?.navigation?.externalDocNumber || 'External Doc Number' },
        { id: 'document_number', label: dictionary?.navigation?.documentNumber || 'Document Number' }
      ], 5, pathname)
    } else if (pathname) {
      unregisterTable('unmatched-customer-transactions', pathname)
    }
  }, [filteredUnmatchedCustomerTransactions.length, dictionary, pathname, registerTable, unregisterTable])

  // Register High Confidence Matches table
  useEffect(() => {
    if (highMatches.length > 0 && dictionary && pathname) {
      registerTable('high-confidence-matches', dictionary?.navigation?.highConfidenceMatches || 'High Confidence Matches', [
        // Bank transaction columns
        { id: 'bank_operation_date', label: `${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.operationDate || 'Operation Date'}` },
        { id: 'bank_label', label: `${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.label || 'Label'}` },
        { id: 'bank_value_date', label: `${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.valueDate || 'Value Date'}` },
        { id: 'bank_debit', label: `${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.debit || 'Debit'}` },
        { id: 'bank_credit', label: `${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.credit || 'Credit'}` },
        { id: 'bank_amount', label: `${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.amount || 'Amount'}` },
        { id: 'bank_payment_class', label: `${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.paymentClass || 'Payment Class'}` },
        { id: 'bank_payment_status', label: `${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.paymentStatus || 'Payment Status'}` },
        { id: 'bank_type', label: `${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.type || 'Type'}` },
        { id: 'bank_ref', label: `${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.ref || 'Ref'}` },
        { id: 'bank_date_ref', label: `${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.dateRef || 'Date Ref'}` },
        { id: 'bank_accounting_account', label: `${dictionary?.navigation?.bankTransaction || 'Bank'} - ${dictionary?.navigation?.accountingAccount || 'Accounting Account'}` },
        // Customer transaction columns
        { id: 'customer_accounting_date', label: `${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.accountingDate || 'Accounting Date'}` },
        { id: 'customer_description', label: `${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.description || 'Description'}` },
        { id: 'customer_debit', label: `${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.debit || 'Debit'}` },
        { id: 'customer_credit', label: `${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.credit || 'Credit'}` },
        { id: 'customer_amount', label: `${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.amount || 'Amount'}` },
        { id: 'customer_total_amount', label: `${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.totalAmount || 'Total Amount'}` },
        { id: 'customer_payment_status', label: `${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.paymentStatus || 'Payment Status'}` },
        { id: 'customer_payment_type', label: `${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.paymentType || 'Payment Type'}` },
        { id: 'customer_due_date', label: `${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.dueDate || 'Due Date'}` },
        { id: 'customer_external_doc_number', label: `${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.externalDocNumber || 'External Doc Number'}` },
        { id: 'customer_document_number', label: `${dictionary?.navigation?.customerTransaction || 'Customer'} - ${dictionary?.navigation?.documentNumber || 'Document Number'}` },
        // Match column
        { id: 'score', label: dictionary?.navigation?.score || 'Score' }
      ], 3, pathname)
    } else if (pathname) {
      unregisterTable('high-confidence-matches', pathname)
    }
  }, [highMatches.length, dictionary, pathname, registerTable, unregisterTable])

  // Cleanup: Unregister all tables when component unmounts or pathname changes
  useEffect(() => {
    if (!pathname) return
    
    return () => {
      // Unregister all tables registered by this page when navigating away
      unregisterTablesByPathname(pathname)
    }
  }, [pathname, unregisterTablesByPathname])

  // Show loading only for a short time, then show page with fallback text
  if (dictionaryLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (criticalError) {
    return (
      <Alert severity='error' sx={{ m: 2 }}>
        {criticalError}
      </Alert>
    )
  }

  // Available icons for selection
  const availableIcons = {
    CreditCard,
    PlayArrow,
    Stop,
    Flag,
    Difference,
    CompareArrows,
    AccountBalance,
    TrendingDown,
    TrendingUp,
    FirstPage,
    LastPage,
    SkipNext,
    SkipPrevious,
    ArrowForward,
    ArrowBack,
    SwapHoriz,
    SwapVert,
    Money,
    LocalAtm,
    Wallet,
    Savings,
    Warning,
    ReportProblem,
    ErrorOutline,
    RemoveCircleOutline,
    SwapCalls,
    Compare,
    IndeterminateCheckBox
  }

  // Icon component renderer
  const renderIcon = (iconName: string, color: string) => {
    const IconComponent = availableIcons[iconName as keyof typeof availableIcons] || CreditCard
    return <IconComponent color={color as any} />
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant='h4' sx={{ fontSize: '1.5rem', m: 0 }}>
            <Box component="span" sx={{ color: 'primary.main' }}>
              {dictionary?.navigation?.reconciliation || 'Reconciliation'}
            </Box>{' '}
            - {agency?.name || (dictionary?.navigation?.agency || 'Agency')} - {agencyCode}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              label={
                reconciliationComplete 
                  ? (dictionary?.navigation?.reconciliationComplete || 'Reconciliation Complete')
                  : matchingLoading || taxComparisonLoading
                    ? (dictionary?.navigation?.reconciliationInProgress || 'Reconciliation in Progress')
                    : reconciliationReady 
                      ? (dictionary?.navigation?.readyToReconcile || 'Ready to Reconcile') 
                      : (dictionary?.navigation?.uploadRequired || 'Upload Required')
              }
              color={reconciliationComplete ? 'success' : reconciliationReady ? 'success' : 'default'}
              icon={
                reconciliationComplete 
                  ? <CheckCircle /> 
                  : matchingLoading || taxComparisonLoading
                    ? <CircularProgress size={16} sx={{ color: 'inherit' }} />
                    : reconciliationReady 
                      ? <CheckCircle /> 
                      : <Pending />
              }
              sx={{ 
                backgroundColor: 'transparent',
                color: reconciliationComplete || reconciliationReady 
                  ? 'success.main' 
                  : 'text.primary',
                opacity: 1,
                '& .MuiChip-icon': {
                  color: 'inherit',
                  opacity: 1
                },
                '& .MuiChip-label': {
                  opacity: 1
                }
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                if (matchingLoading || taxComparisonLoading) {
                  e.preventDefault()
                  return
                }
                if (reconciliationComplete) {
                  handleFinishSession()
                } else {
                  handleRunMatching()
                }
              }}
              disabled={!reconciliationReady && !matchingLoading && !taxComparisonLoading}
              size="small"
              sx={{ 
                height: '32px',
                ...(matchingLoading || taxComparisonLoading ? {
                  opacity: 1,
                  cursor: 'default',
                  pointerEvents: 'none'
                } : {})
              }}
            >
              {matchingLoading 
                ? (dictionary?.navigation?.runningMatching || 'Running Matching...') 
                : taxComparisonLoading 
                  ? (dictionary?.navigation?.comparingTaxes || 'Comparing Taxes...') 
                  : reconciliationComplete
                    ? (dictionary?.navigation?.finishSession || 'Finish Session')
                    : (dictionary?.navigation?.startReconciliation || 'Start Reconciliation')
              }
            </Button>
            {/* Approve button moved below near High Matches section */}
          </Box>
        </Box>
        <Typography color='text.secondary'>
          {dictionary?.navigation?.uploadAndProcess || 'Upload and process bank and customer ledger entries for reconciliation'}
        </Typography>
      </Box>

      {success && (
        <Alert severity='success' sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Matching Progress Bar */}
      {(matchingLoading || taxComparisonLoading) && (
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                {matchingLoading 
                  ? (dictionary?.navigation?.runningMatching || 'Running Matching...')
                  : (dictionary?.navigation?.comparingTaxes || 'Comparing Taxes...')
                }
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {Math.round(matchingLoading ? matchingProgress : taxComparisonProgress)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={matchingLoading ? matchingProgress : taxComparisonProgress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      )}

      {/* Beginning Balance and Statement Ending Balance - Same Row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mt={2.5} mb={3} sx={{ width: '100%' }}>
        {/* Beginning Balance - Left */}
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          <CreditCard color="success" />
          <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
            {dictionary?.navigation?.beginningBalance || 'Beginning balance of ledger entry'}:
          </Typography>
          {!beginningBalanceExtracted && (
            <TextField
              size="small"
              type="number"
              value={beginningBalanceInput}
              onChange={e => {
                setBeginningBalanceInput(e.target.value)
                setBeginningBalanceInputError('')
              }}
              onBlur={() => {
                if (!beginningBalanceInput.trim()) {
                  setBeginningBalance(null)
                  return
                }

                const parsed = Number(beginningBalanceInput.replace(',', '.'))

                if (Number.isNaN(parsed)) {
                  setBeginningBalanceInputError(
                    dictionary?.navigation?.invalidBeginningBalance || 'Please enter a valid number'
                  )
                  return
                }

                setBeginningBalance(parsed)
              }}
              placeholder="0.000"
              error={!!beginningBalanceInputError}
              helperText={beginningBalanceInputError || ''}
              sx={{ 
                maxWidth: 180, 
                mt: 0.25,
                '& .MuiInputBase-root': {
                  height: '32px',
                  minHeight: '32px'
                },
                '& .MuiInputBase-input': {
                  padding: '6px 8px',
                  height: '32px',
                  boxSizing: 'border-box'
                }
              }}
            />
          )}
          {beginningBalanceExtracted && (
            <Typography
              variant="body1"
              color="success.main"
              fontWeight={600}
            >
              {beginningBalance !== null
                ? beginningBalance.toLocaleString('fr-FR', {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3
                  })
                : dictionary?.navigation?.notAvailable || 'N/A'}
            </Typography>
          )}
        </Box>
        
        {/* Statement Ending Balance - Right */}
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" sx={{ marginLeft: 'auto' }}>
          {renderIcon(selectedIcons.statementEndingBalance, 'primary')}
          <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
            {dictionary?.navigation?.statementEndingBalance || 'Statement ending balance of ledger entry'}:
          </Typography>
          <TextField
            size="small"
            type="number"
            value={statementEndingBalanceInput}
            onChange={e => {
              setStatementEndingBalanceInput(e.target.value)
              setStatementEndingBalanceInputError('')
            }}
            onBlur={() => {
              if (!statementEndingBalanceInput.trim()) {
                setStatementEndingBalance(null)
                return
              }

              const parsed = Number(statementEndingBalanceInput.replace(',', '.'))

              if (Number.isNaN(parsed)) {
                setStatementEndingBalanceInputError(
                  dictionary?.navigation?.invalidBeginningBalance || 'Please enter a valid number'
                )
                return
              }

              setStatementEndingBalance(parsed)
            }}
            placeholder="0.000"
            error={!!statementEndingBalanceInputError}
            helperText={statementEndingBalanceInputError || ''}
            sx={{ 
              maxWidth: 180, 
              mt: 0.25,
              '& .MuiInputBase-root': {
                height: '32px',
                minHeight: '32px'
              },
              '& .MuiInputBase-input': {
                padding: '6px 8px',
                height: '32px',
                boxSizing: 'border-box'
              }
            }}
          />
        </Box>
      </Box>

      {/* Split Screen Layout */}
      <Grid container spacing={3} sx={{ alignItems: 'stretch', margin: 0 }}>
        {/* Bank Ledger Section */}
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              sx={{ height: '80px', minHeight: '80px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
              title={
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  {dictionary?.navigation?.bankLedgerEntries || 'Bank Ledger Entries'}
                  {bankTransactions.length > 0 && ` (${bankTransactions.length})`}
                </Typography>
              }
              action={
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="flex-end" 
                  gap={2} 
                  sx={{ 
                    width: 200,
                    height: '100%',
                    // Ensure action aligns with title content vertically
                    alignSelf: 'stretch'
                  }}
                >
                  {(() => {
                    const bankData = bank as any
                    const bankLogoUrl = bankData?.logo_url || bankData?.logo
                    const bankLogoFailed = bankLogoUrl ? failedBankLogos.has(bank?.code || '') : true
                    const showBankLogo = bankLogoUrl && !bankLogoFailed
                    
                    return (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%'
                        }}
                      >
                        {showBankLogo ? (
                          <Box
                            component="img"
                            src={bankLogoUrl}
                            alt={`${bank?.name || 'Bank'} logo`}
                            sx={{
                              maxWidth: '100%',
                              width: 'auto',
                              height: 'auto',
                              // Make portrait logos bigger - 48px for portrait, 32px for others
                              maxHeight: bankLogoAspectRatio === 'portrait' ? 48 : 32,
                              objectFit: 'contain',
                              borderRadius: '4px',
                              display: 'block',
                              // Move portrait logos up to align with title row
                              ...(bankLogoAspectRatio === 'portrait' && {
                                marginTop: '-8px'
                              })
                            }}
                            onLoad={(e) => {
                              const img = e.currentTarget as HTMLImageElement
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
                                setBankLogoAspectRatio(aspectRatio)
                              }
                            }}
                            onError={() => {
                              if (bank?.code) {
                                setFailedBankLogos(prev => new Set(prev).add(bank.code))
                              }
                            }}
                          />
                        ) : (
                          <AccountBalance sx={{ fontSize: 24, color: 'action.main' }} />
                        )}
                      </Box>
                    )
                  })()}
                </Box>
              }
            />
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px', paddingTop: 0 }}>
              {/* Inline Upload Component (hidden after extraction) */}
              {!bankTransactions.length && (
                <Box mb={3}>
                  <FileUpload
                    open
                    inline
                    onClose={() => {}}
                    onUpload={handleBankUpload}
                    acceptedTypes={['.xlsx', '.xls', '.csv']}
                    maxSize={10}
                    dictionary={dictionary}
                  />
                </Box>
              )}
              {/* Render extracted transactions */}
              {bankTransactions.length > 0 && (
                <Table3DSheet 
                  type="bank" 
                  title=""
                  paymentClasses={paymentClasses}
                  searchValue={bankSearchQuery}
                  onSearchChange={setBankSearchQuery}
                  paymentClassFilter={bankPaymentClassFilter}
                  onPaymentClassFilterChange={setBankPaymentClassFilter}
                  dictionary={dictionary}
                >
                  <TableContainer 
                    ref={bankTableScrollRef}
                    component={Paper} 
                    variant="outlined" 
                    sx={{ maxHeight: { xs: 420, md: 'calc(100vh - 200px)' }, width: '100%', margin: 0, overflowY: 'auto', overflowX: 'auto' }}
                  >
                    <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ height: '32px', minHeight: '32px', maxHeight: '32px' }}>
                          {isColumnVisible('bank-ledger-entries', 'operation_date', pathname) && (
                            <ResizableTableCell 
                              columnKey="operation_date"
                              onResizeStart={handleResizeStart}
                              columnWidth={bankColumnWidths['operation_date']}
                              component="th" 
                              className="MuiTableCell-head"
                              sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}
                            >
                              {(() => {
                                const text = dictionary?.navigation?.operationDate || 'Operation Date'
                                console.log('Bank header - operationDate:', { dictionaryValue: dictionary?.navigation?.operationDate, fallback: 'Operation Date', final: text })
                                return formatHeaderText(text)
                              })()}
                            </ResizableTableCell>
                          )}
                          {isColumnVisible('bank-ledger-entries', 'label', pathname) && (
                            <ResizableTableCell 
                              columnKey="label"
                              onResizeStart={handleResizeStart}
                              columnWidth={bankColumnWidths['label'] || 250}
                              component="th" 
                              className="MuiTableCell-head" 
                              sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem', minWidth: bankColumnWidths['label'] || 250, width: bankColumnWidths['label'] || 250 }}
                            >
                              {formatHeaderText(dictionary?.navigation?.label || 'Label')}
                            </ResizableTableCell>
                          )}
                          {isColumnVisible('bank-ledger-entries', 'value_date', pathname) && (
                            <ResizableTableCell 
                              columnKey="value_date"
                              onResizeStart={handleResizeStart}
                              columnWidth={bankColumnWidths['value_date']}
                              component="th" 
                              className="MuiTableCell-head" 
                              sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}
                            >
                              {formatHeaderText(dictionary?.navigation?.valueDate || 'Value Date')}
                            </ResizableTableCell>
                          )}
                          {isColumnVisible('bank-ledger-entries', 'debit', pathname) && (
                            <ResizableTableCell 
                              columnKey="debit"
                              onResizeStart={handleResizeStart}
                              columnWidth={bankColumnWidths['debit']}
                              component="th" 
                              align="right" 
                              className="MuiTableCell-head" 
                              sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}
                            >
                              {formatHeaderText(dictionary?.navigation?.debit || 'Debit')}
                            </ResizableTableCell>
                          )}
                          {isColumnVisible('bank-ledger-entries', 'credit', pathname) && (
                            <ResizableTableCell 
                              columnKey="credit"
                              onResizeStart={handleResizeStart}
                              columnWidth={bankColumnWidths['credit']}
                              component="th" 
                              align="right" 
                              className="MuiTableCell-head" 
                              sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}
                            >
                              {formatHeaderText(dictionary?.navigation?.credit || 'Credit')}
                            </ResizableTableCell>
                          )}
                          {isColumnVisible('bank-ledger-entries', 'amount', pathname) && (
                            <ResizableTableCell 
                              columnKey="amount"
                              onResizeStart={handleResizeStart}
                              columnWidth={bankColumnWidths['amount']}
                              component="th" 
                              align="right" 
                              className="MuiTableCell-head" 
                              sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}
                            >
                              {formatHeaderText(dictionary?.navigation?.amount || 'Amount')}
                            </ResizableTableCell>
                          )}
                          {isColumnVisible('bank-ledger-entries', 'payment_class', pathname) && (
                            <ResizableTableCell 
                              columnKey="payment_class"
                              onResizeStart={handleResizeStart}
                              columnWidth={bankColumnWidths['payment_class']}
                              component="th" 
                              className="MuiTableCell-head" 
                              sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}
                            >
                              {formatHeaderText(dictionary?.navigation?.paymentClass || 'Payment Class')}
                            </ResizableTableCell>
                          )}
                          {isColumnVisible('bank-ledger-entries', 'payment_status', pathname) && (
                            <ResizableTableCell 
                              columnKey="payment_status"
                              onResizeStart={handleResizeStart}
                              columnWidth={bankColumnWidths['payment_status']}
                              component="th" 
                              className="MuiTableCell-head" 
                              sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}
                            >
                              {formatHeaderText(dictionary?.navigation?.paymentStatus || 'Payment Status')}
                            </ResizableTableCell>
                          )}
                          {isColumnVisible('bank-ledger-entries', 'type', pathname) && (
                            <ResizableTableCell 
                              columnKey="type"
                              onResizeStart={handleResizeStart}
                              columnWidth={bankColumnWidths['type']}
                              component="th" 
                              className="MuiTableCell-head" 
                              sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}
                            >
                              {formatHeaderText(dictionary?.navigation?.type || 'Type')}
                            </ResizableTableCell>
                          )}
                          {isColumnVisible('bank-ledger-entries', 'ref', pathname) && (
                            <ResizableTableCell 
                              columnKey="ref"
                              onResizeStart={handleResizeStart}
                              columnWidth={bankColumnWidths['ref']}
                              component="th" 
                              className="MuiTableCell-head" 
                              sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}
                            >
                              {formatHeaderText(dictionary?.navigation?.ref || 'Reference')}
                            </ResizableTableCell>
                          )}
                          {isColumnVisible('bank-ledger-entries', 'date_ref', pathname) && (
                            <ResizableTableCell 
                              columnKey="date_ref"
                              onResizeStart={handleResizeStart}
                              columnWidth={bankColumnWidths['date_ref']}
                              component="th" 
                              className="MuiTableCell-head" 
                              sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}
                            >
                              {formatHeaderText(dictionary?.navigation?.dateRef || 'Date Reference')}
                            </ResizableTableCell>
                          )}
                          {isColumnVisible('bank-ledger-entries', 'document_reference', pathname) && (
                            <ResizableTableCell 
                              columnKey="document_reference"
                              onResizeStart={handleResizeStart}
                              columnWidth={bankColumnWidths['document_reference']}
                              component="th" 
                              className="MuiTableCell-head" 
                              sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}
                            >
                              {formatHeaderText(dictionary?.navigation?.documentRef || 'Document Reference')}
                            </ResizableTableCell>
                          )}
                          {isColumnVisible('bank-ledger-entries', 'accounting_account', pathname) && (
                            <ResizableTableCell 
                              columnKey="accounting_account"
                              onResizeStart={handleResizeStart}
                              columnWidth={bankColumnWidths['accounting_account']}
                              component="th" 
                              className="MuiTableCell-head" 
                              sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}
                            >
                              {formatHeaderText(dictionary?.navigation?.accountingAccount || 'Accounting Account')}
                            </ResizableTableCell>
                          )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBankTransactions.map((tx: any) => {
                          const isLinked = hasLinkedCustomerTransactions(tx.id)
                          const isHighlighted = shouldHighlightBankTransaction(tx)
                          const isHighlightedFromCustomer = isHighlighted && (highlightedCustomerTransaction !== null || highlightedCustomerTransactions.size > 0)
                          const linkedCustomers = getLinkedCustomerTransactions(tx.id)
                          const isOneToMany = isOneToManyRelationship(tx.id)
                          const taxes = cachedBankTaxes[tx.id] || []
                          // Check if transaction is origin or non-origin in group
                          const isOrigin = tx.is_origine === true || tx.is_origine === 'true' || tx.is_origine === 1
                          // Check if non-origin in group: explicitly set field OR derive from having internal_number, group_size > 1, and not being origin
                          const hasExplicitField = tx.is_non_origine_in_group === true || tx.is_non_origine_in_group === 'true' || tx.is_non_origine_in_group === 1
                          const isNonOriginInGroup = hasExplicitField || 
                            (!isOrigin && tx.internal_number && tx.internal_number !== null && tx.internal_number !== '' && tx.group_size && tx.group_size > 1)
                          // Apply green text color only when highlighted (user selection)
                          const textColor = isHighlighted ? '#2e7d32' : 'inherit'
                          
                          return (
                            <Fragment key={tx.id}>
                              <TableRow 
                                ref={(el) => { bankTransactionRefs.current[tx.id] = el }}
                                hover
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleBankTransactionClick(tx.id)
                                }}
                                sx={{ 
                                  height: '32px',
                                  cursor: (isLinked || isNonOriginInGroup) ? 'pointer' : 'default',
                                  backgroundColor: isHighlighted ? '#e8f5e9' : '#ffffff',
                                  borderLeft: isLinked ? '3px solid #4caf50' : 'none',
                                  color: textColor,
                                  transition: isHighlightedFromCustomer ? 'all 0.3s ease-in-out' : 'none',
                                  boxShadow: isHighlightedFromCustomer ? '0 2px 8px rgba(76, 175, 80, 0.4)' : 'none',
                                  position: 'relative',
                                  animation: isHighlightedFromCustomer ? `${pulseBlueAnimation} 1.5s ease-in-out infinite` : 'none',
                                  '& .MuiTableCell-root': {
                                    padding: '4px 8px',
                                    height: '32px',
                                    fontSize: '0.75rem',
                                    color: `${textColor} !important`,
                                    transition: isHighlightedFromCustomer ? 'all 0.2s ease-in-out' : 'none',
                                    '& *': {
                                      color: `${textColor} !important`
                                    }
                                  },
                                  '&:hover': {
                                    backgroundColor: isHighlighted ? '#c8e6c9' : '#f5f5f5',
                                    boxShadow: isHighlightedFromCustomer ? '0 4px 12px rgba(76, 175, 80, 0.5)' : 'none'
                                  }
                                }}
                                title={isLinked ? (isOneToMany ? (dictionary?.navigation?.linkedCustomerTransactionsOneToMany?.replace('{count}', String(linkedCustomers.length)) || `${linkedCustomers.length} transaction(s) client liée(s) (Un-à-plusieurs)`) : (dictionary?.navigation?.linkedCustomerTransactions?.replace('{count}', String(linkedCustomers.length)) || `${linkedCustomers.length} transaction(s) client liée(s)`)) : (dictionary?.navigation?.noLinkedCustomerTransactions || 'Aucune transaction client liée')}
                              >
                                {isColumnVisible('bank-ledger-entries', 'operation_date', pathname) && (
                                  <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['operation_date'], minWidth: bankColumnWidths['operation_date'] }}>{tx.operation_date}</TableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'label', pathname) && (
                                  <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', minWidth: bankColumnWidths['label'] || 250, width: bankColumnWidths['label'] || 250, whiteSpace: 'normal', wordBreak: 'break-word' }}>{preserveSpaces(tx.label)}</TableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'value_date', pathname) && (
                                  <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['value_date'], minWidth: bankColumnWidths['value_date'] }}>{tx.value_date}</TableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'debit', pathname) && (
                                  <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['debit'], minWidth: bankColumnWidths['debit'] }}>
                                    {tx.debit !== null && tx.debit !== undefined && tx.debit !== ''
                                      ? formatHighMatchAmount(tx.debit)
                                      : ''}
                                  </TableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'credit', pathname) && (
                                  <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['credit'], minWidth: bankColumnWidths['credit'] }}>
                                    {tx.credit !== null && tx.credit !== undefined && tx.credit !== ''
                                      ? formatHighMatchAmount(tx.credit)
                                      : ''}
                                  </TableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'amount', pathname) && (
                                  <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['amount'], minWidth: bankColumnWidths['amount'] }}>
                                    {tx.amount !== null && tx.amount !== undefined && tx.amount !== ''
                                      ? formatHighMatchAmount(tx.amount)
                                      : ''}
                                  </TableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'payment_class', pathname) && (
                                  <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['payment_class'], minWidth: bankColumnWidths['payment_class'] }}>{tx.payment_class?.name || tx.payment_class || tx.payment_class_id || ''}</TableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'payment_status', pathname) && (
                                  <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['payment_status'], minWidth: bankColumnWidths['payment_status'] }}>{
                                    (tx.payment_status && tx.payment_status.name)
                                    || paymentStatusMap[Number(tx.payment_status_id)]
                                    || paymentStatusMap[Number(tx.payment_status)]
                                    || tx.payment_status
                                    || tx.payment_status_id
                                    || ''
                                  }</TableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'type', pathname) && (
                                  <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['type'], minWidth: bankColumnWidths['type'] }}>{tx.type ?? ''}</TableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'ref', pathname) && (
                                  <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['ref'], minWidth: bankColumnWidths['ref'] }}>{tx.ref ?? ''}</TableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'date_ref', pathname) && (
                                  <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['date_ref'], minWidth: bankColumnWidths['date_ref'] }}>{tx.date_ref ?? ''}</TableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'document_reference', pathname) && (
                                  <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['document_reference'], minWidth: bankColumnWidths['document_reference'] }}>{tx.document_reference || ''}</TableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'accounting_account', pathname) && (
                                  <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['accounting_account'], minWidth: bankColumnWidths['accounting_account'] }}>{tx.accounting_account || ''}</TableCell>
                                )}
                              </TableRow>
                              {/* Tax rows - one row per tax */}
                              {Array.isArray(taxes) && taxes.map((tax: any, taxIdx: number) => {
                                const taxValue = tax.value ?? tax.tax_amount ?? tax.amount ?? tax.tax_value ?? tax.bank_tax ?? 0
                                const taxLabel = tax.label || tax.tax_name || tax.tax_type || tax.name || `${dictionary?.navigation?.taxName || 'Tax'} ${taxIdx + 1}`
                                return (
                                  <TableRow 
                                    key={`tax-${tx.id}-${taxIdx}`}
                                    sx={{ 
                                      height: '32px',
                                      backgroundColor: '#f9f9f9',
                                      '& .MuiTableCell-root': {
                                        padding: '4px 8px',
                                        height: '32px',
                                        fontSize: '0.75rem'
                                      },
                                      '&:hover': {
                                        backgroundColor: '#f0f0f0'
                                      }
                                    }}
                                  >
                                    {isColumnVisible('bank-ledger-entries', 'operation_date', pathname) && (
                                      <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['operation_date'], minWidth: bankColumnWidths['operation_date'] }}>{tax.operation_date || tx.operation_date || ''}</TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'label', pathname) && (
                                      <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', minWidth: bankColumnWidths['label'] || 250, width: bankColumnWidths['label'] || 250, whiteSpace: 'normal', wordBreak: 'break-word', fontStyle: 'italic' }}>{preserveSpaces(taxLabel)}</TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'value_date', pathname) && (
                                      <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['value_date'], minWidth: bankColumnWidths['value_date'] }}>{tax.value_date || tx.value_date || ''}</TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'debit', pathname) && (
                                      <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['debit'], minWidth: bankColumnWidths['debit'] }}></TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'credit', pathname) && (
                                      <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['credit'], minWidth: bankColumnWidths['credit'] }}></TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'amount', pathname) && (
                                      <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['amount'], minWidth: bankColumnWidths['amount'] }}>
                                        {taxValue !== null && taxValue !== undefined && taxValue !== ''
                                          ? formatHighMatchAmount(taxValue)
                                          : ''}
                                      </TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'payment_class', pathname) && (
                                      <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['payment_class'], minWidth: bankColumnWidths['payment_class'] }}>{tax.payment_class?.name || tax.payment_class || ''}</TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'payment_status', pathname) && (
                                      <TableCell 
                                        sx={{ 
                                          padding: '4px 8px', 
                                          fontSize: '0.75rem', 
                                          width: bankColumnWidths['payment_status'], 
                                          minWidth: bankColumnWidths['payment_status'] 
                                        }}
                                      >
                                        {tax.payment_status?.name || tax.payment_status || ''}
                                      </TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'type', pathname) && (
                                      <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['type'], minWidth: bankColumnWidths['type'] }}>{tax.type || tax.tax_type || 'tax'}</TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'ref', pathname) && (
                                      <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['ref'], minWidth: bankColumnWidths['ref'] }}>{tax.ref || ''}</TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'date_ref', pathname) && (
                                      <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['date_ref'], minWidth: bankColumnWidths['date_ref'] }}>{tax.date_ref || ''}</TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'document_reference', pathname) && (
                                      <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['document_reference'], minWidth: bankColumnWidths['document_reference'] }}>{tax.document_reference || ''}</TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'accounting_account', pathname) && (
                                      <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', width: bankColumnWidths['accounting_account'], minWidth: bankColumnWidths['accounting_account'] }}>{tax.accounting_account || ''}</TableCell>
                                    )}
                                  </TableRow>
                                )
                              })}
                              {/* Tax difference rows - show when transaction is clicked and has matched customer transaction OR is non-origine */}
                              {clickedTransactionIds.includes(tx.id) && ((isLinked && linkedCustomers.length > 0) || isNonOriginInGroup) && (() => {
                                // For non-origine transactions, get difference from comparison API
                                if (isNonOriginInGroup && (!isLinked || linkedCustomers.length === 0)) {
                                  // Find the origine transaction ID
                                  let origineBankId: number | null = null
                                  
                                  if (tx.internal_number && origineTransactionLookup.internalNumberMap.has(tx.internal_number)) {
                                    origineBankId = origineTransactionLookup.internalNumberMap.get(tx.internal_number)!
                                  } else if (tx.ref && origineTransactionLookup.refMap.has(tx.ref)) {
                                    origineBankId = origineTransactionLookup.refMap.get(tx.ref)!
                                  }
                                  
                                  // Get difference from comparison API for this specific non-origine transaction
                                  // Match by origine transaction ID and tax type
                                  if (origineBankId !== null) {
                                    const taxType = (tx.type || '').toUpperCase()
                                    const matchingComparison = taxComparisonResults.find(tax => 
                                      tax.matched_bank_transaction_id === origineBankId &&
                                      (tax.tax_type || '').toUpperCase() === taxType
                                    )
                                    
                                    if (matchingComparison && matchingComparison.difference !== null && matchingComparison.difference !== undefined && matchingComparison.difference !== '') {
                                      const écart = normalizeNumericValue(matchingComparison.difference)
                                      
                                      if (écart !== null) {
                                        const formattedEcart = Math.abs(écart).toLocaleString('fr-FR', {
                                          minimumFractionDigits: 3,
                                          maximumFractionDigits: 3
                                        }).replace(',', '.')
                                        const ecartLabel = écart > 0 
                                          ? `+${formattedEcart}` 
                                          : `-${formattedEcart}`
                                        
                                        return (
                                          <TableRow
                                            key={`ecart-non-origine-${tx.id}`}
                                            sx={{
                                              height: '32px',
                                              maxHeight: '32px',
                                              color: '#2e7d32',
                                              backgroundColor: '#f9f9f9',
                                              '& td': {
                                                padding: '4px 8px',
                                                fontSize: '0.75rem',
                                                height: '32px',
                                                maxHeight: '32px',
                                                lineHeight: '1.2',
                                                whiteSpace: 'nowrap'
                                              },
                                              '& td:first-of-type': {
                                                borderLeft: '1px solid #ccc',
                                                padding: '4px 8px'
                                              },
                                            }}
                                          >
                                            {/* Removed per-tax Écart display row under customer tax row.
                                                The global Écart section next to Total Difference is now the single source of truth. */}
                                          </TableRow>
                                        )
                                      }
                                    }
                                  }
                                  return null
                                }
                                
                                // Get tax data for the first linked customer (or combine all if one-to-many)
                                const firstCustomerId = linkedCustomers[0]
                                const { bankRows, customerRows } = getTaxComparisonForPair(tx.id, firstCustomerId)
                                
                                // Combine and deduplicate taxes by name
                                const allTaxes = new Map<string, { name: string; bankValue: string; customerValue: string; status: string | null }>()
                                
                                bankRows.forEach(tax => {
                                  const key = tax.name.toLowerCase()
                                  if (!allTaxes.has(key)) {
                                    allTaxes.set(key, {
                                      name: tax.name,
                                      bankValue: tax.formattedValue as string,
                                      customerValue: '-',
                                      status: tax.status
                                    })
                                  } else {
                                    const existing = allTaxes.get(key)!
                                    existing.bankValue = tax.formattedValue as string
                                    if (tax.status && !existing.status) {
                                      existing.status = tax.status
                                    }
                                  }
                                })
                                
                                customerRows.forEach(tax => {
                                  const key = tax.name.toLowerCase()
                                  if (!allTaxes.has(key)) {
                                    allTaxes.set(key, {
                                      name: tax.name,
                                      bankValue: '-',
                                      customerValue: tax.formattedValue as string,
                                      status: tax.status
                                    })
                                  } else {
                                    const existing = allTaxes.get(key)!
                                    existing.customerValue = tax.formattedValue as string
                                    if (tax.status && !existing.status) {
                                      existing.status = tax.status
                                    }
                                  }
                                })
                                
                                const uniqueTaxes = Array.from(allTaxes.values())
                                
                                if (uniqueTaxes.length === 0) return null
                                
                                // Calculate combined écart
                                let totalDifference = 0
                                let hasAnyDifference = false
                                
                                uniqueTaxes.forEach(tax => {
                                  const difference = calculateTaxDifference(tax.bankValue, tax.customerValue)
                                  if (difference !== null) {
                                    totalDifference += difference
                                    hasAnyDifference = true
                                  }
                                })
                                
                                // Format difference display
                                let diffDisplay: ReactNode = <Typography variant="caption" color="text.secondary">-</Typography>
                                if (hasAnyDifference) {
                                  const formattedDiff = totalDifference.toLocaleString('fr-FR', {
                                    minimumFractionDigits: 3,
                                    maximumFractionDigits: 3
                                  }).replace(',', '.')
                                  const diffLabel = totalDifference > 0 
                                    ? `+${formattedDiff}` 
                                    : formattedDiff
                                  diffDisplay = (
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        fontWeight: 500,
                                        color: totalDifference === 0 ? 'success.main' : 
                                               Math.abs(totalDifference) > 0.001 ? 'error.main' : 'text.primary',
                                        lineHeight: '1.2',
                                        fontSize: '0.75rem',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {dictionary?.navigation?.taxDifference || 'Écart'}: {diffLabel}
                                    </Typography>
                                  )
                                }
                                
                                // Format bank taxes
                                const bankTaxesElements = uniqueTaxes.map((tax, taxIdx) => {
                                  const difference = calculateTaxDifference(tax.bankValue, tax.customerValue)
                                  let taxColor = 'text.primary'
                                  if (difference !== null && Math.abs(difference) < 0.001) {
                                    taxColor = 'success.main'
                                  } else if (difference !== null) {
                                    taxColor = 'error.main'
                                  }
                                  
                                  return (
                                    <Box key={`bank-tax-${taxIdx}`} component="span" sx={{ color: taxColor, padding: '0 16px' }}>
                                      {`${tax.name}:${formatHighMatchAmount(tax.bankValue)}`}
                                    </Box>
                                  )
                                })
                                
                                // Format customer taxes
                                const customerTaxesElements = uniqueTaxes.map((tax, taxIdx) => {
                                  const difference = calculateTaxDifference(tax.bankValue, tax.customerValue)
                                  let taxColor = 'text.primary'
                                  if (difference !== null && Math.abs(difference) < 0.001) {
                                    taxColor = 'success.main'
                                  } else if (difference !== null) {
                                    taxColor = 'error.main'
                                  }
                                  
                                  return (
                                    <Box key={`customer-tax-${taxIdx}`} component="span" sx={{ color: taxColor, padding: '0 16px' }}>
                                      {`${tax.name}:${formatHighMatchAmount(tax.customerValue)}`}
                                    </Box>
                                  )
                                })
                                
                                return (
                                  <TableRow
                                    key={`tax-diff-${tx.id}`}
                                    sx={{
                                      height: '32px',
                                      maxHeight: '32px',
                                      color: '#2e7d32',
                                      backgroundColor: '#f9f9f9',
                                      '& td': {
                                        padding: '4px 8px',
                                        fontSize: '0.75rem',
                                        height: '32px',
                                        maxHeight: '32px',
                                        lineHeight: '1.2',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      },
                                      '& td:first-of-type': {
                                        borderLeft: '1px solid #ccc',
                                        padding: '4px 8px'
                                      },
                                    }}
                                  >
                                    <TableCell sx={{ borderLeft: '1px solid #ccc', padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                                    <TableCell colSpan={2} sx={{ fontWeight: 400, fontStyle: 'italic', padding: '4px 8px', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    </TableCell>
                                    <TableCell colSpan={3} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                                    <TableCell align="left" sx={{ fontWeight: 400, padding: '4px 8px 4px 0', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 4, margin: 0, padding: 0 }}>
                                        {bankTaxesElements}
                                      </Box>
                                    </TableCell>
                                    <TableCell colSpan={6} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px', borderRight: '1px solid #ccc' }} />
                                    <TableCell colSpan={2} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                                    <TableCell align="left" sx={{ fontWeight: 400, padding: '4px 8px 4px 0', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 4, margin: 0, padding: 0 }}>
                                        {customerTaxesElements}
                                      </Box>
                                    </TableCell>
                                    <TableCell colSpan={6} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                                    <TableCell align="right" sx={{ fontWeight: 400, padding: '4px 8px', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                                      {diffDisplay}
                                    </TableCell>
                                  </TableRow>
                                )
                              })()}
                            </Fragment>
                          )
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
                </Table3DSheet>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Ledger Section */}
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              sx={{ height: '80px', minHeight: '80px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
              title={
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  {dictionary?.navigation?.customerLedgerEntries || 'Customer Ledger Entries'}
                  {customerTransactions.length > 0 && ` (${customerTransactions.length})`}
                </Typography>
              }
              action={
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={2} sx={{ width: 200 }}>
                  {companyLocked || customerProcessing || customerTransactions.length > 0 ? (
                    (() => {
                      const selectedCompanyData = companies.find(c => c.code === selectedCompany)
                      const logoUrl = selectedCompanyData?.logo_url || selectedCompanyData?.logo
                      const logoFailed = logoUrl ? failedLogos.has(selectedCompany || '') : true
                      const showLogo = logoUrl && !logoFailed
                      
                      return (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {showLogo ? (
                            <Box
                              component="img"
                              src={logoUrl}
                              alt={`${selectedCompanyData?.name || 'Company'} logo`}
                              sx={{
                                maxWidth: '100%',
                                width: 'auto',
                                height: 'auto',
                                maxHeight: 32,
                                objectFit: 'contain',
                                borderRadius: '4px',
                                display: 'block'
                              }}
                              onError={() => {
                                setFailedLogos(prev => new Set(prev).add(selectedCompany || ''))
                              }}
                            />
                          ) : (
                            <Business sx={{ fontSize: 24, color: 'action.main' }} />
                          )}
                        </Box>
                      )
                    })()
                  ) : (
                    <FormControl size="small" sx={{ width: 200 }}>
                      <InputLabel id="company-select-label">{dictionary?.navigation?.company || 'Company'}</InputLabel>
                      <Select
                        labelId="company-select-label"
                        label={dictionary?.navigation?.company || 'Company'}
                        value={selectedCompany}
                        onChange={e => setSelectedCompany(e.target.value as string)}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                          borderRadius: 1
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              width: 100,
                              '& .MuiMenuItem-root': {
                                minWidth: 'auto !important',
                                width: '100% !important',
                                maxWidth: '100% !important',
                                padding: '10px 14px !important',
                                display: 'flex !important',
                                justifyContent: 'center !important',
                                alignItems: 'center !important',
                                textAlign: 'center !important',
                                minHeight: '64px !important'
                              }
                            }
                          }
                        }}
                      >
                        {companies.map(company => {
                          const logoUrl = company.logo_url || company.logo
                          const logoFailed = logoUrl ? failedLogos.has(company.code) : true
                          const showLogo = logoUrl && !logoFailed
                          return (
                            <MenuItem 
                              key={company.code} 
                              value={company.code}
                              sx={{
                                width: '100% !important',
                                padding: '10px 14px !important',
                                minHeight: 64,
                                display: 'flex !important',
                                justifyContent: 'center !important',
                                alignItems: 'center !important',
                                textAlign: 'center !important',
                                margin: '0 auto'
                              }}
                            >
                              <Box 
                                display="flex" 
                                alignItems="center" 
                                justifyContent="center"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  padding: 0,
                                  margin: '0 auto'
                                }}
                              >
                                {showLogo ? (
                                  <Box
                                    component="img"
                                    src={logoUrl}
                                    alt={`${company.name} logo`}
                                    sx={{
                                      maxWidth: '100%',
                                      width: 'auto',
                                      height: 'auto',
                                      maxHeight: 32,
                                      objectFit: 'contain',
                                      borderRadius: '4px',
                                      display: 'block',
                                      margin: '0 auto'
                                    }}
                                    onError={() => {
                                      setFailedLogos(prev => new Set(prev).add(company.code))
                                    }}
                                  />
                                ) : (
                                  <Business sx={{ fontSize: 24, color: 'action.main', margin: '0 auto' }} />
                                )}
                              </Box>
                            </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              }
            />
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px', paddingTop: 0 }}>
              {/* Inline Upload Component (hidden after extraction) */}
              {!customerTransactions.length && (
                <Box mb={3}>
                  <FileUpload
                    open
                    inline
                    onClose={() => {}}
                    onUpload={handleCustomerUpload}
                    acceptedTypes={['.xlsx', '.xls', '.csv']}
                    maxSize={10}
                    dictionary={dictionary}
                  />
                </Box>
              )}
              {/* Render extracted transactions */}
              {customerTransactions.length > 0 && (
                <Table3DSheet 
                  type="customer" 
                  title=""
                  paymentClasses={paymentClasses}
                  searchValue={customerSearchQuery}
                  onSearchChange={setCustomerSearchQuery}
                  paymentClassFilter={customerPaymentClassFilter}
                  onPaymentClassFilterChange={setCustomerPaymentClassFilter}
                  dictionary={dictionary}
                >
                  <TableContainer 
                    ref={customerTableScrollRef}
                    component={Paper} 
                    variant="outlined" 
                    sx={{ maxHeight: { xs: 420, md: 'calc(100vh - 200px)' }, width: '100%', margin: 0, overflowY: 'auto', overflowX: 'auto' }}
                  >
                    <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ height: '32px', minHeight: '32px', maxHeight: '32px' }}>
                          {isColumnVisible('customer-ledger-entries', 'accounting_date', pathname) && (
                            <TableCell component="th" className="MuiTableCell-head" sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}>
                              {(() => {
                                const text = dictionary?.navigation?.accountingDate || 'Accounting Date'
                                console.log('Customer header - accountingDate:', { dictionaryValue: dictionary?.navigation?.accountingDate, fallback: 'Accounting Date', final: text })
                                return formatHeaderText(text)
                              })()}
                            </TableCell>
                          )}
                          {isColumnVisible('customer-ledger-entries', 'description', pathname) && (
                            <TableCell component="th" className="MuiTableCell-head" sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem', minWidth: '250px', width: '250px' }}>
                              {formatHeaderText(dictionary?.navigation?.description || 'Description')}
                            </TableCell>
                          )}
                          {isColumnVisible('customer-ledger-entries', 'debit', pathname) && (
                            <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>
                              {formatHeaderText(dictionary?.navigation?.debit || 'Debit')}
                            </TableCell>
                          )}
                          {isColumnVisible('customer-ledger-entries', 'credit', pathname) && (
                            <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>
                              {formatHeaderText(dictionary?.navigation?.credit || 'Credit')}
                            </TableCell>
                          )}
                          {isColumnVisible('customer-ledger-entries', 'amount', pathname) && (
                            <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>
                              {formatHeaderText(dictionary?.navigation?.amount || 'Amount')}
                            </TableCell>
                          )}
                          {isColumnVisible('customer-ledger-entries', 'total_amount', pathname) && (
                            <TableCell component="th" align="right" className="MuiTableCell-head" sx={{ padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>
                              {formatHeaderText(dictionary?.navigation?.totalAmount || 'Total Amount')}
                            </TableCell>
                          )}
                          {isColumnVisible('customer-ledger-entries', 'payment_status', pathname) && (
                            <TableCell component="th" className="MuiTableCell-head" sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}>
                              {formatHeaderText(dictionary?.navigation?.paymentStatus || 'Payment Status')}
                            </TableCell>
                          )}
                          {isColumnVisible('customer-ledger-entries', 'payment_type', pathname) && (
                            <TableCell component="th" className="MuiTableCell-head" sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}>
                              {formatHeaderText(dictionary?.navigation?.paymentType || 'Payment Type')}
                            </TableCell>
                          )}
                          {isColumnVisible('customer-ledger-entries', 'due_date', pathname) && (
                            <TableCell component="th" className="MuiTableCell-head" sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}>
                              {formatHeaderText(dictionary?.navigation?.dueDate || 'Due Date')}
                            </TableCell>
                          )}
                          {isColumnVisible('customer-ledger-entries', 'external_doc_number', pathname) && (
                            <TableCell component="th" className="MuiTableCell-head" sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}>
                              {formatHeaderText(dictionary?.navigation?.externalDocNumber || 'External Doc Number')}
                            </TableCell>
                          )}
                          {isColumnVisible('customer-ledger-entries', 'document_number', pathname) && (
                            <TableCell component="th" className="MuiTableCell-head" sx={{ padding: '4px 8px', height: '32px', minHeight: '32px', maxHeight: '32px', fontSize: '0.75rem' }}>
                              {formatHeaderText(dictionary?.navigation?.documentNumber || 'Document Number')}
                            </TableCell>
                          )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCustomerTransactions.map((tx: any) => {
                          const isLinked = hasLinkedBankTransaction(tx.id)
                          const isHighlighted = highlightedCustomerTransaction === tx.id || highlightedCustomerTransactions.has(tx.id)
                          const isHighlightedFromBank = highlightedCustomerTransactions.has(tx.id)
                          const linkedBank = getLinkedBankTransaction(tx.id)
                          const isPartOfGroup = isPartOfOneToManyGroup(tx.id)
                          const groupedCustomers = getGroupedCustomerTransactions(tx.id)
                          const groupIndex = groupedCustomers.indexOf(tx.id)
                          const isFirstInGroup = groupIndex === 0
                          const isLastInGroup = groupIndex === groupedCustomers.length - 1
                          
                          // Check if this customer transaction is origine
                          // Customer transactions might have type field or is_origine field, or be linked to an origine bank transaction
                          // Check both matched and unmatched bank transactions
                          // Also check if it's in unmatchedCustomerTransactions with origine status
                          const linkedBankTx = linkedBank ? (
                            filteredBankTransactions.find((btx: any) => btx.id === Number(linkedBank)) ||
                            unmatchedBankTransactions.find((btx: any) => btx.id === Number(linkedBank))
                          ) : null
                          // Check if this customer transaction is in unmatched list and is origine
                          const isUnmatchedOrigine = unmatchedCustomerTransactions.some((utx: any) => 
                            utx.id === tx.id && (
                              utx.type === 'origine' || 
                              utx.is_origine === true || 
                              utx.is_origine === 'true' || 
                              utx.is_origine === 1
                            )
                          )
                          
                          const isCustomerOrigine = tx.type === 'origine' || 
                            tx.is_origine === true || 
                            tx.is_origine === 'true' || 
                            tx.is_origine === 1 ||
                            isUnmatchedOrigine ||
                            (linkedBankTx && linkedBankTx.type === 'origine')
                          
                          return (
                            <Fragment key={tx.id}>
                          <TableRow 
                            key={tx.id}
                            ref={(el) => { customerTransactionRefs.current[tx.id] = el }}
                            hover
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCustomerTransactionClick(tx.id)
                            }}
                            sx={{ 
                              height: '32px',
                              cursor: isLinked ? 'pointer' : 'default',
                              backgroundColor: isHighlighted ? '#e8f5e9' : '#ffffff',
                              borderLeft: isLinked ? '3px solid #4caf50' : 'none',
                              transition: isHighlightedFromBank ? 'all 0.3s ease-in-out' : 'none',
                              boxShadow: isHighlightedFromBank ? '0 2px 8px rgba(76, 175, 80, 0.4)' : 'none',
                              position: 'relative',
                              animation: isHighlightedFromBank ? `${pulseGreenAnimation} 1.5s ease-in-out infinite` : 'none',
                              '& .MuiTableCell-root': {
                                padding: '4px 8px',
                                height: '32px',
                                fontSize: '0.75rem',
                                transition: isHighlightedFromBank ? 'all 0.2s ease-in-out' : 'none'
                              },
                              '&:hover': {
                                backgroundColor: isHighlighted ? '#c8e6c9' : '#f5f5f5',
                                boxShadow: isHighlightedFromBank ? '0 4px 12px rgba(76, 175, 80, 0.5)' : 'none'
                              }
                            }}
                            title={isLinked ? (isPartOfGroup ? (dictionary?.navigation?.linkedToBankTransactionGroup?.replace('{bankTransaction}', linkedBank || '').replace('{count}', String(groupedCustomers.length)) || `Lié à la transaction bancaire ${linkedBank || ''} (Partie d'un groupe de ${groupedCustomers.length})`) : (dictionary?.navigation?.linkedToBankTransaction?.replace('{bankTransaction}', linkedBank || '') || `Lié à la transaction bancaire ${linkedBank || ''}`)) : (dictionary?.navigation?.noLinkedBankTransaction || 'Aucune transaction bancaire liée')}
                          >
                            {isColumnVisible('customer-ledger-entries', 'accounting_date', pathname) && (
                              <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem' }}>{tx.accounting_date}</TableCell>
                            )}
                            {isColumnVisible('customer-ledger-entries', 'description', pathname) && (
                              <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', minWidth: '250px', width: '250px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{tx.description}</TableCell>
                            )}
                            {isColumnVisible('customer-ledger-entries', 'debit', pathname) && (
                              <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                                {tx.debit_amount !== null && tx.debit_amount !== undefined && tx.debit_amount !== ''
                                  ? formatHighMatchAmount(tx.debit_amount)
                                  : ''}
                              </TableCell>
                            )}
                            {isColumnVisible('customer-ledger-entries', 'credit', pathname) && (
                              <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                                {tx.credit_amount !== null && tx.credit_amount !== undefined && tx.credit_amount !== ''
                                  ? formatHighMatchAmount(tx.credit_amount)
                                  : ''}
                              </TableCell>
                            )}
                            {isColumnVisible('customer-ledger-entries', 'amount', pathname) && (
                              <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                                {tx.amount !== null && tx.amount !== undefined && tx.amount !== ''
                                  ? formatHighMatchAmount(tx.amount)
                                  : ''}
                              </TableCell>
                            )}
                            {isColumnVisible('customer-ledger-entries', 'total_amount', pathname) && (
                              <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                                {tx.total_amount !== null && tx.total_amount !== undefined && tx.total_amount !== ''
                                  ? formatHighMatchAmount(tx.total_amount)
                                  : ''}
                              </TableCell>
                            )}
                            {isColumnVisible('customer-ledger-entries', 'payment_status', pathname) && (
                              <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem' }}>{
                                (tx.payment_status && tx.payment_status.name)
                                || paymentStatusMap[Number(tx.payment_status_id)]
                                || paymentStatusMap[Number(tx.payment_status)]
                                || tx.payment_status
                                || tx.payment_status_id
                                || ''
                              }</TableCell>
                            )}
                            {isColumnVisible('customer-ledger-entries', 'payment_type', pathname) && (
                              <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem' }}>{tx.payment_type || ''}</TableCell>
                            )}
                            {isColumnVisible('customer-ledger-entries', 'due_date', pathname) && (
                              <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem' }}>{tx.due_date || ''}</TableCell>
                            )}
                            {isColumnVisible('customer-ledger-entries', 'external_doc_number', pathname) && (
                              <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem' }}>{tx.external_doc_number || ''}</TableCell>
                            )}
                            {isColumnVisible('customer-ledger-entries', 'document_number', pathname) && (
                              <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem' }}>{tx.document_number || ''}</TableCell>
                            )}
                        </TableRow>
                        {/* Tax difference rows - show when transaction is clicked and has matched bank transaction */}
                        {clickedTransactionIds.includes(tx.id) && isLinked && linkedBank && (() => {
                          const { bankRows, customerRows } = getTaxComparisonForPair(Number(linkedBank), tx.id)
                          
                          // Combine and deduplicate taxes by name
                          const allTaxes = new Map<string, { name: string; bankValue: string; customerValue: string; status: string | null }>()
                          
                          bankRows.forEach(tax => {
                            const key = tax.name.toLowerCase()
                            if (!allTaxes.has(key)) {
                              allTaxes.set(key, {
                                name: tax.name,
                                bankValue: tax.formattedValue as string,
                                customerValue: '-',
                                status: tax.status
                              })
                            } else {
                              const existing = allTaxes.get(key)!
                              existing.bankValue = tax.formattedValue as string
                              if (tax.status && !existing.status) {
                                existing.status = tax.status
                              }
                            }
                          })
                          
                          customerRows.forEach(tax => {
                            const key = tax.name.toLowerCase()
                            if (!allTaxes.has(key)) {
                              allTaxes.set(key, {
                                name: tax.name,
                                bankValue: '-',
                                customerValue: tax.formattedValue as string,
                                status: tax.status
                              })
                            } else {
                              const existing = allTaxes.get(key)!
                              existing.customerValue = tax.formattedValue as string
                              if (tax.status && !existing.status) {
                                existing.status = tax.status
                              }
                            }
                          })
                          
                          const uniqueTaxes = Array.from(allTaxes.values())
                          
                          if (uniqueTaxes.length === 0) return null
                          
                          // Calculate combined écart
                          let totalDifference = 0
                          let hasAnyDifference = false
                          
                          uniqueTaxes.forEach(tax => {
                            const difference = calculateTaxDifference(tax.bankValue, tax.customerValue)
                            if (difference !== null) {
                              totalDifference += difference
                              hasAnyDifference = true
                            }
                          })
                          
                          // Format difference display
                          let diffDisplay: ReactNode = <Typography variant="caption" color="text.secondary">-</Typography>
                          if (hasAnyDifference) {
                            const formattedDiff = totalDifference.toLocaleString('fr-FR', {
                              minimumFractionDigits: 3,
                              maximumFractionDigits: 3
                            }).replace(',', '.')
                            const diffLabel = totalDifference > 0 
                              ? `+${formattedDiff}` 
                              : formattedDiff
                            diffDisplay = (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 500,
                                  color: totalDifference === 0 ? 'success.main' : 
                                         Math.abs(totalDifference) > 0.001 ? 'error.main' : 'text.primary',
                                  lineHeight: '1.2',
                                  fontSize: '0.75rem',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {dictionary?.navigation?.taxDifference || 'Écart'}: {diffLabel}
                              </Typography>
                            )
                          }
                          
                          // Format bank taxes
                          const bankTaxesElements = uniqueTaxes.map((tax, taxIdx) => {
                            const difference = calculateTaxDifference(tax.bankValue, tax.customerValue)
                            let taxColor = 'text.primary'
                            if (difference !== null && Math.abs(difference) < 0.001) {
                              taxColor = 'success.main'
                            } else if (difference !== null) {
                              taxColor = 'error.main'
                            }
                            
                            return (
                              <Box key={`bank-tax-${taxIdx}`} component="span" sx={{ color: taxColor, padding: '0 16px' }}>
                                {`${tax.name}:${formatHighMatchAmount(tax.bankValue)}`}
                              </Box>
                            )
                          })
                          
                          // Format customer taxes
                          const customerTaxesElements = uniqueTaxes.map((tax, taxIdx) => {
                            const difference = calculateTaxDifference(tax.bankValue, tax.customerValue)
                            let taxColor = 'text.primary'
                            if (difference !== null && Math.abs(difference) < 0.001) {
                              taxColor = 'success.main'
                            } else if (difference !== null) {
                              taxColor = 'error.main'
                            }
                            
                            return (
                              <Box key={`customer-tax-${taxIdx}`} component="span" sx={{ color: taxColor, padding: '0 16px' }}>
                                {`${tax.name}:${formatHighMatchAmount(tax.customerValue)}`}
                              </Box>
                            )
                          })
                          
                          return (
                            <TableRow
                              key={`tax-diff-${tx.id}`}
                              sx={{
                                height: '32px',
                                maxHeight: '32px',
                                color: '#2e7d32',
                                backgroundColor: '#f9f9f9',
                                '& td': {
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  height: '32px',
                                  maxHeight: '32px',
                                  lineHeight: '1.2',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                },
                                '& td:first-of-type': {
                                  borderLeft: '1px solid #ccc',
                                  padding: '4px 8px'
                                },
                              }}
                            >
                              <TableCell sx={{ borderLeft: '1px solid #ccc', padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                              <TableCell colSpan={2} sx={{ fontWeight: 400, fontStyle: 'italic', padding: '4px 8px', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              </TableCell>
                              <TableCell colSpan={3} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                              <TableCell align="left" sx={{ fontWeight: 400, padding: '4px 8px 4px 0', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 4, margin: 0, padding: 0 }}>
                                  {bankTaxesElements}
                                </Box>
                              </TableCell>
                              <TableCell colSpan={6} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px', borderRight: '1px solid #ccc' }} />
                              <TableCell colSpan={2} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                              <TableCell align="left" sx={{ fontWeight: 400, padding: '4px 8px 4px 0', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 4, margin: 0, padding: 0 }}>
                                  {customerTaxesElements}
                                </Box>
                              </TableCell>
                              <TableCell colSpan={6} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                              <TableCell align="right" sx={{ fontWeight: 400, padding: '4px 8px', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                                {diffDisplay}
                              </TableCell>
                            </TableRow>
                          )
                        })()}
                            </Fragment>
                          )
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
                </Table3DSheet>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Balance Sections */}
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mt={7} mb={3} sx={{ width: '100%', flexShrink: 0 }}>
        {/* Left group: Solde + Écart */}
        <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
          {/* Solde Section - Display cumulative balance when transaction is clicked */}
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            {renderIcon(selectedIcons.balance, 'warning')}
            <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
              {dictionary?.navigation?.balance || 'Solde'}:
            </Typography>
            {currentSolde !== null ? (
              <Typography
                variant="body1"
                color="warning.main"
                fontWeight={600}
                sx={{ mt: 0.25 }}
              >
                {currentSolde
                  .toLocaleString('fr-FR', {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                    useGrouping: true
                  })
                  .replace(/\u00A0/g, ' ')
                  .replace(',', '.')}
              </Typography>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25, fontStyle: 'italic' }}
              >
                {dictionary?.navigation?.clickTransactionToSeeBalance || 'Cliquez sur une transaction pour voir le solde'}
              </Typography>
            )}
          </Box>

          {/* Écart Section */}
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            <Box sx={{ color: ecartColor }}>
              {renderIcon(selectedIcons.ecart, 'inherit')}
            </Box>
            <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
              {dictionary?.navigation?.ecart || 'Écart'}:
            </Typography>
            <TextField
              size="small"
              type="text"
              value={ecartInput}
              InputProps={{ readOnly: true }}
              placeholder="0.000"
              sx={{ 
                maxWidth: 180, 
                mt: 0.25,
                '& .MuiInputBase-root': {
                  height: '32px',
                  minHeight: '32px'
                },
                '& .MuiInputBase-input': {
                  padding: '6px 8px',
                  height: '32px',
                  boxSizing: 'border-box',
                  color: ecartColor
                }
              }}
            />
          </Box>
        </Box>

        {/* Right group: [ Total Difference | Ending Balance ] */}
        <Box display="flex" alignItems="center" gap={3} flexWrap="wrap" sx={{ marginLeft: 'auto' }}>
          {/* Total Difference Section */}
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            {renderIcon(selectedIcons.totalDifference, 'error')}
            <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
              {dictionary?.navigation?.totalDifference || 'Total difference of ledger entry'}:
            </Typography>
            <TextField
              size="small"
              type="text"
              value={totalDifferenceInput}
              InputProps={{ readOnly: true }}
              placeholder="0.000"
              sx={{ 
                maxWidth: 180, 
                mt: 0.25,
                '& .MuiInputBase-root': {
                  height: '32px',
                  minHeight: '32px'
                },
                '& .MuiInputBase-input': {
                  padding: '6px 8px',
                  height: '32px',
                  boxSizing: 'border-box'
                }
              }}
            />
          </Box>

          {/* Ending Balance Section */}
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            {(() => {
              // Check if endingBalance equals or differs from statementEndingBalance
              const bothSet = endingBalance !== null && statementEndingBalance !== null
              const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
              const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
              const iconColor = isEqual ? 'success' : isDifferent ? 'error' : 'secondary'
              return renderIcon(selectedIcons.endingBalance, iconColor)
            })()}
            <Typography 
              variant="body2" 
              fontWeight={500} 
              sx={{ 
                fontSize: '0.857rem',
                color: (() => {
                  const bothSet = endingBalance !== null && statementEndingBalance !== null
                  const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
                  const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
                  if (isEqual) return 'success.main'
                  if (isDifferent) return 'error.main'
                  return 'text.primary'
                })()
              }}
            >
              {dictionary?.navigation?.endingBalance || 'Ending balance of ledger entry'}:
            </Typography>
            <TextField
              size="small"
              type="text"
              value={endingBalanceInput}
              onChange={e => {
                setEndingBalanceInput(e.target.value)
                setEndingBalanceInputError('')
              }}
              onBlur={() => {
                if (!endingBalanceInput.trim()) {
                  setEndingBalance(null)
                  return
                }

                // Remove spaces (thousands separators) and replace comma with dot for parsing
                const cleaned = endingBalanceInput.replace(/\s/g, '').replace(',', '.')
                const parsed = Number(cleaned)

                if (Number.isNaN(parsed)) {
                  setEndingBalanceInputError(
                    dictionary?.navigation?.invalidBeginningBalance || 'Please enter a valid number'
                  )
                  return
                }

                setEndingBalance(parsed)
                
              // Format the input with spaces after parsing, and dot as decimal separator
              const formatted = parsed
                .toLocaleString('fr-FR', {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                  useGrouping: true
                })
                .replace(',', '.')
              setEndingBalanceInput(formatted)
              }}
              placeholder="0.000"
              error={!!endingBalanceInputError}
              helperText={endingBalanceInputError || ''}
              sx={{ 
                maxWidth: 180, 
                mt: 0.25,
                '& .MuiInputBase-root': {
                  height: '32px',
                  minHeight: '32px'
                },
                '& .MuiInputBase-input': {
                  padding: '6px 8px',
                  height: '32px',
                  boxSizing: 'border-box',
                  color: (() => {
                    const bothSet = endingBalance !== null && statementEndingBalance !== null
                    const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
                    const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
                    if (isEqual) return 'success.main'
                    if (isDifferent) return 'error.main'
                    return undefined
                  })()
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      {matchingSummary && (
        <Box mt={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" gutterBottom sx={{ m: 0, fontSize: '1rem' }}>{dictionary?.navigation?.matchingSummary || 'Matching Summary'}</Typography>
            <TextField
              size="small"
              placeholder={dictionary?.navigation?.searchBankTransactions || 'Search bank transactions...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              sx={{ minWidth: 360 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <Box display="flex" gap={4} flexWrap="wrap" mb={2}>
            <Chip label={`${dictionary?.navigation?.totalBank || 'Total Bank'}: ${matchingSummary.total_bank_transactions}`} />
            <Chip label={`${dictionary?.navigation?.highMatches || 'High Matches'}: ${matchingSummary.high_matches_count} (${matchingSummary.high_matches_percentage}%)`} color="success" />
            <Chip label={`${dictionary?.navigation?.lowMatches || 'Low Matches'}: ${matchingSummary.low_matches_count} (${matchingSummary.low_matches_percentage}%)`} color="warning" />
            {taxComparisonResults.length > 0 && (
                <Chip 
                label={`${dictionary?.navigation?.taxComparisons || 'Tax Comparisons'}: ${taxComparisonResults.length}`} 
                color="info" 
                variant="outlined"
                />
            )}
          </Box>

          <Grid container spacing={3}>
            {/* High Matches Table */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom sx={{ color: 'success.main', fontWeight: 500, m: 0, fontSize: '1rem' }}>
                  {dictionary?.navigation?.highConfidenceMatches || 'High Confidence Matches'} ({highMatches.length})
                </Typography>
                <Box display="flex" gap={2} alignItems="center">
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={handleToggleSelectAllHighMatches}
                    size="small"
                    sx={{
                      height: '32px',
                      borderColor: theme => theme.palette.success.main,
                      color: theme => theme.palette.success.main,
                      '&:hover': {
                        borderColor: theme => theme.palette.success.dark,
                        color: theme => theme.palette.success.dark
                      }
                    }}
                    disabled={!highMatches.length}
                  >
                    {allHighMatchesSelected
                      ? dictionary?.navigation?.clearSelection || 'Clear Selection'
                      : dictionary?.navigation?.selectAll || 'Select All'}
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleApproveSelection}
                    size="small"
                    sx={{ height: '32px' }}
                    disabled={selectedHighMatchCount === 0}
                  >
                    {dictionary?.navigation?.approveSelection || 'Approve Selection'} ({selectedHighMatchCount})
                  </Button>
                  <Box sx={{ transform: 'scale(0.6)', transformOrigin: 'center' }}>
                    <ShortcutsDropdown shortcuts={shortcuts} />
                  </Box>
                  <IconButton
                    onClick={() => setIsHighMatchesFullscreen(!isHighMatchesFullscreen)}
                    aria-label={isHighMatchesFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    className="text-textPrimary"
                    size="small"
                    sx={{ 
                      padding: '4px',
                      '& svg': {
                        fontSize: '1.75rem !important',
                        width: '1.75rem',
                        height: '1.75rem'
                      }
                    }}
                  >
                    {isHighMatchesFullscreen ? <FullscreenExit /> : <Fullscreen />}
                  </IconButton>
                </Box>
              </Box>
              {isHighMatchesFullscreen && (
                <Dialog
                  open={isHighMatchesFullscreen}
                  onClose={() => setIsHighMatchesFullscreen(false)}
                  maxWidth={false}
                  fullWidth
                  PaperProps={{
                    sx: {
                      m: 0,
                      width: '100vw',
                      height: '100vh',
                      maxWidth: '100vw',
                      maxHeight: '100vh',
                      borderRadius: 0,
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  <DialogContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Title and Buttons Above Table */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                      <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 500, fontSize: '1rem' }}>
                        {dictionary?.navigation?.highConfidenceMatches || 'High Confidence Matches'} ({highMatches.length})
                      </Typography>
                      <Box display="flex" gap={2} alignItems="center">
                        <Button
                          variant="outlined"
                          color="success"
                          onClick={handleToggleSelectAllHighMatches}
                          size="small"
                          sx={{
                            height: '32px',
                            borderColor: theme => theme.palette.success.main,
                            color: theme => theme.palette.success.main,
                            '&:hover': {
                              borderColor: theme => theme.palette.success.dark,
                              color: theme => theme.palette.success.dark
                            }
                          }}
                          disabled={!highMatches.length}
                        >
                          {allHighMatchesSelected
                            ? dictionary?.navigation?.clearSelection || 'Clear Selection'
                            : dictionary?.navigation?.selectAll || 'Select All'}
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleApproveSelection}
                          size="small"
                          sx={{ height: '32px' }}
                          disabled={selectedHighMatchCount === 0}
                        >
                          {dictionary?.navigation?.approveSelection || 'Approve Selection'} ({selectedHighMatchCount})
                        </Button>
                        <Box sx={{ transform: 'scale(0.6)', transformOrigin: 'center' }}>
                          <ShortcutsDropdown shortcuts={shortcuts} />
                        </Box>
                        <IconButton
                          onClick={() => setIsHighMatchesFullscreen(false)}
                          aria-label="Exit fullscreen"
                          className="text-textPrimary"
                          sx={{ 
                            padding: '4px',
                            '& svg': {
                              fontSize: '1.625rem !important',
                              width: '1.625rem',
                              height: '1.625rem'
                            }
                          }}
                        >
                          <FullscreenExit />
                        </IconButton>
                      </Box>
                    </Box>
                    {/* Balance Section */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mb={2} flexShrink={0}>
                      {/* Beginning Balance - Left */}
                      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        <CreditCard color="success" />
                        <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                          {dictionary?.navigation?.beginningBalance || 'Beginning balance of ledger entry'}:
                        </Typography>
                        {!beginningBalanceExtracted && (
                          <TextField
                            size="small"
                            type="number"
                            value={beginningBalanceInput}
                            onChange={e => {
                              setBeginningBalanceInput(e.target.value)
                              setBeginningBalanceInputError('')
                            }}
                            onBlur={() => {
                              if (!beginningBalanceInput.trim()) {
                                setBeginningBalance(null)
                                return
                              }

                              const parsed = Number(beginningBalanceInput.replace(',', '.'))

                              if (Number.isNaN(parsed)) {
                                setBeginningBalanceInputError(
                                  dictionary?.navigation?.invalidBeginningBalance || 'Please enter a valid number'
                                )
                                return
                              }

                              setBeginningBalance(parsed)
                            }}
                            placeholder="0.000"
                            error={!!beginningBalanceInputError}
                            helperText={beginningBalanceInputError || ''}
                            sx={{ 
                              maxWidth: 180, 
                              mt: 0.25,
                              '& .MuiInputBase-root': {
                                height: '32px',
                                minHeight: '32px'
                              },
                              '& .MuiInputBase-input': {
                                padding: '6px 8px',
                                height: '32px',
                                boxSizing: 'border-box'
                              }
                            }}
                          />
                        )}
                        {beginningBalanceExtracted && (
                          <Typography
                            variant="body1"
                            color="success.main"
                            fontWeight={600}
                          >
                            {beginningBalance !== null
                              ? beginningBalance.toLocaleString('fr-FR', {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3
                                })
                              : dictionary?.navigation?.notAvailable || 'N/A'}
                          </Typography>
                        )}
                      </Box>
                      
                      {/* Statement Ending Balance - Right */}
                      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" sx={{ marginLeft: 'auto' }}>
                        {renderIcon(selectedIcons.statementEndingBalance, 'primary')}
                        <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                          {dictionary?.navigation?.statementEndingBalance || 'Statement ending balance of ledger entry'}:
                        </Typography>
                        <TextField
                          size="small"
                          type="number"
                          value={statementEndingBalanceInput}
                          onChange={e => {
                            setStatementEndingBalanceInput(e.target.value)
                            setStatementEndingBalanceInputError('')
                          }}
                          onBlur={() => {
                            if (!statementEndingBalanceInput.trim()) {
                              setStatementEndingBalance(null)
                              return
                            }

                            const parsed = Number(statementEndingBalanceInput.replace(',', '.'))

                            if (Number.isNaN(parsed)) {
                              setStatementEndingBalanceInputError(
                                dictionary?.navigation?.invalidBeginningBalance || 'Please enter a valid number'
                              )
                              return
                            }

                            setStatementEndingBalance(parsed)
                          }}
                          placeholder="0.000"
                          error={!!statementEndingBalanceInputError}
                          helperText={statementEndingBalanceInputError || ''}
                          sx={{ 
                            maxWidth: 180, 
                            mt: 0.25,
                            '& .MuiInputBase-root': {
                              height: '32px',
                              minHeight: '32px'
                            },
                            '& .MuiInputBase-input': {
                              padding: '6px 8px',
                              height: '32px',
                              boxSizing: 'border-box'
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                      <TableContainer component={Paper} variant="outlined" sx={{ height: '100%', overflow: 'auto', border: '1px solid #ccc' }}>
                        <Table size="small" stickyHeader sx={{ 
                          '& .MuiTableCell-root': { borderColor: '#ccc' },
                          '& .MuiTableCell-root:nth-of-type(10)': { borderRight: 'none !important' },
                          '& .MuiTableCell-root:nth-of-type(12)': { borderRight: 'none !important' }
                        }}>
                          <TableHead>
                            <TableRow>
                              <TableCell colSpan={13} sx={{ 
                                fontWeight: 'bold', 
                                backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                                textAlign: 'center',
                                border: '1px solid #ccc',
                                borderRight: '1px solid #ccc'
                              }}>
                                {dictionary?.navigation?.bankTransaction || 'Bank Transaction'}
                              </TableCell>
                              <TableCell colSpan={11} sx={{ 
                                fontWeight: 'bold', 
                                backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                                textAlign: 'center',
                                border: '1px solid #ccc'
                              }}>
                                {dictionary?.navigation?.customerTransaction || 'Customer Transaction'}
                              </TableCell>
                              <TableCell sx={{ 
                                fontWeight: 'bold', 
                                backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                                textAlign: 'center',
                                border: '1px solid #ccc'
                              }}>
                                {dictionary?.navigation?.match || 'Match'}
                              </TableCell>
                            </TableRow>
                            <TableRow
                              sx={{
                                height: '32px',
                                '& th:nth-of-type(1)': {
                                  position: 'sticky',
                                  left: 0,
                                  zIndex: 10,
                                  width: '50px',
                                  minWidth: '50px',
                                  maxWidth: '50px',
                                  textAlign: 'center'
                                },
                                '& th:nth-of-type(12)': {
                                  borderRight: 'none !important'
                                },
                                '& .MuiTableCell-root': {
                                  padding: '4px 8px',
                                  height: '32px',
                                  fontSize: '0.75rem'
                                }
                              }}
                            >
                              <TableCell align="center" sx={{ 
                                position: 'sticky',
                                left: 0,
                                zIndex: 10,
                                fontWeight: 700,
                                width: '50px',
                                minWidth: '50px',
                                maxWidth: '50px',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                padding: '4px 8px',
                                height: '32px',
                                fontSize: '0.75rem'
                              }}></TableCell>
                              {isColumnVisible('high-confidence-matches', 'bank_operation_date', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.operationDate || 'Operation Date'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'bank_label', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem', minWidth: '250px', width: '250px' }}>{dictionary?.navigation?.label || 'Label'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'bank_value_date', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.valueDate || 'Value Date'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'bank_debit', pathname) && (
                                <TableCell align="right" sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.debit || 'Debit'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'bank_credit', pathname) && (
                                <TableCell align="right" sx={{ fontWeight: 700, padding: '4px 2px 4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.credit || 'Credit'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'bank_amount', pathname) && (
                                <TableCell align="right" sx={{ fontWeight: 700, padding: '4px 8px 4px 2px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.amount || 'Amount'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'bank_payment_class', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.paymentClass || 'Payment Class'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'bank_payment_status', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.paymentStatus || 'Payment Status'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'bank_type', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.type || 'Type'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'bank_ref', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.ref || 'Ref'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'bank_date_ref', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.dateRef || 'Date Ref'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'bank_accounting_account', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem', borderRight: '1px solid #ccc' }}>{dictionary?.navigation?.accountingAccount || 'Accounting Account'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'customer_accounting_date', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.accountingDate || 'Accounting Date'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'customer_description', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 2px 4px 8px', height: '32px', fontSize: '0.75rem', minWidth: '250px', width: '250px' }}>{dictionary?.navigation?.description || 'Description'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'customer_debit', pathname) && (
                                <TableCell align="right" sx={{ fontWeight: 700, padding: '4px 8px 4px 2px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.debit || 'Debit'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'customer_credit', pathname) && (
                                <TableCell align="right" sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.credit || 'Credit'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'customer_amount', pathname) && (
                                <TableCell align="right" sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.amount || 'Amount'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'customer_total_amount', pathname) && (
                                <TableCell align="right" sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.totalAmount || 'Total Amount'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'customer_payment_status', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.paymentStatus || 'Payment Status'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'customer_payment_type', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.paymentType || 'Payment Type'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'customer_due_date', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.dueDate || 'Due Date'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'customer_external_doc_number', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.externalDocNumber || 'External Doc Number'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'customer_document_number', pathname) && (
                                <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.documentNumber || 'Document Number'}</TableCell>
                              )}
                              {isColumnVisible('high-confidence-matches', 'score', pathname) && (
                                <TableCell align="center" sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.score || 'Score'}</TableCell>
                              )}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                          {highMatches.map((m: any, idx: number) => {
                            const taxMatchStatus = getTaxMatchStatus(m.bank_transaction_id, m.customer_transaction_id)
                            const { bankRows, customerRows } = getInlineTaxData(m)
                            
                            // Combine and deduplicate taxes by name
                            const allTaxes = new Map<string, { name: string; bankValue: string; customerValue: string; status: string | null }>()
                            
                            bankRows.forEach(tax => {
                              const key = tax.name.toLowerCase()
                              if (!allTaxes.has(key)) {
                                allTaxes.set(key, {
                                  name: tax.name,
                                  bankValue: tax.formattedValue as string,
                                  customerValue: '-',
                                  status: tax.status
                                })
                              } else {
                                const existing = allTaxes.get(key)!
                                existing.bankValue = tax.formattedValue as string
                                if (tax.status && !existing.status) {
                                  existing.status = tax.status
                                }
                              }
                            })
                            
                            customerRows.forEach(tax => {
                              const key = tax.name.toLowerCase()
                              if (!allTaxes.has(key)) {
                                allTaxes.set(key, {
                                  name: tax.name,
                                  bankValue: '-',
                                  customerValue: tax.formattedValue as string,
                                  status: tax.status
                                })
                              } else {
                                const existing = allTaxes.get(key)!
                                existing.customerValue = tax.formattedValue as string
                                if (tax.status && !existing.status) {
                                  existing.status = tax.status
                                }
                              }
                            })
                            
                            let uniqueTaxes = Array.from(allTaxes.values())
                            
                            // Filter out missing taxes if hideMissingTaxes is true
                            if (hideMissingTaxes) {
                              uniqueTaxes = uniqueTaxes.filter(tax => tax.status !== 'missing')
                            }
                            
                            // Check if the bank transaction is an origin or non-origin in a group
                            const bankTx = bankTransactions.find((tx: any) => tx.id === m.bank_transaction_id)
                            const isOrigin = bankTx?.is_origine === true || bankTx?.is_origine === 'true' || bankTx?.is_origine === 1
                            const hasExplicitField = bankTx?.is_non_origine_in_group === true || bankTx?.is_non_origine_in_group === 'true' || bankTx?.is_non_origine_in_group === 1
                            const isNonOriginInGroup = hasExplicitField || 
                              (!isOrigin && bankTx?.internal_number && bankTx?.internal_number !== null && bankTx?.internal_number !== '' && bankTx?.group_size && bankTx?.group_size > 1)
                            
                            // Set font color to default (no automatic coloring based on origin/group status)
                            const fontColor = 'inherit'
                            
                            return (
                              <Fragment key={`high-${idx}`}>
                                <TableRow
                                  hover
                                  sx={{ 
                                    height: '32px',
                                    backgroundColor: '#ffffff',
                                    cursor: 'pointer',
                                    color: fontColor,
                                    '& td:first-of-type': {
                                      borderLeft: '1px solid #ccc',
                                      backgroundColor: '#ffffff'
                                    },
                                    '& td:nth-of-type(12)': {
                                      borderLeft: 'none !important',
                                      borderRight: 'none !important'
                                    },
                                    '& td': {
                                      color: `${fontColor} !important`,
                                      padding: '4px 8px',
                                      fontSize: '0.75rem',
                                      '& *': {
                                        color: `${fontColor} !important`
                                      }
                                    },
                                    '&:hover': {
                                      backgroundColor: '#f5f5f5',
                                      '& td:first-of-type': {
                                        backgroundColor: '#f5f5f5'
                                      }
                                    },
                                    '&:hover td:first-of-type': {
                                      backgroundColor: '#f5f5f5 !important'
                                    }
                                  }}
                                >
                                  <MemoizedCheckbox 
                                    idx={idx}
                                    checked={selectedHighMatchesRef.current[idx] || false}
                                    onSelection={handleHighMatchSelection}
                                  />
                                  {isColumnVisible('high-confidence-matches', 'bank_operation_date', pathname) && (
                                    <TableCell style={{ color: fontColor }}>{m.bank_operation_date}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'bank_label', pathname) && (
                                    <TableCell sx={{ color: fontColor, minWidth: '250px', width: '250px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{preserveSpaces(m.bank_label)}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'bank_value_date', pathname) && (
                                    <TableCell style={{ color: fontColor }}>{m.bank_value_date || ''}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'bank_debit', pathname) && (
                                    <TableCell align="right" style={{ color: fontColor }}>
                                      {m.bank_debit !== null && m.bank_debit !== undefined && m.bank_debit !== ''
                                        ? formatHighMatchAmount(m.bank_debit)
                                        : ''}
                                    </TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'bank_credit', pathname) && (
                                    <TableCell align="right" sx={{ paddingRight: '2px', paddingLeft: '8px' }} style={{ color: fontColor }}>
                                      {m.bank_credit !== null && m.bank_credit !== undefined && m.bank_credit !== ''
                                        ? formatHighMatchAmount(m.bank_credit)
                                        : ''}
                                    </TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'bank_amount', pathname) && (
                                    <TableCell align="right" sx={{ paddingRight: '8px', paddingLeft: '2px' }} style={{ color: fontColor }}>
                                      {m.bank_amount !== null && m.bank_amount !== undefined && m.bank_amount !== ''
                                        ? formatHighMatchAmount(m.bank_amount)
                                        : ''}
                                    </TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'bank_payment_class', pathname) && (
                                    <TableCell style={{ color: fontColor }}>{m.bank_payment_class}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'bank_payment_status', pathname) && (
                                    <TableCell style={{ color: fontColor }}>{m.bank_payment_status || ''}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'bank_type', pathname) && (
                                    <TableCell style={{ color: fontColor }}>{m.bank_type || ''}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'bank_ref', pathname) && (
                                    <TableCell style={{ color: fontColor }}>{m.bank_ref}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'bank_date_ref', pathname) && (
                                    <TableCell sx={{ borderRight: 'none !important', borderLeft: 'none !important' }} style={{ color: fontColor }}>{m.bank_date_ref || ''}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'bank_accounting_account', pathname) && (
                                    <TableCell sx={{ borderRight: '1px solid #ccc', borderLeft: 'none !important' }} style={{ color: fontColor }}>{m.bank_accounting_account || ''}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'customer_accounting_date', pathname) && (
                                    <TableCell style={{ color: fontColor }}>{m.customer_accounting_date}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'customer_description', pathname) && (
                                    <TableCell sx={{ color: fontColor, minWidth: '250px', width: '250px', whiteSpace: 'normal', wordBreak: 'break-word', paddingRight: '2px', paddingLeft: '8px' }}>{m.customer_description}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'customer_debit', pathname) && (
                                    <TableCell align="right" sx={{ paddingRight: '8px', paddingLeft: '2px' }} style={{ color: fontColor }}>
                                      {m.customer_debit !== null && m.customer_debit !== undefined && m.customer_debit !== ''
                                        ? formatHighMatchAmount(m.customer_debit)
                                        : ''}
                                    </TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'customer_credit', pathname) && (
                                    <TableCell align="right" style={{ color: fontColor }}>
                                      {m.customer_credit !== null && m.customer_credit !== undefined && m.customer_credit !== ''
                                        ? formatHighMatchAmount(m.customer_credit)
                                        : ''}
                                    </TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'customer_amount', pathname) && (
                                    <TableCell align="right" style={{ color: fontColor }}>
                                      {m.customer_amount !== null && m.customer_amount !== undefined && m.customer_amount !== ''
                                        ? formatHighMatchAmount(m.customer_amount)
                                        : ''}
                                    </TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'customer_total_amount', pathname) && (
                                    <TableCell align="right" style={{ color: fontColor }}>
                                      {m.customer_total_amount !== null && m.customer_total_amount !== undefined && m.customer_total_amount !== ''
                                        ? formatHighMatchAmount(m.customer_total_amount)
                                        : ''}
                                    </TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'customer_payment_status', pathname) && (
                                    <TableCell style={{ color: fontColor }}>{m.customer_payment_status || ''}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'customer_payment_type', pathname) && (
                                    <TableCell style={{ color: fontColor }}>{m.customer_payment_type}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'customer_due_date', pathname) && (
                                    <TableCell style={{ color: fontColor }}>{m.customer_due_date || ''}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'customer_external_doc_number', pathname) && (
                                    <TableCell style={{ color: fontColor }}>{m.customer_external_doc_number}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'customer_document_number', pathname) && (
                                    <TableCell style={{ color: fontColor }}>{m.customer_document_number}</TableCell>
                                  )}
                                  {isColumnVisible('high-confidence-matches', 'score', pathname) && (
                                    <TableCell align="center">
                                      <Chip 
                                        label={`${m.score}%`} 
                                        color="success"
                                        size="small"
                                      />
                                    </TableCell>
                                  )}
                                </TableRow>
                                {/* Tax row - single row with all taxes */}
                                {uniqueTaxes.length > 0 && (() => {
                                  // Calculate combined écart (sum of all differences)
                                  let totalDifference = 0
                                  let hasAnyDifference = false
                                  let hasWarning = false
                                  let hasError = false
                                  
                                  uniqueTaxes.forEach(tax => {
                                    const bankNum = normalizeNumericValue(tax.bankValue)
                                    const customerNum = normalizeNumericValue(tax.customerValue)
                                    const bankIsZero = bankNum === 0
                                    const customerIsZero = customerNum === 0
                                    const bankIsMissing = tax.bankValue === '-' || tax.bankValue === null || tax.bankValue === undefined || tax.bankValue === '' || (bankIsZero && customerNum !== null && customerNum !== 0)
                                    const customerIsMissing = tax.customerValue === '-' || tax.customerValue === null || tax.customerValue === undefined || tax.customerValue === '' || (customerIsZero && bankNum !== null && bankNum !== 0)
                                    const oneSideMissing = (bankIsMissing && !customerIsMissing) || (!bankIsMissing && customerIsMissing)
                                    const bothMissing = (tax.bankValue === '-' || tax.bankValue === null || tax.bankValue === undefined || tax.bankValue === '') && (tax.customerValue === '-' || tax.customerValue === null || tax.customerValue === undefined || tax.customerValue === '')
                                    
                                    const difference = calculateTaxDifference(tax.bankValue, tax.customerValue)
                                    
                                    if (difference !== null) {
                                      totalDifference += difference
                                      hasAnyDifference = true
                                      if (Math.abs(difference) > 0.001) {
                                        hasError = true
                                      }
                                    }
                                    
                                    if (bothMissing || oneSideMissing) {
                                      hasWarning = true
                                    }
                                  })
                                  
                                  // Determine text color
                                  let textColor = 'text.primary'
                                  if (hasWarning) {
                                    textColor = 'warning.main'
                                  } else if (hasError) {
                                    textColor = 'error.main'
                                  } else if (hasAnyDifference && Math.abs(totalDifference) < 0.001) {
                                    textColor = 'success.main'
                                  }
                                  
                                  // Format combined difference
                                  let diffDisplay: ReactNode = <Typography variant="caption" color="text.secondary">-</Typography>
                                  if (hasAnyDifference) {
                                    const formattedDiff = totalDifference.toLocaleString('fr-FR', {
                                      minimumFractionDigits: 3,
                                      maximumFractionDigits: 3
                                    }).replace(',', '.')
                                    const diffLabel = totalDifference > 0 
                                      ? `+${formattedDiff}` 
                                      : formattedDiff
                                    diffDisplay = (
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          fontWeight: 500,
                                          color: totalDifference === 0 ? 'success.main' : 
                                                 Math.abs(totalDifference) > 0.001 ? 'error.main' : 'text.primary',
                                          lineHeight: '1.2',
                                          fontSize: '0.75rem',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        {dictionary?.navigation?.taxDifference || 'Écart'}: {diffLabel}
                                      </Typography>
                                    )
                                  }
                                  
                                  // Format bank taxes with individual colors
                                  const bankTaxesElements = uniqueTaxes.map((tax, taxIdx) => {
                                    const bankNum = normalizeNumericValue(tax.bankValue)
                                    const customerNum = normalizeNumericValue(tax.customerValue)
                                    const bankIsZero = bankNum === 0
                                    const customerIsZero = customerNum === 0
                                    const bankIsMissing = tax.bankValue === '-' || tax.bankValue === null || tax.bankValue === undefined || tax.bankValue === '' || (bankIsZero && customerNum !== null && customerNum !== 0)
                                    const customerIsMissing = tax.customerValue === '-' || tax.customerValue === null || tax.customerValue === undefined || tax.customerValue === '' || (customerIsZero && bankNum !== null && bankNum !== 0)
                                    const oneSideMissing = (bankIsMissing && !customerIsMissing) || (!bankIsMissing && customerIsMissing)
                                    const bothMissing = (tax.bankValue === '-' || tax.bankValue === null || tax.bankValue === undefined || tax.bankValue === '') && (tax.customerValue === '-' || tax.customerValue === null || tax.customerValue === undefined || tax.customerValue === '')
                                    
                                    const difference = calculateTaxDifference(tax.bankValue, tax.customerValue)
                                    
                                    let taxColor = 'text.primary'
                                    if (bothMissing || oneSideMissing) {
                                      taxColor = 'warning.main'
                                    } else if (difference !== null && Math.abs(difference) < 0.001) {
                                      taxColor = 'success.main'
                                    } else if (difference !== null) {
                                      taxColor = 'error.main'
                                    }
                                    
                                    return (
                                      <Box key={`bank-tax-${taxIdx}`} component="span" sx={{ color: taxColor, padding: '0 16px' }}>
                                        {`${tax.name}:${formatHighMatchAmount(tax.bankValue)}`}
                                      </Box>
                                    )
                                  })
                                  
                                  // Format customer taxes with individual colors
                                  const customerTaxesElements = uniqueTaxes.map((tax, taxIdx) => {
                                    const bankNum = normalizeNumericValue(tax.bankValue)
                                    const customerNum = normalizeNumericValue(tax.customerValue)
                                    const bankIsZero = bankNum === 0
                                    const customerIsZero = customerNum === 0
                                    const bankIsMissing = tax.bankValue === '-' || tax.bankValue === null || tax.bankValue === undefined || tax.bankValue === '' || (bankIsZero && customerNum !== null && customerNum !== 0)
                                    const customerIsMissing = tax.customerValue === '-' || tax.customerValue === null || tax.customerValue === undefined || tax.customerValue === '' || (customerIsZero && bankNum !== null && bankNum !== 0)
                                    const oneSideMissing = (bankIsMissing && !customerIsMissing) || (!bankIsMissing && customerIsMissing)
                                    const bothMissing = (tax.bankValue === '-' || tax.bankValue === null || tax.bankValue === undefined || tax.bankValue === '') && (tax.customerValue === '-' || tax.customerValue === null || tax.customerValue === undefined || tax.customerValue === '')
                                    
                                    const difference = calculateTaxDifference(tax.bankValue, tax.customerValue)
                                    
                                    let taxColor = 'text.primary'
                                    if (bothMissing || oneSideMissing) {
                                      taxColor = 'warning.main'
                                    } else if (difference !== null && Math.abs(difference) < 0.001) {
                                      taxColor = 'success.main'
                                    } else if (difference !== null) {
                                      taxColor = 'error.main'
                                    }
                                    
                                    return (
                                      <Box key={`customer-tax-${taxIdx}`} component="span" sx={{ color: taxColor, padding: '0 16px' }}>
                                        {`${tax.name}:${formatHighMatchAmount(tax.customerValue)}`}
                                      </Box>
                                    )
                                  })
                                  
                                  return (
                                    <TableRow
                                      key={`tax-${idx}`}
                                      sx={{
                                        height: '32px',
                                        maxHeight: '32px',
                                        color: '#2e7d32', // green - same as transaction rows
                                        '& td': {
                                          padding: '4px 8px',
                                          fontSize: '0.75rem',
                                          height: '32px',
                                          maxHeight: '32px',
                                          lineHeight: '1.2',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        },
                                        '& td:first-of-type': {
                                          borderLeft: '1px solid #ccc',
                                          padding: '4px 8px'
                                        },
                                      }}
                                    >
                                      <TableCell sx={{ borderLeft: '1px solid #ccc', padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                                      <TableCell colSpan={2} sx={{ fontWeight: 400, fontStyle: 'italic', padding: '4px 8px', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      </TableCell>
                                      <TableCell colSpan={3} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                                      <TableCell align="left" sx={{ fontWeight: 400, padding: '4px 8px 4px 0', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 4, margin: 0, padding: 0 }}>
                                          {bankTaxesElements}
                                        </Box>
                                      </TableCell>
                                      <TableCell colSpan={6} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px', borderRight: '1px solid #ccc' }} />
                                      <TableCell colSpan={2} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                                      <TableCell align="left" sx={{ fontWeight: 400, padding: '4px 8px 4px 0', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 4, margin: 0, padding: 0 }}>
                                          {customerTaxesElements}
                                        </Box>
                                      </TableCell>
                                      <TableCell colSpan={6} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                                      <TableCell align="right" sx={{ fontWeight: 400, padding: '4px 8px', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                                        {diffDisplay}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })()}
                              </Fragment>
                            )
                          })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                    {/* Balance Sections */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mt={3} mb={2} sx={{ width: '100%', flexShrink: 0 }}>
                      {/* Left group: Solde + Écart */}
                      <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                        {/* Solde Section - Display cumulative balance when transaction is clicked */}
                        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                          {renderIcon(selectedIcons.balance, 'warning')}
                          <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                            {dictionary?.navigation?.balance || 'Solde'}:
                          </Typography>
                          {currentSolde !== null ? (
                            <Typography
                              variant="body1"
                              color="warning.main"
                              fontWeight={600}
                              sx={{ mt: 0.25 }}
                            >
                              {currentSolde
                                .toLocaleString('fr-FR', {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3,
                                  useGrouping: true
                                })
                                .replace(/\u00A0/g, ' ')
                                .replace(',', '.')}
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.25, fontStyle: 'italic' }}
                            >
                              {dictionary?.navigation?.clickTransactionToSeeBalance || 'Cliquez sur une transaction pour voir le solde'}
                            </Typography>
                          )}
                        </Box>
                        
                        {/* Écart Section */}
                        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                          <Box sx={{ color: ecartColor }}>
                            {renderIcon(selectedIcons.ecart, 'inherit')}
                          </Box>
                          <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                            {dictionary?.navigation?.ecart || 'Écart'}:
                          </Typography>
                          <TextField
                            size="small"
                            type="text"
                            value={ecartInput}
                            InputProps={{ readOnly: true }}
                            placeholder="0.000"
                            sx={{ 
                              maxWidth: 180, 
                              mt: 0.25,
                              '& .MuiInputBase-root': {
                                height: '32px',
                                minHeight: '32px'
                              },
                              '& .MuiInputBase-input': {
                                padding: '6px 8px',
                                height: '32px',
                                boxSizing: 'border-box',
                                color: ecartColor
                              }
                            }}
                          />
                        </Box>
                      </Box>
                      
                      {/* Right group: Total difference + Solde final */}
                      <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                        {/* Total Difference Section */}
                        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                          {renderIcon(selectedIcons.totalDifference, 'error')}
                          <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                            {dictionary?.navigation?.totalDifference || 'Total difference of ledger entry'}:
                          </Typography>
                          <TextField
                            size="small"
                            type="text"
                            value={totalDifferenceInput}
                            InputProps={{ readOnly: true }}
                            placeholder="0.000"
                            sx={{ 
                              maxWidth: 180, 
                              mt: 0.25,
                              '& .MuiInputBase-root': {
                                height: '32px',
                                minHeight: '32px'
                              },
                              '& .MuiInputBase-input': {
                                padding: '6px 8px',
                                height: '32px',
                                boxSizing: 'border-box'
                              }
                            }}
                          />
                        </Box>
                        
                        {/* Ending Balance Section */}
                        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        {(() => {
                          // Check if endingBalance equals or differs from statementEndingBalance
                          const bothSet = endingBalance !== null && statementEndingBalance !== null
                          const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
                          const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
                          const iconColor = isEqual ? 'success' : isDifferent ? 'error' : 'secondary'
                          return renderIcon(selectedIcons.endingBalance, iconColor)
                        })()}
                        <Typography 
                          variant="body2" 
                          fontWeight={500} 
                          sx={{ 
                            fontSize: '0.857rem',
                            color: (() => {
                              const bothSet = endingBalance !== null && statementEndingBalance !== null
                              const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
                              const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
                              if (isEqual) return 'success.main'
                              if (isDifferent) return 'error.main'
                              return 'text.primary'
                            })()
                          }}
                        >
                          {dictionary?.navigation?.endingBalance || 'Ending balance of ledger entry'}:
                        </Typography>
                        <TextField
                          size="small"
                          type="text"
                          value={endingBalanceInput}
                          onChange={e => {
                            setEndingBalanceInput(e.target.value)
                            setEndingBalanceInputError('')
                          }}
                          onBlur={() => {
                            if (!endingBalanceInput.trim()) {
                              setEndingBalance(null)
                              return
                            }

                            // Remove spaces (thousands separators) and replace comma with dot for parsing
                            const cleaned = endingBalanceInput.replace(/\s/g, '').replace(',', '.')
                            const parsed = Number(cleaned)

                            if (Number.isNaN(parsed)) {
                              setEndingBalanceInputError(
                                dictionary?.navigation?.invalidBeginningBalance || 'Please enter a valid number'
                              )
                              return
                            }

                            setEndingBalance(parsed)
                            
                            // Format the input with spaces after parsing, and dot as decimal separator
                            const formatted = parsed
                              .toLocaleString('fr-FR', {
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 3,
                                useGrouping: true
                              })
                              .replace(',', '.')
                            setEndingBalanceInput(formatted)
                          }}
                          placeholder="0.000"
                          error={!!endingBalanceInputError}
                          helperText={endingBalanceInputError || ''}
                          sx={{ 
                            maxWidth: 180, 
                            mt: 0.25,
                            '& .MuiInputBase-root': {
                              height: '32px',
                              minHeight: '32px'
                            },
                            '& .MuiInputBase-input': {
                              padding: '6px 8px',
                              height: '32px',
                              boxSizing: 'border-box',
                              color: (() => {
                                const bothSet = endingBalance !== null && statementEndingBalance !== null
                                const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
                                const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
                                if (isEqual) return 'success.main'
                                if (isDifferent) return 'error.main'
                                return 'inherit'
                              })()
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    </Box>
                  </DialogContent>
                </Dialog>
              )}
              {!isHighMatchesFullscreen && (
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, overflowX: 'auto', mb: 4, border: '1px solid #ccc' }}>
                <Table size="small" stickyHeader sx={{ 
                  '& .MuiTableCell-root': { borderColor: '#ccc' },
                  '& .MuiTableCell-root:nth-of-type(10)': { borderRight: 'none !important' },
                  '& .MuiTableCell-root:nth-of-type(12)': { borderRight: 'none !important' }
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        position: 'sticky',
                        left: 0,
                        top: 0,
                        zIndex: 11,
                        fontWeight: 'bold', 
                        textAlign: 'center',
                        border: '1px solid #ccc',
                        width: '50px',
                        minWidth: '50px',
                        maxWidth: '50px',
                        height: '32px',
                        padding: '4px 8px'
                      }}></TableCell>
                      <TableCell colSpan={13} sx={{ 
                        fontWeight: 'bold', 
                        backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                        textAlign: 'center',
                        border: '1px solid #ccc',
                        borderRight: '1px solid #ccc'
                      }}>
                        {dictionary?.navigation?.bankTransaction || 'Bank Transaction'}
                      </TableCell>
                      <TableCell colSpan={11} sx={{ 
                        fontWeight: 'bold', 
                        backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                        textAlign: 'center',
                        border: '1px solid #ccc'
                      }}>
                        {dictionary?.navigation?.customerTransaction || 'Customer Transaction'}
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                        textAlign: 'center',
                        border: '1px solid #ccc'
                      }}>
                        {dictionary?.navigation?.match || 'Match'}
                      </TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        height: '32px',
                        '& th:nth-of-type(12)': {
                          borderRight: 'none !important'
                        },
                        '& .MuiTableCell-root': {
                          padding: '4px 8px',
                          height: '32px',
                          fontSize: '0.75rem'
                        }
                      }}
                    >
                      {isColumnVisible('high-confidence-matches', 'bank_operation_date', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.operationDate || 'Operation Date'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'bank_label', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem', minWidth: '250px', width: '250px' }}>{dictionary?.navigation?.label || 'Label'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'bank_value_date', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.valueDate || 'Value Date'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'bank_debit', pathname) && (
                        <TableCell align="right" sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.debit || 'Debit'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'bank_credit', pathname) && (
                        <TableCell align="right" sx={{ fontWeight: 700, padding: '4px 2px 4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.credit || 'Credit'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'bank_amount', pathname) && (
                        <TableCell align="right" sx={{ fontWeight: 700, padding: '4px 8px 4px 2px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.amount || 'Amount'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'bank_payment_class', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.paymentClass || 'Payment Class'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'bank_payment_status', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.paymentStatus || 'Payment Status'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'bank_type', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.type || 'Type'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'bank_ref', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.ref || 'Ref'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'bank_date_ref', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.dateRef || 'Date Ref'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'bank_accounting_account', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem', borderRight: '1px solid #ccc' }}>{dictionary?.navigation?.accountingAccount || 'Accounting Account'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'customer_accounting_date', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.accountingDate || 'Accounting Date'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'customer_description', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 2px 4px 8px', height: '32px', fontSize: '0.75rem', minWidth: '250px', width: '250px' }}>{dictionary?.navigation?.description || 'Description'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'customer_debit', pathname) && (
                        <TableCell align="right" sx={{ fontWeight: 700, padding: '4px 8px 4px 2px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.debit || 'Debit'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'customer_credit', pathname) && (
                        <TableCell align="right" sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.credit || 'Credit'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'customer_amount', pathname) && (
                        <TableCell align="right" sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.amount || 'Amount'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'customer_total_amount', pathname) && (
                        <TableCell align="right" sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.totalAmount || 'Total Amount'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'customer_payment_status', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.paymentStatus || 'Payment Status'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'customer_payment_type', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.paymentType || 'Payment Type'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'customer_due_date', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.dueDate || 'Due Date'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'customer_external_doc_number', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.externalDocNumber || 'External Doc Number'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'customer_document_number', pathname) && (
                        <TableCell sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.documentNumber || 'Document Number'}</TableCell>
                      )}
                      {isColumnVisible('high-confidence-matches', 'score', pathname) && (
                        <TableCell align="center" sx={{ fontWeight: 700, padding: '4px 8px', height: '32px', fontSize: '0.75rem' }}>{dictionary?.navigation?.score || 'Score'}</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {highMatches.map((m: any, idx: number) => {
                    const taxMatchStatus = getTaxMatchStatus(m.bank_transaction_id, m.customer_transaction_id)
                    const { bankRows, customerRows } = getInlineTaxData(m)
                    
                    // Combine and deduplicate taxes by name
                    const allTaxes = new Map<string, { name: string; bankValue: string; customerValue: string; status: string | null }>()
                    
                    bankRows.forEach(tax => {
                      const key = tax.name.toLowerCase()
                      if (!allTaxes.has(key)) {
                        allTaxes.set(key, {
                          name: tax.name,
                          bankValue: tax.formattedValue as string,
                          customerValue: '-',
                          status: tax.status
                        })
                      } else {
                        const existing = allTaxes.get(key)!
                        existing.bankValue = tax.formattedValue as string
                        if (tax.status && !existing.status) {
                          existing.status = tax.status
                        }
                      }
                    })
                    
                    customerRows.forEach(tax => {
                      const key = tax.name.toLowerCase()
                      if (!allTaxes.has(key)) {
                        allTaxes.set(key, {
                          name: tax.name,
                          bankValue: '-',
                          customerValue: tax.formattedValue as string,
                          status: tax.status
                        })
                      } else {
                        const existing = allTaxes.get(key)!
                        existing.customerValue = tax.formattedValue as string
                        if (tax.status && !existing.status) {
                          existing.status = tax.status
                        }
                      }
                    })
                    
                    let uniqueTaxes = Array.from(allTaxes.values())
                    
                    // Filter out missing taxes if hideMissingTaxes is true
                    if (hideMissingTaxes) {
                      uniqueTaxes = uniqueTaxes.filter(tax => tax.status !== 'missing')
                    }
                    
                    // Check if the bank transaction is an origin or non-origin in a group
                    const bankTx = bankTransactions.find((tx: any) => tx.id === m.bank_transaction_id)
                    const isOrigin = bankTx?.is_origine === true || bankTx?.is_origine === 'true' || bankTx?.is_origine === 1
                    const hasExplicitField = bankTx?.is_non_origine_in_group === true || bankTx?.is_non_origine_in_group === 'true' || bankTx?.is_non_origine_in_group === 1
                    const isNonOriginInGroup = hasExplicitField || 
                      (!isOrigin && bankTx?.internal_number && bankTx?.internal_number !== null && bankTx?.internal_number !== '' && bankTx?.group_size && bankTx?.group_size > 1)
                    
                    // Set font color to default (no automatic coloring based on origin/group status)
                    const fontColor = 'inherit'
                    
                    return (
                      <Fragment key={`high-${idx}`}>
                        <TableRow
                          hover
                          sx={{ 
                            height: '32px',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer',
                            color: fontColor,
                            '& td:first-of-type': {
                              borderLeft: '1px solid #ccc',
                              backgroundColor: '#ffffff'
                            },
                            '& td:nth-of-type(12)': {
                              borderLeft: 'none !important',
                              borderRight: 'none !important'
                            },
                            '& td': {
                              color: `${fontColor} !important`,
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              '& *': {
                                color: `${fontColor} !important`
                              }
                            },
                            '&:hover': {
                              backgroundColor: '#f5f5f5',
                              '& td:first-of-type': {
                                backgroundColor: '#f5f5f5'
                              }
                            },
                            '&:hover td:first-of-type': {
                              backgroundColor: '#f5f5f5 !important'
                            }
                          }}
                        >
                          <MemoizedCheckbox 
                            idx={idx}
                            checked={selectedHighMatchesRef.current[idx] || false}
                            onSelection={handleHighMatchSelection}
                          />
                          {isColumnVisible('high-confidence-matches', 'bank_operation_date', pathname) && (
                            <TableCell style={{ color: fontColor }}>{m.bank_operation_date}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'bank_label', pathname) && (
                            <TableCell sx={{ color: fontColor, minWidth: '250px', width: '250px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{m.bank_label}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'bank_value_date', pathname) && (
                            <TableCell style={{ color: fontColor }}>{m.bank_value_date || ''}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'bank_debit', pathname) && (
                            <TableCell align="right" style={{ color: fontColor }}>
                              {m.bank_debit !== null && m.bank_debit !== undefined && m.bank_debit !== ''
                                ? formatHighMatchAmount(m.bank_debit)
                                : ''}
                            </TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'bank_credit', pathname) && (
                            <TableCell align="right" sx={{ paddingRight: '2px', paddingLeft: '8px' }} style={{ color: fontColor }}>
                              {m.bank_credit !== null && m.bank_credit !== undefined && m.bank_credit !== ''
                                ? formatHighMatchAmount(m.bank_credit)
                                : ''}
                            </TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'bank_amount', pathname) && (
                            <TableCell align="right" sx={{ paddingRight: '8px', paddingLeft: '2px' }} style={{ color: fontColor }}>
                              {m.bank_amount !== null && m.bank_amount !== undefined && m.bank_amount !== ''
                                ? formatHighMatchAmount(m.bank_amount)
                                : ''}
                            </TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'bank_payment_class', pathname) && (
                            <TableCell style={{ color: fontColor }}>{m.bank_payment_class}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'bank_payment_status', pathname) && (
                            <TableCell style={{ color: fontColor }}>{m.bank_payment_status || ''}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'bank_type', pathname) && (
                            <TableCell style={{ color: fontColor }}>{m.bank_type || ''}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'bank_ref', pathname) && (
                            <TableCell style={{ color: fontColor }}>{m.bank_ref}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'bank_date_ref', pathname) && (
                            <TableCell sx={{ borderRight: 'none !important', borderLeft: 'none !important' }} style={{ color: fontColor }}>{m.bank_date_ref || ''}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'bank_accounting_account', pathname) && (
                            <TableCell sx={{ borderRight: '1px solid #ccc', borderLeft: 'none !important' }} style={{ color: fontColor }}>{m.bank_accounting_account || ''}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'customer_accounting_date', pathname) && (
                            <TableCell style={{ color: fontColor }}>{m.customer_accounting_date}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'customer_description', pathname) && (
                            <TableCell sx={{ color: fontColor, minWidth: '250px', width: '250px', whiteSpace: 'normal', wordBreak: 'break-word', paddingRight: '2px', paddingLeft: '8px' }}>{m.customer_description}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'customer_debit', pathname) && (
                            <TableCell align="right" sx={{ paddingRight: '8px', paddingLeft: '2px' }} style={{ color: fontColor }}>
                              {m.customer_debit !== null && m.customer_debit !== undefined && m.customer_debit !== ''
                                ? formatHighMatchAmount(m.customer_debit)
                                : ''}
                            </TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'customer_credit', pathname) && (
                            <TableCell align="right" style={{ color: fontColor }}>
                              {m.customer_credit !== null && m.customer_credit !== undefined && m.customer_credit !== ''
                                ? formatHighMatchAmount(m.customer_credit)
                                : ''}
                            </TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'customer_amount', pathname) && (
                            <TableCell align="right" style={{ color: fontColor }}>
                              {m.customer_amount !== null && m.customer_amount !== undefined && m.customer_amount !== ''
                                ? formatHighMatchAmount(m.customer_amount)
                                : ''}
                            </TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'customer_total_amount', pathname) && (
                            <TableCell align="right" style={{ color: fontColor }}>
                              {m.customer_total_amount !== null && m.customer_total_amount !== undefined && m.customer_total_amount !== ''
                                ? formatHighMatchAmount(m.customer_total_amount)
                                : ''}
                            </TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'customer_payment_status', pathname) && (
                            <TableCell style={{ color: fontColor }}>{m.customer_payment_status || ''}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'customer_payment_type', pathname) && (
                            <TableCell style={{ color: fontColor }}>{m.customer_payment_type}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'customer_due_date', pathname) && (
                            <TableCell style={{ color: fontColor }}>{m.customer_due_date || ''}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'customer_external_doc_number', pathname) && (
                            <TableCell style={{ color: fontColor }}>{m.customer_external_doc_number}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'customer_document_number', pathname) && (
                            <TableCell style={{ color: fontColor }}>{m.customer_document_number}</TableCell>
                          )}
                          {isColumnVisible('high-confidence-matches', 'score', pathname) && (
                            <TableCell align="center">
                              <Chip 
                                label={`${m.score}%`} 
                                color="success"
                                size="small"
                              />
                            </TableCell>
                          )}
                        </TableRow>
                        {/* Tax row - single row with all taxes */}
                        {uniqueTaxes.length > 0 && (() => {
                          // Calculate combined écart (sum of all differences)
                          let totalDifference = 0
                          let hasAnyDifference = false
                          let hasWarning = false
                          let hasError = false
                          
                          uniqueTaxes.forEach(tax => {
                            const bankNum = normalizeNumericValue(tax.bankValue)
                            const customerNum = normalizeNumericValue(tax.customerValue)
                            const bankIsZero = bankNum === 0
                            const customerIsZero = customerNum === 0
                            const bankIsMissing = tax.bankValue === '-' || tax.bankValue === null || tax.bankValue === undefined || tax.bankValue === '' || (bankIsZero && customerNum !== null && customerNum !== 0)
                            const customerIsMissing = tax.customerValue === '-' || tax.customerValue === null || tax.customerValue === undefined || tax.customerValue === '' || (customerIsZero && bankNum !== null && bankNum !== 0)
                            const oneSideMissing = (bankIsMissing && !customerIsMissing) || (!bankIsMissing && customerIsMissing)
                            const bothMissing = (tax.bankValue === '-' || tax.bankValue === null || tax.bankValue === undefined || tax.bankValue === '') && (tax.customerValue === '-' || tax.customerValue === null || tax.customerValue === undefined || tax.customerValue === '')
                            
                            const difference = calculateTaxDifference(tax.bankValue, tax.customerValue)
                            
                            if (difference !== null) {
                              totalDifference += difference
                              hasAnyDifference = true
                              if (Math.abs(difference) > 0.001) {
                                hasError = true
                              }
                            }
                            
                            if (bothMissing || oneSideMissing) {
                              hasWarning = true
                            }
                          })
                          
                          // Determine text color
                          let textColor = 'text.primary'
                          if (hasWarning) {
                            textColor = 'warning.main'
                          } else if (hasError) {
                            textColor = 'error.main'
                          } else if (hasAnyDifference && Math.abs(totalDifference) < 0.001) {
                            textColor = 'success.main'
                          }
                          
                          // Format combined difference
                          let diffDisplay: ReactNode = <Typography variant="caption" color="text.secondary">-</Typography>
                          if (hasAnyDifference) {
                            const formattedDiff = totalDifference.toLocaleString('fr-FR', {
                              minimumFractionDigits: 3,
                              maximumFractionDigits: 3
                            }).replace(',', '.')
                            const diffLabel = totalDifference > 0 
                              ? `+${formattedDiff}` 
                              : formattedDiff
                            diffDisplay = (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 500,
                                  color: totalDifference === 0 ? 'success.main' : 
                                         Math.abs(totalDifference) > 0.001 ? 'error.main' : 'text.primary',
                                  lineHeight: '1.2',
                                  fontSize: '0.75rem',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {dictionary?.navigation?.taxDifference || 'Écart'}: {diffLabel}
                              </Typography>
                            )
                          }
                          
                          // Format bank taxes with individual colors
                          const bankTaxesElements = uniqueTaxes.map((tax, taxIdx) => {
                            const bankNum = normalizeNumericValue(tax.bankValue)
                            const customerNum = normalizeNumericValue(tax.customerValue)
                            const bankIsZero = bankNum === 0
                            const customerIsZero = customerNum === 0
                            const bankIsMissing = tax.bankValue === '-' || tax.bankValue === null || tax.bankValue === undefined || tax.bankValue === '' || (bankIsZero && customerNum !== null && customerNum !== 0)
                            const customerIsMissing = tax.customerValue === '-' || tax.customerValue === null || tax.customerValue === undefined || tax.customerValue === '' || (customerIsZero && bankNum !== null && bankNum !== 0)
                            const oneSideMissing = (bankIsMissing && !customerIsMissing) || (!bankIsMissing && customerIsMissing)
                            const bothMissing = (tax.bankValue === '-' || tax.bankValue === null || tax.bankValue === undefined || tax.bankValue === '') && (tax.customerValue === '-' || tax.customerValue === null || tax.customerValue === undefined || tax.customerValue === '')
                            
                            const difference = calculateTaxDifference(tax.bankValue, tax.customerValue)
                            
                            let taxColor = 'text.primary'
                            if (bothMissing || oneSideMissing) {
                              taxColor = 'warning.main'
                            } else if (difference !== null && Math.abs(difference) < 0.001) {
                              taxColor = 'success.main'
                            } else if (difference !== null) {
                              taxColor = 'error.main'
                            }
                            
                            return (
                              <Box key={`bank-tax-${taxIdx}`} component="span" sx={{ color: taxColor, padding: '0 16px' }}>
                                {`${tax.name}:${formatHighMatchAmount(tax.bankValue)}`}
                              </Box>
                            )
                          })
                          
                          // Format customer taxes with individual colors
                          const customerTaxesElements = uniqueTaxes.map((tax, taxIdx) => {
                            const bankNum = normalizeNumericValue(tax.bankValue)
                            const customerNum = normalizeNumericValue(tax.customerValue)
                            const bankIsZero = bankNum === 0
                            const customerIsZero = customerNum === 0
                            const bankIsMissing = tax.bankValue === '-' || tax.bankValue === null || tax.bankValue === undefined || tax.bankValue === '' || (bankIsZero && customerNum !== null && customerNum !== 0)
                            const customerIsMissing = tax.customerValue === '-' || tax.customerValue === null || tax.customerValue === undefined || tax.customerValue === '' || (customerIsZero && bankNum !== null && bankNum !== 0)
                            const oneSideMissing = (bankIsMissing && !customerIsMissing) || (!bankIsMissing && customerIsMissing)
                            const bothMissing = (tax.bankValue === '-' || tax.bankValue === null || tax.bankValue === undefined || tax.bankValue === '') && (tax.customerValue === '-' || tax.customerValue === null || tax.customerValue === undefined || tax.customerValue === '')
                            
                            const difference = calculateTaxDifference(tax.bankValue, tax.customerValue)
                            
                            let taxColor = 'text.primary'
                            if (bothMissing || oneSideMissing) {
                              taxColor = 'warning.main'
                            } else if (difference !== null && Math.abs(difference) < 0.001) {
                              taxColor = 'success.main'
                            } else if (difference !== null) {
                              taxColor = 'error.main'
                            }
                            
                            return (
                              <Box key={`customer-tax-${taxIdx}`} component="span" sx={{ color: taxColor, padding: '0 16px' }}>
                                {`${tax.name}:${formatHighMatchAmount(tax.customerValue)}`}
                              </Box>
                            )
                          })
                          
                          return (
                            <TableRow
                              key={`tax-${idx}`}
                              sx={{
                                height: '32px',
                                maxHeight: '32px',
                                color: '#2e7d32', // green - same as transaction rows
                                '& td': {
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  height: '32px',
                                  maxHeight: '32px',
                                  lineHeight: '1.2',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                },
                                '& td:first-of-type': {
                                  borderLeft: '1px solid #ccc',
                                  padding: '4px 8px'
                                },
                              }}
                            >
                              <TableCell sx={{ borderLeft: '1px solid #ccc', padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                              <TableCell colSpan={2} sx={{ fontWeight: 400, fontStyle: 'italic', padding: '4px 8px', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              </TableCell>
                              <TableCell colSpan={3} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                              <TableCell align="left" sx={{ fontWeight: 400, padding: '4px 8px 4px 0', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 4, margin: 0, padding: 0 }}>
                                  {bankTaxesElements}
                                </Box>
                              </TableCell>
                              <TableCell colSpan={6} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px', borderRight: '1px solid #ccc' }} />
                              <TableCell colSpan={2} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                              <TableCell align="left" sx={{ fontWeight: 400, padding: '4px 8px 4px 0', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 4, margin: 0, padding: 0 }}>
                                  {customerTaxesElements}
                                </Box>
                              </TableCell>
                              <TableCell colSpan={7} sx={{ padding: '4px 8px', height: '32px', maxHeight: '32px' }} />
                              <TableCell align="center" sx={{ padding: '4px 8px', fontSize: '0.75rem', height: '32px', maxHeight: '32px', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                                {diffDisplay}
                              </TableCell>
                            </TableRow>
                          )
                        })()}
                      </Fragment>
                    )
                  })}
                  </TableBody>
                </Table>
              </TableContainer>
              )}
              
              {/* Balance Sections */}
              {!isHighMatchesFullscreen && (
              <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mt={3} mb={2} sx={{ width: '100%' }}>
                {/* Left group: Balance + Écart */}
                <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                  {/* Balance Section */}
                  <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                    {renderIcon(selectedIcons.balance, 'warning')}
                    <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                      {dictionary?.navigation?.balance || 'Balance of ledger entry'}:
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={balanceInput}
                      onChange={e => {
                        setBalanceInput(e.target.value)
                        setBalanceInputError('')
                      }}
                      onBlur={() => {
                        if (!balanceInput.trim()) {
                          setBalance(null)
                          return
                        }

                        const parsed = Number(balanceInput.replace(',', '.'))

                        if (Number.isNaN(parsed)) {
                          setBalanceInputError(
                            dictionary?.navigation?.invalidBeginningBalance || 'Please enter a valid number'
                          )
                          return
                        }

                        setBalance(parsed)
                      }}
                      placeholder="0.000"
                      error={!!balanceInputError}
                      helperText={balanceInputError || ''}
                      sx={{ 
                        maxWidth: 180, 
                        mt: 0.25,
                        '& .MuiInputBase-root': {
                          height: '32px',
                          minHeight: '32px'
                        },
                        '& .MuiInputBase-input': {
                          padding: '6px 8px',
                          height: '32px',
                          boxSizing: 'border-box'
                        }
                      }}
                    />
                  </Box>
                  
                  {/* Écart Section */}
                  <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                    <Box sx={{ color: ecartColor }}>
                      {renderIcon(selectedIcons.ecart, 'inherit')}
                    </Box>
                    <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                      {dictionary?.navigation?.ecart || 'Écart'}:
                    </Typography>
                    <TextField
                      size="small"
                      type="text"
                      value={ecartInput}
                      InputProps={{ readOnly: true }}
                      placeholder="0.000"
                      sx={{ 
                        maxWidth: 180, 
                        mt: 0.25,
                        '& .MuiInputBase-root': {
                          height: '32px',
                          minHeight: '32px'
                        },
                        '& .MuiInputBase-input': {
                          padding: '6px 8px',
                          height: '32px',
                          boxSizing: 'border-box',
                          color: ecartColor
                        }
                      }}
                    />
                  </Box>
                </Box>
                
                {/* Right group: Total difference + Solde final */}
                <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                  {/* Total Difference Section */}
                  <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                    {renderIcon(selectedIcons.totalDifference, 'error')}
                    <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                      {dictionary?.navigation?.totalDifference || 'Total difference of ledger entry'}:
                    </Typography>
                    <TextField
                      size="small"
                      type="text"
                      value={totalDifferenceInput}
                      InputProps={{ readOnly: true }}
                      placeholder="0.000"
                      sx={{ 
                        maxWidth: 180, 
                        mt: 0.25,
                        '& .MuiInputBase-root': {
                          height: '32px',
                          minHeight: '32px'
                        },
                        '& .MuiInputBase-input': {
                          padding: '6px 8px',
                          height: '32px',
                          boxSizing: 'border-box'
                        }
                      }}
                    />
                  </Box>
                  
                  {/* Ending Balance Section */}
                  <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                  {(() => {
                    // Check if endingBalance equals or differs from statementEndingBalance
                    const bothSet = endingBalance !== null && statementEndingBalance !== null
                    const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
                    const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
                    const iconColor = isEqual ? 'success' : isDifferent ? 'error' : 'secondary'
                    return renderIcon(selectedIcons.endingBalance, iconColor)
                  })()}
                  <Typography 
                    variant="body2" 
                    fontWeight={500} 
                    sx={{ 
                      fontSize: '0.857rem',
                      color: (() => {
                        const bothSet = endingBalance !== null && statementEndingBalance !== null
                        const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
                        const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
                        if (isEqual) return 'success.main'
                        if (isDifferent) return 'error.main'
                        return 'text.primary'
                      })()
                    }}
                  >
                    {dictionary?.navigation?.endingBalance || 'Ending balance of ledger entry'}:
                  </Typography>
                  <TextField
                    size="small"
                    type="text"
                    value={endingBalanceInput}
                    onChange={e => {
                      setEndingBalanceInput(e.target.value)
                      setEndingBalanceInputError('')
                    }}
                    onBlur={() => {
                      if (!endingBalanceInput.trim()) {
                        setEndingBalance(null)
                        return
                      }

                      // Remove spaces (thousands separators) and replace comma with dot for parsing
                      const cleaned = endingBalanceInput.replace(/\s/g, '').replace(',', '.')
                      const parsed = Number(cleaned)

                      if (Number.isNaN(parsed)) {
                        setEndingBalanceInputError(
                          dictionary?.navigation?.invalidBeginningBalance || 'Please enter a valid number'
                        )
                        return
                      }

                      setEndingBalance(parsed)
                      
                      // Format the input with spaces after parsing, and dot as decimal separator
                      const formatted = parsed
                        .toLocaleString('fr-FR', {
                          minimumFractionDigits: 3,
                          maximumFractionDigits: 3,
                          useGrouping: true
                        })
                        .replace(',', '.')
                      setEndingBalanceInput(formatted)
                    }}
                    placeholder="0.000"
                    error={!!endingBalanceInputError}
                    helperText={endingBalanceInputError || ''}
                    sx={{ 
                      maxWidth: 180, 
                      mt: 0.25,
                      '& .MuiInputBase-root': {
                        height: '32px',
                        minHeight: '32px'
                      },
                      '& .MuiInputBase-input': {
                        padding: '6px 8px',
                        height: '32px',
                        boxSizing: 'border-box',
                        color: (() => {
                          const bothSet = endingBalance !== null && statementEndingBalance !== null
                          const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
                          const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
                          if (isEqual) return 'success.main'
                          if (isDifferent) return 'error.main'
                          return 'inherit'
                        })()
                      }
                    }}
                  />
                  </Box>
                </Box>
              </Box>
              )}
            </Grid>

            {/* Reconciliation Tables Components - Only show after matching is complete */}
            {!matchingLoading && matchingSummary !== null && (
            <Grid item xs={12} sx={{ mb: 4 }}>
              <Card sx={{ width: '100%' }}>
                <CardContent sx={{ padding: '24px' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" gap={4} alignItems="center">
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          {dictionary?.navigation?.bankLedgerEntries || 'Bank Ledger Entries'}
                          {bankTransactions.length > 0 && ` (${bankTransactions.length})`}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          {dictionary?.navigation?.customerLedgerEntries || 'Customer Ledger Entries'}
                          {customerTransactions.length > 0 && ` (${customerTransactions.length})`}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" gap={2} alignItems="center">
                      <ButtonGroup variant="outlined" color="success" size="small" sx={{ 
                        height: '32px',
                        gap: 0,
                        '& .MuiButton-root': {
                          border: 'none !important',
                          borderLeft: 'none !important',
                          borderRight: 'none !important',
                          borderTop: 'none !important',
                          borderBottom: 'none !important',
                          margin: 0,
                          marginLeft: 0,
                          marginRight: 0,
                          '&:not(:last-of-type)': {
                            borderRight: 'none !important',
                            marginRight: 0
                          }
                        }
                      }}>
                        <Button
                          onClick={handleSelectAllBankTransactions}
                          sx={{
                            height: '32px',
                            border: 'none !important',
                            paddingRight: '2px !important',
                            marginRight: 0,
                            color: theme => theme.palette.success.main,
                            '&:hover': {
                              border: 'none !important',
                              color: theme => theme.palette.success.dark,
                              backgroundColor: 'transparent'
                            }
                          }}
                        >
                          {dictionary?.navigation?.selectAll || 'Select All'}
                        </Button>
                        <Button
                          ref={selectAllMenuAnchorRef}
                          onClick={() => setSelectAllMenuOpen(prev => !prev)}
                          sx={{
                            minWidth: '16px',
                            width: '16px',
                            height: '32px',
                            paddingLeft: '2px !important',
                            paddingRight: '2px !important',
                            paddingTop: 0,
                            paddingBottom: 0,
                            marginLeft: 0,
                            border: 'none !important',
                            color: theme => theme.palette.success.main,
                            '&:hover': {
                              border: 'none !important',
                              color: theme => theme.palette.success.dark,
                              backgroundColor: 'transparent'
                            },
                            '& .MuiSvgIcon-root': {
                              fontSize: '1rem',
                              margin: 0
                            }
                          }}
                        >
                          <ArrowDropDown />
                        </Button>
                      </ButtonGroup>
                      <Popper
                        open={selectAllMenuOpen}
                        anchorEl={selectAllMenuAnchorRef.current}
                        placement="bottom-start"
                        transition
                        disablePortal
                        sx={{ zIndex: 1300 }}
                      >
                        {({ TransitionProps }) => (
                          <Fade {...TransitionProps}>
                            <Paper className="shadow-lg" sx={{ border: 'none' }}>
                              <ClickAwayListener onClickAway={(e) => {
                                if (selectAllMenuAnchorRef.current && selectAllMenuAnchorRef.current.contains(e.target as HTMLElement)) {
                                  return
                                }
                                setSelectAllMenuOpen(false)
                              }}>
                                <MenuList autoFocusItem={selectAllMenuOpen} sx={{ py: 0.5, px: 0 }}>
                                  <MenuItem 
                                    onClick={(e) => {
                                      handleSelectAllBank(e)
                                      setSelectAllMenuOpen(false)
                                    }}
                                    sx={{ fontSize: '0.75rem', py: 0.5, px: 0.75, minHeight: 'auto' }}
                                  >
                                    {dictionary?.navigation?.all || (lang === 'fr' ? 'Tout' : 'All')}
                                  </MenuItem>
                                  <MenuItem 
                                    onClick={(e) => {
                                      handleSelectNoneBank(e)
                                      setSelectAllMenuOpen(false)
                                    }}
                                    sx={{ fontSize: '0.75rem', py: 0.5, px: 0.75, minHeight: 'auto' }}
                                  >
                                    {dictionary?.navigation?.none || (lang === 'fr' ? 'Aucun' : 'None')}
                                  </MenuItem>
                                  <MenuItem 
                                    onClick={(e) => {
                                      handleSelectMatchedBank(e)
                                      setSelectAllMenuOpen(false)
                                    }}
                                    sx={{ fontSize: '0.75rem', py: 0.5, px: 0.75, minHeight: 'auto' }}
                                  >
                                    {dictionary?.navigation?.matched || (lang === 'fr' ? 'Rapprochées' : 'Matched')}
                                  </MenuItem>
                                  <MenuItem 
                                    onClick={(e) => {
                                      handleSelectUnmatchedBank(e)
                                      setSelectAllMenuOpen(false)
                                    }}
                                    sx={{ fontSize: '0.75rem', py: 0.5, px: 0.75, minHeight: 'auto' }}
                                  >
                                    {dictionary?.navigation?.unmatched || (lang === 'fr' ? 'Non rapprochées' : 'Unmatched')}
                                  </MenuItem>
                                </MenuList>
                              </ClickAwayListener>
                            </Paper>
                          </Fade>
                        )}
                      </Popper>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => {}}
                        size="small"
                        sx={{ height: '32px' }}
                        disabled={true}
                      >
                        {dictionary?.navigation?.approveSelection || 'Approve Selection'} (0)
                      </Button>
                      <ShortcutsDropdown shortcuts={shortcuts} />
                      <IconButton
                        onClick={handleReconciliationTablesFullscreenToggle}
                        aria-label={isReconciliationTablesFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        className="text-textPrimary"
                        size="small"
                        sx={{ 
                          padding: '4px',
                          '& svg': {
                            fontSize: '1.75rem !important',
                            width: '1.75rem',
                            height: '1.75rem'
                          }
                        }}
                      >
                        {isReconciliationTablesFullscreen ? <FullscreenExit /> : <Fullscreen />}
                      </IconButton>
                    </Box>
                  </Box>
                  <Grid container spacing={1}>
                    {/* Bank Reconciliation Table */}
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ flex: 1, mt: 1 }}>
                    {bankTransactions.length > 0 && (
                      <Table3DSheet 
                        type="bank" 
                        title=""
                        paymentClasses={paymentClasses}
                        searchValue={bankSearchQuery}
                        onSearchChange={setBankSearchQuery}
                        paymentClassFilter={bankPaymentClassFilter}
                        onPaymentClassFilterChange={setBankPaymentClassFilter}
                        dictionary={dictionary}
                        hideHeader={true}
                      >
                        <TableContainer 
                          ref={bankTableScrollRef}
                          component={Paper} 
                          variant="outlined" 
                          sx={{ 
                            maxHeight: { xs: 460, md: 'calc(100vh - 160px)' }, 
                            width: '100%', 
                            margin: 0,
                            overflowY: 'auto',
                            overflowX: 'auto'
                          }}
                        >
                          <Table size="small" stickyHeader sx={{ tableLayout: 'auto', width: '100%' }}>
                          <TableHead>
                            <TableRow sx={{ 
                              height: '56.8px !important', 
                              minHeight: '56.8px !important', 
                              maxHeight: '56.8px !important',
                              '& .MuiTableCell-root': {
                                height: '56.8px !important',
                                minHeight: '56.8px !important',
                                maxHeight: '56.8px !important',
                                lineHeight: '1.2 !important',
                                verticalAlign: 'middle !important',
                                boxSizing: 'border-box !important'
                              }
                            }}>
                              <TableCell 
                                component="th" 
                                align="center"
                                className="MuiTableCell-head" 
                                sx={{ 
                                  padding: '4px',
                                  position: 'sticky',
                                  left: 0,
                                  top: 0,
                                  zIndex: 11,
                                  width: '50px',
                                  minWidth: '50px',
                                  maxWidth: '50px',
                                  height: '56.8px !important',
                                  minHeight: '56.8px !important',
                                  maxHeight: '56.8px !important',
                                  lineHeight: '1.2 !important',
                                  verticalAlign: 'middle !important',
                                  boxSizing: 'border-box !important'
                                }}
                              >
                              </TableCell>
                              {isColumnVisible('bank-ledger-entries', 'operation_date', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="operation_date"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={bankColumnWidths['operation_date']}
                                    tableType="bank"
                                    component="th" 
                                    className="MuiTableCell-head"
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.operationDate || 'Operation Date')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'label', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="label"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={bankColumnWidths['label'] || 250}
                                    tableType="bank"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      boxSizing: 'border-box !important',
                                      verticalAlign: 'middle !important',
                                      minWidth: bankColumnWidths['label'] || 250, 
                                      width: bankColumnWidths['label'] || 250,
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.label || 'Label')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'value_date', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="value_date"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={bankColumnWidths['value_date']}
                                    tableType="bank"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.valueDate || 'Value Date')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'debit', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="debit"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={bankColumnWidths['debit']}
                                    tableType="bank"
                                    component="th" 
                                    align="right" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.debit || 'Debit')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'credit', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="credit"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={bankColumnWidths['credit']}
                                    tableType="bank"
                                    component="th" 
                                    align="right" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.credit || 'Credit')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'amount', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="amount"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={bankColumnWidths['amount']}
                                    tableType="bank"
                                    component="th" 
                                    align="right" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.amount || 'Amount')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'payment_class', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="payment_class"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={bankColumnWidths['payment_class']}
                                    tableType="bank"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.paymentClass || 'Payment Class')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'payment_status', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="payment_status"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={bankColumnWidths['payment_status']}
                                    tableType="bank"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.paymentStatus || 'Payment Status')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'type', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="type"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={bankColumnWidths['type']}
                                    tableType="bank"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.type || 'Type')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'ref', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="ref"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={bankColumnWidths['ref']}
                                    tableType="bank"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.ref || 'Reference')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'date_ref', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="date_ref"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={bankColumnWidths['date_ref']}
                                    tableType="bank"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.dateRef || 'Date Reference')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'document_reference', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="document_reference"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={bankColumnWidths['document_reference']}
                                    tableType="bank"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.documentRef || 'Document Reference')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('bank-ledger-entries', 'accounting_account', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="accounting_account"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={bankColumnWidths['accounting_account']}
                                    tableType="bank"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.accountingAccount || 'Accounting Account')}
                                  </ResizableTableCell>
                                )}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                              {filteredBankTransactions.map((tx: any) => {
                                const isLinked = hasLinkedCustomerTransactions(tx.id)
                                const isHighlighted = shouldHighlightBankTransaction(tx)
                                const isHighlightedFromCustomer = isHighlighted && (highlightedCustomerTransaction !== null || highlightedCustomerTransactions.size > 0)
                                const linkedCustomers = getLinkedCustomerTransactions(tx.id)
                                const isOneToMany = isOneToManyRelationship(tx.id)
                                // Check if transaction is origin or non-origin in group
                                const isOrigin = tx.is_origine === true || tx.is_origine === 'true' || tx.is_origine === 1
                                // Check if non-origin in group: explicitly set field OR derive from having internal_number, group_size > 1, and not being origin
                                const hasExplicitField = tx.is_non_origine_in_group === true || tx.is_non_origine_in_group === 'true' || tx.is_non_origine_in_group === 1
                                const isNonOriginInGroup = hasExplicitField || 
                                  (!isOrigin && tx.internal_number && tx.internal_number !== null && tx.internal_number !== '' && tx.group_size && tx.group_size > 1)
                                // Use should_be_colored from API: light green for matched non-origine or linked transactions, otherwise default
                                const shouldBeColored = tx.should_be_colored === true || tx.should_be_colored === 'true' || tx.should_be_colored === 1
                                const textColor = (shouldBeColored || isLinked) ? '#4caf50' : 'inherit'
                                
                                // Get bank taxes for this transaction
                                const allBankTaxes = cachedBankTaxes[tx.id] || []
                                
                                // Get the bank_transaction_id to use for tax comparison lookup
                                // In high matches table, it uses match.bank_transaction_id directly
                                // For non-origine transactions, use pre-computed lookup maps from sorted API
                                let bankTransactionIdForComparison: number = tx.id
                                
                                // Use pre-computed lookup maps from sorted API data to resolve origine transaction
                                if (!isOrigin) {
                                  // Try internal_number first (for REMISE EFFET transactions)
                                  if (tx.internal_number && origineTransactionLookup.internalNumberMap.has(tx.internal_number)) {
                                    bankTransactionIdForComparison = origineTransactionLookup.internalNumberMap.get(tx.internal_number)!
                                  }
                                  // If not found by internal_number, try ref (for PAYEMENT EFFET transactions)
                                  else if (tx.ref && origineTransactionLookup.refMap.has(tx.ref)) {
                                    bankTransactionIdForComparison = origineTransactionLookup.refMap.get(tx.ref)!
                                  }
                                }
                                
                                // Get matching customer taxes from tax comparison results
                                // Filter by matched_bank_transaction_id (same as high matches table does)
                                const matchingCustomerTaxes = taxComparisonResults.filter(tax => 
                                  tax.matched_bank_transaction_id === bankTransactionIdForComparison
                                )
                                
                                // When there are no comparison results, simply fall back to original circle logic
                                if (!isOrigin && matchingCustomerTaxes.length === 0) {
                                  // (no verbose logging)
                                }
                                
                                // Determine circle emoji for non-origine transactions based on comparison API status
                                // Check the status of the SPECIFIC tax type for this non-origine transaction
                                const isNonOrigin = !isOrigin
                                let circleEmoji: string | null = null
                                let circleTooltip: string = ''
                                if (isNonOrigin) {
                                  // Get the tax type from this non-origine transaction (e.g., 'tva', 'plo', 'com', 'agios')
                                  const txTaxType = (tx.type || '').toUpperCase()
                                  
                                  // If we have comparison results (from origine transaction), find this specific tax type
                                  if (matchingCustomerTaxes.length > 0) {
                                    // Find the comparison result for THIS specific tax type
                                    const specificTaxComparison = matchingCustomerTaxes.find(t => 
                                      (t.tax_type || '').toUpperCase() === txTaxType
                                    )
                                    
                                    if (specificTaxComparison) {
                                      // Normalize status: API might return 'matched' but we check for 'match'
                                      const status = specificTaxComparison.status === 'matched' ? 'match' : specificTaxComparison.status
                                      
                                      if (status === 'match') {
                                        circleEmoji = '🟢' // Green - this specific tax matches
                                        circleTooltip = `Non-origine: ${txTaxType} tax matched`
                                      } else if (status === 'mismatch') {
                                        circleEmoji = '🟡' // Yellow - this specific tax mismatches
                                        circleTooltip = `Non-origine: ${txTaxType} tax mismatches`
                                      } else if (status === 'missing') {
                                        circleEmoji = '🔴' // Red - this specific tax is missing
                                        circleTooltip = `Non-origine: ${txTaxType} tax missing`
                                      } else {
                                        // Unknown status, default to yellow
                                        circleEmoji = '🟡'
                                        circleTooltip = `Non-origine: ${txTaxType} tax status unknown`
                                      }
                                    } else {
                                      // This specific tax type not found in comparison results
                                      // Fall through to fallback logic
                                    }
                                  }
                                  
                                  // Fallback to original logic if no comparison results or tax type not found
                                  if (!circleEmoji) {
                                    // Fallback to original logic if no comparison results
                                    if (shouldBeColored) {
                                      circleEmoji = '🟢' // Green - origine matched
                                      circleTooltip = 'Non-origine: Origine matched'
                                    } else if (isNonOriginInGroup) {
                                      circleEmoji = '🟡' // Yellow - origine not matched yet
                                      circleTooltip = 'Non-origine: Origine not matched yet'
                                    } else {
                                      circleEmoji = '🔴' // Red - unmatched or no group
                                      circleTooltip = 'Non-origine: Unmatched or no group'
                                    }
                                  }
                                }
                                // Get tax types already in comparison results (to avoid duplicates)
                                const comparisonTaxTypes = new Set(matchingCustomerTaxes.map(t => 
                                  (t.tax_type || '').toLowerCase()
                                ))
                                // Get all transaction labels that already exist as separate rows in the table
                                const existingTransactionLabels = new Set(filteredBankTransactions.map(t => 
                                  (t.label || '').toLowerCase().trim()
                                ))
                                // Filter out bank taxes that already exist in comparison results OR as separate transaction rows
                                const bankTaxes = allBankTaxes.filter(tax => {
                                  const taxType = (tax.tax_type || tax.tax_name || tax.label || '').toLowerCase()
                                  const taxLabel = (tax.label || tax.tax_name || '').toLowerCase().trim()
                                  // Skip if tax type is in comparison results OR tax label matches an existing transaction label
                                  return !comparisonTaxTypes.has(taxType) && !existingTransactionLabels.has(taxLabel)
                                })
                                
                                return (
                                <Fragment key={`bank-tx-wrapper-${tx.id}`}>
                                <TableRow 
                                  key={`reco-bank-${tx.id}`}
                                  ref={(el) => { bankTransactionRefs.current[tx.id] = el }}
                                  hover
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleBankTransactionClick(tx.id)
                                  }}
                                  sx={{ 
                                    height: '32px',
                                    minHeight: '32px',
                                    maxHeight: '32px',
                                    cursor: (isLinked || isNonOriginInGroup) ? 'pointer' : 'default',
                                    backgroundColor: isHighlighted ? '#e8f5e9' : '#ffffff',
                                    borderLeft: isLinked ? '3px solid #4caf50' : 'none',
                                    color: textColor,
                                    transition: isHighlightedFromCustomer ? 'all 0.3s ease-in-out' : 'none',
                                    boxShadow: isHighlightedFromCustomer ? '0 2px 8px rgba(76, 175, 80, 0.4)' : 'none',
                                    position: 'relative',
                                    animation: isHighlightedFromCustomer ? `${pulseBlueAnimation} 1.5s ease-in-out infinite` : 'none',
                                    fontWeight: tx.type === 'origine' ? 600 : 'normal',
                                    '& .MuiTableCell-root': {
                                      padding: '4px 8px',
                                      fontSize: '0.75rem',
                                      color: `${textColor} !important`,
                                      transition: isHighlightedFromCustomer ? 'all 0.2s ease-in-out' : 'none',
                                      verticalAlign: 'middle',
                                      lineHeight: '1.2',
                                      boxSizing: 'border-box',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      height: '32px',
                                      fontWeight: tx.type === 'origine' ? 600 : 'inherit',
                                      '& *': {
                                        color: `${textColor} !important`,
                                        fontWeight: tx.type === 'origine' ? 600 : 'inherit'
                                      }
                                    },
                                    '&:hover': {
                                      backgroundColor: isHighlighted ? '#c8e6c9' : '#f5f5f5',
                                      boxShadow: isHighlightedFromCustomer ? '0 4px 12px rgba(76, 175, 80, 0.5)' : 'none'
                                    }
                                  }}
                                  title={isLinked ? (isOneToMany ? (dictionary?.navigation?.linkedCustomerTransactionsOneToMany?.replace('{count}', String(linkedCustomers.length)) || `${linkedCustomers.length} transaction(s) client liée(s) (Un-à-plusieurs)`) : (dictionary?.navigation?.linkedCustomerTransactions?.replace('{count}', String(linkedCustomers.length)) || `${linkedCustomers.length} transaction(s) client liée(s)`)) : (dictionary?.navigation?.noLinkedCustomerTransactions || 'Aucune transaction client liée')}
                                >
                                  <MemoizedReconciliationCheckbox
                                    txId={tx.id}
                                    checked={selectedBankTransactions.has(tx.id)}
                                    onSelection={handleBankTransactionSelection}
                                    backgroundColor={isHighlighted ? '#e8f5e9' : '#ffffff'}
                                    isPulsing={isHighlightedFromCustomer}
                                    pulseAnimation={pulseBlueAnimation}
                                  />
                                  {isColumnVisible('bank-ledger-entries', 'operation_date', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['operation_date'], minWidth: bankColumnWidths['operation_date'] }}>{tx.operation_date}</TableCell>
                                  )}
                                  {isColumnVisible('bank-ledger-entries', 'label', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', minWidth: bankColumnWidths['label'] || 250, width: bankColumnWidths['label'] || 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {isNonOrigin && circleEmoji && (
                                          <span 
                                            style={{ fontSize: '10px', cursor: 'help' }}
                                            title={circleTooltip}
                                          >
                                            {circleEmoji}
                                          </span>
                                        )}
                                        <span>{tx.label}</span>
                                      </Box>
                                    </TableCell>
                                  )}
                                  {isColumnVisible('bank-ledger-entries', 'value_date', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['value_date'], minWidth: bankColumnWidths['value_date'] }}>{tx.value_date}</TableCell>
                                  )}
                                  {isColumnVisible('bank-ledger-entries', 'debit', pathname) && (
                                    <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['debit'], minWidth: bankColumnWidths['debit'] }}>
                                      {tx.debit !== null && tx.debit !== undefined && tx.debit !== ''
                                        ? formatHighMatchAmount(tx.debit)
                                        : ''}
                                    </TableCell>
                                  )}
                                  {isColumnVisible('bank-ledger-entries', 'credit', pathname) && (
                                    <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['credit'], minWidth: bankColumnWidths['credit'] }}>
                                      {tx.credit !== null && tx.credit !== undefined && tx.credit !== ''
                                        ? formatHighMatchAmount(tx.credit)
                                        : ''}
                                    </TableCell>
                                  )}
                                  {isColumnVisible('bank-ledger-entries', 'amount', pathname) && (
                                    <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['amount'], minWidth: bankColumnWidths['amount'] }}>
                                      {tx.amount !== null && tx.amount !== undefined && tx.amount !== ''
                                        ? formatHighMatchAmount(tx.amount)
                                        : ''}
                                    </TableCell>
                                  )}
                                  {isColumnVisible('bank-ledger-entries', 'payment_class', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['payment_class'], minWidth: bankColumnWidths['payment_class'] }}>{tx.payment_class?.name || tx.payment_class || tx.payment_class_id || ''}</TableCell>
                                  )}
                                  {isColumnVisible('bank-ledger-entries', 'payment_status', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['payment_status'], minWidth: bankColumnWidths['payment_status'] }}>{
                                      (tx.payment_status && tx.payment_status.name)
                                      || paymentStatusMap[Number(tx.payment_status_id)]
                                      || paymentStatusMap[Number(tx.payment_status)]
                                      || tx.payment_status
                                      || tx.payment_status_id
                                      || ''
                                    }</TableCell>
                                  )}
                                  {isColumnVisible('bank-ledger-entries', 'type', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['type'], minWidth: bankColumnWidths['type'] }}>{tx.type ?? ''}</TableCell>
                                  )}
                                  {isColumnVisible('bank-ledger-entries', 'ref', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['ref'], minWidth: bankColumnWidths['ref'] }}>{tx.ref ?? ''}</TableCell>
                                  )}
                                  {isColumnVisible('bank-ledger-entries', 'date_ref', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['date_ref'], minWidth: bankColumnWidths['date_ref'] }}>{tx.date_ref ?? ''}</TableCell>
                                  )}
                                  {isColumnVisible('bank-ledger-entries', 'document_reference', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['document_reference'], minWidth: bankColumnWidths['document_reference'] }}>{tx.document_reference || ''}</TableCell>
                                  )}
                                  {isColumnVisible('bank-ledger-entries', 'accounting_account', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['accounting_account'], minWidth: bankColumnWidths['accounting_account'] }}>{tx.accounting_account || ''}</TableCell>
                                  )}
                              </TableRow>
                              {/* Bank Tax Rows */}
                              {bankTaxes.map((tax: any, taxIdx: number) => {
                                const taxType = tax.tax_type || tax.tax_name || tax.label || 'Tax'
                                const taxValue = tax.value || tax.tax_amount || tax.amount || 0
                                // Check if this tax has a matching customer tax
                                const matchingTax = matchingCustomerTaxes.find((t: any) => 
                                  (t.tax_type || '').toLowerCase() === (taxType || '').toLowerCase()
                                )
                                const hasMatchingCustomerTax = !!matchingTax
                                const taxStatus = matchingTax?.status || null
                                
                                return (
                                  <TableRow
                                    key={`bank-tax-${tx.id}-${taxIdx}`}
                                    sx={{
                                      height: '28px',
                                      backgroundColor: '#fafafa',
                                      borderLeft: hasMatchingCustomerTax ? '3px solid #4caf50' : 'none',
                                      '& .MuiTableCell-root': {
                                        padding: '2px 8px',
                                        fontSize: '0.7rem',
                                        paddingLeft: '20px',
                                        fontStyle: 'italic',
                                        height: '28px'
                                      }
                                    }}
                                  >
                                    <TableCell></TableCell>
                                    {isColumnVisible('bank-ledger-entries', 'operation_date', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'label', pathname) && (
                                      <TableCell sx={{ paddingLeft: '20px' }}>
                                        {hasMatchingCustomerTax && <span style={{ color: '#4caf50', marginRight: '4px' }}>✓</span>}
                                        <span>💰 {taxType}</span>
                                      </TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'value_date', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'debit', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'credit', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'amount', pathname) && (
                                      <TableCell align="right">{formatTaxValue(taxValue)}</TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'payment_class', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'payment_status', pathname) && (
                                      <TableCell>
                                        {taxStatus && (
                                          <span style={{ 
                                            color: taxStatus === 'match' ? '#4caf50' : taxStatus === 'mismatch' ? '#f44336' : '#ff9800',
                                            fontSize: '0.65rem'
                                          }}>
                                            {taxStatus}
                                          </span>
                                        )}
                                      </TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'type', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'ref', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'date_ref', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'document_reference', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('bank-ledger-entries', 'accounting_account', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                  </TableRow>
                                )
                              })}
                              </Fragment>
                                )
                              })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      </Table3DSheet>
                      )}
                      </Box>
                    </Grid>

                    {/* Customer Reconciliation Table */}
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ flex: 1, mt: 1 }}>
                    {customerTransactions.length > 0 && (
                      <Table3DSheet 
                        type="customer" 
                        title=""
                        paymentClasses={paymentClasses}
                        searchValue={customerSearchQuery}
                        onSearchChange={setCustomerSearchQuery}
                        paymentClassFilter={customerPaymentClassFilter}
                        onPaymentClassFilterChange={setCustomerPaymentClassFilter}
                        dictionary={dictionary}
                        hideHeader={true}
                      >
                        <TableContainer 
                          ref={customerTableScrollRef}
                          component={Paper} 
                          variant="outlined" 
                          sx={{ 
                            maxHeight: { xs: 460, md: 'calc(100vh - 160px)' }, 
                            width: '100%', 
                            margin: 0,
                            overflowY: 'auto',
                            overflowX: 'auto'
                          }}
                        >
                          <Table size="small" stickyHeader sx={{ tableLayout: 'auto', width: '100%' }}>
                          <TableHead>
                            <TableRow sx={{ 
                              height: '56.8px !important', 
                              minHeight: '56.8px !important', 
                              maxHeight: '56.8px !important',
                              '& .MuiTableCell-root': {
                                height: '56.8px !important',
                                minHeight: '56.8px !important',
                                maxHeight: '56.8px !important',
                                lineHeight: '1.2 !important',
                                verticalAlign: 'middle !important',
                                boxSizing: 'border-box !important'
                              }
                            }}>
                              <TableCell 
                                component="th" 
                                align="center"
                                className="MuiTableCell-head" 
                                sx={{ 
                                  padding: '4px',
                                  position: 'sticky',
                                  left: 0,
                                  top: 0,
                                  zIndex: 11,
                                  width: '50px',
                                  minWidth: '50px',
                                  maxWidth: '50px',
                                  height: '56.8px !important',
                                  minHeight: '56.8px !important',
                                  maxHeight: '56.8px !important',
                                  lineHeight: '1.2 !important',
                                  verticalAlign: 'middle !important',
                                  boxSizing: 'border-box !important'
                                }}
                              >
                              </TableCell>
                              {isColumnVisible('customer-ledger-entries', 'accounting_date', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="accounting_date"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={customerColumnWidths['accounting_date']}
                                    tableType="customer"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.accountingDate || 'Accounting Date')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('customer-ledger-entries', 'description', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="description"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={customerColumnWidths['description'] || 250}
                                    tableType="customer"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px',
                                      minHeight: '56.8px',
                                      maxHeight: '56.8px',
                                      fontSize: '0.75rem', 
                                      minWidth: customerColumnWidths['description'] || 250, 
                                      width: customerColumnWidths['description'] || 250,
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.description || 'Description')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('customer-ledger-entries', 'debit', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="debit"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={customerColumnWidths['debit']}
                                    tableType="customer"
                                    component="th" 
                                    align="right" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.debit || 'Debit')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('customer-ledger-entries', 'credit', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="credit"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={customerColumnWidths['credit']}
                                    tableType="customer"
                                    component="th" 
                                    align="right" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.credit || 'Credit')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('customer-ledger-entries', 'amount', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="amount"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={customerColumnWidths['amount']}
                                    tableType="customer"
                                    component="th" 
                                    align="right" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.amount || 'Amount')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('customer-ledger-entries', 'total_amount', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="total_amount"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={customerColumnWidths['total_amount']}
                                    tableType="customer"
                                    component="th" 
                                    align="right" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.totalAmount || 'Total Amount')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('customer-ledger-entries', 'payment_status', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="payment_status"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={customerColumnWidths['payment_status']}
                                    tableType="customer"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.paymentStatus || 'Payment Status')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('customer-ledger-entries', 'payment_type', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="payment_type"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={customerColumnWidths['payment_type']}
                                    tableType="customer"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.paymentType || 'Payment Type')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('customer-ledger-entries', 'due_date', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="due_date"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={customerColumnWidths['due_date']}
                                    tableType="customer"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.dueDate || 'Due Date')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('customer-ledger-entries', 'external_doc_number', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="external_doc_number"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={customerColumnWidths['external_doc_number']}
                                    tableType="customer"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.externalDocNumber || 'External Doc Number')}
                                  </ResizableTableCell>
                                )}
                                {isColumnVisible('customer-ledger-entries', 'document_number', pathname) && (
                                  <ResizableTableCell 
                                    columnKey="document_number"
                                    onResizeStart={handleResizeStart}
                                    columnWidth={customerColumnWidths['document_number']}
                                    tableType="customer"
                                    component="th" 
                                    className="MuiTableCell-head" 
                                    sx={{ 
                                      padding: '4px 8px', 
                                      height: '56.8px !important',
                                      minHeight: '56.8px !important',
                                      maxHeight: '56.8px !important',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.2 !important',
                                      verticalAlign: 'middle !important',
                                      boxSizing: 'border-box !important',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 10
                                    }}
                                  >
                                    {formatHeaderText(dictionary?.navigation?.documentNumber || 'Document Number')}
                                  </ResizableTableCell>
                                )}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                              {filteredCustomerTransactions.map((tx: any) => {
                                const isLinked = hasLinkedBankTransaction(tx.id)
                                const isHighlighted = highlightedCustomerTransaction === tx.id || highlightedCustomerTransactions.has(tx.id)
                                const isHighlightedFromBank = highlightedCustomerTransactions.has(tx.id)
                                const linkedBank = getLinkedBankTransaction(tx.id)
                                const isPartOfGroup = isPartOfOneToManyGroup(tx.id)
                                const groupedCustomers = getGroupedCustomerTransactions(tx.id)
                                const groupIndex = groupedCustomers.indexOf(tx.id)
                                const isFirstInGroup = groupIndex === 0
                                const isLastInGroup = groupIndex === groupedCustomers.length - 1
                                
                                // Get customer taxes from tax comparison results
                                const allCustomerTaxes = taxComparisonResults.filter(tax => 
                                  tax.customer_transaction_id === tx.id
                                )
                                // Get matching bank taxes (for status indicators)
                                const linkedBankId = linkedBank ? Number(linkedBank) : null
                                const matchingBankTaxes = linkedBankId ? taxComparisonResults.filter(tax => 
                                  tax.matched_bank_transaction_id === linkedBankId &&
                                  tax.customer_transaction_id === tx.id
                                ) : []
                                // Get cached customer taxes (to avoid duplicates)
                                const cachedCustTaxes = cachedCustomerTaxes[tx.id] || []
                                const cachedTaxTypes = new Set(cachedCustTaxes.map(t => 
                                  (t.tax_type || t.tax_name || t.label || '').toLowerCase()
                                ))
                                // Get all transaction descriptions that already exist as separate rows in the table
                                const existingCustomerDescriptions = new Set(filteredCustomerTransactions.map(t => 
                                  (t.description || '').toLowerCase().trim()
                                ))
                                // Use taxComparisonResults for display (has customer_tax and customer_total_tax from DB)
                                // These come from the tax comparison API which has the correct structure
                                const customerTaxes = allCustomerTaxes.filter(tax => {
                                  const taxType = (tax.tax_type || '').toLowerCase()
                                  // Skip if tax type is in cache (to avoid duplicates)
                                  return !cachedTaxTypes.has(taxType)
                                })

                                // ---------- ORIGINE DETECTION FOR CUSTOMER TX (SIDE-BY-SIDE VIEW) ----------
                                // Check if this customer transaction is origine
                                // 1) Direct flags on the customer transaction (type / is_origine)
                                // 2) Origine information on the linked bank transaction (matched or unmatched)
                                // 3) Fallback: if there are NO customerTaxes for this tx, treat it as origine (final row, not a tax row)

                                // 1) Direct flags on customer transaction
                                const hasTypeOrigine = tx.type === 'origine'
                                const hasIsOrigine = tx.is_origine === true || tx.is_origine === 'true' || tx.is_origine === 1

                                // 2) Linked bank transaction (matched or unmatched)
                                const linkedBankTx = linkedBank ? (
                                  filteredBankTransactions.find((btx: any) => btx.id === Number(linkedBank)) ||
                                  unmatchedBankTransactions.find((btx: any) => btx.id === Number(linkedBank))
                                ) : null
                                const linkedToOrigineBank = !!(linkedBankTx && linkedBankTx.type === 'origine')

                                // 3) Fallback: no customerTaxes → treat as origine
                                const hasNoCustomerTaxes = customerTaxes.length === 0

                                const isCustomerOrigine =
                                  hasTypeOrigine ||
                                  hasIsOrigine ||
                                  linkedToOrigineBank ||
                                  hasNoCustomerTaxes

                                // (removed verbose debug logging for customerTaxes array)
                                
                                // Determine circle emoji for customer transactions linked to bank non-origine transactions
                                // The circle icon represents the bank non-origine transaction's respective customer tax status
                                let circleEmoji: string | null = null
                                let circleTooltip: string = ''
                                if (linkedBankId) {
                                  // Find the linked bank transaction
                                  const linkedBankTx = filteredBankTransactions.find((btx: any) => btx.id === linkedBankId)
                                  if (linkedBankTx) {
                                    // Check if the linked bank transaction is non-origine (has type like 'tva', 'plo', 'com', 'agios')
                                    const bankTxType = (linkedBankTx.type || '').toUpperCase()
                                    const isBankNonOrigine = bankTxType && ['TVA', 'PLO', 'COM', 'AGIOS'].includes(bankTxType)
                                    
                                    if (isBankNonOrigine) {
                                      // Find the tax comparison result for this specific tax type
                                      const specificTaxComparison = matchingBankTaxes.find((t: any) => 
                                        (t.tax_type || '').toUpperCase() === bankTxType
                                      )
                                      
                                      if (specificTaxComparison) {
                                        // Normalize status: API might return 'matched' but we check for 'match'
                                        const status = specificTaxComparison.status === 'matched' ? 'match' : specificTaxComparison.status
                                        
                                        if (status === 'match') {
                                          circleEmoji = '🟢' // Green - this specific tax matches
                                          circleTooltip = `Linked to bank ${bankTxType} tax: Matched`
                                        } else if (status === 'mismatch') {
                                          circleEmoji = '🟡' // Yellow - this specific tax mismatches
                                          circleTooltip = `Linked to bank ${bankTxType} tax: Mismatch`
                                        } else if (status === 'missing') {
                                          circleEmoji = '🔴' // Red - this specific tax is missing
                                          circleTooltip = `Linked to bank ${bankTxType} tax: Missing`
                                        } else {
                                          // Unknown status, default to yellow
                                          circleEmoji = '🟡'
                                          circleTooltip = `Linked to bank ${bankTxType} tax: Status unknown`
                                        }
                                      } else {
                                        // Tax type not found in comparison results
                                        circleEmoji = '🟡'
                                        circleTooltip = `Linked to bank ${bankTxType} tax: No comparison result`
                                      }
                                    }
                                  }
                                }
                                
                                return (
                                <Fragment key={`customer-tx-wrapper-${tx.id}`}>
                                <TableRow 
                                  key={`reco-customer-${tx.id}`}
                                  ref={(el) => { customerTransactionRefs.current[tx.id] = el }}
                                  hover
                                  onClick={(e) => {
                              e.stopPropagation()
                              handleCustomerTransactionClick(tx.id)
                            }}
                                  sx={{ 
                                    height: '32px',
                                    minHeight: '32px',
                                    maxHeight: '32px',
                                    cursor: isLinked ? 'pointer' : 'default',
                                    backgroundColor: isHighlighted ? '#e8f5e9' : '#ffffff',
                                    borderLeft: isLinked ? '3px solid #4caf50' : 'none',
                                    color: isLinked ? '#4caf50' : 'inherit',
                                    transition: isHighlightedFromBank ? 'all 0.3s ease-in-out' : 'none',
                                    boxShadow: isHighlightedFromBank ? '0 2px 8px rgba(76, 175, 80, 0.4)' : 'none',
                                    position: 'relative',
                                    animation: isHighlightedFromBank ? `${pulseGreenAnimation} 1.5s ease-in-out infinite` : 'none',
                                    fontWeight: isCustomerOrigine ? 600 : 'normal',
                                    '& .MuiTableCell-root': {
                                      padding: '4px 8px',
                                      fontSize: '0.75rem',
                                      color: isLinked ? '#4caf50 !important' : 'inherit',
                                      transition: isHighlightedFromBank ? 'all 0.2s ease-in-out' : 'none',
                                      verticalAlign: 'middle',
                                      lineHeight: '1.2',
                                      boxSizing: 'border-box',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      height: '32px',
                                      fontWeight: isCustomerOrigine ? 600 : 'inherit',
                                      '& *': {
                                        color: isLinked ? '#4caf50 !important' : 'inherit',
                                        fontWeight: isCustomerOrigine ? 600 : 'inherit'
                                      }
                                    },
                                    '&:hover': {
                                      backgroundColor: isHighlighted ? '#c8e6c9' : '#f5f5f5',
                                      boxShadow: isHighlightedFromBank ? '0 4px 12px rgba(76, 175, 80, 0.5)' : 'none'
                                    }
                                  }}
                                  title={isLinked ? (isPartOfGroup ? (dictionary?.navigation?.linkedToBankTransactionGroup?.replace('{bankTransaction}', linkedBank || '').replace('{count}', String(groupedCustomers.length)) || `Lié à la transaction bancaire ${linkedBank || ''} (Partie d'un groupe de ${groupedCustomers.length})`) : (dictionary?.navigation?.linkedToBankTransaction?.replace('{bankTransaction}', linkedBank || '') || `Lié à la transaction bancaire ${linkedBank || ''}`)) : (dictionary?.navigation?.noLinkedBankTransaction || 'Aucune transaction bancaire liée')}
                                >
                                  <MemoizedReconciliationCheckbox
                                    txId={tx.id}
                                    checked={selectedCustomerTransactions.has(tx.id)}
                                    onSelection={handleCustomerTransactionSelection}
                                    backgroundColor={isHighlighted ? '#e8f5e9' : '#ffffff'}
                                    isPulsing={isHighlightedFromBank}
                                    pulseAnimation={pulseGreenAnimation}
                                  />
                                  {isColumnVisible('customer-ledger-entries', 'accounting_date', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['accounting_date'], minWidth: customerColumnWidths['accounting_date'] }}>{tx.accounting_date}</TableCell>
                                  )}
                                  {isColumnVisible('customer-ledger-entries', 'description', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', minWidth: customerColumnWidths['description'] || 250, width: customerColumnWidths['description'] || 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {circleEmoji && (
                                          <span 
                                            style={{ fontSize: '10px', cursor: 'help' }}
                                            title={circleTooltip}
                                          >
                                            {circleEmoji}
                                          </span>
                                        )}
                                        <Tooltip 
                                          title={tx.description || ''} 
                                          placement="bottom" 
                                          arrow
                                          componentsProps={{
                                            tooltip: {
                                              sx: {
                                                fontSize: '0.75rem',
                                                padding: '4px 8px',
                                                maxWidth: '200px',
                                                zIndex: 10000
                                              }
                                            },
                                            arrow: {
                                              sx: {
                                                fontSize: '0.75rem'
                                              }
                                            }
                                          }}
                                        >
                                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{tx.description}</span>
                                        </Tooltip>
                                      </Box>
                                    </TableCell>
                                  )}
                                  {isColumnVisible('customer-ledger-entries', 'debit', pathname) && (
                                    <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['debit'], minWidth: customerColumnWidths['debit'] }}>
                                      {tx.debit_amount !== null && tx.debit_amount !== undefined && tx.debit_amount !== ''
                                        ? formatHighMatchAmount(tx.debit_amount)
                                        : ''}
                                    </TableCell>
                                  )}
                                  {isColumnVisible('customer-ledger-entries', 'credit', pathname) && (
                                    <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['credit'], minWidth: customerColumnWidths['credit'] }}>
                                      {tx.credit_amount !== null && tx.credit_amount !== undefined && tx.credit_amount !== ''
                                        ? formatHighMatchAmount(tx.credit_amount)
                                        : ''}
                                    </TableCell>
                                  )}
                                  {isColumnVisible('customer-ledger-entries', 'amount', pathname) && (
                                    <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['amount'], minWidth: customerColumnWidths['amount'] }}>
                                      {tx.amount !== null && tx.amount !== undefined && tx.amount !== ''
                                        ? formatHighMatchAmount(tx.amount)
                                        : ''}
                                    </TableCell>
                                  )}
                                  {isColumnVisible('customer-ledger-entries', 'total_amount', pathname) && (
                                    <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['total_amount'], minWidth: customerColumnWidths['total_amount'] }}>
                                      {tx.total_amount !== null && tx.total_amount !== undefined && tx.total_amount !== ''
                                        ? formatHighMatchAmount(tx.total_amount)
                                        : ''}
                                    </TableCell>
                                  )}
                                  {isColumnVisible('customer-ledger-entries', 'payment_status', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['payment_status'], minWidth: customerColumnWidths['payment_status'] }}>{
                                      (tx.payment_status && tx.payment_status.name)
                                      || paymentStatusMap[Number(tx.payment_status_id)]
                                      || paymentStatusMap[Number(tx.payment_status)]
                                      || tx.payment_status
                                      || tx.payment_status_id
                                      || ''
                                    }</TableCell>
                                  )}
                                  {isColumnVisible('customer-ledger-entries', 'payment_type', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['payment_type'], minWidth: customerColumnWidths['payment_type'] }}>{tx.payment_type || ''}</TableCell>
                                  )}
                                  {isColumnVisible('customer-ledger-entries', 'due_date', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['due_date'], minWidth: customerColumnWidths['due_date'] }}>{tx.due_date || ''}</TableCell>
                                  )}
                                  {isColumnVisible('customer-ledger-entries', 'external_doc_number', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['external_doc_number'], minWidth: customerColumnWidths['external_doc_number'] }}>{tx.external_doc_number || ''}</TableCell>
                                  )}
                                  {isColumnVisible('customer-ledger-entries', 'document_number', pathname) && (
                                    <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['document_number'], minWidth: customerColumnWidths['document_number'] }}>{tx.document_number || ''}</TableCell>
                                  )}
                              </TableRow>
                              {/* Customer Tax Rows */}
                              {customerTaxes.map((tax: any, taxIdx: number) => {
                                const taxType = tax.tax_type || 'Tax'
                                // amount column uses customer_tax (individual amount), total_amount column uses customer_total_tax (total from API)
                                // IMPORTANT: Read values directly from tax object - do not modify
                                // Use bracket notation to avoid any getter/setter issues
                                const customerTaxAmount = tax['customer_tax'] || tax.customer_tax
                                const customerTotalTaxAmount = tax['customer_total_tax'] || tax.customer_total_tax
                                
                                // At least one value must exist (0 is a valid value, so check for null/undefined/empty string)
                                if ((customerTaxAmount === null || customerTaxAmount === undefined || customerTaxAmount === '') &&
                                    (customerTotalTaxAmount === null || customerTotalTaxAmount === undefined || customerTotalTaxAmount === '')) {
                                  console.warn('⚠️ Skipping tax row - both values are null/undefined/empty:', { taxType, tax })
                                  return null
                                }
                                
                                // Convert to numbers and make negative (since they're in debit column)
                                const formatNegativeValue = (value: any, fieldName: string): number | null => {
                                  // 0 is a valid value, so only check for null/undefined/empty string
                                  if (value === null || value === undefined || value === '') {
                                    return null
                                  }
                                  const num = typeof value === 'string' 
                                    ? parseFloat(value.replace(/\s/g, '').replace(',', '.')) 
                                    : Number(value)
                                  if (isNaN(num)) {
                                    return null
                                  }
                                  const negativeValue = -Math.abs(num)
                                  return negativeValue
                                }
                                
                                const amountValue = formatNegativeValue(customerTaxAmount, 'customer_tax (amount)')
                                const totalAmountValue = formatNegativeValue(customerTotalTaxAmount, 'customer_total_tax (total_amount)')
                                
                                                                
                                // Check if this tax has a matching bank tax
                                const matchingTax = matchingBankTaxes.find((t: any) => 
                                  (t.tax_type || '').toLowerCase() === (taxType || '').toLowerCase()
                                )
                                const hasMatchingBankTax = !!matchingTax
                                const taxStatus = matchingTax?.status || null
                                
                                // Create unique ID for this tax row
                                const taxRowId = `tax-${tx.id}-${taxIdx}`
                                
                                // Determine circle emoji based on tax status
                                let taxCircleEmoji: string = ''
                                let taxCircleTooltip: string = ''
                                // Handle both 'matched' and 'match' status values from API
                                if (taxStatus) {
                                  const statusLower = String(taxStatus).toLowerCase().trim()
                                  
                                  if (statusLower === 'match' || statusLower === 'matched') {
                                    taxCircleEmoji = '🟢'
                                    taxCircleTooltip = 'Tax matched'
                                  } else if (statusLower === 'mismatch') {
                                    taxCircleEmoji = '🟡'
                                    taxCircleTooltip = 'Tax mismatch'
                                  } else if (statusLower === 'missing') {
                                    taxCircleEmoji = '🔴'
                                    taxCircleTooltip = 'Tax missing'
                                  } else {
                                    taxCircleEmoji = '🟡'
                                    taxCircleTooltip = `Tax status: ${statusLower}`
                                  }
                                }
                                
                                // Use parent transaction's background color
                                const taxRowBgColor = isHighlighted ? '#e8f5e9' : '#ffffff'
                                
                                return (
                                  <Fragment key={`customer-tax-${tx.id}-${taxIdx}`}>
                                  <TableRow
                                    key={`customer-tax-${tx.id}-${taxIdx}`}
                                    hover
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // Track clicked tax row - toggle on/off
                                      setClickedTransactionIds(prev => {
                                        const taxRowId = `tax-${tx.id}-${taxIdx}`
                                        console.log('🟢🟢🟢 Tax row clicked:', {
                                          taxRowId,
                                          customerTxId: tx.id,
                                          taxIdx,
                                          prevIds: prev,
                                          alreadyIncluded: prev.includes(taxRowId)
                                        })
                                        if (!prev.includes(taxRowId)) {
                                          const newIds = [...prev, taxRowId]
                                          console.log('✅✅✅ Adding tax row to clickedTransactionIds:', newIds)
                                          return newIds
                                        }
                                        const filteredIds = prev.filter(id => id !== taxRowId)
                                        console.log('🔄 Removing tax row from clickedTransactionIds:', filteredIds)
                                        return filteredIds
                                      })
                                    }}
                                    sx={{
                                      height: '28px',
                                      backgroundColor: taxRowBgColor,
                                      borderLeft: hasMatchingBankTax ? '3px solid #4caf50' : 'none',
                                      color: isLinked ? '#4caf50' : 'inherit',
                                      cursor: 'pointer',
                                      '& .MuiTableCell-root': {
                                        padding: '4px 8px',
                                        fontSize: '0.75rem',
                                        height: '28px',
                                        verticalAlign: 'middle',
                                        lineHeight: '1.2',
                                        boxSizing: 'border-box',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        color: isLinked ? '#4caf50 !important' : 'inherit',
                                        '& *': {
                                          color: isLinked ? '#4caf50 !important' : 'inherit'
                                        }
                                      },
                                      '&:hover': {
                                        backgroundColor: isHighlighted ? '#c8e6c9' : '#f5f5f5',
                                        '& .MuiTableCell-root': {
                                          backgroundColor: 'transparent'
                                        }
                                      }
                                    }}
                                  >
                                    <MemoizedReconciliationCheckbox
                                      txId={taxRowId}
                                      checked={selectedCustomerTransactions.has(taxRowId)}
                                      onSelection={handleCustomerTransactionSelection}
                                      backgroundColor={taxRowBgColor}
                                    />
                                    {isColumnVisible('customer-ledger-entries', 'accounting_date', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('customer-ledger-entries', 'description', pathname) && (
                                      <TableCell sx={{ paddingLeft: '20px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          {taxCircleEmoji && (
                                            <span 
                                              style={{ fontSize: '10px', cursor: 'help' }}
                                              title={taxCircleTooltip}
                                            >
                                              {taxCircleEmoji}
                                            </span>
                                          )}
                                          <span>{taxType}</span>
                                        </Box>
                                      </TableCell>
                                    )}
                                    {isColumnVisible('customer-ledger-entries', 'debit', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('customer-ledger-entries', 'credit', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('customer-ledger-entries', 'amount', pathname) && (
                                      <TableCell align="right">{amountValue !== null ? formatTaxValue(amountValue) : '-'}</TableCell>
                                    )}
                                    {isColumnVisible('customer-ledger-entries', 'total_amount', pathname) && (
                                      <TableCell align="right">{totalAmountValue !== null ? formatTaxValue(totalAmountValue) : '-'}</TableCell>
                                    )}
                                    {isColumnVisible('customer-ledger-entries', 'payment_status', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('customer-ledger-entries', 'payment_type', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('customer-ledger-entries', 'due_date', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('customer-ledger-entries', 'external_doc_number', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                    {isColumnVisible('customer-ledger-entries', 'document_number', pathname) && (
                                      <TableCell></TableCell>
                                    )}
                                  </TableRow>
                                  </Fragment>
                                )
                              }).filter(Boolean)}
                              </Fragment>
                                )
                              })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      </Table3DSheet>
                      )}
                      </Box>
                    </Grid>
                  </Grid>
                  {/* Balance Sections */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mt={3} mb={2} sx={{ width: '100%', flexShrink: 0 }}>
                    {/* Left group: Solde + Écart */}
                    <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                      {/* Solde Section - Display cumulative balance when transaction is clicked */}
                      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        {renderIcon(selectedIcons.balance, 'warning')}
                        <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                          {dictionary?.navigation?.balance || 'Solde'}:
                        </Typography>
                        {currentSolde !== null ? (
                          <Typography
                            variant="body1"
                            color="warning.main"
                            fontWeight={600}
                            sx={{ mt: 0.25 }}
                          >
                            {currentSolde.toLocaleString('fr-FR', {
                              minimumFractionDigits: 3,
                              maximumFractionDigits: 3,
                              useGrouping: true
                            })}
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.25, fontStyle: 'italic' }}
                          >
                            {dictionary?.navigation?.clickTransactionToSeeBalance || 'Cliquez sur une transaction pour voir le solde'}
                          </Typography>
                        )}
                      </Box>
                      
                      {/* Écart Section */}
                      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        <Box sx={{ color: ecartColor }}>
                          {renderIcon(selectedIcons.ecart, 'inherit')}
                        </Box>
                        <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                          {dictionary?.navigation?.ecart || 'Écart'}:
                        </Typography>
                        <TextField
                          size="small"
                          type="text"
                          value={ecartInput}
                          InputProps={{ readOnly: true }}
                          placeholder="0.000"
                          sx={{ 
                            maxWidth: 180, 
                            mt: 0.25,
                            '& .MuiInputBase-root': {
                              height: '32px',
                              minHeight: '32px'
                            },
                            '& .MuiInputBase-input': {
                              padding: '6px 8px',
                              height: '32px',
                              boxSizing: 'border-box',
                              color: ecartColor
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    
                    {/* Right group: Total difference + Solde final */}
                    <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                      {/* Total Difference Section */}
                      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        {renderIcon(selectedIcons.totalDifference, 'error')}
                        <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                          {dictionary?.navigation?.totalDifference || 'Total difference of ledger entry'}:
                        </Typography>
                        <TextField
                          size="small"
                          type="text"
                          value={totalDifferenceInput}
                          InputProps={{ readOnly: true }}
                          placeholder="0.000"
                          sx={{ 
                            maxWidth: 180, 
                            mt: 0.25,
                            '& .MuiInputBase-root': {
                              height: '32px',
                              minHeight: '32px'
                            },
                            '& .MuiInputBase-input': {
                              padding: '6px 8px',
                              height: '32px',
                              boxSizing: 'border-box'
                            }
                          }}
                        />
                      </Box>
                      
                      {/* Ending Balance Section */}
                      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                      {(() => {
                        // Check if endingBalance equals or differs from statementEndingBalance
                        const bothSet = endingBalance !== null && statementEndingBalance !== null
                        const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
                        const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
                        const iconColor = isEqual ? 'success' : isDifferent ? 'error' : 'secondary'
                        return renderIcon(selectedIcons.endingBalance, iconColor)
                      })()}
                      <Typography 
                        variant="body2" 
                        fontWeight={500} 
                        sx={{ 
                          fontSize: '0.857rem',
                          color: (() => {
                            const bothSet = endingBalance !== null && statementEndingBalance !== null
                            const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
                            const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
                            if (isEqual) return 'success.main'
                            if (isDifferent) return 'error.main'
                            return 'text.primary'
                          })()
                        }}
                      >
                        {dictionary?.navigation?.endingBalance || 'Ending balance of ledger entry'}:
                      </Typography>
                      <TextField
                        size="small"
                        type="text"
                        value={endingBalanceInput}
                        onChange={e => {
                          setEndingBalanceInput(e.target.value)
                          setEndingBalanceInputError('')
                        }}
                        onBlur={() => {
                          if (!endingBalanceInput.trim()) {
                            setEndingBalance(null)
                            return
                          }

                          // Remove spaces (thousands separators) and replace comma with dot for parsing
                          const cleaned = endingBalanceInput.replace(/\s/g, '').replace(',', '.')
                          const parsed = Number(cleaned)

                          if (Number.isNaN(parsed)) {
                            setEndingBalanceInputError(
                              dictionary?.navigation?.invalidBeginningBalance || 'Please enter a valid number'
                            )
                            return
                          }

                          setEndingBalance(parsed)
                          
                          // Format the input with spaces after parsing, and dot as decimal separator
                          const formatted = parsed
                            .toLocaleString('fr-FR', {
                              minimumFractionDigits: 3,
                              maximumFractionDigits: 3,
                              useGrouping: true
                            })
                            .replace(',', '.')
                          setEndingBalanceInput(formatted)
                        }}
                        placeholder="0.000"
                        error={!!endingBalanceInputError}
                        helperText={endingBalanceInputError || ''}
                        sx={{ 
                          maxWidth: 180, 
                          mt: 0.25,
                          '& .MuiInputBase-root': {
                            height: '32px',
                            minHeight: '32px'
                          },
                          '& .MuiInputBase-input': {
                            padding: '6px 8px',
                            height: '32px',
                            boxSizing: 'border-box',
                            color: (() => {
                              const bothSet = endingBalance !== null && statementEndingBalance !== null
                              const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
                              const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
                              if (isEqual) return 'success.main'
                              if (isDifferent) return 'error.main'
                              return undefined
                            })()
                          }
                        }}
                      />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              {/* Fullscreen Dialog for Reconciliation Tables */}
              <Dialog
                open={isReconciliationTablesFullscreen}
                onClose={handleReconciliationTablesFullscreenToggle}
                maxWidth={false}
                fullWidth
                PaperProps={{
                  sx: {
                    m: 0,
                    width: '100vw',
                    height: '100vh',
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    borderRadius: 0,
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <DialogContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexShrink: 0 }}>
                    <Box display="flex" gap={4} alignItems="center">
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          {dictionary?.navigation?.bankLedgerEntries || 'Bank Ledger Entries'}
                          {bankTransactions.length > 0 && ` (${bankTransactions.length})`}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          {dictionary?.navigation?.customerLedgerEntries || 'Customer Ledger Entries'}
                          {customerTransactions.length > 0 && ` (${customerTransactions.length})`}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" gap={2} alignItems="center">
                      <ButtonGroup variant="outlined" color="success" size="small" sx={{ 
                        height: '32px',
                        gap: 0,
                        '& .MuiButton-root': {
                          border: 'none !important',
                          borderLeft: 'none !important',
                          borderRight: 'none !important',
                          borderTop: 'none !important',
                          borderBottom: 'none !important',
                          margin: 0,
                          marginLeft: 0,
                          marginRight: 0,
                          '&:not(:last-of-type)': {
                            borderRight: 'none !important',
                            marginRight: 0
                          }
                        }
                      }}>
                        <Button
                          onClick={handleSelectAllBankTransactions}
                          sx={{
                            height: '32px',
                            border: 'none !important',
                            paddingRight: '2px !important',
                            marginRight: 0,
                            color: theme => theme.palette.success.main,
                            '&:hover': {
                              border: 'none !important',
                              color: theme => theme.palette.success.dark,
                              backgroundColor: 'transparent'
                            }
                          }}
                        >
                          {dictionary?.navigation?.selectAll || 'Select All'}
                        </Button>
                        <Button
                          ref={selectAllMenuAnchorRef}
                          onClick={() => setSelectAllMenuOpen(prev => !prev)}
                          sx={{
                            minWidth: '16px',
                            width: '16px',
                            height: '32px',
                            paddingLeft: '2px !important',
                            paddingRight: '2px !important',
                            paddingTop: 0,
                            paddingBottom: 0,
                            marginLeft: 0,
                            border: 'none !important',
                            color: theme => theme.palette.success.main,
                            '&:hover': {
                              border: 'none !important',
                              color: theme => theme.palette.success.dark,
                              backgroundColor: 'transparent'
                            },
                            '& .MuiSvgIcon-root': {
                              fontSize: '1rem',
                              margin: 0
                            }
                          }}
                        >
                          <ArrowDropDown />
                        </Button>
                      </ButtonGroup>
                      <Popper
                        open={selectAllMenuOpen}
                        anchorEl={selectAllMenuAnchorRef.current}
                        placement="bottom-start"
                        transition
                        disablePortal
                        sx={{ zIndex: 1300 }}
                      >
                        {({ TransitionProps }) => (
                          <Fade {...TransitionProps}>
                            <Paper className="shadow-lg" sx={{ border: 'none' }}>
                              <ClickAwayListener onClickAway={(e) => {
                                if (selectAllMenuAnchorRef.current && selectAllMenuAnchorRef.current.contains(e.target as HTMLElement)) {
                                  return
                                }
                                setSelectAllMenuOpen(false)
                              }}>
                                <MenuList autoFocusItem={selectAllMenuOpen} sx={{ py: 0.5, px: 0 }}>
                                  <MenuItem 
                                    onClick={(e) => {
                                      handleSelectAllBank(e)
                                      setSelectAllMenuOpen(false)
                                    }}
                                    sx={{ fontSize: '0.75rem', py: 0.5, px: 0.75, minHeight: 'auto' }}
                                  >
                                    {dictionary?.navigation?.all || (lang === 'fr' ? 'Tout' : 'All')}
                                  </MenuItem>
                                  <MenuItem 
                                    onClick={(e) => {
                                      handleSelectNoneBank(e)
                                      setSelectAllMenuOpen(false)
                                    }}
                                    sx={{ fontSize: '0.75rem', py: 0.5, px: 0.75, minHeight: 'auto' }}
                                  >
                                    {dictionary?.navigation?.none || (lang === 'fr' ? 'Aucun' : 'None')}
                                  </MenuItem>
                                  <MenuItem 
                                    onClick={(e) => {
                                      handleSelectMatchedBank(e)
                                      setSelectAllMenuOpen(false)
                                    }}
                                    sx={{ fontSize: '0.75rem', py: 0.5, px: 0.75, minHeight: 'auto' }}
                                  >
                                    {dictionary?.navigation?.matched || (lang === 'fr' ? 'Rapprochées' : 'Matched')}
                                  </MenuItem>
                                  <MenuItem 
                                    onClick={(e) => {
                                      handleSelectUnmatchedBank(e)
                                      setSelectAllMenuOpen(false)
                                    }}
                                    sx={{ fontSize: '0.75rem', py: 0.5, px: 0.75, minHeight: 'auto' }}
                                  >
                                    {dictionary?.navigation?.unmatched || (lang === 'fr' ? 'Non rapprochées' : 'Unmatched')}
                                  </MenuItem>
                                </MenuList>
                              </ClickAwayListener>
                            </Paper>
                          </Fade>
                        )}
                      </Popper>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => {}}
                        size="small"
                        sx={{ height: '32px' }}
                        disabled={true}
                      >
                        {dictionary?.navigation?.approveSelection || 'Approve Selection'} (0)
                      </Button>
                      <ShortcutsDropdown shortcuts={shortcuts} />
                      <IconButton
                        onClick={handleReconciliationTablesFullscreenToggle}
                        aria-label="Exit fullscreen"
                        className="text-textPrimary"
                        sx={{ 
                          padding: '4px',
                          '& svg': {
                            fontSize: '1.625rem !important',
                            width: '1.625rem',
                            height: '1.625rem'
                          }
                        }}
                      >
                        <FullscreenExit />
                      </IconButton>
                    </Box>
                  </Box>
                  {/* Balance Section */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mb={1} flexShrink={0}>
                    {/* Beginning Balance - Left */}
                    <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                      <CreditCard color="success" />
                      <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                        {dictionary?.navigation?.beginningBalance || 'Beginning balance of ledger entry'}:
                      </Typography>
                      {!beginningBalanceExtracted && (
                        <TextField
                          size="small"
                          type="number"
                          value={beginningBalanceInput}
                          onChange={e => {
                            setBeginningBalanceInput(e.target.value)
                            setBeginningBalanceInputError('')
                          }}
                          onBlur={() => {
                            if (!beginningBalanceInput.trim()) {
                              setBeginningBalance(null)
                              return
                            }

                            const parsed = Number(beginningBalanceInput.replace(',', '.'))

                            if (Number.isNaN(parsed)) {
                              setBeginningBalanceInputError(
                                dictionary?.navigation?.invalidBeginningBalance || 'Please enter a valid number'
                              )
                              return
                            }

                            setBeginningBalance(parsed)
                          }}
                          placeholder="0.000"
                          error={!!beginningBalanceInputError}
                          helperText={beginningBalanceInputError || ''}
                          sx={{ 
                            maxWidth: 180, 
                            mt: 0.25,
                            '& .MuiInputBase-root': {
                              height: '32px',
                              minHeight: '32px'
                            },
                            '& .MuiInputBase-input': {
                              padding: '6px 8px',
                              height: '32px',
                              boxSizing: 'border-box'
                            }
                          }}
                        />
                      )}
                      {beginningBalanceExtracted && (
                        <Typography
                          variant="body1"
                          color="success.main"
                          fontWeight={600}
                        >
                          {beginningBalance !== null
                            ? beginningBalance.toLocaleString('fr-FR', {
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 3
                              })
                            : dictionary?.navigation?.notAvailable || 'N/A'}
                        </Typography>
                      )}
                    </Box>
                    
                    {/* Statement Ending Balance - Right */}
                    <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" sx={{ marginLeft: 'auto' }}>
                      {renderIcon(selectedIcons.statementEndingBalance, 'primary')}
                      <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                        {dictionary?.navigation?.statementEndingBalance || 'Statement ending balance of ledger entry'}:
                      </Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={statementEndingBalanceInput}
                        onChange={e => {
                          setStatementEndingBalanceInput(e.target.value)
                          setStatementEndingBalanceInputError('')
                        }}
                        onBlur={() => {
                          if (!statementEndingBalanceInput.trim()) {
                            setStatementEndingBalance(null)
                            return
                          }

                          const parsed = Number(statementEndingBalanceInput.replace(',', '.'))

                          if (Number.isNaN(parsed)) {
                            setStatementEndingBalanceInputError(
                              dictionary?.navigation?.invalidBeginningBalance || 'Please enter a valid number'
                            )
                            return
                          }

                          setStatementEndingBalance(parsed)
                        }}
                        placeholder="0.000"
                        error={!!statementEndingBalanceInputError}
                        helperText={statementEndingBalanceInputError || ''}
                        sx={{ 
                          maxWidth: 180, 
                          mt: 0.25,
                          '& .MuiInputBase-root': {
                            height: '32px',
                            minHeight: '32px'
                          },
                          '& .MuiInputBase-input': {
                            padding: '6px 8px',
                            height: '32px',
                            boxSizing: 'border-box'
                          }
                        }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <Grid container spacing={1}>
                      {/* Bank Reconciliation Table */}
                      <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ flex: 1, mt: 1 }}>
                          {bankTransactions.length > 0 && (
                            <Table3DSheet 
                              type="bank" 
                              title=""
                              paymentClasses={paymentClasses}
                              searchValue={bankSearchQuery}
                              onSearchChange={setBankSearchQuery}
                              paymentClassFilter={bankPaymentClassFilter}
                              onPaymentClassFilterChange={setBankPaymentClassFilter}
                              dictionary={dictionary}
                              hideHeader={true}
                            >
                              <TableContainer 
                                ref={bankTableScrollFullscreenRef}
                                component={Paper} 
                                variant="outlined" 
                                sx={{ 
                                  maxHeight: 'calc(100vh - 160px)', 
                                  width: '100%', 
                                  margin: 0,
                                  overflowY: 'auto',
                                  overflowX: 'auto'
                                }}
                              >
                                <Table size="small" stickyHeader>
                                  <TableHead>
                                    <TableRow sx={{ 
                                      height: '56.8px !important', 
                                      minHeight: '56.8px !important', 
                                      maxHeight: '56.8px !important',
                                      '& .MuiTableCell-root': {
                                        height: '56.8px !important',
                                        minHeight: '56.8px !important',
                                        maxHeight: '56.8px !important',
                                        lineHeight: '1.2 !important',
                                        verticalAlign: 'middle !important',
                                        boxSizing: 'border-box !important'
                                      }
                                    }}>
                                      <TableCell 
                                        component="th" 
                                        align="center"
                                        className="MuiTableCell-head" 
                                        sx={{ 
                                          padding: '4px',
                                          position: 'sticky',
                                          left: 0,
                                          top: 0,
                                          zIndex: 11,
                                          width: '50px',
                                          minWidth: '50px',
                                          maxWidth: '50px',
                                          height: '56.8px !important',
                                          minHeight: '56.8px !important',
                                          maxHeight: '56.8px !important',
                                          lineHeight: '1.2 !important',
                                          verticalAlign: 'middle !important',
                                          boxSizing: 'border-box !important'
                                        }}
                                      >
                                      </TableCell>
                                      {isColumnVisible('bank-ledger-entries', 'operation_date', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="operation_date"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={bankColumnWidths['operation_date']}
                                          tableType="bank"
                                          component="th" 
                                          className="MuiTableCell-head"
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px !important',
                                            minHeight: '56.8px !important',
                                            maxHeight: '56.8px !important',
                                            fontSize: '0.75rem',
                                            lineHeight: '1.2 !important',
                                            verticalAlign: 'middle !important',
                                            boxSizing: 'border-box !important',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.operationDate || 'Operation Date')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('bank-ledger-entries', 'label', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="label"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={bankColumnWidths['label'] || 250}
                                          tableType="bank"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px !important',
                                            minHeight: '56.8px !important',
                                            maxHeight: '56.8px !important',
                                            fontSize: '0.75rem', 
                                            lineHeight: '1.2 !important',
                                            verticalAlign: 'middle !important',
                                            boxSizing: 'border-box !important',
                                            minWidth: bankColumnWidths['label'] || 250, 
                                            width: bankColumnWidths['label'] || 250,
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.label || 'Label')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('bank-ledger-entries', 'value_date', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="value_date"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={bankColumnWidths['value_date']}
                                          tableType="bank"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px !important',
                                            minHeight: '56.8px !important',
                                            maxHeight: '56.8px !important',
                                            fontSize: '0.75rem',
                                            lineHeight: '1.2 !important',
                                            verticalAlign: 'middle !important',
                                            boxSizing: 'border-box !important',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.valueDate || 'Value Date')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('bank-ledger-entries', 'debit', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="debit"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={bankColumnWidths['debit']}
                                          tableType="bank"
                                          component="th" 
                                          align="right" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px !important',
                                            minHeight: '56.8px !important',
                                            maxHeight: '56.8px !important',
                                            fontSize: '0.75rem',
                                            lineHeight: '1.2 !important',
                                            verticalAlign: 'middle !important',
                                            boxSizing: 'border-box !important',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.debit || 'Debit')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('bank-ledger-entries', 'credit', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="credit"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={bankColumnWidths['credit']}
                                          tableType="bank"
                                          component="th" 
                                          align="right" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px !important',
                                            minHeight: '56.8px !important',
                                            maxHeight: '56.8px !important',
                                            fontSize: '0.75rem',
                                            lineHeight: '1.2 !important',
                                            verticalAlign: 'middle !important',
                                            boxSizing: 'border-box !important',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.credit || 'Credit')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('bank-ledger-entries', 'amount', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="amount"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={bankColumnWidths['amount']}
                                          tableType="bank"
                                          component="th" 
                                          align="right" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px !important',
                                            minHeight: '56.8px !important',
                                            maxHeight: '56.8px !important',
                                            fontSize: '0.75rem',
                                            lineHeight: '1.2 !important',
                                            verticalAlign: 'middle !important',
                                            boxSizing: 'border-box !important',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.amount || 'Amount')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('bank-ledger-entries', 'payment_class', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="payment_class"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={bankColumnWidths['payment_class']}
                                          tableType="bank"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px',
                                            minHeight: '56.8px',
                                            maxHeight: '56.8px',
                                            fontSize: '0.75rem',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.paymentClass || 'Payment Class')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('bank-ledger-entries', 'payment_status', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="payment_status"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={bankColumnWidths['payment_status']}
                                          tableType="bank"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px',
                                            minHeight: '56.8px',
                                            maxHeight: '56.8px',
                                            fontSize: '0.75rem',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.paymentStatus || 'Payment Status')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('bank-ledger-entries', 'type', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="type"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={bankColumnWidths['type']}
                                          tableType="bank"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px',
                                            minHeight: '56.8px',
                                            maxHeight: '56.8px',
                                            fontSize: '0.75rem',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.type || 'Type')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('bank-ledger-entries', 'ref', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="ref"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={bankColumnWidths['ref']}
                                          tableType="bank"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px',
                                            minHeight: '56.8px',
                                            maxHeight: '56.8px',
                                            fontSize: '0.75rem',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.ref || 'Reference')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('bank-ledger-entries', 'date_ref', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="date_ref"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={bankColumnWidths['date_ref']}
                                          tableType="bank"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px',
                                            minHeight: '56.8px',
                                            maxHeight: '56.8px',
                                            fontSize: '0.75rem',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.dateRef || 'Date Reference')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('bank-ledger-entries', 'document_reference', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="document_reference"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={bankColumnWidths['document_reference']}
                                          tableType="bank"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px',
                                            minHeight: '56.8px',
                                            maxHeight: '56.8px',
                                            fontSize: '0.75rem',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.documentRef || 'Document Reference')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('bank-ledger-entries', 'accounting_account', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="accounting_account"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={bankColumnWidths['accounting_account']}
                                          tableType="bank"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px',
                                            minHeight: '56.8px',
                                            maxHeight: '56.8px',
                                            fontSize: '0.75rem',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.accountingAccount || 'Accounting Account')}
                                        </ResizableTableCell>
                                      )}
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {filteredBankTransactions.map((tx: any) => {
                                      const isLinked = hasLinkedCustomerTransactions(tx.id)
                                      const isHighlighted = shouldHighlightBankTransaction(tx)
                                      const isHighlightedFromCustomer = isHighlighted && (highlightedCustomerTransaction !== null || highlightedCustomerTransactions.size > 0)
                                      const linkedCustomers = getLinkedCustomerTransactions(tx.id)
                                      const isOneToMany = isOneToManyRelationship(tx.id)
                                      // Check if transaction is origin or non-origin in group
                                      const isOrigin = tx.is_origine === true || tx.is_origine === 'true' || tx.is_origine === 1
                                      // Check if non-origin in group: explicitly set field OR derive from having internal_number, group_size > 1, and not being origin
                                      const hasExplicitField = tx.is_non_origine_in_group === true || tx.is_non_origine_in_group === 'true' || tx.is_non_origine_in_group === 1
                                      const isNonOriginInGroup = hasExplicitField || 
                                        (!isOrigin && tx.internal_number && tx.internal_number !== null && tx.internal_number !== '' && tx.group_size && tx.group_size > 1)
                                      // Use should_be_colored from API: light green for matched non-origine or linked transactions, otherwise default
                                      const shouldBeColored = tx.should_be_colored === true || tx.should_be_colored === 'true' || tx.should_be_colored === 1
                                      const textColor = (shouldBeColored || isLinked) ? '#4caf50' : 'inherit'
                                      
                                      // Get bank taxes for this transaction
                                      const allBankTaxes = cachedBankTaxes[tx.id] || []
                                      
                                      // Get the bank_transaction_id to use for tax comparison lookup
                                      // In high matches table, it uses match.bank_transaction_id directly
                                      // For non-origine transactions, use pre-computed lookup maps from sorted API
                                      let bankTransactionIdForComparison: number = tx.id
                                      
                                      if (!isOrigin) {
                                        // Use pre-computed lookup maps from sorted API data
                                        // Try internal_number first (for REMISE EFFET transactions)
                                        if (tx.internal_number && origineTransactionLookup.internalNumberMap.has(tx.internal_number)) {
                                          bankTransactionIdForComparison = origineTransactionLookup.internalNumberMap.get(tx.internal_number)!
                                        }
                                        // If not found by internal_number, try ref (for PAYEMENT EFFET transactions)
                                        else if (tx.ref && origineTransactionLookup.refMap.has(tx.ref)) {
                                          bankTransactionIdForComparison = origineTransactionLookup.refMap.get(tx.ref)!
                                        }
                                      }
                                      
                                      // Get matching customer taxes from tax comparison results
                                      // Filter by matched_bank_transaction_id (same as high matches table does)
                                      const matchingCustomerTaxes = taxComparisonResults.filter(tax => 
                                        tax.matched_bank_transaction_id === bankTransactionIdForComparison
                                      )
                                      
                                      // Determine circle emoji for non-origine transactions based on comparison API status
                                      // Check the status of the SPECIFIC tax type for this non-origine transaction
                                      const isNonOrigin = !isOrigin
                                      let circleEmoji: string | null = null
                                      let circleTooltip: string = ''
                                      if (isNonOrigin) {
                                        // Get the tax type from this non-origine transaction (e.g., 'tva', 'plo', 'com', 'agios')
                                        const txTaxType = (tx.type || '').toUpperCase()
                                        
                                        // If we have comparison results (from origine transaction), find this specific tax type
                                        if (matchingCustomerTaxes.length > 0) {
                                          // Find the comparison result for THIS specific tax type
                                          const specificTaxComparison = matchingCustomerTaxes.find(t => 
                                            (t.tax_type || '').toUpperCase() === txTaxType
                                          )
                                          
                                          if (specificTaxComparison) {
                                            // Normalize status: API might return 'matched' but we check for 'match'
                                            const status = specificTaxComparison.status === 'matched' ? 'match' : specificTaxComparison.status
                                            
                                            if (status === 'match') {
                                              circleEmoji = '🟢' // Green - this specific tax matches
                                              circleTooltip = `Non-origine: ${txTaxType} tax matched`
                                            } else if (status === 'mismatch') {
                                              circleEmoji = '🟡' // Yellow - this specific tax mismatches
                                              circleTooltip = `Non-origine: ${txTaxType} tax mismatches`
                                            } else if (status === 'missing') {
                                              circleEmoji = '🔴' // Red - this specific tax is missing
                                              circleTooltip = `Non-origine: ${txTaxType} tax missing`
                                            } else {
                                              // Unknown status, default to yellow
                                              circleEmoji = '🟡'
                                              circleTooltip = `Non-origine: ${txTaxType} tax status unknown`
                                            }
                                          }
                                        }
                                        
                                        // Fallback to original logic if no comparison results or tax type not found
                                        if (!circleEmoji) {
                                          if (shouldBeColored) {
                                            circleEmoji = '🟢' // Green - origine matched
                                            circleTooltip = 'Non-origine: Origine matched'
                                          } else if (isNonOriginInGroup) {
                                            circleEmoji = '🟡' // Yellow - origine not matched yet
                                            circleTooltip = 'Non-origine: Origine not matched yet'
                                          } else {
                                            circleEmoji = '🔴' // Red - unmatched or no group
                                            circleTooltip = 'Non-origine: Unmatched or no group'
                                          }
                                        }
                                      }
                                      // Get tax types already in comparison results (to avoid duplicates)
                                      const comparisonTaxTypes = new Set(matchingCustomerTaxes.map(t => 
                                        (t.tax_type || '').toLowerCase()
                                      ))
                                      // Get all transaction labels that already exist as separate rows in the table
                                      const existingTransactionLabels = new Set(filteredBankTransactions.map(t => 
                                        (t.label || '').toLowerCase().trim()
                                      ))
                                      // Filter out bank taxes that already exist in comparison results OR as separate transaction rows
                                      const bankTaxes = allBankTaxes.filter(tax => {
                                        const taxType = (tax.tax_type || tax.tax_name || tax.label || '').toLowerCase()
                                        const taxLabel = (tax.label || tax.tax_name || '').toLowerCase().trim()
                                        // Skip if tax type is in comparison results OR tax label matches an existing transaction label
                                        return !comparisonTaxTypes.has(taxType) && !existingTransactionLabels.has(taxLabel)
                                      })
                                      
                                      return (
                                      <Fragment key={`bank-tx-wrapper-fullscreen-${tx.id}`}>
                                      <TableRow 
                                        key={`reco-bank-fullscreen-${tx.id}`}
                                        ref={(el) => { bankTransactionRefs.current[tx.id] = el }}
                                        hover
                                        onClick={(e) => {
                                    e.stopPropagation()
                                    handleBankTransactionClick(tx.id)
                                  }}
                                        sx={{ 
                                          height: '32px',
                                          minHeight: '32px',
                                          maxHeight: '32px',
                                          cursor: (isLinked || isNonOriginInGroup) ? 'pointer' : 'default',
                                          backgroundColor: isHighlighted ? '#e8f5e9' : '#ffffff',
                                          borderLeft: isLinked ? '3px solid #4caf50' : 'none',
                                          color: textColor,
                                          transition: isHighlightedFromCustomer ? 'all 0.3s ease-in-out' : 'none',
                                          boxShadow: isHighlightedFromCustomer ? '0 2px 8px rgba(76, 175, 80, 0.4)' : 'none',
                                          position: 'relative',
                                          animation: isHighlightedFromCustomer ? `${pulseBlueAnimation} 1.5s ease-in-out infinite` : 'none',
                                          fontWeight: tx.type === 'origine' ? 600 : 'normal',
                                          '& .MuiTableCell-root': {
                                            padding: '4px 8px',
                                            fontSize: '0.75rem',
                                            color: `${textColor} !important`,
                                            transition: isHighlightedFromCustomer ? 'all 0.2s ease-in-out' : 'none',
                                            verticalAlign: 'middle',
                                            lineHeight: '1.2',
                                            boxSizing: 'border-box',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            height: '32px',
                                            fontWeight: tx.type === 'origine' ? 600 : 'inherit',
                                            '& *': {
                                              color: `${textColor} !important`,
                                              fontWeight: tx.type === 'origine' ? 600 : 'inherit'
                                            }
                                          },
                                          '&:hover': {
                                            backgroundColor: isHighlighted ? '#c8e6c9' : '#f5f5f5',
                                            boxShadow: isHighlightedFromCustomer ? '0 4px 12px rgba(76, 175, 80, 0.5)' : 'none'
                                          }
                                        }}
                                        title={isLinked ? (isOneToMany ? (dictionary?.navigation?.linkedCustomerTransactionsOneToMany?.replace('{count}', String(linkedCustomers.length)) || `${linkedCustomers.length} transaction(s) client liée(s) (Un-à-plusieurs)`) : (dictionary?.navigation?.linkedCustomerTransactions?.replace('{count}', String(linkedCustomers.length)) || `${linkedCustomers.length} transaction(s) client liée(s)`)) : (dictionary?.navigation?.noLinkedCustomerTransactions || 'Aucune transaction client liée')}
                                      >
                                        <MemoizedReconciliationCheckbox
                                          txId={tx.id}
                                          checked={selectedBankTransactions.has(tx.id)}
                                          onSelection={handleBankTransactionSelection}
                                          backgroundColor={isHighlighted ? '#e8f5e9' : '#ffffff'}
                                          isPulsing={isHighlightedFromCustomer}
                                          pulseAnimation={pulseBlueAnimation}
                                        />
                                        {isColumnVisible('bank-ledger-entries', 'operation_date', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['operation_date'], minWidth: bankColumnWidths['operation_date'] }}>{tx.operation_date}</TableCell>
                                        )}
                                        {isColumnVisible('bank-ledger-entries', 'label', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', minWidth: bankColumnWidths['label'] || 250, width: bankColumnWidths['label'] || 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                              {isNonOrigin && circleEmoji && (
                                                <span 
                                                  style={{ fontSize: '10px', cursor: 'help' }}
                                                  title={circleTooltip}
                                                >
                                                  {circleEmoji}
                                                </span>
                                              )}
                                              <span>{tx.label}</span>
                                            </Box>
                                          </TableCell>
                                        )}
                                        {isColumnVisible('bank-ledger-entries', 'value_date', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['value_date'], minWidth: bankColumnWidths['value_date'] }}>{tx.value_date}</TableCell>
                                        )}
                                        {isColumnVisible('bank-ledger-entries', 'debit', pathname) && (
                                          <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['debit'], minWidth: bankColumnWidths['debit'] }}>
                                            {tx.debit !== null && tx.debit !== undefined && tx.debit !== ''
                                              ? formatHighMatchAmount(tx.debit)
                                              : ''}
                                          </TableCell>
                                        )}
                                        {isColumnVisible('bank-ledger-entries', 'credit', pathname) && (
                                          <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['credit'], minWidth: bankColumnWidths['credit'] }}>
                                            {tx.credit !== null && tx.credit !== undefined && tx.credit !== ''
                                              ? formatHighMatchAmount(tx.credit)
                                              : ''}
                                          </TableCell>
                                        )}
                                        {isColumnVisible('bank-ledger-entries', 'amount', pathname) && (
                                          <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['amount'], minWidth: bankColumnWidths['amount'] }}>
                                            {tx.amount !== null && tx.amount !== undefined && tx.amount !== ''
                                              ? formatHighMatchAmount(tx.amount)
                                              : ''}
                                          </TableCell>
                                        )}
                                        {isColumnVisible('bank-ledger-entries', 'payment_class', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['payment_class'], minWidth: bankColumnWidths['payment_class'] }}>{tx.payment_class?.name || tx.payment_class || tx.payment_class_id || ''}</TableCell>
                                        )}
                                        {isColumnVisible('bank-ledger-entries', 'payment_status', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['payment_status'], minWidth: bankColumnWidths['payment_status'] }}>{
                                            (tx.payment_status && tx.payment_status.name)
                                            || paymentStatusMap[Number(tx.payment_status_id)]
                                            || paymentStatusMap[Number(tx.payment_status)]
                                            || tx.payment_status
                                            || tx.payment_status_id
                                            || ''
                                          }</TableCell>
                                        )}
                                        {isColumnVisible('bank-ledger-entries', 'type', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['type'], minWidth: bankColumnWidths['type'] }}>{tx.type ?? ''}</TableCell>
                                        )}
                                        {isColumnVisible('bank-ledger-entries', 'ref', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['ref'], minWidth: bankColumnWidths['ref'] }}>{tx.ref ?? ''}</TableCell>
                                        )}
                                        {isColumnVisible('bank-ledger-entries', 'date_ref', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['date_ref'], minWidth: bankColumnWidths['date_ref'] }}>{tx.date_ref ?? ''}</TableCell>
                                        )}
                                        {isColumnVisible('bank-ledger-entries', 'document_reference', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['document_reference'], minWidth: bankColumnWidths['document_reference'] }}>{tx.document_reference || ''}</TableCell>
                                        )}
                                        {isColumnVisible('bank-ledger-entries', 'accounting_account', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: bankColumnWidths['accounting_account'], minWidth: bankColumnWidths['accounting_account'] }}>{tx.accounting_account || ''}</TableCell>
                                        )}
                                      </TableRow>
                                      {/* Bank Tax Rows - Fullscreen */}
                                      {bankTaxes.map((tax: any, taxIdx: number) => {
                                        const taxType = tax.tax_type || tax.tax_name || tax.label || 'Tax'
                                        const taxValue = tax.value || tax.tax_amount || tax.amount || 0
                                        // Check if this tax has a matching customer tax
                                        const matchingTax = matchingCustomerTaxes.find((t: any) => 
                                          (t.tax_type || '').toLowerCase() === (taxType || '').toLowerCase()
                                        )
                                        const hasMatchingCustomerTax = !!matchingTax
                                        const taxStatus = matchingTax?.status || null
                                        
                                        return (
                                          <TableRow
                                            key={`bank-tax-fullscreen-${tx.id}-${taxIdx}`}
                                            sx={{
                                              height: '28px',
                                              backgroundColor: '#fafafa',
                                              borderLeft: hasMatchingCustomerTax ? '3px solid #4caf50' : 'none',
                                              '& .MuiTableCell-root': {
                                                padding: '2px 8px',
                                                fontSize: '0.7rem',
                                                paddingLeft: '20px',
                                                fontStyle: 'italic',
                                                height: '28px'
                                              }
                                            }}
                                          >
                                            <TableCell></TableCell>
                                            {isColumnVisible('bank-ledger-entries', 'operation_date', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('bank-ledger-entries', 'label', pathname) && (
                                              <TableCell sx={{ paddingLeft: '20px' }}>
                                                {hasMatchingCustomerTax && <span style={{ color: '#4caf50', marginRight: '4px' }}>✓</span>}
                                                <span>💰 {taxType}</span>
                                              </TableCell>
                                            )}
                                            {isColumnVisible('bank-ledger-entries', 'value_date', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('bank-ledger-entries', 'debit', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('bank-ledger-entries', 'credit', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('bank-ledger-entries', 'amount', pathname) && (
                                              <TableCell align="right">{formatTaxValue(taxValue)}</TableCell>
                                            )}
                                            {isColumnVisible('bank-ledger-entries', 'payment_class', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('bank-ledger-entries', 'payment_status', pathname) && (
                                              <TableCell>
                                                {taxStatus && (
                                                  <span style={{ 
                                                    color: taxStatus === 'match' ? '#4caf50' : taxStatus === 'mismatch' ? '#f44336' : '#ff9800',
                                                    fontSize: '0.65rem'
                                                  }}>
                                                    {taxStatus}
                                                  </span>
                                                )}
                                              </TableCell>
                                            )}
                                            {isColumnVisible('bank-ledger-entries', 'type', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('bank-ledger-entries', 'ref', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('bank-ledger-entries', 'date_ref', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('bank-ledger-entries', 'document_reference', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('bank-ledger-entries', 'accounting_account', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                          </TableRow>
                                        )
                                      })}
                                      </Fragment>
                                      )
                                    })}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Table3DSheet>
                          )}
                        </Box>
                      </Grid>

                      {/* Customer Reconciliation Table */}
                      <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ flex: 1, mt: 1 }}>
                          {customerTransactions.length > 0 && (
                            <Table3DSheet 
                              type="customer" 
                              title=""
                              paymentClasses={paymentClasses}
                              searchValue={customerSearchQuery}
                              onSearchChange={setCustomerSearchQuery}
                              paymentClassFilter={customerPaymentClassFilter}
                              onPaymentClassFilterChange={setCustomerPaymentClassFilter}
                              dictionary={dictionary}
                              hideHeader={true}
                            >
                              <TableContainer 
                                ref={customerTableScrollFullscreenRef}
                                component={Paper} 
                                variant="outlined" 
                                sx={{ 
                                  maxHeight: 'calc(100vh - 160px)', 
                                  width: '100%', 
                                  margin: 0,
                                  overflowY: 'auto',
                                  overflowX: 'auto'
                                }}
                              >
                                <Table size="small" stickyHeader>
                                  <TableHead>
                                    <TableRow sx={{ 
                                      height: '56.8px !important', 
                                      minHeight: '56.8px !important', 
                                      maxHeight: '56.8px !important',
                                      '& .MuiTableCell-root': {
                                        height: '56.8px !important',
                                        minHeight: '56.8px !important',
                                        maxHeight: '56.8px !important',
                                        lineHeight: '1.2 !important',
                                        verticalAlign: 'middle !important',
                                        boxSizing: 'border-box !important'
                                      }
                                    }}>
                                      <TableCell 
                                        component="th" 
                                        align="center"
                                        className="MuiTableCell-head" 
                                        sx={{ 
                                          padding: '4px',
                                          position: 'sticky',
                                          left: 0,
                                          top: 0,
                                          zIndex: 11,
                                          width: '50px',
                                          minWidth: '50px',
                                          maxWidth: '50px',
                                          height: '56.8px !important',
                                          minHeight: '56.8px !important',
                                          maxHeight: '56.8px !important',
                                          lineHeight: '1.2 !important',
                                          verticalAlign: 'middle !important',
                                          boxSizing: 'border-box !important'
                                        }}
                                      >
                                      </TableCell>
                                      {isColumnVisible('customer-ledger-entries', 'accounting_date', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="accounting_date"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={customerColumnWidths['accounting_date']}
                                          tableType="customer"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px !important',
                                            minHeight: '56.8px !important',
                                            maxHeight: '56.8px !important',
                                            fontSize: '0.75rem',
                                            lineHeight: '1.2 !important',
                                            verticalAlign: 'middle !important',
                                            boxSizing: 'border-box !important',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.accountingDate || 'Accounting Date')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('customer-ledger-entries', 'description', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="description"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={customerColumnWidths['description'] || 250}
                                          tableType="customer"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px !important',
                                            minHeight: '56.8px !important',
                                            maxHeight: '56.8px !important',
                                            fontSize: '0.75rem', 
                                            lineHeight: '1.2 !important',
                                            verticalAlign: 'middle !important',
                                            boxSizing: 'border-box !important',
                                            minWidth: customerColumnWidths['description'] || 250, 
                                            width: customerColumnWidths['description'] || 250,
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.description || 'Description')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('customer-ledger-entries', 'debit', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="debit"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={customerColumnWidths['debit']}
                                          tableType="customer"
                                          component="th" 
                                          align="right" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px !important',
                                            minHeight: '56.8px !important',
                                            maxHeight: '56.8px !important',
                                            fontSize: '0.75rem',
                                            lineHeight: '1.2 !important',
                                            verticalAlign: 'middle !important',
                                            boxSizing: 'border-box !important',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.debit || 'Debit')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('customer-ledger-entries', 'credit', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="credit"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={customerColumnWidths['credit']}
                                          tableType="customer"
                                          component="th" 
                                          align="right" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px !important',
                                            minHeight: '56.8px !important',
                                            maxHeight: '56.8px !important',
                                            fontSize: '0.75rem',
                                            lineHeight: '1.2 !important',
                                            verticalAlign: 'middle !important',
                                            boxSizing: 'border-box !important',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.credit || 'Credit')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('customer-ledger-entries', 'amount', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="amount"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={customerColumnWidths['amount']}
                                          tableType="customer"
                                          component="th" 
                                          align="right" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px !important',
                                            minHeight: '56.8px !important',
                                            maxHeight: '56.8px !important',
                                            fontSize: '0.75rem',
                                            lineHeight: '1.2 !important',
                                            verticalAlign: 'middle !important',
                                            boxSizing: 'border-box !important',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.amount || 'Amount')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('customer-ledger-entries', 'total_amount', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="total_amount"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={customerColumnWidths['total_amount']}
                                          tableType="customer"
                                          component="th" 
                                          align="right" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px !important',
                                            minHeight: '56.8px !important',
                                            maxHeight: '56.8px !important',
                                            fontSize: '0.75rem',
                                            lineHeight: '1.2 !important',
                                            verticalAlign: 'middle !important',
                                            boxSizing: 'border-box !important',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.totalAmount || 'Total Amount')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('customer-ledger-entries', 'payment_status', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="payment_status"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={customerColumnWidths['payment_status']}
                                          tableType="customer"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px',
                                            minHeight: '56.8px',
                                            maxHeight: '56.8px',
                                            fontSize: '0.75rem',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.paymentStatus || 'Payment Status')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('customer-ledger-entries', 'payment_type', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="payment_type"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={customerColumnWidths['payment_type']}
                                          tableType="customer"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px',
                                            minHeight: '56.8px',
                                            maxHeight: '56.8px',
                                            fontSize: '0.75rem',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.paymentType || 'Payment Type')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('customer-ledger-entries', 'due_date', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="due_date"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={customerColumnWidths['due_date']}
                                          tableType="customer"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px',
                                            minHeight: '56.8px',
                                            maxHeight: '56.8px',
                                            fontSize: '0.75rem',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.dueDate || 'Due Date')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('customer-ledger-entries', 'external_doc_number', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="external_doc_number"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={customerColumnWidths['external_doc_number']}
                                          tableType="customer"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px',
                                            minHeight: '56.8px',
                                            maxHeight: '56.8px',
                                            fontSize: '0.75rem',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.externalDocNumber || 'External Doc Number')}
                                        </ResizableTableCell>
                                      )}
                                      {isColumnVisible('customer-ledger-entries', 'document_number', pathname) && (
                                        <ResizableTableCell 
                                          columnKey="document_number"
                                          onResizeStart={handleResizeStart}
                                          columnWidth={customerColumnWidths['document_number']}
                                          tableType="customer"
                                          component="th" 
                                          className="MuiTableCell-head" 
                                          sx={{ 
                                            padding: '4px 8px', 
                                            height: '56.8px',
                                            minHeight: '56.8px',
                                            maxHeight: '56.8px',
                                            fontSize: '0.75rem',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                          }}
                                        >
                                          {formatHeaderText(dictionary?.navigation?.documentNumber || 'Document Number')}
                                        </ResizableTableCell>
                                      )}
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {filteredCustomerTransactions.map((tx: any) => {
                                      const isLinked = hasLinkedBankTransaction(tx.id)
                                      const isHighlighted = highlightedCustomerTransaction === tx.id || highlightedCustomerTransactions.has(tx.id)
                                      const isHighlightedFromBank = highlightedCustomerTransactions.has(tx.id)
                                      const linkedBank = getLinkedBankTransaction(tx.id)
                                      const isPartOfGroup = isPartOfOneToManyGroup(tx.id)
                                      const groupedCustomers = getGroupedCustomerTransactions(tx.id)
                                      const groupIndex = groupedCustomers.indexOf(tx.id)
                                      const isFirstInGroup = groupIndex === 0
                                      const isLastInGroup = groupIndex === groupedCustomers.length - 1
                                      
                                      // Check if this customer transaction is origine
                                      // Customer transactions might have type field or is_origine field, or be linked to an origine bank transaction
                                      // Check both matched and unmatched bank transactions
                                      // Also check if it's in unmatchedCustomerTransactions with origine status
                                      const linkedBankTx = linkedBank ? (
                                        filteredBankTransactions.find((btx: any) => btx.id === Number(linkedBank)) ||
                                        unmatchedBankTransactions.find((btx: any) => btx.id === Number(linkedBank))
                                      ) : null
                                      // Check if this customer transaction is in unmatched list and is origine
                                      const isUnmatchedOrigine = unmatchedCustomerTransactions.some((utx: any) => 
                                        utx.id === tx.id && (
                                          utx.type === 'origine' || 
                                          utx.is_origine === true || 
                                          utx.is_origine === 'true' || 
                                          utx.is_origine === 1
                                        )
                                      )
                                      
                                      // Debug logging for customer transaction origine detection (Fullscreen View)
                                      const hasTypeOrigine = tx.type === 'origine'
                                      const hasIsOrigine = tx.is_origine === true || tx.is_origine === 'true' || tx.is_origine === 1
                                      const linkedToOrigineBank = linkedBankTx && linkedBankTx.type === 'origine'
                                      
                                      const isCustomerOrigine = tx.type === 'origine' || 
                                        tx.is_origine === true || 
                                        tx.is_origine === 'true' || 
                                        tx.is_origine === 1 ||
                                        isUnmatchedOrigine ||
                                        (linkedBankTx && linkedBankTx.type === 'origine')
                                      
                                      // Get customer taxes from tax comparison results
                                      const allCustomerTaxes = taxComparisonResults.filter(tax => 
                                        tax.customer_transaction_id === tx.id
                                      )
                                      // Get matching bank taxes (for status indicators)
                                      const linkedBankId = linkedBank ? Number(linkedBank) : null
                                      const matchingBankTaxes = linkedBankId ? taxComparisonResults.filter(tax => 
                                        tax.matched_bank_transaction_id === linkedBankId &&
                                        tax.customer_transaction_id === tx.id
                                      ) : []
                                      // Get cached customer taxes (to avoid duplicates)
                                      const cachedCustTaxes = cachedCustomerTaxes[tx.id] || []
                                      const cachedTaxTypes = new Set(cachedCustTaxes.map(t => 
                                        (t.tax_type || t.tax_name || t.label || '').toLowerCase()
                                      ))
                                      // Get all transaction descriptions that already exist as separate rows in the table
                                      const existingCustomerDescriptions = new Set(filteredCustomerTransactions.map(t => 
                                        (t.description || '').toLowerCase().trim()
                                      ))
                                      // Use taxComparisonResults for display (has customer_tax and customer_total_tax from DB)
                                      // These come from the tax comparison API which has the correct structure
                                      const customerTaxes = allCustomerTaxes.filter(tax => {
                                        const taxType = (tax.tax_type || '').toLowerCase()
                                        // Skip if tax type is in cache (to avoid duplicates)
                                        return !cachedTaxTypes.has(taxType)
                                      })
                                      
                                      // (removed verbose debug logging for customerTaxes array in fullscreen)
                                      
                                      // Determine circle emoji for customer transactions linked to bank non-origine transactions
                                      // The circle icon represents the bank non-origine transaction's respective customer tax status
                                      let circleEmoji: string | null = null
                                      let circleTooltip: string = ''
                                      if (linkedBankId) {
                                        // Find the linked bank transaction
                                        const linkedBankTx = filteredBankTransactions.find((btx: any) => btx.id === linkedBankId)
                                        if (linkedBankTx) {
                                          // Check if the linked bank transaction is non-origine (has type like 'tva', 'plo', 'com', 'agios')
                                          const bankTxType = (linkedBankTx.type || '').toUpperCase()
                                          const isBankNonOrigine = bankTxType && ['TVA', 'PLO', 'COM', 'AGIOS'].includes(bankTxType)
                                          
                                          if (isBankNonOrigine) {
                                            // Find the tax comparison result for this specific tax type
                                            const specificTaxComparison = matchingBankTaxes.find((t: any) => 
                                              (t.tax_type || '').toUpperCase() === bankTxType
                                            )
                                            
                                            if (specificTaxComparison) {
                                              // Normalize status: API might return 'matched' but we check for 'match'
                                              const status = specificTaxComparison.status === 'matched' ? 'match' : specificTaxComparison.status
                                              
                                              if (status === 'match') {
                                                circleEmoji = '🟢' // Green - this specific tax matches
                                                circleTooltip = `Linked to bank ${bankTxType} tax: Matched`
                                              } else if (status === 'mismatch') {
                                                circleEmoji = '🟡' // Yellow - this specific tax mismatches
                                                circleTooltip = `Linked to bank ${bankTxType} tax: Mismatch`
                                              } else if (status === 'missing') {
                                                circleEmoji = '🔴' // Red - this specific tax is missing
                                                circleTooltip = `Linked to bank ${bankTxType} tax: Missing`
                                              } else {
                                                // Unknown status, default to yellow
                                                circleEmoji = '🟡'
                                                circleTooltip = `Linked to bank ${bankTxType} tax: Status unknown`
                                              }
                                            } else {
                                              // Tax type not found in comparison results
                                              circleEmoji = '🟡'
                                              circleTooltip = `Linked to bank ${bankTxType} tax: No comparison result`
                                            }
                                          }
                                        }
                                      }
                                      
                                      return (
                                      <Fragment key={`customer-tx-wrapper-fullscreen-${tx.id}`}>
                                      <TableRow 
                                        key={`reco-customer-fullscreen-${tx.id}`}
                                        ref={(el) => { customerTransactionRefs.current[tx.id] = el }}
                                        hover
                                        onClick={(e) => {
                              e.stopPropagation()
                              handleCustomerTransactionClick(tx.id)
                            }}
                                        sx={{ 
                                          height: '32px',
                                          minHeight: '32px',
                                          maxHeight: '32px',
                                          cursor: isLinked ? 'pointer' : 'default',
                                          backgroundColor: isHighlighted ? '#e8f5e9' : '#ffffff',
                                          borderLeft: isLinked ? '3px solid #4caf50' : 'none',
                                          color: isLinked ? '#4caf50' : 'inherit',
                                          transition: isHighlightedFromBank ? 'all 0.3s ease-in-out' : 'none',
                                          boxShadow: isHighlightedFromBank ? '0 2px 8px rgba(76, 175, 80, 0.4)' : 'none',
                                          position: 'relative',
                                          animation: isHighlightedFromBank ? `${pulseGreenAnimation} 1.5s ease-in-out infinite` : 'none',
                                          fontWeight: isCustomerOrigine ? 600 : 'normal',
                                          '& .MuiTableCell-root': {
                                            padding: '4px 8px',
                                            fontSize: '0.75rem',
                                            color: isLinked ? '#4caf50 !important' : 'inherit',
                                            transition: isHighlightedFromBank ? 'all 0.2s ease-in-out' : 'none',
                                            verticalAlign: 'middle',
                                            lineHeight: '1.2',
                                            boxSizing: 'border-box',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            height: '32px',
                                            fontWeight: isCustomerOrigine ? 600 : 'inherit',
                                            '& *': {
                                              color: isLinked ? '#4caf50 !important' : 'inherit',
                                              fontWeight: isCustomerOrigine ? 600 : 'inherit'
                                            }
                                          },
                                          '&:hover': {
                                            backgroundColor: isHighlighted ? '#c8e6c9' : '#f5f5f5',
                                            boxShadow: isHighlightedFromBank ? '0 4px 12px rgba(76, 175, 80, 0.5)' : 'none'
                                          }
                                        }}
                                        title={isLinked ? (isPartOfGroup ? (dictionary?.navigation?.linkedToBankTransactionGroup?.replace('{bankTransaction}', linkedBank || '').replace('{count}', String(groupedCustomers.length)) || `Lié à la transaction bancaire ${linkedBank || ''} (Partie d'un groupe de ${groupedCustomers.length})`) : (dictionary?.navigation?.linkedToBankTransaction?.replace('{bankTransaction}', linkedBank || '') || `Lié à la transaction bancaire ${linkedBank || ''}`)) : (dictionary?.navigation?.noLinkedBankTransaction || 'Aucune transaction bancaire liée')}
                                      >
                                        <MemoizedReconciliationCheckbox
                                          txId={tx.id}
                                          checked={selectedCustomerTransactions.has(tx.id)}
                                          onSelection={handleCustomerTransactionSelection}
                                          backgroundColor={isHighlighted ? '#e8f5e9' : '#ffffff'}
                                          isPulsing={isHighlightedFromBank}
                                          pulseAnimation={pulseGreenAnimation}
                                        />
                                        {isColumnVisible('customer-ledger-entries', 'accounting_date', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['accounting_date'], minWidth: customerColumnWidths['accounting_date'] }}>{tx.accounting_date}</TableCell>
                                        )}
                                        {isColumnVisible('customer-ledger-entries', 'description', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', minWidth: customerColumnWidths['description'] || 250, width: customerColumnWidths['description'] || 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                              {circleEmoji && (
                                                <span 
                                                  style={{ fontSize: '10px', cursor: 'help' }}
                                                  title={circleTooltip}
                                                >
                                                  {circleEmoji}
                                                </span>
                                              )}
                                              <Tooltip 
                                                title={tx.description || ''} 
                                                placement="bottom" 
                                                arrow
                                                componentsProps={{
                                                  tooltip: {
                                                    sx: {
                                                      fontSize: '0.75rem',
                                                      padding: '4px 8px',
                                                      maxWidth: '200px',
                                                      zIndex: 10000
                                                    }
                                                  },
                                                  arrow: {
                                                    sx: {
                                                      fontSize: '0.75rem'
                                                    }
                                                  }
                                                }}
                                              >
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{tx.description}</span>
                                              </Tooltip>
                                            </Box>
                                          </TableCell>
                                        )}
                                        {isColumnVisible('customer-ledger-entries', 'debit', pathname) && (
                                          <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['debit'], minWidth: customerColumnWidths['debit'] }}>
                                            {tx.debit_amount !== null && tx.debit_amount !== undefined && tx.debit_amount !== ''
                                              ? formatHighMatchAmount(tx.debit_amount)
                                              : ''}
                                          </TableCell>
                                        )}
                                        {isColumnVisible('customer-ledger-entries', 'credit', pathname) && (
                                          <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['credit'], minWidth: customerColumnWidths['credit'] }}>
                                            {tx.credit_amount !== null && tx.credit_amount !== undefined && tx.credit_amount !== ''
                                              ? formatHighMatchAmount(tx.credit_amount)
                                              : ''}
                                          </TableCell>
                                        )}
                                        {isColumnVisible('customer-ledger-entries', 'amount', pathname) && (
                                          <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['amount'], minWidth: customerColumnWidths['amount'] }}>
                                            {tx.amount !== null && tx.amount !== undefined && tx.amount !== ''
                                              ? formatHighMatchAmount(tx.amount)
                                              : ''}
                                          </TableCell>
                                        )}
                                        {isColumnVisible('customer-ledger-entries', 'total_amount', pathname) && (
                                          <TableCell align="right" sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['total_amount'], minWidth: customerColumnWidths['total_amount'] }}>
                                            {tx.total_amount !== null && tx.total_amount !== undefined && tx.total_amount !== ''
                                              ? formatHighMatchAmount(tx.total_amount)
                                              : ''}
                                          </TableCell>
                                        )}
                                        {isColumnVisible('customer-ledger-entries', 'payment_status', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['payment_status'], minWidth: customerColumnWidths['payment_status'] }}>{
                                            (tx.payment_status && tx.payment_status.name)
                                            || paymentStatusMap[Number(tx.payment_status_id)]
                                            || paymentStatusMap[Number(tx.payment_status)]
                                            || tx.payment_status
                                            || tx.payment_status_id
                                            || ''
                                          }</TableCell>
                                        )}
                                        {isColumnVisible('customer-ledger-entries', 'payment_type', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['payment_type'], minWidth: customerColumnWidths['payment_type'] }}>{tx.payment_type || ''}</TableCell>
                                        )}
                                        {isColumnVisible('customer-ledger-entries', 'due_date', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['due_date'], minWidth: customerColumnWidths['due_date'] }}>{tx.due_date || ''}</TableCell>
                                        )}
                                        {isColumnVisible('customer-ledger-entries', 'external_doc_number', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['external_doc_number'], minWidth: customerColumnWidths['external_doc_number'] }}>{tx.external_doc_number || ''}</TableCell>
                                        )}
                                        {isColumnVisible('customer-ledger-entries', 'document_number', pathname) && (
                                          <TableCell sx={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap', width: customerColumnWidths['document_number'], minWidth: customerColumnWidths['document_number'] }}>{tx.document_number || ''}</TableCell>
                                        )}
                                      </TableRow>
                                      {/* Customer Tax Rows - Fullscreen */}
                                      {customerTaxes.map((tax: any, taxIdx: number) => {
                                        const taxType = tax.tax_type || 'Tax'
                                        // amount column uses customer_tax (individual amount), total_amount column uses customer_total_tax (total from API)
                                        // IMPORTANT: Read values directly from tax object - ensure we get the correct API values
                                        // Use bracket notation to avoid any getter/setter issues
                                        const customerTaxAmount = tax['customer_tax'] || tax.customer_tax
                                        const customerTotalTaxAmount = tax['customer_total_tax'] || tax.customer_total_tax
                                        
                                        // Verify we're reading the correct values
                                        if (customerTotalTaxAmount === customerTaxAmount && tax.tax_type === 'AGIOS') {
                                          console.warn('⚠️ WARNING: customer_total_tax equals customer_tax for AGIOS tax - this should not happen!', {
                                            transactionId: tx.id,
                                            taxType: tax.tax_type,
                                            'tax.customer_tax': tax.customer_tax,
                                            'tax.customer_total_tax': tax.customer_total_tax,
                                            'tax["customer_tax"]': tax['customer_tax'],
                                            'tax["customer_total_tax"]': tax['customer_total_tax'],
                                            customerTaxAmount,
                                            customerTotalTaxAmount,
                                            rawTaxObject: tax
                                          })
                                        }
                                        
                                        // At least one value must exist (0 is a valid value, so check for null/undefined/empty string)
                                        if ((customerTaxAmount === null || customerTaxAmount === undefined || customerTaxAmount === '') &&
                                            (customerTotalTaxAmount === null || customerTotalTaxAmount === undefined || customerTotalTaxAmount === '')) {
                                          console.warn('⚠️ Skipping tax row (Fullscreen) - both values are null/undefined/empty:', { taxType, tax })
                                          return null
                                        }
                                        
                                        // Convert to numbers and make negative (since they're in debit column)
                                        const formatNegativeValue = (value: any, fieldName: string): number | null => {
                                          // 0 is a valid value, so only check for null/undefined/empty string
                                          if (value === null || value === undefined || value === '') {
                                            return null
                                          }
                                          const num = typeof value === 'string' 
                                            ? parseFloat(value.replace(/\s/g, '').replace(',', '.')) 
                                            : Number(value)
                                          if (isNaN(num)) {
                                            return null
                                          }
                                          const negativeValue = -Math.abs(num)
                                          return negativeValue
                                        }
                                        
                                        const amountValue = formatNegativeValue(customerTaxAmount, 'customer_tax (amount)')
                                        const totalAmountValue = formatNegativeValue(customerTotalTaxAmount, 'customer_total_tax (total_amount)')
                                        
                                        
                                        // Check if this tax has a matching bank tax
                                        const matchingTax = matchingBankTaxes.find((t: any) => 
                                          (t.tax_type || '').toLowerCase() === (taxType || '').toLowerCase()
                                        )
                                        const hasMatchingBankTax = !!matchingTax
                                        const taxStatus = matchingTax?.status || null
                                        
                                        // Create unique ID for this tax row
                                        const taxRowId = `tax-${tx.id}-${taxIdx}`
                                        
                                        // Determine circle emoji based on tax status
                                        let taxCircleEmoji: string = ''
                                        let taxCircleTooltip: string = ''
                                        // Handle both 'matched' and 'match' status values from API
                                        if (taxStatus) {
                                          const statusLower = String(taxStatus).toLowerCase().trim()
                                          
                                          if (statusLower === 'match' || statusLower === 'matched') {
                                            taxCircleEmoji = '🟢'
                                            taxCircleTooltip = 'Tax matched'
                                          } else if (statusLower === 'mismatch') {
                                            taxCircleEmoji = '🟡'
                                            taxCircleTooltip = 'Tax mismatch'
                                          } else if (statusLower === 'missing') {
                                            taxCircleEmoji = '🔴'
                                            taxCircleTooltip = 'Tax missing'
                                          } else {
                                            taxCircleEmoji = '🟡'
                                            taxCircleTooltip = `Tax status: ${statusLower}`
                                          }
                                        }
                                        
                                        // Use parent transaction's background color
                                        const taxRowBgColor = isHighlighted ? '#e8f5e9' : '#ffffff'
                                        
                                        return (
                                          <TableRow
                                            key={`customer-tax-fullscreen-${tx.id}-${taxIdx}`}
                                            hover
                                            sx={{
                                              height: '28px',
                                              backgroundColor: taxRowBgColor,
                                              borderLeft: hasMatchingBankTax ? '3px solid #4caf50' : 'none',
                                              color: isLinked ? '#4caf50' : 'inherit',
                                              '& .MuiTableCell-root': {
                                                padding: '4px 8px',
                                                fontSize: '0.75rem',
                                                height: '28px',
                                                verticalAlign: 'middle',
                                                lineHeight: '1.2',
                                                boxSizing: 'border-box',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                color: isLinked ? '#4caf50 !important' : 'inherit',
                                                '& *': {
                                                  color: isLinked ? '#4caf50 !important' : 'inherit'
                                                }
                                              },
                                              '&:hover': {
                                                backgroundColor: isHighlighted ? '#c8e6c9' : '#f5f5f5',
                                                '& .MuiTableCell-root': {
                                                  backgroundColor: 'transparent'
                                                }
                                              }
                                            }}
                                          >
                                            <MemoizedReconciliationCheckbox
                                              txId={taxRowId}
                                              checked={selectedCustomerTransactions.has(taxRowId)}
                                              onSelection={handleCustomerTransactionSelection}
                                              backgroundColor={taxRowBgColor}
                                            />
                                            {isColumnVisible('customer-ledger-entries', 'accounting_date', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('customer-ledger-entries', 'description', pathname) && (
                                              <TableCell sx={{ paddingLeft: '20px' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                  {taxCircleEmoji && (
                                                    <span 
                                                      style={{ fontSize: '10px', cursor: 'help' }}
                                                      title={taxCircleTooltip}
                                                    >
                                                      {taxCircleEmoji}
                                                    </span>
                                                  )}
                                                  <span>{taxType}</span>
                                                </Box>
                                              </TableCell>
                                            )}
                                            {isColumnVisible('customer-ledger-entries', 'debit', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('customer-ledger-entries', 'credit', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('customer-ledger-entries', 'amount', pathname) && (
                                              <TableCell align="right">{amountValue !== null ? formatTaxValue(amountValue) : '-'}</TableCell>
                                            )}
                                            {isColumnVisible('customer-ledger-entries', 'total_amount', pathname) && (
                                              <TableCell align="right">{totalAmountValue !== null ? formatTaxValue(totalAmountValue) : '-'}</TableCell>
                                            )}
                                            {isColumnVisible('customer-ledger-entries', 'payment_status', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('customer-ledger-entries', 'payment_type', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('customer-ledger-entries', 'due_date', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('customer-ledger-entries', 'external_doc_number', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                            {isColumnVisible('customer-ledger-entries', 'document_number', pathname) && (
                                              <TableCell></TableCell>
                                            )}
                                          </TableRow>
                                        )
                                      }).filter(Boolean)}
                                      </Fragment>
                                      )
                                    })}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Table3DSheet>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                    {/* Balance Sections */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mt={3} mb={2} sx={{ width: '100%', flexShrink: 0 }}>
                      {/* Left group: Solde + Écart */}
                      <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                        {/* Solde Section - Display cumulative balance when transaction is clicked */}
                        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                          {renderIcon(selectedIcons.balance, 'warning')}
                          <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                            {dictionary?.navigation?.balance || 'Solde'}:
                          </Typography>
                          {currentSolde !== null ? (
                            <Typography
                              variant="body1"
                              color="warning.main"
                              fontWeight={600}
                              sx={{ mt: 0.25 }}
                            >
                              {currentSolde.toLocaleString('fr-FR', {
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 3,
                                useGrouping: true
                              })}
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.25, fontStyle: 'italic' }}
                            >
                              {dictionary?.navigation?.clickTransactionToSeeBalance || 'Cliquez sur une transaction pour voir le solde'}
                            </Typography>
                          )}
                        </Box>
                        
                        {/* Écart Section */}
                        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                          <Box sx={{ color: ecartColor }}>
                            {renderIcon(selectedIcons.ecart, 'inherit')}
                          </Box>
                          <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                            {dictionary?.navigation?.ecart || 'Écart'}:
                          </Typography>
                          <TextField
                            size="small"
                            type="text"
                            value={ecartInput}
                            InputProps={{ readOnly: true }}
                            placeholder="0.000"
                            sx={{ 
                              maxWidth: 180, 
                              mt: 0.25,
                              '& .MuiInputBase-root': {
                                height: '32px',
                                minHeight: '32px'
                              },
                              '& .MuiInputBase-input': {
                                padding: '6px 8px',
                                height: '32px',
                                boxSizing: 'border-box',
                                color: ecartColor
                              }
                            }}
                          />
                        </Box>
                      </Box>
                      
                      {/* Right group: Total difference + Solde final */}
                      <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                        {/* Total Difference Section */}
                        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                          {renderIcon(selectedIcons.totalDifference, 'error')}
                          <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontSize: '0.857rem' }}>
                            {dictionary?.navigation?.totalDifference || 'Total difference of ledger entry'}:
                          </Typography>
                          <TextField
                            size="small"
                            type="text"
                            value={totalDifferenceInput}
                            InputProps={{ readOnly: true }}
                            placeholder="0.000"
                            sx={{ 
                              maxWidth: 180, 
                              mt: 0.25,
                              '& .MuiInputBase-root': {
                                height: '32px',
                                minHeight: '32px'
                              },
                              '& .MuiInputBase-input': {
                                padding: '6px 8px',
                                height: '32px',
                                boxSizing: 'border-box'
                              }
                            }}
                          />
                        </Box>
                        
                        {/* Ending Balance Section */}
                        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        {(() => {
                          // Check if endingBalance equals or differs from statementEndingBalance
                          const bothSet = endingBalance !== null && statementEndingBalance !== null
                          const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
                          const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
                          const iconColor = isEqual ? 'success' : isDifferent ? 'error' : 'secondary'
                          return renderIcon(selectedIcons.endingBalance, iconColor)
                        })()}
                        <Typography 
                          variant="body2" 
                          fontWeight={500} 
                          sx={{ 
                            fontSize: '0.857rem',
                            color: (() => {
                              const bothSet = endingBalance !== null && statementEndingBalance !== null
                              const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
                              const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
                              if (isEqual) return 'success.main'
                              if (isDifferent) return 'error.main'
                              return 'text.primary'
                            })()
                          }}
                        >
                          {dictionary?.navigation?.endingBalance || 'Ending balance of ledger entry'}:
                        </Typography>
                        <TextField
                          size="small"
                          type="text"
                          value={endingBalanceInput}
                          onChange={e => {
                            setEndingBalanceInput(e.target.value)
                            setEndingBalanceInputError('')
                          }}
                          onBlur={() => {
                            if (!endingBalanceInput.trim()) {
                              setEndingBalance(null)
                              return
                            }

                            // Remove spaces (thousands separators) and replace comma with dot for parsing
                            const cleaned = endingBalanceInput.replace(/\s/g, '').replace(',', '.')
                            const parsed = Number(cleaned)

                            if (Number.isNaN(parsed)) {
                              setEndingBalanceInputError(
                                dictionary?.navigation?.invalidBeginningBalance || 'Please enter a valid number'
                              )
                              return
                            }

                            setEndingBalance(parsed)
                            
                            // Format the input with spaces after parsing, and dot as decimal separator
                            const formatted = parsed
                              .toLocaleString('fr-FR', {
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 3,
                                useGrouping: true
                              })
                              .replace(',', '.')
                            setEndingBalanceInput(formatted)
                          }}
                          placeholder="0.000"
                          error={!!endingBalanceInputError}
                          helperText={endingBalanceInputError || ''}
                          sx={{ 
                            maxWidth: 180, 
                            mt: 0.25,
                            '& .MuiInputBase-root': {
                              height: '32px',
                              minHeight: '32px'
                            },
                            '& .MuiInputBase-input': {
                              padding: '6px 8px',
                              height: '32px',
                              boxSizing: 'border-box',
                              color: (() => {
                                const bothSet = endingBalance !== null && statementEndingBalance !== null
                                const isEqual = bothSet && Math.abs(endingBalance - statementEndingBalance) <= 0.001
                                const isDifferent = bothSet && Math.abs(endingBalance - statementEndingBalance) > 0.001
                                if (isEqual) return 'success.main'
                                if (isDifferent) return 'error.main'
                                return undefined
                              })()
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </DialogContent>
              </Dialog>
            </Grid>
            )}

            {/* Static Transaction Lists */}
            <Grid item xs={12}>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={6000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: 'white',
            color: 'primary.main',
            fontWeight: 500,
            '& .MuiSnackbarContent-message': {
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }
          }
        }}
        message={
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle sx={{ color: 'primary.main' }} />
            {notificationMessage}
          </Box>
        }
      />

      {/* Calculator Dialog (opened from search shortcuts) */}
      <Dialog
        open={calculatorOpen}
        onClose={handleCalculatorClose}
        maxWidth="xs"
        fullWidth
        aria-labelledby="calculator-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 8,
            overflow: 'hidden',
            transform: 'perspective(1200px) rotateX(6deg)',
            transformOrigin: 'top center'
          }
        }}
      >
        <DialogTitle
          id="calculator-dialog-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: '1rem'
          }}
        >
          <Calculate fontSize="small" />
          {dictionary?.navigation?.calculator || 'Calculator'}
        </DialogTitle>
        <DialogContent
          sx={{
            pt: 3,
            pb: 2,
            background: 'linear-gradient(145deg, #fafafa, #e0e0e0)'
          }}
        >
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label={dictionary?.navigation?.expression || 'Expression'}
              size="small"
              fullWidth
              value={calculatorExpression}
              onChange={e => {
                setCalculatorExpression(e.target.value)
                setCalculatorError('')
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCalculatorEvaluate()
                }
              }}
              helperText={
                calculatorError ||
                dictionary?.navigation?.expressionHelper ||
                  'Use +, -, *, / and parentheses. Example: 2807.195 * 3'
              }
              error={!!calculatorError}
            />
            <TextField
              label={dictionary?.navigation?.result || 'Result'}
              size="small"
              fullWidth
              value={calculatorResult}
              InputProps={{ readOnly: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCalculatorClose} color="inherit" size="small">
            {dictionary?.navigation?.cancel || 'Cancel'}
          </Button>
          <Button onClick={handleCalculatorEvaluate} variant="contained" color="primary" size="small">
            {dictionary?.navigation?.calculate || 'Calculate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Internal Number Dialog (opened from shortcuts) */}
      <Dialog
        open={assignInternalNumberOpen}
        onClose={handleCloseAssignInternalNumberDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {dictionary?.navigation?.assignInternalNumber || 'Assign Internal Number'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {dictionary?.navigation?.assignInternalNumberDescription ||
              'Enter the internal number to assign to all selected bank transactions in the reconciliation table.'}
          </Typography>
          <TextField
            label={dictionary?.navigation?.internalNumber || 'Internal Number'}
            fullWidth
            value={assignInternalNumberValue}
            onChange={e => {
              setAssignInternalNumberValue(e.target.value)
              setAssignInternalNumberError(null)
            }}
            disabled={assignInternalNumberLoading}
            error={!!assignInternalNumberError}
            helperText={assignInternalNumberError || ' '}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignInternalNumberDialog} disabled={assignInternalNumberLoading}>
            {dictionary?.navigation?.cancel || 'Cancel'}
          </Button>
          <Button
            onClick={handleConfirmAssignInternalNumber}
            variant="contained"
            disabled={assignInternalNumberLoading}
          >
            {assignInternalNumberLoading
              ? (dictionary?.navigation?.assigning || 'Assigning...')
              : (dictionary?.navigation?.assign || 'Assign')}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}
