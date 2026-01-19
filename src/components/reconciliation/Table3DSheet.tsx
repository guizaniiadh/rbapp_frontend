'use client'

import { useState } from 'react'
import { 
  Box, 
  IconButton, 
  Dialog, 
  DialogContent, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  InputAdornment
} from '@mui/material'
import { Fullscreen, FullscreenExit, Search } from '@mui/icons-material'
import Customizer from '@core/components/customizer'
import styles from './Table3DSheet.module.css'

interface PaymentClass {
  code: string
  name: string
}

interface Table3DSheetProps {
  children: React.ReactNode
  type: 'bank' | 'customer'
  title: string
  paymentClasses?: PaymentClass[]
  searchValue?: string
  onSearchChange?: (value: string) => void
  paymentClassFilter?: string
  onPaymentClassFilterChange?: (value: string) => void
  dictionary?: any
  hideHeader?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

const Table3DSheet = ({ 
  children, 
  type, 
  title,
  paymentClasses = [],
  searchValue = '',
  onSearchChange,
  paymentClassFilter = '',
  onPaymentClassFilterChange,
  dictionary,
  hideHeader = false,
  isFullscreen: externalIsFullscreen,
  onToggleFullscreen: externalToggleFullscreen
}: Table3DSheetProps) => {
  const [internalFullscreen, setInternalFullscreen] = useState(false)
  
  const isFullscreen = externalIsFullscreen !== undefined ? externalIsFullscreen : internalFullscreen
  const toggleFullscreen = externalToggleFullscreen || (() => setInternalFullscreen(!internalFullscreen))

  const content = (
    <Box className={styles.sheetContainer}>
      <Box className={styles.sheet}>
        {!hideHeader && (
          <>
            {title && (
              <Box className={styles.sheetHeader}>
                <Box className={styles.sheetTitle}>{title}</Box>
                <Box className={styles.sheetControls}>
                  <IconButton
                    size="small"
                    onClick={toggleFullscreen}
                    className={styles.controlButton}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                  </IconButton>
                </Box>
              </Box>
            )}
            {!title && (
              <Box className={styles.sheetHeader} sx={{ justifyContent: 'flex-end', padding: '0.5rem 1rem' }}>
                <Box sx={{ flex: 1 }}></Box>
                <IconButton
                  size="small"
                  onClick={toggleFullscreen}
                  className={styles.controlButton}
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  sx={{ marginLeft: 'auto' }}
                >
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Box>
            )}
          </>
        )}
        <Box className={styles.sheetContent} sx={isFullscreen ? { height: 'calc(100vh - 80px)' } : {}}>
          {children}
        </Box>
      </Box>
    </Box>
  )

  if (isFullscreen) {
    return (
      <Dialog
        open={isFullscreen}
        onClose={toggleFullscreen}
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
        <DialogContent sx={{ p: 0, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {/* Theme Customizer */}
          <Customizer breakpoint="lg" />
          
          {/* Filters and Search Bar - Compact and on the right */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center', flexShrink: 0, justifyContent: 'flex-end', padding: '0.5rem 1rem', paddingTop: '1rem' }}>
            <TextField
              size="small"
              placeholder={dictionary?.navigation?.search || 'Search...'}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              sx={{ 
                minWidth: 300,
                maxWidth: 400, 
                '& .MuiInputBase-root': { 
                  height: '32px', 
                  fontSize: '0.75rem' 
                },
                '& .MuiInputBase-input::placeholder': {
                  fontSize: '0.75rem',
                  opacity: 0.6
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ fontSize: '0.875rem' }} />
                  </InputAdornment>
                )
              }}
            />
            {paymentClasses.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 180, maxWidth: 220 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>{dictionary?.navigation?.paymentClass || 'Payment Class'}</InputLabel>
                <Select
                  value={paymentClassFilter}
                  onChange={(e) => onPaymentClassFilterChange?.(e.target.value)}
                  label={dictionary?.navigation?.paymentClass || 'Payment Class'}
                  sx={{ 
                    height: '32px',
                    fontSize: '0.75rem',
                    '& .MuiSelect-select': { 
                      fontSize: '0.75rem',
                      padding: '4px 24px 4px 8px'
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.75rem'
                    }
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: '0.75rem', paddingLeft: '2px', paddingRight: '2px', paddingTop: '6px', paddingBottom: '6px' }}>{dictionary?.navigation?.allClasses || 'All Classes'}</MenuItem>
                  {paymentClasses.map((pc) => (
                    <MenuItem key={pc.code} value={pc.code} sx={{ fontSize: '0.75rem', paddingLeft: '2px', paddingRight: '2px', paddingTop: '6px', paddingBottom: '6px' }}>
                      {pc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <IconButton
              onClick={toggleFullscreen}
              aria-label="Exit fullscreen"
              size="small"
              sx={{ padding: '4px' }}
            >
              <FullscreenExit fontSize="small" />
            </IconButton>
          </Box>
          
          {/* Table Content - Direct render without sheet wrapper */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'hidden', 
            position: 'relative', 
            padding: '0 1rem 1rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            height: 0 // Force flex child to respect parent height
          }}>
            <Box sx={{ 
              height: '100%', 
              width: '100%',
              overflow: 'auto',
              '& .MuiTableContainer-root': {
                height: '100% !important',
                maxHeight: 'none !important',
                display: 'flex',
                flexDirection: 'column'
              },
              '& .MuiTable-root': {
                height: '100%'
              }
            }}>
              {children}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }

  return content
}

export default Table3DSheet

