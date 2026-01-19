'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Box,
  Input,
  InputAdornment,
  IconButton,
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
  Tooltip
} from '@mui/material'
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  FilterList as FilterIcon
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
}

export interface LookupData {
  [key: string]: any
}

// Table data type
type TableData = {
  [key: string]: any
}

const EntityLookup: React.FC<EntityLookupProps> = ({
  componentName,
  apiURI,
  columnDefs = [],
  field = 'name',
  selectedItem = '',
  size = 'md',
  lookupSize = 'lg',
  title,
  onItemSelected,
  disabled = false,
  placeholder
}) => {
  const [localValue, setLocalValue] = useState(selectedItem)
  const [modalOpen, setModalOpen] = useState(false)
  const [data, setData] = useState<LookupData[]>([])
  const [filteredData, setFilteredData] = useState<LookupData[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentLookupSize, setCurrentLookupSize] = useState(lookupSize)
  const [error, setError] = useState<string | null>(null)

  const modalRef = useRef<HTMLDivElement>(null)

  // Update local value when selectedItem prop changes
  useEffect(() => {
    setLocalValue(selectedItem)
  }, [selectedItem])

  // Load data when modal opens
  useEffect(() => {
    if (modalOpen) {
      getData()
    }
  }, [modalOpen])

  // Filter data when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(data)
    } else {
      const filtered = data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
      setFilteredData(filtered)
    }
  }, [searchQuery, data])

  const getData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate API call - replace with actual API call
      const response = await fetch(apiURI)
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`)
      }
      
      const result = await response.json()
      setData(result)
      setFilteredData(result)
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
      console.error('Error loading lookup data:', err)
    } finally {
      setLoading(false)
    }
  }

  const openModal = () => {
    if (!disabled) {
      setModalOpen(true)
      setSearchQuery('')
    }
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
    const url = `/admin/${componentName.toLowerCase()}`
    window.open(url, '_blank')
  }

  const handleItemSelect = (item: LookupData) => {
    setLocalValue(item[field] || '')
    onItemSelected?.(item, field)
    closeModal()
  }

  const refresh = () => {
    getData()
  }

  const updateSearchQuery = (value: string) => {
    setSearchQuery(value)
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
      case 'sm': return 400
      case 'lg': return 800
      case 'xl': return 1140
      default: return 800
    }
  }

  const getModalHeight = () => {
    switch (currentLookupSize) {
      case 'sm': return 500
      case 'lg': return 600
      case 'xl': return 700
      default: return 600
    }
  }

  return (
    <>
      {/* Input Field - Matching regular input field styling */}
      <Box className={styles.inputGroup}>
        <Box className={styles.inputWrapper}>
          <input
            type="text"
            value={localValue}
            placeholder={placeholder || `Select ${componentName}`}
            disabled={disabled}
            readOnly
            className={styles.lookupInput}
            onClick={openModal}
          />
          <Box className={styles.searchIconContainer}>
            <SearchIcon 
              className={styles.searchIcon}
              onClick={openModal}
            />
          </Box>
        </Box>
      </Box>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        className={styles.modal}
        ref={modalRef}
      >
        <Paper
          className={styles.modalContent}
          style={{
            width: getModalWidth(),
            height: getModalHeight(),
            maxHeight: '90vh'
          }}
        >
          {/* Modal Header */}
          <Box className={styles.modalHeader}>
            <Typography variant="h6" className={styles.modalTitle}>
              {title || `Select ${componentName}`}
            </Typography>
            <Box className={styles.headerActions}>
              <IconButton
                onClick={openInNewTab}
                size="small"
                className={styles.headerButton}
                title="Open in new tab"
              >
                <OpenInNewIcon />
              </IconButton>
              <IconButton
                onClick={changeModalSize}
                size="small"
                className={styles.headerButton}
                title="Change size"
              >
                {currentLookupSize === 'xl' ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
              <IconButton
                onClick={closeModal}
                size="small"
                className={styles.headerButton}
                title="Close"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Search Section */}
          <Box className={styles.searchSection}>
            <TextField
              placeholder={`Search ${componentName}...`}
              value={searchQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              size="small"
              fullWidth
              className={styles.searchInput}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={refresh}
                      size="small"
                      disabled={loading}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Data Grid */}
          <Box className={styles.dataGridContainer}>
            {loading ? (
              <Box className={styles.loadingContainer}>
                <CircularProgress />
                <Typography>Loading...</Typography>
              </Box>
            ) : error ? (
              <Alert severity="error" className={styles.errorAlert}>
                {error}
              </Alert>
            ) : filteredData.length === 0 ? (
              <Box className={styles.noDataContainer}>
                <Typography>No data found</Typography>
              </Box>
            ) : (
              <Box className={styles.dataTable}>
                {filteredData.map((item, index) => (
                  <Box
                    key={index}
                    className={styles.dataRow}
                    onDoubleClick={() => handleItemSelect(item)}
                  >
                    {columnDefs.length > 0 ? (
                      columnDefs.map((col, colIndex) => (
                        <Box
                          key={colIndex}
                          className={styles.dataCell}
                          style={{ flex: col.flex || 1 }}
                        >
                          <Typography variant="body2">
                            {item[col.field] || ''}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Box className={styles.dataCell} style={{ flex: 1 }}>
                        <Typography variant="body2">
                          {item[field] || ''}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Modal>
    </>
  )
}

export default EntityLookup
