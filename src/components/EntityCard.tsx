'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
  Link,
  useTheme,
  Button,
  IconButton
} from '@mui/material'
import {
  ArrowBack,
  Save,
  RotateLeft,
  DeleteForever,
  Home,
  ExpandMore,
  Close
} from '@mui/icons-material'

import styles from './EntityCard.module.css'
import EntityLookupEnhanced from './EntityLookupEnhanced'

// Types
export interface EntityField {
  field: string
  label: { fr: string; en: string; ar: string }
  type: 'String' | 'Number' | 'Boolean' | 'Date' | 'Lookup' | 'Email' | 'Phone' | 'Url' | 'Textarea' | 'Image'
  value?: any
  options?: { value: any; label: string }[]
  required?: boolean
  disabled?: boolean
  placeholder?: string
  tooltip?: { fr: string; en: string; ar: string }
  tab?: number
  order?: number
  showList?: boolean
  showCard?: boolean
  lookupEntity?: string
  width?: 'wide' // optional flag: set to 'wide' to apply the .smallField (wide) class on the field wrapper
}

export interface EntityTab {
  id: number
  title: { fr: string; en: string; ar: string }
  open?: boolean
  fields?: EntityField[]
}

export interface EntityDefinition {
  apiURI: string
  titleList: { fr: string; en: string; ar: string }
  titleForm: { fr: string; en: string; ar: string }
  breadcrumb: string[] | { fr: string[]; en: string[]; ar: string[] }
  tabs?: EntityTab[]
  fields: EntityField[]
}

export interface EntityCardProps {
  entityDefinition: EntityDefinition
  data?: any
  loading?: boolean
  error?: string
  onDataChange?: (data: any) => void
  onSave?: (data: any) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onRefresh?: () => Promise<void>
  onBack?: () => void
  inputFocusColor?: string
}

