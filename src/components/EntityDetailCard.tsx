'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  ArrowBack,
  Save,
  Edit,
  Delete,
  Refresh,
  ExpandMore,
  Business,
  Person,
  Email,
  Phone,
  LocationOn,
  Web,
  Description
} from '@mui/icons-material'

// Types
export interface EntityField {
  field: string
  label: { fr: string; en: string; ar: string }
  type: 'String' | 'Number' | 'Boolean' | 'Date' | 'Lookup' | 'Email' | 'Phone' | 'Url' | 'Textarea'
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
}

export interface EntityTab {
  id: number
  title: { fr: string; en: string; ar: string }
  open?: boolean
  fields?: EntityField[]
}

export interface EntityConfig {
  id: string
  title: string
  subtitle?: string
  icon?: React.ReactNode
  tabs?: EntityTab[]
  fields?: EntityField[]
  showDelete?: boolean
  showEdit?: boolean
  showSave?: boolean
  showRefresh?: boolean
  onSave?: (data: any) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onRefresh?: () => Promise<void>
  onBack?: () => void
}

// New entity configuration structure
export interface EntityDefinition {
  apiURI: string
  titleList: { fr: string; en: string; ar: string }
  titleForm: { fr: string; en: string; ar: string }
  breadcrumb: string[]
  tabs?: EntityTab[]
  fields: EntityField[]
}

interface EntityDetailCardProps {
  config: EntityConfig
  data: any
  loading?: boolean
  error?: string
  onDataChange?: (data: any) => void
}

const EntityDetailCard: React.FC<EntityDetailCardProps> = ({
  config,
  data,
  loading = false,
  error,
  onDataChange
}) => {
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState(data || {})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setFormData(data || {})
  }, [data])

  const handleFieldChange = (key: string, value: any) => {
    const newData = { ...formData, [key]: value }
    setFormData(newData)
    onDataChange?.(newData)
  }

  const handleSave = async () => {
    if (!config.onSave) return
    
    setSaving(true)
    try {
      await config.onSave(formData)
      setEditMode(false)
    } catch (err) {
      console.error('Error saving:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!config.onDelete || !data?.id) return
    
    setDeleting(true)
    try {
      await config.onDelete(data.id)
    } catch (err) {
      console.error('Error deleting:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleRefresh = async () => {
    if (!config.onRefresh) return
    
    try {
      await config.onRefresh()
    } catch (err) {
      console.error('Error refreshing:', err)
    }
  }

  const renderField = (field: EntityField) => {
    const value = formData[field.field] || ''
    const isDisabled = field.disabled || (!editMode && field.type !== 'Boolean')
    const currentLanguage = 'fr' // You can get this from context or props
    const label = field.label[currentLanguage as keyof typeof field.label] || field.label.fr
    const tooltip = field.tooltip?.[currentLanguage as keyof typeof field.tooltip] || field.tooltip?.fr || ''

    const commonProps = {
      fullWidth: true,
      disabled: isDisabled,
      placeholder: field.placeholder,
      value: value || '',
      onChange: (e: any) => handleFieldChange(field.field, e.target.value)
    }

    switch (field.type) {
      case 'Email':
        return (
          <TextField
            {...commonProps}
            type="email"
            label={label}
            required={field.required}
            InputProps={{
              startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        )

      case 'Phone':
        return (
          <TextField
            {...commonProps}
            type="tel"
            label={label}
            required={field.required}
            InputProps={{
              startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        )

      case 'Number':
        return (
          <TextField
            {...commonProps}
            type="number"
            label={label}
            required={field.required}
          />
        )

      case 'Url':
        return (
          <TextField
            {...commonProps}
            type="url"
            label={label}
            required={field.required}
            InputProps={{
              startAdornment: <Web sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        )

      case 'Lookup':
        return (
          <FormControl fullWidth disabled={isDisabled}>
            <InputLabel>{label}</InputLabel>
            <Select
              value={value || ''}
              label={label}
              onChange={(e) => handleFieldChange(field.field, e.target.value)}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )

      case 'Boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={!!value}
                onChange={(e) => handleFieldChange(field.field, e.target.checked)}
                disabled={isDisabled}
              />
            }
            label={label}
          />
        )

      case 'Textarea':
        return (
          <TextField
            {...commonProps}
            multiline
            rows={4}
            label={label}
            required={field.required}
            InputProps={{
              startAdornment: <Description sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        )

      case 'Date':
        return (
          <TextField
            {...commonProps}
            type="date"
            label={label}
            required={field.required}
            InputLabelProps={{ shrink: true }}
          />
        )

      default:
        return (
          <TextField
            {...commonProps}
            label={label}
            required={field.required}
          />
        )
    }
  }

  const renderFields = (fields: EntityField[]) => {
    return fields
      .filter(field => field.showCard !== false) // Only show fields that should be displayed in card
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((field) => (
        <Grid item xs={12} sm={6} md={4} key={field.field}>
          {renderField(field)}
        </Grid>
      ))
  }

  const renderContent = () => {
    if (config.tabs && config.tabs.length > 0) {
      return (
        <Box>
          {config.tabs.map((tab) => {
            const currentLanguage = 'fr' // You can get this from context or props
            const tabTitle = tab.title[currentLanguage as keyof typeof tab.title] || tab.title.fr
            const tabFields = config.fields?.filter(field => field.tab === tab.id) || []
            
            return (
              <Accordion key={tab.id} defaultExpanded={tab.open}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">{tabTitle}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {renderFields(tabFields)}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>
      )
    }

    if (config.fields && config.fields.length > 0) {
      return (
        <Grid container spacing={3}>
          {renderFields(config.fields)}
        </Grid>
      )
    }

    return (
      <Typography color="text.secondary">
        No fields configured for this entity.
      </Typography>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={2}>
            {config.icon}
            <Box>
              <Typography variant="h5" component="h1">
                {config.title}
              </Typography>
              {config.subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {config.subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        }
        action={
          <Box display="flex" gap={1}>
            {config.showRefresh && (
              <IconButton onClick={handleRefresh} disabled={loading}>
                <Refresh />
              </IconButton>
            )}
            {config.showEdit && !editMode && (
              <IconButton onClick={() => setEditMode(true)}>
                <Edit />
              </IconButton>
            )}
            {config.showDelete && (
              <IconButton 
                onClick={handleDelete} 
                disabled={deleting}
                color="error"
              >
                <Delete />
              </IconButton>
            )}
            {config.onBack && (
              <IconButton onClick={config.onBack}>
                <ArrowBack />
              </IconButton>
            )}
          </Box>
        }
      />

      {error && (
        <Box px={3}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Divider />

      <CardContent>
        {editMode && (
          <Box mb={3} display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => {
                setEditMode(false)
                setFormData(data || {})
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} /> : <Save />}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        )}

        {renderContent()}
      </CardContent>
    </Card>
  )
}

export default EntityDetailCard
