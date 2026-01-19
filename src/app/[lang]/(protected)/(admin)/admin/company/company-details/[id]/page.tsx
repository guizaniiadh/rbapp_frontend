'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Box, Alert, CircularProgress, Snackbar } from '@mui/material'
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

// Components
import EntityDetailCard from '@/components/EntityDetailCard'

// Services
import { companyService } from '@/services/company.service'

// Types
import type { Company } from '@/types/company'
import type { EntityConfig } from '@/components/EntityDetailCard'

// Config
import { companyEntityConfig } from '@/configs/entityConfigs'

const CompanyDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string
  const lang = params.lang as Locale

  // State
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [dictionary, setDictionary] = useState<any>(null)

  // Load company data
  const loadCompany = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For demo purposes, we'll create a mock company
      // In real implementation, you would fetch from API
      const mockCompany: Company = {
        code: companyId,
        name: `Company ${companyId}`,
        users: [],
        user_count: 0,
        active_user_count: 0
      }
      
      setCompany(mockCompany)
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
      
      // In real implementation, you would call the API
      console.log('Saving company data:', data)
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSnackbar({
        open: true,
        message: dictionary?.navigation?.companyUpdatedSuccessfully || 'Company updated successfully!',
        severity: 'success'
      })
      
      // Update local state
      setCompany(prev => prev ? { ...prev, ...data } : null)
    } catch (err) {
      setSnackbar({
        open: true,
        message: dictionary?.navigation?.failedToUpdateCompany || 'Failed to update company',
        severity: 'error'
      })
      console.error('Error saving company:', err)
    } finally {
      setLoading(false)
    }
  }

  // Delete company
  const handleDelete = async (id: string) => {
    try {
      setLoading(true)
      
      // In real implementation, you would call the API
      console.log('Deleting company:', id)
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSnackbar({
        open: true,
        message: dictionary?.navigation?.companyDeletedSuccessfully || 'Company deleted successfully!',
        severity: 'success'
      })
      
      // Navigate back to company list
      router.push('/admin/company/company-list')
    } catch (err) {
      setSnackbar({
        open: true,
        message: dictionary?.navigation?.failedToDeleteCompany || 'Failed to delete company',
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
    router.push('/admin/company/company-informations')
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
    if (companyId) {
      loadCompany()
    }
  }, [companyId])

  // Configure entity config with handlers
  const entityConfig: EntityConfig = {
    ...companyEntityConfig,
    onSave: handleSave,
    onDelete: handleDelete,
    onRefresh: handleRefresh,
    onBack: handleBack
  }

  if (loading && !company) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <EntityDetailCard
        config={entityConfig}
        data={company}
        loading={loading}
        error={error}
        onDataChange={handleDataChange}
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
    </Box>
  )
}

export default CompanyDetailsPage
