'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Box, Alert, CircularProgress, Snackbar, Dialog, DialogContent, DialogActions, Button, Typography } from '@mui/material'
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

// Components
import EntityCard from '@/components/EntityCard'

// Services
import { agencyService } from '@/services/agency.service'
import { bankService } from '@/services/bank.service'

// Types
import type { Agency } from '@/types/agency'
import type { EntityDefinition } from '@/components/EntityCard'

// Config
import { getEntityByName } from '@/configs/entityConfigs'

// Wrapper function to ensure the import works
const getEntityConfig = (entityName: string) => {
  return getEntityByName(entityName)
}

const AgencyDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const agencyId = params.id as string
  const lang = params.lang as Locale
  const isNewAgency = agencyId === 'new'

  // State
  const [agency, setAgency] = useState<Agency | undefined>(undefined)
  const [loading, setLoading] = useState(!isNewAgency) // Don't show loading for new agency
  const [error, setError] = useState<string | undefined>(undefined)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [dictionary, setDictionary] = useState<any>(null)
  const [deleteAgencyDialogOpen, setDeleteAgencyDialogOpen] = useState(false)
  const [agencyToDelete, setAgencyToDelete] = useState<string | null>(null)

  // Get entity definition
  const entityDefinition = getEntityConfig('Agency')
  
  // Debug: Log the entity definition to see the breadcrumb structure
  console.log('Entity definition breadcrumb:', entityDefinition?.breadcrumb)

  // Load agency data
  const loadAgency = async () => {
    if (isNewAgency) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(undefined)
      
      // Fetch real agency data from Django backend
      const agencyData = await agencyService.getAgencyByCode(agencyId)
      
      // Load bank information for this agency
      // The API might return bank_id, but we need to convert it to bank for the form
      try {
        // Check if we have bank_id from the database
        if ((agencyData as any).bank_id) {
          const bankId = (agencyData as any).bank_id
          try {
            // Try to fetch bank by code (banks use code as identifier)
            const banks = await bankService.getBanks()
            const bank = banks.find(b => b.code === String(bankId))
            if (bank) {
              // Set bank as object with code for the lookup field
              agencyData.bank = { code: bank.code, name: bank.name }
            } else {
              // If not found, use the bank_id as number
              agencyData.bank = typeof bankId === 'number' ? bankId : parseInt(String(bankId), 10)
            }
          } catch (bankErr) {
            console.warn('Could not fetch bank details:', bankErr)
            // Use bank_id as number
            agencyData.bank = typeof (agencyData as any).bank_id === 'number' 
              ? (agencyData as any).bank_id 
              : parseInt(String((agencyData as any).bank_id), 10)
          }
        } else if (agencyData.bank) {
          // If bank is already set (from API response)
          const bankValue = agencyData.bank
          
          if (typeof bankValue === 'object' && bankValue !== null && 'code' in bankValue) {
            // Bank is already an object with code, ensure it has name
            const bankObj = bankValue as { code: string; name?: string }
            if (!bankObj.name) {
              try {
                const banks = await bankService.getBanks()
                const bank = banks.find(b => b.code === bankObj.code)
                if (bank) {
                  agencyData.bank = { code: bank.code, name: bank.name }
                }
              } catch (bankErr) {
                console.warn('Could not fetch bank name:', bankErr)
              }
            }
          } else if (typeof bankValue === 'string') {
            // Bank is a string (code), fetch bank details
            try {
              const banks = await bankService.getBanks()
              const bank = banks.find(b => b.code === bankValue)
              if (bank) {
                agencyData.bank = { code: bank.code, name: bank.name }
              }
            } catch (bankErr) {
              console.warn('Could not fetch bank details:', bankErr)
            }
          } else if (typeof bankValue === 'number') {
            // Bank is a number (ID), try to fetch bank details
            try {
              const banks = await bankService.getBanks()
              const bank = banks.find(b => b.code === String(bankValue))
              if (bank) {
                agencyData.bank = { code: bank.code, name: bank.name }
              }
            } catch (bankErr) {
              console.warn('Could not fetch bank details:', bankErr)
              // Keep as number
            }
          }
        }
      } catch (bankErr) {
        console.warn('Could not load bank for agency:', bankErr)
        // Keep the bank as is
      }
      
      setAgency(agencyData)
    } catch (err) {
      setError(dictionary?.navigation?.agencyNotFound?.replace('{code}', agencyId) || `Agency with code ${agencyId} not found`)
      console.error('Error loading agency:', err)
    } finally {
      setLoading(false)
    }
  }

  // Save agency data
  const handleSave = async (data: any) => {
    try {
      setLoading(true)
      
      // Handle bank lookup field - convert to bank_id to match database structure
      const saveData: any = { ...data }
      
      // Remove read-only and lookup fields that shouldn't be sent to API
      delete saveData.id
      delete saveData.created_at
      delete saveData.updated_at
      
      // Handle bank field - backend expects 'bank' with bank code (string)
      // The form uses 'bank' as an object with code and name for display
      if (saveData.bank !== undefined) {
        let bankCode: string | undefined
        
        if (typeof saveData.bank === 'string') {
          // String could be bank name or code - need to find the bank code
          try {
            const banks = await bankService.getBanks()
            const bank = banks.find(b => b.name === saveData.bank || b.code === saveData.bank)
            if (bank) {
              // Use bank code as the API expects the code
              bankCode = bank.code
            } else {
              // If not found, assume it's already a code
              bankCode = saveData.bank
            }
          } catch (bankErr) {
            console.warn('Could not fetch banks to resolve bank field:', bankErr)
            // Assume it's already a code
            bankCode = saveData.bank
          }
        } else if (saveData.bank && typeof saveData.bank === 'object' && 'code' in saveData.bank) {
          // Bank object with code - extract the code
          bankCode = saveData.bank.code
        } else if (typeof saveData.bank === 'number') {
          // Bank is a number - convert to string code
          bankCode = String(saveData.bank)
        }
        
        // Set bank to the code (backend expects 'bank' field with code as string)
        if (bankCode !== undefined) {
          saveData.bank = bankCode
          console.log('🏦 Bank field converted to code:', bankCode, 'from:', data.bank)
        } else {
          // If we can't determine the code, remove the bank field
          console.warn('⚠️ Could not determine bank code from:', data.bank)
          delete saveData.bank
        }
      } else {
        console.warn('⚠️ Bank field is undefined in save data')
      }
      
      // Don't remove bank field even if it's empty string - it's required
      // Remove any undefined or null values that might cause issues (except bank)
      Object.keys(saveData).forEach(key => {
        if (key === 'bank') {
          // Keep bank field - it's required
          return
        }
        if (saveData[key] === undefined || saveData[key] === null || saveData[key] === '') {
          // Keep empty strings for optional fields, but remove undefined/null
          if (saveData[key] === undefined || saveData[key] === null) {
            delete saveData[key]
          }
        }
      })
      
      // Ensure bank is included if it was in the original data
      if (data.bank !== undefined && saveData.bank === undefined) {
        // Bank was in the form data but got removed - restore it
        if (typeof data.bank === 'object' && data.bank && 'code' in data.bank) {
          saveData.bank = data.bank.code
        } else if (typeof data.bank === 'string') {
          saveData.bank = data.bank
        }
      }
      
      if (isNewAgency) {
        // Create new agency
        console.log('Creating agency data:', saveData)
        
        // Validation
        if (!saveData.code || !saveData.code.trim()) {
          throw new Error(dictionary?.navigation?.codeRequired || 'Code is required')
        }
        if (!saveData.name || !saveData.name.trim()) {
          throw new Error(dictionary?.navigation?.nameRequired || 'Name is required')
        }
        
        await agencyService.createAgency(saveData as any)
        
        // Reset loading state before navigation to prevent glitch
        setLoading(false)
        
        // Navigate back to the agencies list after creating
        router.push(`/${lang}/admin/banques/comptes-bancaires#agencies`)
      } else {
        // Update existing agency
        console.log('💾 Saving agency data:', saveData)
        console.log('🏦 Bank value in saveData:', saveData.bank, 'Type:', typeof saveData.bank)
        await agencyService.updateAgency(agencyId, saveData)
        
        setSnackbar({
          open: true,
          message: dictionary?.navigation?.agencyUpdatedSuccessfully || 'Agency updated successfully!',
          severity: 'success'
        })
        
        // Reload agency data to get updated information
        await loadAgency()
      }
    } catch (err: any) {
      // Helper function to translate error messages
      const translateError = (message: string): string => {
        if (!message || lang !== 'fr') return message
        
        // Translate common error messages (handle these first before field name translation)
        const errorTranslations: { [key: string]: string } = {
          'this field is required': dictionary?.navigation?.thisFieldIsRequired || 'Ce champ est requis',
          'This field is required': dictionary?.navigation?.thisFieldIsRequired || 'Ce champ est requis',
          'agency with this code already exists': dictionary?.navigation?.agencyCodeAlreadyExists || 'Une agence avec ce code existe déjà',
          'Agency with this code already exists': dictionary?.navigation?.agencyCodeAlreadyExists || 'Une agence avec ce code existe déjà',
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
        
        // Don't translate field names in error messages - they're translated separately
        
        return translated
      }
      
      // Extract error message from API response
      let errorMessage = isNewAgency 
        ? (dictionary?.navigation?.failedToCreateAgency || 'Failed to create agency')
        : (dictionary?.navigation?.failedToUpdateAgency || 'Failed to update agency')
      
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
            'city': dictionary?.navigation?.city || 'Ville',
            'bank': dictionary?.navigation?.bank || 'Banque',
          }
          
          const validationErrors = Object.entries(err.response.data)
            .map(([field, messages]) => {
              const translatedField = fieldTranslations[field] || field
              const messageText = Array.isArray(messages) ? messages.join(', ') : String(messages)
              // Translate the error message
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
      console.error(`Error ${isNewAgency ? 'creating' : 'saving'} agency:`, err)
      console.error('Error response:', err?.response?.data)
    } finally {
      setLoading(false)
    }
  }

  // Delete agency - show confirmation dialog, or cancel if new agency
  const handleDelete = async (id: string) => {
    if (isNewAgency || !id) {
      // For new agencies or when no id provided, act as cancel button - navigate back
      handleBack()
      return
    }
    setAgencyToDelete(id || agencyId)
    setDeleteAgencyDialogOpen(true)
  }

  // Confirm delete agency
  const handleConfirmDeleteAgency = async () => {
    if (!agencyToDelete) return

    try {
      setLoading(true)
      setDeleteAgencyDialogOpen(false)
      
      // Call real API to delete agency
      console.log('Deleting agency:', agencyToDelete)
      await agencyService.deleteAgency(agencyToDelete)
      
      setSnackbar({
        open: true,
        message: dictionary?.navigation?.agencyDeletedSuccessfully || 'Agency deleted successfully!',
        severity: 'success'
      })
      
      setAgencyToDelete(null)
      
      // Navigate back to agencies list (tab 1 of the banks/agencies page)
      router.push(`/${lang}/admin/banques/comptes-bancaires#agencies`)
    } catch (err: any) {
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
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      })
      console.error('Error deleting agency:', err)
    } finally {
      setLoading(false)
    }
  }

  // Refresh agency data
  const handleRefresh = async () => {
    if (isNewAgency) {
      // For new agencies, reset the form to empty state
      setAgency(undefined)
      setError(undefined)
      return
    }
    await loadAgency()
  }

  // Navigate back to agencies list (tab 1 of the banks/agencies page)
  const handleBack = () => {
    router.push(`/${lang}/admin/banques/comptes-bancaires#agencies`)
  }

  // Handle data change
  const handleDataChange = (data: any) => {
    // Preserve bank object structure if it exists
    const updatedData = { ...data }
    if (data.bank && typeof data.bank === 'object' && data.bank.name) {
      // Keep bank as object with name
      updatedData.bank = { code: data.bank.code, name: data.bank.name }
    }
    setAgency(prev => prev ? { ...prev, ...updatedData } : null)
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

  // Load agency on mount
  useEffect(() => {
    if (agencyId && !isNewAgency) {
      loadAgency()
    }
  }, [agencyId, isNewAgency])

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
        data={agency}
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
            {dictionary?.navigation?.confirmDeleteAgency?.replace('{agencyName}', agency?.name || agencyToDelete || agencyId) || 'Are you sure?'}
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
    </Box>
  )
}

export default AgencyDetailsPage