const EntityCard: React.FC<EntityCardProps> = ({
  entityDefinition,
  data,
  loading = false,
  error,
  onDataChange,
  onSave,
  onDelete,
  onRefresh,
  onBack,
  inputFocusColor = 'var(--mui-palette-primary-main, #7367f0)'
}) => {
  const theme = useTheme()
  const [formData, setFormData] = useState<any>({})
  const [editMode, setEditMode] = useState(true) // Enable inline editing by default
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const params = useParams()
  const currentLanguage = (params?.lang as 'fr' | 'en') || 'fr'
  const [expandedTabs, setExpandedTabs] = useState<{ [key: number]: boolean }>({})
  const [dictionary, setDictionary] = useState<any>(null)
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string | null }>({})
  const [imageFiles, setImageFiles] = useState<{ [key: string]: File | null }>({})
  const failedImageUrlsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (data) {
      setFormData(data)
      // Update image previews from server logo_url when data changes
      // This ensures the logo displays correctly after save/reload
      if (data.logo_url) {
        // Use logo_url as-is from backend - backend provides correct URL
        console.log('Setting logo preview from server:', data.logo_url)
        setImagePreviews(prev => ({ ...prev, logo: data.logo_url }))
        // Clear any pending file uploads since server has the logo
        setImageFiles(prev => {
          const newFiles = { ...prev }
          if (newFiles.logo instanceof File) {
            delete newFiles.logo
          }
          return newFiles
        })
        // Reset failed URLs when new data loads
        failedImageUrlsRef.current = new Set()
      } else {
        // If no logo_url, check if we're uploading a file before clearing
        // We need to check the current imageFiles state
        setImageFiles(currentFiles => {
          const hasFileBeingUploaded = currentFiles.logo instanceof File
          if (!hasFileBeingUploaded) {
            // Logo was removed or doesn't exist - clear everything
            console.log('Clearing logo preview - no logo_url in data and no file being uploaded')
            const newFiles = { ...currentFiles }
            delete newFiles.logo
            // Clear previews separately
            setImagePreviews(prev => {
              const newPreviews = { ...prev }
              delete newPreviews.logo
              return newPreviews
            })
            return newFiles
          } else {
            // Keep the preview from file selection - don't clear it
            console.log('No logo_url from server, but file is being uploaded - keeping preview')
            return currentFiles // Don't modify
          }
        })
        failedImageUrlsRef.current = new Set()
      }
    } else {
      // Clear previews when data is cleared
      setImagePreviews({})
      setImageFiles({})
      failedImageUrlsRef.current = new Set()
    }
  }, [data])

  useEffect(() => {
    if (entityDefinition.tabs) {
      const initialExpanded: { [key: number]: boolean } = {}
      entityDefinition.tabs.forEach(tab => {
        initialExpanded[tab.id] = tab.open || false
      })
      setExpandedTabs(initialExpanded)
    }
  }, [entityDefinition.tabs])

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionaryClient(currentLanguage)
      setDictionary(dict)
    }
    loadDictionary()
  }, [currentLanguage])

  const handleFieldChange = (fieldName: string, value: any) => {
    const newData = { ...formData, [fieldName]: value }
    setFormData(newData)
    onDataChange?.(newData)
  }

  const handleSave = async () => {
    if (!onSave) return

    try {
      setSaving(true)
      // Merge imageFiles into formData to ensure File objects are included
      // formData already contains null values if logo was removed, so they'll be included
      const dataToSave = { ...formData }
      Object.keys(imageFiles).forEach(fieldName => {
        if (imageFiles[fieldName] instanceof File) {
          dataToSave[fieldName] = imageFiles[fieldName]
        } else if (imageFiles[fieldName] === null) {
          // Explicitly set to null to remove image (overrides formData if needed)
          dataToSave[fieldName] = null
        }
      })
      // Note: formData[field.field] = null is already included in dataToSave via spread
      await onSave(dataToSave)
      setEditMode(false)
      // Don't clear imageFiles immediately - wait for server response
      // The useEffect will clear imageFiles when data reloads with logo_url
      // This ensures the preview stays visible if server hasn't processed the file yet
    } catch (err) {
      console.error('Error saving:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    // Use id or code as identifier (some entities use code, others use id)
    // For new entities (no identifier), pass empty string to indicate cancel action
    const identifier = data?.id || data?.code || ''

    try {
      setDeleting(true)
      await onDelete(identifier)
    } catch (err) {
      console.error('Error deleting:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleRefresh = async () => {
    if (!onRefresh) return

    try {
      // Reset form data immediately to clear any entered values
      setFormData({})
      await onRefresh()
      // After refresh, keep edit mode enabled so user can continue typing
      // Only disable edit mode if we have actual data (existing entity)
      if (!data) {
        setEditMode(true) // Keep edit mode for new entities
      } else {
        setEditMode(false) // Disable for existing entities after refresh
      }
    } catch (err) {
      console.error('Error refreshing:', err)
    }
  }

  const handleAccordionChange = (tabId: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedTabs(prev => ({
      ...prev,
      [tabId]: isExpanded
    }))
  }

  const renderFieldLabel = (label: string, tooltip?: string) => {
    // Concatenate label if it's too long
    const displayLabel = label.length > 15 ? `${label.substring(0, 12)}...` : label
    
    return (
      <Box className={styles.formFieldLabelWithDots}>
        <Typography className={styles.formFieldLabelText} title={tooltip || label}>
          {displayLabel}
        </Typography>
        <Box className={styles.formFieldDottedLine} />
      </Box>
    )
  }

  const renderField = (field: EntityField) => {
    const value = formData[field.field] ?? ''
    // Lookup fields should always be clickable, even when not in edit mode
    const isDisabled = field.disabled || (!editMode && field.type !== 'Boolean' && field.type !== 'Lookup')
    const label = field.label[currentLanguage as keyof typeof field.label] || field.label.fr
    const tooltip = field.tooltip?.[currentLanguage as keyof typeof field.tooltip] || field.tooltip?.fr || ''

    switch (field.type) {
      case 'Email':
        return (
          <Box className={styles.fieldContainer}>
            {renderFieldLabel(label, tooltip)}
            <Box className={styles.formField}>
              <input
                type="email"
                value={value}
                onChange={(e) => handleFieldChange(field.field, e.target.value)}
                placeholder={field.placeholder}
                disabled={isDisabled}
              />
            </Box>
          </Box>
        )

      case 'Phone':
        return (
          <Box className={styles.fieldContainer}>
            {renderFieldLabel(label, tooltip)}
            <Box className={styles.formField}>
              <input
                type="tel"
                value={value}
                onChange={(e) => handleFieldChange(field.field, e.target.value)}
                placeholder={field.placeholder}
                disabled={isDisabled}
              />
            </Box>
          </Box>
        )

      case 'Number':
        return (
          <Box className={styles.fieldContainer}>
            {renderFieldLabel(label, tooltip)}
            <Box className={styles.formField}>
              <input
                type="number"
                value={value}
                onChange={(e) => handleFieldChange(field.field, e.target.value)}
                placeholder={field.placeholder}
                disabled={isDisabled}
              />
            </Box>
          </Box>
        )

      case 'Url':
        return (
          <Box className={styles.fieldContainer}>
            {renderFieldLabel(label, tooltip)}
            <Box className={styles.formField}>
              <input
                type="url"
                value={value}
                onChange={(e) => handleFieldChange(field.field, e.target.value)}
                placeholder={field.placeholder}
                disabled={isDisabled}
              />
            </Box>
          </Box>
        )

      case 'Lookup':
        return (
          <Box className={styles.fieldContainer}>
            {renderFieldLabel(label, tooltip)}
            <Box className={styles.formField}>
              <EntityLookupEnhanced
                componentName={field.lookupEntity || 'Entity'}
                apiURI={(() => {
                  const le = field.lookupEntity?.toLowerCase()
                  if (le === 'agency') return '/agencies/'
                  if (le === 'user') return '/users/'
                  const base = le || 'entities'
                  const resource = base.endsWith('s') ? base : `${base}s`
                  return `/${resource}/`
                })()}
                selectedItem={value}
                field={field.field}
                filterParams={(() => {
                  if (field.lookupEntity === 'Agency') {
                    const bankCode = data?.code || window.location.pathname.split('/').pop()
                    console.log('🏦 Bank Filter Debug:')
                    console.log('- Bank data:', data)
                    console.log('- Bank code from data:', data?.code)
                    console.log('- Bank code from URL:', window.location.pathname.split('/').pop())
                    console.log('- Final bank code:', bankCode)
                    return { bank: bankCode }
                  }
                  return undefined
                })()}
                parentEntityId={data?.code}
                columnDefs={(() => {
                  if (field.lookupEntity === 'Agency') {
                    return [
                      { headerName: 'Code', field: 'code', flex: 1 },
                      { headerName: 'Name', field: 'name', flex: 2 },
                      { headerName: 'Address', field: 'address', flex: 2 },
                      { headerName: 'City', field: 'city', flex: 1 }
                    ]
                  } else if (field.lookupEntity === 'Bank') {
                    return [
                      { headerName: 'Code', field: 'code', flex: 1 },
                      { headerName: 'Name', field: 'name', flex: 2 },
                      { headerName: 'Address', field: 'address', flex: 2 },
                      { headerName: 'Website', field: 'website', flex: 1 }
                    ]
                  } else if (field.lookupEntity === 'User') {
                    return [
                      { headerName: 'ID', field: 'id', flex: 1 },
                      { headerName: 'Name', field: 'name', flex: 2 },
                      { headerName: 'Email', field: 'email', flex: 2 },
                      { headerName: 'Status', field: 'status', flex: 1 }
                    ]
                  } else {
                    return [
                      { headerName: 'ID', field: 'id', flex: 1 },
                      { headerName: 'Name', field: 'name', flex: 2 },
                      { headerName: 'Email', field: 'email', flex: 2 },
                      { headerName: 'Status', field: 'status', flex: 1 }
                    ]
                  }
                })()}
                onItemSelected={(data, fieldName) => {
                  // Handle appended users
                  if (data.isAppend && data.displayValue) {
                    handleFieldChange(field.field, data.displayValue)
                  } 
                  // Handle removed users
                  else if (data.isRemove && data.displayValue) {
                    handleFieldChange(field.field, data.displayValue)
                  } 
                  // For Bank lookup, store as object with name for proper display
                  else if (field.lookupEntity === 'Bank' && data.name) {
                    handleFieldChange(field.field, { code: data.code, name: data.name })
                  }
                  // For other entities, use displayValue if available, otherwise fallback
                  else if (data.displayValue) {
                    handleFieldChange(field.field, data.displayValue)
                  }
                  else {
                    handleFieldChange(field.field, data[fieldName] || data.name || data.title || '')
                  }
                }}
                disabled={isDisabled}
                placeholder={field.placeholder}
                size="md"
                hoverBorderColor={inputFocusColor}
              />
            </Box>
          </Box>
        )

      case 'Boolean':
        return (
          <Box className={styles.fieldContainer}>
            {renderFieldLabel(label, tooltip)}
            <Box className={styles.formField}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!value}
                    onChange={(e) => handleFieldChange(field.field, e.target.checked)}
                    disabled={isDisabled}
                    size="small"
                  />
                }
                label={value ? 'Yes' : 'No'}
              />
            </Box>
          </Box>
        )

      case 'Textarea':
        return (
          <Box className={styles.fieldContainer}>
            {renderFieldLabel(label, tooltip)}
            <Box className={styles.formField}>
              <textarea
                value={value}
                onChange={(e) => handleFieldChange(field.field, e.target.value)}
                placeholder={field.placeholder}
                disabled={isDisabled}
                rows={4}
              />
            </Box>
          </Box>
        )

      case 'Date':
        return (
          <Box className={styles.fieldContainer}>
            {renderFieldLabel(label, tooltip)}
            <Box className={styles.formField}>
              <input
                type="date"
                value={value}
                onChange={(e) => handleFieldChange(field.field, e.target.value)}
                placeholder={field.placeholder}
                disabled={isDisabled}
              />
            </Box>
          </Box>
        )

      case 'Image':
        // Priority: 1. Server logo_url (if available), 2. File being uploaded (show preview), 3. Nothing
        const imageFile = imageFiles[field.field]
        // Check for server logo URL from formData first (most reliable)
        const serverLogoUrlFromFormData = formData[`${field.field}_url`] || formData.logo_url
        // Get cached preview (could be base64 from file selection or server URL from useEffect)
        const cachedPreview = imagePreviews[field.field]
        
        let imagePreview: string | null = null
        
        // Priority order:
        // 1. If file being uploaded, ALWAYS show file preview (base64) - user wants to see what they selected
        // 2. If server has logo_url in formData, use that (after save/reload when no file is being uploaded)
        // 3. If cached preview exists and it's a server URL (starts with http), use it
        // 4. Otherwise, no preview (file input will show)
        
        if (imageFile instanceof File && cachedPreview) {
          // File being uploaded - ALWAYS show base64 preview of the new file (highest priority)
          // This ensures user sees the file they just selected, not the old server logo
          imagePreview = cachedPreview
          console.log('Using file preview (base64) - new file selected:', imagePreview?.substring(0, 50) + '...')
        } else if (serverLogoUrlFromFormData && typeof serverLogoUrlFromFormData === 'string') {
          // Server URL from formData (after save/reload, when no file is being uploaded)
          imagePreview = serverLogoUrlFromFormData
          console.log('Using server logo_url from formData:', imagePreview)
        } else if (cachedPreview && typeof cachedPreview === 'string' && cachedPreview.startsWith('http')) {
          // Cached preview is a server URL (from useEffect)
          imagePreview = cachedPreview
          console.log('Using cached server URL:', imagePreview)
        } else {
          // No preview available
          imagePreview = null
          console.log('No image preview available')
        }
        
        // Debug logging after imagePreview is determined
        console.log('Image field rendering:', {
          fieldName: field.field,
          hasImageFile: imageFile instanceof File,
          serverLogoUrlFromFormData: serverLogoUrlFromFormData,
          cachedPreview: cachedPreview,
          formDataValue: value,
          formDataKeys: Object.keys(formData),
          willShowPreview: !!imagePreview,
          previewUrl: imagePreview
        })

        const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0]
          if (file) {
            setImageFiles(prev => ({ ...prev, [field.field]: file }))
            const reader = new FileReader()
            reader.onloadend = () => {
              setImagePreviews(prev => ({ ...prev, [field.field]: reader.result as string }))
            }
            reader.readAsDataURL(file)
            handleFieldChange(field.field, file)
          }
        }

        const handleRemoveImage = () => {
          // Calculate new formData first
          const newFormData = { ...formData }
          newFormData[field.field] = null
          newFormData[`${field.field}_url`] = null
          newFormData.logo_url = null
          
          // Set imageFiles to null (not delete) so handleSave knows to send null to server
          setImageFiles(prev => ({ ...prev, [field.field]: null }))
          // Clear previews
          setImagePreviews(prev => {
            const newPreviews = { ...prev }
            delete newPreviews[field.field]
            return newPreviews
          })
          // Clear failed URLs for this field
          failedImageUrlsRef.current.clear()
          // Update formData
          setFormData(newFormData)
          // Notify parent component (after state updates)
          onDataChange?.(newFormData)
        }

        return (
          <Box className={styles.fieldContainer}>
            {renderFieldLabel(label, tooltip)}
            <Box className={styles.formField}>
              {imagePreview && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', width: 'fit-content' }}>
                  <img 
                    src={imagePreview} 
                    alt={label}
                    onError={(e) => {
                      const img = e.currentTarget
                      const currentSrc = img.src
                      
                      // Prevent infinite loop - check if we've already tried this URL
                      if (failedImageUrlsRef.current.has(currentSrc)) {
                        console.error('❌ Image URL already tried. Backend configuration issue.')
                        console.error('❌ File exists at: C:\\Users\\MSI\\Documents\\rb divided new\\company_logos\\sss\\logo.png')
                        console.error('❌ But Django returns 404. Backend needs to:')
                        console.error('   1. Set MEDIA_URL="/media/" in Django settings')
                        console.error('   2. Configure URL routing to serve media files')
                        console.error('   3. Return logo_url with /media/ prefix')
                        return
                      }
                      
                      // Mark this URL as failed
                      failedImageUrlsRef.current.add(currentSrc)
                      
                      console.error('❌ Image failed to load:', {
                        attemptedSrc: imagePreview,
                        actualSrc: currentSrc
                      })
                      
                      // Try alternative URL with /media/ prefix if current URL doesn't have it
                      if (currentSrc.includes('127.0.0.1:8000/company_logos/') && !currentSrc.includes('/media/')) {
                        const mediaUrl = currentSrc.replace('/company_logos/', '/media/company_logos/')
                        // Only try if we haven't tried this URL before
                        if (!failedImageUrlsRef.current.has(mediaUrl)) {
                          console.log('🔄 Trying with /media/ prefix:', mediaUrl)
                          failedImageUrlsRef.current.add(mediaUrl)
                          img.src = mediaUrl
                          return
                        }
                      }
                      
                      // Try removing /media/ if it has it
                      if (currentSrc.includes('/media/company_logos/')) {
                        const noMediaUrl = currentSrc.replace('/media/company_logos/', '/company_logos/')
                        // Only try if we haven't tried this URL before
                        if (!failedImageUrlsRef.current.has(noMediaUrl)) {
                          console.log('🔄 Trying without /media/ prefix:', noMediaUrl)
                          failedImageUrlsRef.current.add(noMediaUrl)
                          img.src = noMediaUrl
                          return
                        }
                      }
                      
                      console.error('❌ All URL attempts failed. Backend configuration issue.')
                    }}
                    onLoad={() => {
                      console.log('✅ Image loaded successfully:', imagePreview)
                    }}
                    style={{ 
                      maxWidth: '100px', 
                      maxHeight: '100px', 
                      objectFit: 'contain',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '4px',
                      padding: '4px',
                      backgroundColor: theme.palette.background.default,
                      display: 'block'
                    }} 
                  />
                  {!isDisabled && (
                    <IconButton
                      size="small"
                      onClick={handleRemoveImage}
                      color="error"
                      sx={{ 
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.shadows[2],
                        '&:hover': {
                          backgroundColor: theme.palette.error.light,
                          color: theme.palette.error.contrastText
                        },
                        width: 24,
                        height: 24,
                        padding: 0
                      }}
                      title={dictionary?.navigation?.remove || 'Remove'}
                    >
                      <Close sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>
              )}
              {!isDisabled && !imagePreview && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ fontSize: '0.875rem', cursor: 'pointer' }}
                />
              )}
            </Box>
          </Box>
        )

      default:
        // String and fallback
        return (
          <Box className={styles.fieldContainer}>
            {renderFieldLabel(label, tooltip)}
            <Box className={styles.formField}>
              <input
                type="text"
                value={value}
                onChange={(e) => handleFieldChange(field.field, e.target.value)}
                placeholder={field.placeholder}
                disabled={isDisabled}
              />
            </Box>
          </Box>
        )
    }
  }

  const renderFields = (fields: EntityField[]) => {
    return fields
      .filter(field => field.showCard !== false) // Only show fields that should be displayed in card
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((field) => {
        const gridClassName = field.width === 'wide' ? styles.smallField : undefined
        // All fields use the same grid sizing for consistent alignment (3 columns per row)
        const gridSize = { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }

        return (
          <Grid
            item
            {...gridSize}
            key={field.field}
            className={gridClassName}
            sx={{
              mb: 2,
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {renderField(field)}
          </Grid>
        )
      })
  }

  const renderContent = () => {
    if (entityDefinition.tabs && entityDefinition.tabs.length > 0) {
      return (
        <Box className={styles.collapseBorder}>
          {entityDefinition.tabs.map((tab) => {
            const tabTitle = tab.title[currentLanguage as keyof typeof tab.title] || tab.title.fr
            const tabFields = entityDefinition.fields?.filter(field => field.tab === tab.id) || []

            return (
              <Accordion
                key={tab.id}
                expanded={expandedTabs[tab.id] || false}
                onChange={handleAccordionChange(tab.id)}
                className={styles.accordionContainer}
                sx={{
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: 0 },
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[1],
                  '&:hover': {
                    boxShadow: theme.shadows[2]
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  className={styles.accordionSummary}
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    },
                    '&.Mui-expanded': {
                      minHeight: 48,
                      '& .MuiAccordionSummary-content': {
                        margin: '12px 0'
                      }
                    }
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.text.primary
                    }}
                  >
                    {tabTitle}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails 
                  className={styles.accordionDetails}
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary
                  }}
                >
                  <Grid container spacing={3} sx={{ width: '100%', margin: 0 }}>
                    {renderFields(tabFields)}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>
      )
    }

    if (entityDefinition.fields && entityDefinition.fields.length > 0) {
      return (
        <Grid container spacing={3} sx={{ width: '100%', margin: 0 }}>
          {renderFields(entityDefinition.fields)}
        </Grid>
      )
    }

    return (
      <Box className={styles.noFieldsContainer}>
        <Typography className={styles.noFieldsText}>
          No fields configured for this entity.
        </Typography>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    )
  }

  const title = entityDefinition.titleForm[currentLanguage as keyof typeof entityDefinition.titleForm] || entityDefinition.titleForm.fr

  return (
    <Box style={{ '--entity-card-primary': inputFocusColor } as React.CSSProperties}>
      {/* Breadcrumb Header - Matching Vendor Example */}
      <Box 
        className={styles.contentHeader}
        sx={{
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary
        }}
      >
        {/* Content Left */}
        <Box className={styles.contentHeaderLeft}>
          <Box className={styles.breadcrumbsTop}>
            <Typography 
              variant="h4" 
              component="h1" 
              className={styles.contentHeaderTitle}
              sx={{
                color: theme.palette.text.primary,
                borderRightColor: theme.palette.divider
              }}
            >
              {title}
            </Typography>
            <Box 
              className={styles.breadcrumbWrapper}
              sx={{
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[1]
              }}
            >
              <Breadcrumbs aria-label="breadcrumb">
                {(() => {
                  // Handle both old string array format and new multilingual object format
                  const breadcrumbItems = Array.isArray(entityDefinition.breadcrumb) 
                    ? entityDefinition.breadcrumb 
                    : entityDefinition.breadcrumb[currentLanguage] || entityDefinition.breadcrumb.en || []
                  
                  
                  return breadcrumbItems.map((item, index) => (
                    <Typography
                      key={index}
                      className={index === breadcrumbItems.length - 1 ? styles.breadcrumbItemActive : styles.breadcrumbItem}
                      sx={{
                        color: index === breadcrumbItems.length - 1 
                          ? theme.palette.text.primary 
                          : theme.palette.text.secondary,
                        fontSize: '0.857rem', // 13.7px - small font size
                        fontFamily: "'Montserrat', Helvetica, Arial, serif",
                        fontWeight: 400
                      }}
                    >
                      {(() => {
                        // For breadcrumb items, we'll use direct translation logic
                        // since each item should be translated individually
                        
                        // Fallback translations for common items
                        if (currentLanguage === 'fr') {
                          const frTranslations: { [key: string]: string } = {
                            'Administration': 'Administration',
                            'Entreprises': 'Entreprises',
                            'Entreprise': 'Entreprise',
                            'Companies': 'Entreprises',
                            'Company': 'Entreprise',
                            'Users': 'Utilisateurs',
                            'User': 'Utilisateur'
                          }
                          return frTranslations[item] || item
                        } else {
                          const enTranslations: { [key: string]: string } = {
                            'Admin': 'Admin',
                            'Administration': 'Admin',
                            'Companies': 'Companies',
                            'Company': 'Company',
                            'Users': 'Users',
                            'User': 'User'
                          }
                          return enTranslations[item] || item
                        }
                      })()}
                    </Typography>
                  ))
                })()}
              </Breadcrumbs>
            </Box>
          </Box>
        </Box>

        {/* Content Right */}
        <Box className={styles.contentHeaderRight}>
          {onBack && (
            <button
              className={`${styles.buttonVariant} ${styles.buttonSecondary} ${styles.mr50}`}
              onClick={onBack}
              style={{
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.palette.action.hover
                e.currentTarget.style.color = theme.palette.text.primary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.palette.background.paper
                e.currentTarget.style.color = theme.palette.text.secondary
              }}
            >
              <ArrowBack sx={{ height: 16, width: 16 }} />
            </button>
          )}
          {onRefresh && (
            <button
              className={`${styles.buttonVariant} ${styles.buttonPrimary} ${styles.mr50}`}
              onClick={handleRefresh}
              style={{
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.palette.primary.main
                e.currentTarget.style.color = theme.palette.primary.contrastText
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.palette.background.paper
                e.currentTarget.style.color = theme.palette.primary.main
              }}
            >
              <RotateLeft sx={{ height: 16, width: 16 }} />
            </button>
          )}
          {onDelete && (
            <button
              className={`${styles.buttonVariant} ${styles.buttonError} ${styles.mr50}`}
              onClick={handleDelete}
              disabled={deleting}
              style={{
                backgroundColor: deleting ? theme.palette.action.disabled : theme.palette.error.main,
                color: deleting ? theme.palette.action.disabled : theme.palette.error.contrastText
              }}
              onMouseEnter={(e) => {
                if (!deleting) {
                  e.currentTarget.style.backgroundColor = theme.palette.error.dark
                }
              }}
              onMouseLeave={(e) => {
                if (!deleting) {
                  e.currentTarget.style.backgroundColor = theme.palette.error.main
                }
              }}
            >
              <DeleteForever sx={{ height: 16, width: 16 }} />
            </button>
          )}
          <button
            className={styles.buttonVariant}
            onClick={handleSave}
            disabled={saving}
            style={{
              backgroundColor: saving ? theme.palette.action.disabled : theme.palette.primary.main,
              color: saving ? theme.palette.action.disabled : (theme.palette.primary.contrastText || '#FFF'),
              fontFamily: "'Montserrat', Helvetica, Arial, serif",
              boxShadow: saving ? 'none' : `0 4px 12px 0 ${theme.palette.primary.main}40`,
              border: 'none'
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = theme.palette.primary.dark
                e.currentTarget.style.boxShadow = `0 8px 25px 0 ${theme.palette.primary.main}60`
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = theme.palette.primary.main
                e.currentTarget.style.boxShadow = `0 4px 12px 0 ${theme.palette.primary.main}40`
              }
            }}
          >
            <Save sx={{ height: 16, width: 16, marginRight: 8 }} />
            <span className={styles.alignMiddle} style={{ fontFamily: "'Montserrat', Helvetica, Arial, serif" }}>Sauvegarder</span>
          </button>
        </Box>
      </Box>

      {error && (
        <Box className={styles.errorContainer}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {/* Main Card */}
      <Card 
        className={styles.cardContainer}
        sx={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[2],
          '&:hover': {
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <Divider />
        <CardContent 
          className={styles.cardContent}
          sx={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary
          }}
        >
          {renderContent()}
        </CardContent>
      </Card>
    </Box>
  )
}

export default EntityCard
