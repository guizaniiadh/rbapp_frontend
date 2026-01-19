'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Box, Alert, CircularProgress, Snackbar, Dialog, DialogContent, DialogActions, Button, Typography } from '@mui/material'
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

// Components
import EntityCard from '@/components/EntityCard'

// Services
import { bankService } from '@/services/bank.service'
import { agencyService } from '@/services/agency.service'

// Types
import type { Bank } from '@/types/bank'
import type { EntityDefinition } from '@/components/EntityCard'

// Config
import { getEntityByName } from '@/configs/entityConfigs'

// Wrapper function to ensure the import works
const getEntityConfig = (entityName: string) => {
  return getEntityByName(entityName)
}

const BankDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const bankId = params.id as string
  const lang = params.lang as Locale
  const isNewBank = bankId === 'new'

  // State
  const [bank, setBank] = useState<Bank | undefined>(undefined)
  const [loading, setLoading] = useState(!isNewBank) // Don't show loading for new bank
  const [error, setError] = useState<string | undefined>(undefined)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [dictionary, setDictionary] = useState<any>(null)
  const [deleteBankDialogOpen, setDeleteBankDialogOpen] = useState(false)
  const [bankToDelete, setBankToDelete] = useState<string | null>(null)

  // Get entity definition
  const entityDefinition = getEntityConfig('Bank')
  
  // Debug: Log the entity definition to see the breadcrumb structure
  console.log('Entity definition breadcrumb:', entityDefinition?.breadcrumb)

  // Load bank data
  const loadBank = async () => {
    if (isNewBank) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(undefined)
      
      // Fetch real bank data from Django backend
      const bank = await bankService.getBankByCode(bankId)
      
      // Load agencies for this specific bank
      try {
        const agencies = await agencyService.getAgenciesByBank(bankId)
        if (agencies && agencies.length > 0) {
          const agencyNames = agencies.map((agency: any) => 
            agency.name || agency.code || `Agency ${agency.id}`
          ).join(', ')
          bank.agencies = agencyNames
        } else {
          bank.agencies = ''
        }
      } catch (agencyErr) {
        console.warn('Could not load agencies for bank (endpoint may not exist yet):', agencyErr)
        // For now, set empty agencies until the Django backend endpoint is created
        bank.agencies = ''
      }
      
      setBank(bank)
    } catch (err) {
      setError(dictionary?.navigation?.bankNotFound?.replace('{code}', bankId) || `Bank with code ${bankId} not found`)
      console.error('Error loading bank:', err)
    } finally {
      setLoading(false)
    }
  }

  // Save bank data
  const handleSave = async (data: any) => {
    try {
      setLoading(true)
      
      if (isNewBank) {
        // Create new bank
        // Handle agencies lookup field - don't send the formatted string to API
        const saveData = { ...data }
        
        // Remove read-only and lookup fields that shouldn't be sent to API
        delete saveData.id
        delete saveData.created_at
        delete saveData.updated_at
        delete saveData.agencies // Agencies are managed through the agency service
        delete saveData.logo // Logo not included in create (can be added later via update)
        delete saveData.logo_url // Logo URL is read-only
        
        // Remove any undefined or null values that might cause issues
        Object.keys(saveData).forEach(key => {
          if (saveData[key] === undefined || saveData[key] === null || saveData[key] === '') {
            // Keep empty strings for optional fields, but remove undefined/null
            if (saveData[key] === undefined || saveData[key] === null) {
              delete saveData[key]
            }
          }
        })
        
        console.log('Creating bank data:', saveData)
        
        // Validation
        if (!saveData.code || !saveData.code.trim()) {
          throw new Error(dictionary?.navigation?.codeRequired || 'Code is required')
        }
        if (!saveData.name || !saveData.name.trim()) {
          throw new Error(dictionary?.navigation?.nameRequired || 'Name is required')
        }
        
        await bankService.createBank(saveData as any)
        
        // Reset loading state before navigation to prevent glitch
        setLoading(false)
        
        // Navigate back to the banks list after creating
        router.push(`/${lang}/admin/banques/comptes-bancaires`)
      } else {
        // Update existing bank
        console.log('Updating existing bank...')
        console.log('Bank ID (code):', bankId)
        
        // Prepare data: include logo only if it's a File or explicitly null
        const updateData: any = {}
        
        console.log('Checking data.name:', data.name)
        if (data.name !== undefined) {
          updateData.name = data.name
          console.log('Added name to updateData:', updateData.name)
        }
        
        console.log('Checking data.address:', data.address)
        if (data.address !== undefined) {
          updateData.address = data.address
          console.log('Added address to updateData:', updateData.address)
        }
        
        console.log('Checking data.website:', data.website)
        if (data.website !== undefined) {
          updateData.website = data.website
          console.log('Added website to updateData:', updateData.website)
        }
        
        console.log('Checking data.logo:', data.logo)
        console.log('Logo type:', typeof data.logo)
        console.log('Is logo a File?', data.logo instanceof File)
        console.log('Is logo null?', data.logo === null)
        
        // Include logo if it's a File (new upload) or null (removal)
        if (data.logo instanceof File || data.logo === null) {
          updateData.logo = data.logo
          console.log('Added logo to updateData:', data.logo instanceof File ? 'File' : 'null')
        }
        
        // Include other configuration fields if they exist
        if (data.beginning_balance_label !== undefined) {
          updateData.beginning_balance_label = data.beginning_balance_label
        }
        if (data.statement_ending_balance_label !== undefined) {
          updateData.statement_ending_balance_label = data.statement_ending_balance_label
        }
        if (data.balance_label !== undefined) {
          updateData.balance_label = data.balance_label
        }
        if (data.ending_balance_label !== undefined) {
          updateData.ending_balance_label = data.ending_balance_label
        }
        if (data.total_difference_label !== undefined) {
          updateData.total_difference_label = data.total_difference_label
        }
        
        // If logo is not in data or is undefined, don't include it (no change)
        console.log('Final updateData:', updateData)
        console.log('UpdateData keys:', Object.keys(updateData))
        console.log('UpdateData values:', Object.values(updateData))
        
        // Note: code should NOT be included in updateData for PATCH requests
        // The code is in the URL path: /banks/{code}/
        console.log('Sending PATCH request to:', `/banks/${bankId}/`)
        console.log('Update payload:', JSON.stringify(updateData, null, 2))
        
        await bankService.updateBank(bankId, updateData)
        
        setSnackbar({
          open: true,
          message: dictionary?.navigation?.bankUpdatedSuccessfully || 'Bank updated successfully!',
          severity: 'success'
        })
        
        // Reload bank data to get updated information
        await loadBank()
      }
    } catch (err: any) {
      // Helper function to translate error messages
      const translateError = (message: string): string => {
        if (!message || lang !== 'fr') return message
        
        // Translate common error messages (handle these first before field name translation)
        const errorTranslations: { [key: string]: string } = {
          'bank with this code already exists': dictionary?.navigation?.bankCodeAlreadyExists || 'Une banque avec ce code existe déjà',
          'Bank with this code already exists': dictionary?.navigation?.bankCodeAlreadyExists || 'Une banque avec ce code existe déjà',
        }
        
        // Check for exact matches first (case-insensitive)
        const messageLower = message.toLowerCase().trim()
        for (const [en, fr] of Object.entries(errorTranslations)) {
          if (messageLower === en.toLowerCase()) {
            return fr
          }
        }
        
        // Check for partial matches in the error message text (not field names)
        let translated = message
        Object.entries(errorTranslations).forEach(([en, fr]) => {
          // Only replace if it's part of the error message, not a field name
          const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
          if (regex.test(translated)) {
            translated = translated.replace(regex, fr)
          }
        })
        
        // Don't translate "code" in error messages - keep it lowercase in French
        // Field names are translated separately in validation errors
        
        return translated
      }
      
      // Extract error message from API response
      let errorMessage = isNewBank 
        ? (dictionary?.navigation?.failedToCreateBank || 'Failed to create bank')
        : (dictionary?.navigation?.failedToUpdateBank || 'Failed to update bank')
      
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = translateError(err.response.data)
        } else if (err.response.data.detail) {
          errorMessage = translateError(err.response.data.detail)
        } else if (err.response.data.message) {
          errorMessage = translateError(err.response.data.message)
        } else if (err.response.data.error) {
          errorMessage = translateError(err.response.data.error)
        } else if (Object.keys(err.response.data).length > 0) {
          // Show validation errors with translated field names
          const fieldTranslations: { [key: string]: string } = {
            'code': dictionary?.navigation?.code || 'Code',
            'name': dictionary?.navigation?.name || 'Nom',
            'address': dictionary?.navigation?.address || 'Adresse',
            'website': dictionary?.navigation?.website || 'Site web',
          }
          
          const validationErrors = Object.entries(err.response.data)
            .map(([field, messages]) => {
              const translatedField = fieldTranslations[field] || field
              const messageText = Array.isArray(messages) ? messages.join(', ') : String(messages)
              // Translate the error message, but preserve lowercase "code" in French error messages
              const translatedMessage = translateError(messageText)
              return `${translatedField}: ${translatedMessage}`
            })
            .join('; ')
          
          // Always use French translation for validation prefix when lang is 'fr'
          const validationPrefix = lang === 'fr' 
            ? (dictionary?.navigation?.validationErrors || 'Erreurs de validation')
            : (dictionary?.navigation?.validationErrors || 'Validation errors')
          errorMessage = `${validationPrefix}: ${validationErrors}`
        }
      } else if (err?.message) {
        errorMessage = translateError(err.message)
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      })
      console.error(`Error ${isNewBank ? 'creating' : 'saving'} bank:`, err)
      console.error('Error response:', err?.response?.data)
    } finally {
      setLoading(false)
    }
  }

  // Delete bank - show confirmation dialog, or cancel if new bank
  const handleDelete = async (id: string) => {
    if (isNewBank || !id) {
      // For new banks or when no id provided, act as cancel button - navigate back
      handleBack()
      return
    }
    setBankToDelete(id || bankId)
    setDeleteBankDialogOpen(true)
  }

  // Confirm delete bank
  const handleConfirmDeleteBank = async () => {
    if (!bankToDelete) return

    try {
      setLoading(true)
      setDeleteBankDialogOpen(false)
      
      // Call real API to delete bank
      console.log('Deleting bank:', bankToDelete)
      await bankService.deleteBank(bankToDelete)
      
      setSnackbar({
        open: true,
        message: dictionary?.navigation?.bankDeletedSuccessfully || 'Bank deleted successfully!',
        severity: 'success'
      })
      
      setBankToDelete(null)
      
      // Navigate back to bank list
      router.push(`/${lang}/admin/banques/comptes-bancaires`)
    } catch (err: any) {
      let errorMessage = dictionary?.navigation?.failedToDeleteBank || 'Failed to delete bank'
      
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
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      })
      console.error('Error deleting bank:', err)
    } finally {
      setLoading(false)
    }
  }

  // Refresh bank data
  const handleRefresh = async () => {
    if (isNewBank) {
      // For new banks, reset the form to empty state
      setBank(undefined)
      setError(undefined)
      return
    }
    await loadBank()
  }

  // Navigate back to banks list
  const handleBack = () => {
    router.push(`/${lang}/admin/banques/comptes-bancaires`)
  }

  // Handle data change
  const handleDataChange = (data: any) => {
    setBank(prev => prev ? { ...prev, ...data } : null)
  }

  // Load dictionary
  useEffect(() => {
    if (!lang) return
    
    const loadDictionary = async () => {
      try {
        const dict = await getDictionaryClient(lang)
        setDictionary(dict)
      } catch (err) {
        console.error('Failed to load dictionary:', err)
      }
    }
    
    loadDictionary()
  }, [lang])

  // Load bank on mount
  useEffect(() => {
    if (bankId && !isNewBank) {
      loadBank()
    }
  }, [bankId, isNewBank])

  if (!entityDefinition) {
    return (
      <Box p={3}>
        <Alert severity="error">Entity configuration not found</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <EntityCard
        entityDefinition={entityDefinition}
        data={bank}
        loading={loading}
        error={error}
        onDataChange={handleDataChange}
        onSave={handleSave}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
        onBack={handleBack}
      />
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            backgroundColor: snackbar.severity === 'success' 
              ? (theme) => theme.palette.primary.main 
              : undefined,
            color: snackbar.severity === 'success' 
              ? (theme) => theme.palette.primary.contrastText 
              : undefined,
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'success' 
                ? (theme) => theme.palette.primary.contrastText 
                : undefined,
              backgroundColor: 'transparent !important'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Bank Confirmation Dialog */}
      <Dialog
        fullWidth
        open={deleteBankDialogOpen}
        onClose={() => {
          setDeleteBankDialogOpen(false)
          setBankToDelete(null)
        }}
        maxWidth='xs'
        scroll='body'
        closeAfterTransition={false}
      >
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='tabler-alert-circle text-[88px] mbe-6 text-error' />
          <Typography variant='h4' className='mbe-2'>
            {dictionary?.navigation?.confirmDeleteBank?.replace('{bankName}', bank?.name || bankToDelete || bankId) || 'Are you sure?'}
          </Typography>
          <Typography color='text.primary'>
            {dictionary?.navigation?.confirmDeleteBankMessage || 'You won\'t be able to revert this action!'}
          </Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              setDeleteBankDialogOpen(false)
              setBankToDelete(null)
            }}
          >
            {dictionary?.navigation?.cancel || 'Cancel'}
          </Button>
          <Button variant='contained' color='error' onClick={handleConfirmDeleteBank} disabled={loading}>
            {dictionary?.navigation?.delete || 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BankDetailsPage
