'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Box, Alert, CircularProgress, Snackbar, Dialog, DialogContent, DialogActions, Button, Typography } from '@mui/material'
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

// Components
import EntityCard from '@/components/EntityCard'

// Services
import { companyService } from '@/services/company.service'

// Types
import type { Company } from '@/types/company'
import type { EntityDefinition } from '@/components/EntityCard'

// Config
import { getEntityByName } from '@/configs/entityConfigs'

// Wrapper function to ensure the import works
const getEntityConfig = (entityName: string) => {
  return getEntityByName(entityName)
}

const CompanyDetailsNewPage = () => {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string
  const lang = params.lang as Locale

  // Check if we're in create mode
  const isNewCompany = companyId === 'new'

  // State
  const [company, setCompany] = useState<Company | undefined>(isNewCompany ? undefined : undefined)
  const [loading, setLoading] = useState(!isNewCompany)
  const [error, setError] = useState<string | undefined>(undefined)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [dictionary, setDictionary] = useState<any>(null)
  const [deleteCompanyDialogOpen, setDeleteCompanyDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null)

  // Get entity definition
  const entityDefinition = getEntityConfig('Company')
  
  // Debug: Log the entity definition to see the breadcrumb structure
  console.log('Entity definition breadcrumb:', entityDefinition?.breadcrumb)

  // Load company data
  const loadCompany = async () => {
    // Don't load if creating new company
    if (isNewCompany) {
      setLoading(false)
      setCompany(undefined)
      setError(undefined)
      return
    }

    try {
      setLoading(true)
      setError(undefined)
      
      // Fetch real company data with users from Django backend
      const companies = await companyService.getCompaniesWithUsers()
      const company = companies.find(c => c.code === companyId)
      
      if (company) {
        // Format users for display if they exist
        if (Array.isArray(company.users) && company.users.length > 0) {
          const userNames = company.users.map(user => 
            user.first_name && user.last_name 
              ? `${user.first_name} ${user.last_name}` 
              : user.username
          ).join(', ')
          // Create a new company object with formatted users string
          const formattedCompany = {
            ...company,
            users: userNames
          }
          setCompany(formattedCompany)
          setError(undefined) // Clear any previous errors
        } else {
          setCompany(company)
          setError(undefined) // Clear any previous errors
        }
      } else {
        setError(`Company with code ${companyId} not found`)
      }
    } catch (err) {
      setError('Failed to load company details')
      console.error('Error loading company:', err)
    } finally {
      setLoading(false)
    }
  }

  // Save company data
  const handleSave = async (data: any) => {
    try {
      setLoading(true)
      
      console.log('=== SAVE DEBUG START ===')
      console.log('1. Raw data received from EntityCard:', data)
      console.log('2. Data keys:', Object.keys(data || {}))
      console.log('3. Data values:', Object.values(data || {}))
      console.log('4. Company ID:', companyId)
      console.log('5. Is new company:', isNewCompany)
      console.log('6. Current company state:', company)
      
      if (isNewCompany) {
        // Create new company
        // Note: Logo upload not supported during creation, only during update
        console.log('7. Creating new company...')
        console.log('7a. Data before logo removal:', data)
        const { logo, ...companyData } = data
        console.log('7b. Company data after logo removal:', companyData)
        console.log('7c. Company data keys:', Object.keys(companyData))
        console.log('7d. Company data.code:', companyData.code)
        console.log('7e. Company data.name:', companyData.name)
        
        if (!companyData.code) {
          console.error('ERROR: code is missing from companyData!')
          console.error('Available keys:', Object.keys(companyData))
        }
        
        const createdCompany = await companyService.createCompany(companyData)
        
        console.log('8. Created company response:', createdCompany)
        
        setSnackbar({
          open: true,
          message: dictionary?.navigation?.companyCreatedSuccessfully || 'Company created successfully!',
          severity: 'success'
        })
        
        // Navigate to the created company's detail page
        router.push(`/${lang}/admin/company/company-details-new/${createdCompany.code}`)
      } else {
        // Update existing company
        console.log('7. Updating existing company...')
        console.log('7a. Company ID (code):', companyId)
        
        // Prepare data: include logo only if it's a File or explicitly null
        const updateData: any = {}
        
        console.log('7b. Checking data.name:', data.name)
        if (data.name !== undefined) {
          updateData.name = data.name
          console.log('7c. Added name to updateData:', updateData.name)
        }
        
        console.log('7d. Checking data.logo:', data.logo)
        console.log('7e. Logo type:', typeof data.logo)
        console.log('7f. Is logo a File?', data.logo instanceof File)
        console.log('7g. Is logo null?', data.logo === null)
        
        // Include logo if it's a File (new upload) or null (removal)
        if (data.logo instanceof File || data.logo === null) {
          updateData.logo = data.logo
          console.log('7h. Added logo to updateData:', data.logo instanceof File ? 'File' : 'null')
        }
        
        // If logo is not in data or is undefined, don't include it (no change)
        console.log('7i. Final updateData:', updateData)
        console.log('7j. UpdateData keys:', Object.keys(updateData))
        console.log('7k. UpdateData values:', Object.values(updateData))
        
        // Note: code should NOT be included in updateData for PUT requests
        // The code is in the URL path: /companies/{code}/
        console.log('7l. Sending PUT request to:', `/companies/${companyId}/`)
        console.log('7m. Update payload:', JSON.stringify(updateData, null, 2))
        
        await companyService.updateCompany(companyId, updateData)
        
        console.log('8. Update successful')
        
        setSnackbar({
          open: true,
          message: dictionary?.navigation?.companyUpdatedSuccessfully || 'Company updated successfully!',
          severity: 'success'
        })
        
        // Reload company data to get updated information
        await loadCompany()
      }
    } catch (err: any) {
      let errorMessage = isNewCompany 
        ? (dictionary?.navigation?.failedToCreateCompany || 'Failed to create company')
        : (dictionary?.navigation?.failedToUpdateCompany || 'Failed to update company')
      
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
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      })
      console.error('Error saving company:', err)
    } finally {
      setLoading(false)
    }
  }

  // Delete company - show confirmation dialog
  const handleDelete = async (id: string) => {
    // Don't allow delete for new companies
    if (isNewCompany) {
      return
    }
    
    // Use the provided id or fall back to companyId
    const companyCode = id || companyId
    
    if (!companyCode) {
      setSnackbar({
        open: true,
        message: dictionary?.navigation?.failedToDeleteCompany || 'Failed to delete company: No company code found',
        severity: 'error'
      })
      return
    }
    
    setCompanyToDelete(companyCode)
    setDeleteCompanyDialogOpen(true)
  }

  // Confirm delete company
  const handleConfirmDeleteCompany = async () => {
    if (!companyToDelete) return

    try {
      setLoading(true)
      setDeleteCompanyDialogOpen(false)
      
      // Call real API to delete company
      console.log('Deleting company:', companyToDelete)
      await companyService.deleteCompany(companyToDelete)
      
      setSnackbar({
        open: true,
        message: dictionary?.navigation?.companyDeletedSuccessfully || 'Company deleted successfully!',
        severity: 'success'
      })
      
      setCompanyToDelete(null)
      
      // Navigate back to company list
      router.push(`/${lang}/admin/company/company-list`)
    } catch (err: any) {
      let errorMessage = dictionary?.navigation?.failedToDeleteCompany || 'Failed to delete company'
      
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
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      })
      console.error('Error deleting company:', err)
    } finally {
      setLoading(false)
    }
  }

  // Refresh company data
  const handleRefresh = async () => {
    await loadCompany()
  }

  // Navigate back
  const handleBack = () => {
    router.push(`/${lang}/admin/company/company-list`)
  }

  // Handle data change
  const handleDataChange = (data: any) => {
    setCompany(prev => prev ? { ...prev, ...data } : null)
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

  // Load company on mount
  useEffect(() => {
    if (companyId && !isNewCompany) {
      // Clear any previous error before loading
      setError(undefined)
      loadCompany()
    } else if (isNewCompany) {
      setLoading(false)
      setCompany(undefined)
      setError(undefined)
    }
  }, [companyId, isNewCompany])

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
        data={company}
        loading={loading}
        error={loading ? undefined : error}
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

      {/* Delete Company Confirmation Dialog */}
      <Dialog
        fullWidth
        open={deleteCompanyDialogOpen}
        onClose={() => {
          setDeleteCompanyDialogOpen(false)
          setCompanyToDelete(null)
        }}
        maxWidth='xs'
        scroll='body'
        closeAfterTransition={false}
      >
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='tabler-alert-circle text-[88px] mbe-6 text-error' />
          <Typography variant='h4' className='mbe-2'>
            {dictionary?.navigation?.confirmDeleteCompany?.replace('{companyCode}', company?.name || companyToDelete || companyId) || 'Are you sure?'}
          </Typography>
          <Typography color='text.primary'>
            {dictionary?.navigation?.confirmDeleteCompanyMessage || 'You won\'t be able to revert this action!'}
          </Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              setDeleteCompanyDialogOpen(false)
              setCompanyToDelete(null)
            }}
          >
            {dictionary?.navigation?.cancel || 'Cancel'}
          </Button>
          <Button variant='contained' color='error' onClick={handleConfirmDeleteCompany} disabled={loading}>
            {dictionary?.navigation?.delete || 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CompanyDetailsNewPage
