'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

import {
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider
} from '@mui/material'
import { 
  PlayArrow, 
  Description, 
  AccountBalance, 
  Receipt,
  ArrowForward,
  TextSnippet as FileText
} from '@mui/icons-material'

// Service Imports
import { agencyService } from '@/services/agency.service'
import { bankLedgerEntryService } from '@/services/bankLedgerEntry.service'
import { customerLedgerEntryService } from '@/services/customerLedgerEntry.service'

// Type Imports
import type { Agency } from '@/types/agency'

const ReconciliationPage = () => {
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as Locale
  
  // State
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dictionary, setDictionary] = useState<any>(null)

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

  // Load agencies
  const loadAgencies = useCallback(async () => {
    try {
      setLoading(true)
      const agenciesData = await agencyService.getAgencies()
      setAgencies(agenciesData)
    } catch (err) {
      console.error('Error loading agencies:', err)
      const errorMsg = err instanceof Error ? err.message : dictionary?.navigation?.unknownError || 'Unknown error'
      setError(dictionary?.navigation?.failedToLoadAgencies 
        ? `${dictionary.navigation.failedToLoadAgencies}: ${errorMsg}`
        : `Failed to load agencies: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }, [dictionary])

  // Get reconciliation status for an agency
  const getReconciliationStatus = async (agencyCode: string) => {
    try {
      const [bankEntries, customerEntries] = await Promise.all([
        bankLedgerEntryService.getBankLedgerEntries({ agency: agencyCode }),
        customerLedgerEntryService.getCustomerLedgerEntries()
      ])
      
      return {
        bankEntries: bankEntries.length,
        customerEntries: customerEntries.length,
        ready: bankEntries.length > 0 && customerEntries.length > 0
      }
    } catch (err) {
      console.error('Error getting reconciliation status:', err)
      return {
        bankEntries: 0,
        customerEntries: 0,
        ready: false
      }
    }
  }

  // Navigate to agency reconciliation
  const handleAgencyReconciliation = (agencyCode: string) => {
    router.push(`/reconciliation/agency/${agencyCode}`)
  }

  // Load data on mount
  useEffect(() => {
    loadAgencies()
  }, [loadAgencies])

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant='h4' gutterBottom>
              Reconciliation
            </Typography>
            <Typography color='text.secondary'>
              Select an agency to begin the reconciliation process
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {agencies.map((agency) => (
            <Grid item xs={12} sm={6} md={4} key={agency.code}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <AccountBalance />
                    </Avatar>
                  }
                  title={agency.name}
                  subheader={`Code: ${agency.code}`}
                  action={
                    <Chip
                      label="Active"
                      color="success"
                      size="small"
                    />
                  }
                />
                
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {agency.description || 'Agency reconciliation management'}
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <AccountBalance color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Bank Ledger"
                        secondary="Upload bank statements"
                      />
                    </ListItem>
                    
                    <Divider />
                    
                    <ListItem>
                      <ListItemIcon>
                        <Receipt color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Customer Ledger"
                        secondary="Upload customer invoices"
                      />
                    </ListItem>
                  </List>
                </CardContent>
                
                <CardActions>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={() => handleAgencyReconciliation(agency.code)}
                    fullWidth
                  >
                    Start Reconciliation
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {agencies.length === 0 && (
        <Box textAlign="center" py={8}>
          <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Agencies Found
          </Typography>
            <Typography color="text.secondary">
              Please contact your administrator to set up agencies for reconciliation.
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  )
}

export default ReconciliationPage
