'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'

import {
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import {
  Delete,
  Search,
  Add,
  ArrowUpward,
  ArrowDownward,
  Check,
  Edit,
  Close
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
  type SortingState
} from '@tanstack/react-table'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import ArrayValueEditor from '@/components/parameters/ArrayValueEditor'

// Service Imports
import { conventionParameterService } from '@/services/conventionParameter.service'

// Type Imports
import type {
  ConventionParameter,
  CreateConventionParameterDto,
  ConventionParameterForm,
  Holiday,
  ParameterValueType
} from '@/types/conventionParameter'

// Config Imports
import { PARAMETER_TYPES, getParameterTypeInfo, detectParameterType, formatValueForDisplay, getInputType } from '@/config/parameterTypes'

// Style Imports
import styles from '@core/styles/table.module.css'

// Dictionary imports
import { getDictionaryClient } from '@/utils/getDictionaryClient'
import type { Locale } from '@configs/i18n'

// Component for displaying array values in table - Modern Design
const ArrayValueDisplay: React.FC<{ 
  value: any[]; 
  onUpdate: (newValue: any[]) => void;
  parameterId: number;
  lang?: string;
}> = ({ value, onUpdate, parameterId, lang = 'fr' }) => {
  const [expanded, setExpanded] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [newItem, setNewItem] = useState<any>(null)
  const isObjectArray = value.length > 0 && typeof value[0] === 'object' && value[0] !== null && !Array.isArray(value[0])

  const handleStartEdit = (index: number) => {
    setAddingNew(false)
    setEditingIndex(index)
    setEditingItem(isObjectArray ? { ...value[index] } : { value: value[index] })
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditingItem(null)
    setAddingNew(false)
    setNewItem(null)
  }

  const handleSaveEdit = async () => {
    if (addingNew) {
      // Adding new item
      if (newItem === null) return
      const newValue = [...value]
      if (isObjectArray) {
        newValue.push({ ...newItem })
      } else {
        newValue.push(newItem.value)
      }
      onUpdate(newValue)
      setAddingNew(false)
      setNewItem(null)
    } else {
      // Editing existing item
      if (editingIndex === null || editingItem === null) return

      const newValue = [...value]
      if (isObjectArray) {
        newValue[editingIndex] = { ...editingItem }
      } else {
        newValue[editingIndex] = editingItem.value
      }

      onUpdate(newValue)
      setEditingIndex(null)
      setEditingItem(null)
    }
  }

  const handleAddNew = () => {
    setEditingIndex(null)
    setEditingItem(null)
    setAddingNew(true)
    if (isObjectArray && value.length > 0) {
      // Create new item with same structure as existing items
      const keys = Object.keys(value[0])
      const newItemObj: any = {}
      keys.forEach(key => {
        newItemObj[key] = ''
      })
      setNewItem(newItemObj)
    } else if (isObjectArray && value.length === 0) {
      // Empty array - allow user to define structure
      setNewItem({ key: '', value: '' })
    } else {
      // Simple array
      setNewItem({ value: '' })
    }
  }

  const handleDeleteItem = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      const newValue = value.filter((_, i) => i !== index)
      onUpdate(newValue)
      if (editingIndex === index) {
        setEditingIndex(null)
        setEditingItem(null)
      } else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1)
      }
    }
  }

  const handleUpdateField = (key: string, newValue: any) => {
    const currentItem = addingNew ? newItem : editingItem
    if (currentItem === null) return
    
    if (addingNew) {
      setNewItem({ ...currentItem, [key]: newValue })
    } else {
      setEditingItem({ ...currentItem, [key]: newValue })
    }
  }

  const handleAddKeyValue = () => {
    // Add a new key-value pair to the object
    const currentItem = addingNew ? newItem : editingItem
    if (currentItem === null) return
    
    const newKey = `key${Object.keys(currentItem).length + 1}`
    if (addingNew) {
      setNewItem({ ...currentItem, [newKey]: '' })
    } else {
      setEditingItem({ ...currentItem, [newKey]: '' })
    }
  }

  const handleRemoveKey = (keyToRemove: string) => {
    const currentItem = addingNew ? newItem : editingItem
    if (currentItem === null) return
    
    const newItemObj = { ...currentItem }
    delete newItemObj[keyToRemove]
    
    if (addingNew) {
      setNewItem(newItemObj)
    } else {
      setEditingItem(newItemObj)
    }
  }

  const handleUpdateKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return
    
    const currentItem = addingNew ? newItem : editingItem
    if (currentItem === null) return
    
    const newItemObj: any = {}
    Object.keys(currentItem).forEach(key => {
      if (key === oldKey) {
        newItemObj[newKey] = currentItem[key]
      } else {
        newItemObj[key] = currentItem[key]
      }
    })
    
    if (addingNew) {
      setNewItem(newItemObj)
    } else {
      setEditingItem(newItemObj)
    }
  }

  return (
    <Box>
      <Box 
        display="flex" 
        alignItems="center" 
        gap={1.5}
        onClick={(e) => {
          e.stopPropagation()
          setExpanded(!expanded)
        }}
        sx={{ 
          cursor: 'pointer',
          p: 1.5,
          borderRadius: 2,
          bgcolor: expanded ? 'primary.light' : 'background.paper',
          border: '2px solid',
          borderColor: expanded ? 'primary.main' : 'transparent',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: 'primary.main',
            transform: 'translateY(-2px)',
            boxShadow: 2
          }
        }}
      >
        <Chip 
          label={`${value.length} élément${value.length !== 1 ? 's' : ''}`} 
          size='small' 
          color='primary'
          sx={{ 
            fontWeight: 600,
            boxShadow: 1
          }}
        />
        <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
          {isObjectArray 
            ? `Tableau d'objets`
            : `Valeurs du tableau`
          }
        </Typography>
        <Box
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        >
          <ArrowDownward fontSize="small" />
        </Box>
      </Box>
      
      {expanded && (
        <Box 
          sx={{ 
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {/* Add New Item Button */}
          {!addingNew && (
            <Box
              display="flex"
              alignItems="center"
              gap={0.5}
              onClick={handleAddNew}
              sx={{
                alignSelf: 'flex-start',
                cursor: 'pointer',
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.dark'
                }
              }}
            >
              <Add color="primary" />
              <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                Ajouter un nouvel élément
              </Typography>
            </Box>
          )}

          {/* Add New Item Card */}
          {addingNew && (
            <Paper
              elevation={8}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '2px solid',
                borderColor: 'primary.main',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  bgcolor: 'primary.main'
                }
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                Ajouter un nouvel élément
              </Typography>
              {isObjectArray ? (
                <Box display="flex" flexDirection="column" gap={2}>
                  {newItem && Object.entries(newItem).map(([key, val]) => (
                    <Box key={key} display="flex" gap={1} alignItems="center">
                      <CustomTextField
                        size="small"
                        label="Clé"
                        value={key}
                        onChange={(e) => handleUpdateKey(key, e.target.value)}
                        sx={{
                          minWidth: '150px',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                      <CustomTextField
                        fullWidth
                        size="small"
                        label="Valeur"
                        value={String(val || '')}
                        onChange={(e) => handleUpdateField(key, e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveKey(key)}
                        sx={{
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'error.dark'
                          }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleAddKeyValue}
                    sx={{
                      alignSelf: 'flex-start',
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    Ajouter une paire clé-valeur
                  </Button>
                </Box>
              ) : (
                <CustomTextField
                  fullWidth
                  size="small"
                  label="Valeur"
                  value={newItem?.value || ''}
                  onChange={(e) => handleUpdateField('value', e.target.value)}
                  placeholder="Entrer la valeur"
                  autoFocus
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              )}
              <Box display="flex" gap={1} mt={2} justifyContent="flex-end">
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Check />}
                  onClick={handleSaveEdit}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Ajouter l'élément
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Close />}
                  onClick={handleCancelEdit}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Annuler
                </Button>
              </Box>
            </Paper>
          )}

          {/* Existing Items Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isObjectArray ? 'repeat(auto-fill, minmax(350px, 1fr))' : 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 2,
              maxHeight: '500px',
              overflowY: 'auto',
              p: 1,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'background.default',
                borderRadius: 1
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'primary.main',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }
            }}
          >
            {value.map((item: any, idx: number) => (
              <Paper
                key={idx}
                elevation={editingIndex === idx ? 8 : 2}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: editingIndex === idx ? 'primary.main' : 'transparent',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: editingIndex !== idx ? 'translateY(-4px)' : 'none',
                    boxShadow: editingIndex !== idx ? 6 : 8,
                    borderColor: editingIndex !== idx ? 'primary.main' : 'primary.main'
                  },
                  '&::before': editingIndex === idx ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    bgcolor: 'primary.main'
                  } : {}
                }}
              >
              {editingIndex === idx ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                    Modifier l'élément {idx + 1}
                  </Typography>
                  {isObjectArray ? (
                    <Box display="flex" flexDirection="column" gap={1.5}>
                      {Object.entries(editingItem || {}).map(([key, val]) => (
                        <Box key={key} display="flex" gap={1} alignItems="center">
                          <CustomTextField
                            size="small"
                            label="Clé"
                            value={key}
                            onChange={(e) => handleUpdateKey(key, e.target.value)}
                            sx={{
                              minWidth: '150px',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                              }
                            }}
                          />
                          <CustomTextField
                            fullWidth
                            size="small"
                            label="Valeur"
                            value={String(val || '')}
                            onChange={(e) => handleUpdateField(key, e.target.value)}
                            placeholder={`Entrer la valeur`}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                              }
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveKey(key)}
                            sx={{
                              bgcolor: 'error.main',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'error.dark'
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={handleAddKeyValue}
                        sx={{
                          alignSelf: 'flex-start',
                          borderRadius: 2,
                          textTransform: 'none',
                          mt: 1
                        }}
                      >
                        Ajouter une paire clé-valeur
                      </Button>
                    </Box>
                  ) : (
                    <CustomTextField
                      fullWidth
                      size="small"
                      value={editingItem?.value || ''}
                      onChange={(e) => handleUpdateField('value', e.target.value)}
                      placeholder="Entrer la valeur"
                      autoFocus
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  )}
                  <Box display="flex" gap={1} mt={2} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Check />}
                      onClick={handleSaveEdit}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Enregistrer
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Close />}
                      onClick={handleCancelEdit}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none'
                      }}
                    >
                      Annuler
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  {isObjectArray ? (
                    <Box display="flex" flexDirection="column" gap={1}>
                      {Object.entries(item).map(([key, val]) => (
                        <Box 
                          key={key}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: 'background.default'
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontWeight: 600, 
                              minWidth: '80px',
                              color: 'text.secondary',
                              textTransform: 'capitalize'
                            }}
                          >
                            {key}:
                          </Typography>
                          <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                            {String(val || '')}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        textAlign: 'center'
                      }}
                    >
                      {String(item)}
                    </Typography>
                  )}
                  <Box 
                    display="flex" 
                    gap={1} 
                    mt={2} 
                    justifyContent="flex-end"
                    sx={{
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease',
                      '&:hover': {
                        opacity: 1
                      }
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleStartEdit(idx)}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    {editingIndex !== idx && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteItem(idx)}
                        sx={{
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'error.dark',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              )}
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

const GeneralParametersPage = () => {
  const params = useParams()
  const lang = params.lang as Locale
  
  // Dictionary state
  const [dictionary, setDictionary] = useState<any>(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(true)

  // Helper function to translate parameter type labels
  const getTranslatedTypeLabel = (type: ParameterValueType): string => {
    if (lang === 'fr') {
      const translations: Record<ParameterValueType, string> = {
        string: 'Texte',
        number: 'Nombre',
        integer: 'Nombre',
        boolean: 'Booléen',
        json: 'JSON',
        array: 'Tableau',
        object: 'Objet'
      }
      return translations[type] || type
    }
    return getParameterTypeInfo(type).label
  }

  // Helper function to translate parameter type placeholders
  const getTranslatedPlaceholder = (type: ParameterValueType): string => {
    if (lang === 'fr') {
      const translations: Record<ParameterValueType, string> = {
        string: 'Entrer une valeur texte',
        number: 'Entrer un nombre décimal (ex: 7,99)',
        integer: 'Entrer un nombre (ex: 3 ou 3,5)',
        boolean: 'Entrer vrai ou faux',
        json: 'Entrer un JSON valide (ex: {"clé": "valeur"})',
        array: 'Entrer un tableau JSON (ex: ["élément1", "élément2"])',
        object: 'Entrer un objet JSON (ex: {"nom": "valeur"})'
      }
      return translations[type] || getParameterTypeInfo(type).placeholder
    }
    return getParameterTypeInfo(type).placeholder
  }

  // Helper function to translate parameter type descriptions
  const getTranslatedDescription = (type: ParameterValueType): string => {
    if (lang === 'fr') {
      const translations: Record<ParameterValueType, string> = {
        string: 'Valeur texte simple',
        number: 'Valeur numérique décimale',
        integer: 'Valeur numérique (entier ou décimal)',
        boolean: 'Valeur vraie ou fausse',
        json: 'Objet ou tableau JSON valide',
        array: 'Tableau JSON de valeurs',
        object: 'Objet JSON avec paires clé-valeur'
      }
      return translations[type] || getParameterTypeInfo(type).description
    }
    return getParameterTypeInfo(type).description
  }
  
  // State
  const [conventionParameters, setConventionParameters] = useState<ConventionParameter[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingParameter, setEditingParameter] = useState<ConventionParameter | null>(null)

  // Form states
  const [form, setForm] = useState<ConventionParameterForm>({
    name: '',
    value: '',
    type: 'string'
  })

  // Search and sorting states
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  
  // Inline editing state
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [editingName, setEditingName] = useState('')
  const [editingField, setEditingField] = useState<'name' | 'value' | null>(null)
  
  // Scroll position state
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isScrollRestored, setIsScrollRestored] = useState(false)

  // Column Helper
  const columnHelper = createColumnHelper<ConventionParameter>()

  // Save scroll position
  const saveScrollPosition = useCallback(() => {
    if (isScrollRestored) {
      const scrollY = window.scrollY
      setScrollPosition(scrollY)
      sessionStorage.setItem('parameters-scroll-position', scrollY.toString())
    }
  }, [isScrollRestored])

  // Robust scroll restoration
  const restoreScrollPosition = useCallback(() => {
    const savedPosition = sessionStorage.getItem('parameters-scroll-position')
    if (savedPosition && !isScrollRestored) {
      const position = parseInt(savedPosition, 10)
      
      // Disable browser's automatic scroll restoration
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }
      
      // Force scroll to position with multiple attempts
      const forceScroll = () => {
        window.scrollTo(0, position)
        document.documentElement.scrollTop = position
        document.body.scrollTop = position
      }
      
      // Immediate attempt
      forceScroll()
      
      // Multiple attempts with increasing delays to handle different rendering phases
      const attempts = [50, 100, 200, 500, 1000]
      attempts.forEach(delay => {
        setTimeout(() => {
          if (Math.abs(window.scrollY - position) > 5) {
            forceScroll()
          }
        }, delay)
      })
      
      // Mark as restored after a delay
      setTimeout(() => {
        setIsScrollRestored(true)
      }, 1200)
    } else if (!savedPosition) {
      setIsScrollRestored(true)
    }
  }, [isScrollRestored])

  // Load data
  const loadConventionParameters = useCallback(async () => {
    try {
      setLoading(true)
      const data = await conventionParameterService.getConventionParameters()

      setConventionParameters(data)
    } catch (err) {
      setError(dictionary?.navigation?.failedToLoadParameters || 'Failed to load parameters')
      console.error('Error loading parameters:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConventionParameters()
  }, [loadConventionParameters])

  // Initialize scroll restoration on component mount
  useEffect(() => {
    // Disable browser's automatic scroll restoration immediately
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    
    // Start restoration process
    restoreScrollPosition()
  }, [restoreScrollPosition])

  // Restore scroll position after data is loaded and table is rendered
  useEffect(() => {
    if (conventionParameters.length > 0 && !loading && !isScrollRestored) {
      // Small delay to ensure table is fully rendered, then restore
      setTimeout(() => {
        restoreScrollPosition()
      }, 100)
    }
  }, [conventionParameters.length, loading, isScrollRestored, restoreScrollPosition])

  // Handle clicking outside to cancel editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      // If clicking outside input fields and not on save button, cancel editing
      if (editingRow !== null && 
          !target.closest('input') && 
          !target.closest('button') && 
          !target.closest('[role="button"]')) {
        cancelInlineEdit()
      }
    }

    if (editingRow !== null) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editingRow])

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => {
      saveScrollPosition()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [saveScrollPosition])

  // Save scroll position when starting to edit
  useEffect(() => {
    if (editingRow !== null) {
      saveScrollPosition()
    }
  }, [editingRow, saveScrollPosition])

  // Save scroll position before page unload and cleanup
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Re-enable browser's automatic scroll restoration when component unmounts
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto'
      }
    }
  }, [saveScrollPosition])

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

  // Handler functions
  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm(dictionary?.navigation?.confirmDeleteParameter || 'Are you sure you want to delete this parameter?')) return

      try {
        setLoading(true)
        await conventionParameterService.deleteConventionParameter(id)
        setSuccess(dictionary?.navigation?.parameterDeletedSuccessfully || 'Parameter deleted successfully')
        
        // Update local state instead of reloading to maintain position
        setConventionParameters(prev => prev.filter(p => p.id !== id))
        
        setTimeout(() => setSuccess(''), 3000)
      } catch (err) {
        console.error('Error deleting parameter:', err)
        const baseMessage = dictionary?.navigation?.failedToDeleteParameter || 'Failed to delete parameter'
        setError(`${baseMessage}: ${(err as any).response?.data?.detail || (err as any).message}`)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const openDialog = useCallback((parameter?: ConventionParameter) => {
    if (parameter) {
      setEditingParameter(parameter)
      const detectedType = detectParameterType(parameter.value)
      // For array/json types, ensure we have a valid JSON string
      let valueToDisplay = formatValueForDisplay(parameter.value, detectedType)
      if ((detectedType === 'array' || detectedType === 'json') && typeof parameter.value !== 'string') {
        // If value is already an object/array, stringify it
        valueToDisplay = JSON.stringify(parameter.value, null, 2)
      }
      setForm({
        name: parameter.name,
        value: valueToDisplay,
        type: detectedType
      })
    } else {
      setEditingParameter(null)
      setForm({
        name: '',
        value: '',
        type: 'string'
      })
    }

    setError('')
    setDialogOpen(true)
  }, [])

  const handleCreate = useCallback(async () => {
    // Simple validation
    if (!form.name || !form.value) {
      setError(dictionary?.navigation?.pleaseEnterBothNameAndValue || 'Please enter both name and value')
      return
    }

    // Validate value based on selected type
    // For array/json types, ArrayValueEditor handles validation, so we skip it here
    let parsedValue: any
    if (form.type !== 'array' && form.type !== 'json') {
      const typeInfo = getParameterTypeInfo(form.type)
      if (!typeInfo.validation(form.value)) {
        const typeLabel = lang === 'fr' ? getTranslatedTypeLabel(form.type).toLowerCase() : typeInfo.label.toLowerCase()
        let errorMessage = dictionary?.navigation?.invalidValuePleaseCheckFormat?.replace('{type}', typeLabel) || `Invalid ${typeLabel} value. Please check the format.`
        
        // Provide more specific error messages for common issues
        if (form.type === 'object') {
          try {
            JSON.parse(form.value)
            errorMessage = dictionary?.navigation?.invalidObjectValue || 'Invalid object value. Make sure it\'s a valid JSON object.'
          } catch {
            errorMessage = dictionary?.navigation?.invalidJsonFormat || 'Invalid JSON format. Please check your syntax and try again.'
          }
        } else if (form.type === 'boolean') {
          errorMessage = dictionary?.navigation?.invalidBooleanValue || 'Invalid boolean value. Please enter "true" or "false".'
        } else if (form.type === 'number' || form.type === 'integer') {
          errorMessage = dictionary?.navigation?.invalidNumberValue?.replace('{type}', form.type) || `Invalid ${form.type} value. Please enter a valid number.`
        }
        
        setError(errorMessage)
        return
      }
      parsedValue = typeInfo.formatValue(form.value)
    } else {
      // For array/json types, validate that it's valid JSON array
      try {
        parsedValue = JSON.parse(form.value)
        if (!Array.isArray(parsedValue)) {
          setError(dictionary?.navigation?.valueMustBeJsonArray || 'Value must be a JSON array')
          return
        }
      } catch {
        setError(dictionary?.navigation?.invalidJsonFormat || 'Invalid JSON format. Please check your syntax and try again.')
        return
      }
    }

    const parameterData: CreateConventionParameterDto = {
      name: form.name,
      value: parsedValue,
    }

    try {
      setLoading(true)

      const newParameter = await conventionParameterService.createConventionParameter(parameterData)
      setSuccess(dictionary?.navigation?.parameterCreatedSuccessfully || 'Parameter created successfully')
      setError('')
      setDialogOpen(false)
      setForm({
        name: '',
        value: '',
        type: 'string'
      })
      
      // Add new parameter to local state instead of reloading
      setConventionParameters(prev => [...prev, newParameter])
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error creating parameter:', err)
      console.error('Parameter data being sent:', parameterData)

      const baseMessage = dictionary?.navigation?.failedToCreateParameter || 'Failed to create parameter'
      if ((err as any).response?.data) {
        setError(`${baseMessage}: ${JSON.stringify((err as any).response.data)}`)
      } else if ((err as any).response?.status) {
        setError(`${baseMessage}: HTTP ${(err as any).response.status} - ${(err as any).response.statusText}`)
      } else if ((err as any).message) {
        setError(`${baseMessage}: ${(err as any).message}`)
      } else {
        setError(`${baseMessage}: ${dictionary?.navigation?.unknownError || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }, [form, dictionary, lang])

  const handleUpdate = useCallback(async () => {
    if (!editingParameter) return

    // Simple validation
    if (!form.name || !form.value) {
      setError(dictionary?.navigation?.pleaseEnterBothNameAndValue || 'Please enter both name and value')
      return
    }

    // Validate value based on selected type
    // For array/json types, ArrayValueEditor handles validation, so we skip it here
    let parsedValue: any
    if (form.type !== 'array' && form.type !== 'json') {
      const typeInfo = getParameterTypeInfo(form.type)
      if (!typeInfo.validation(form.value)) {
        const typeLabel = lang === 'fr' ? getTranslatedTypeLabel(form.type).toLowerCase() : typeInfo.label.toLowerCase()
        let errorMessage = dictionary?.navigation?.invalidValuePleaseCheckFormat?.replace('{type}', typeLabel) || `Invalid ${typeLabel} value. Please check the format.`
        
        // Provide more specific error messages for common issues
        if (form.type === 'object') {
          try {
            JSON.parse(form.value)
            errorMessage = dictionary?.navigation?.invalidObjectValue || 'Invalid object value. Make sure it\'s a valid JSON object.'
          } catch {
            errorMessage = dictionary?.navigation?.invalidJsonFormat || 'Invalid JSON format. Please check your syntax and try again.'
          }
        } else if (form.type === 'boolean') {
          errorMessage = dictionary?.navigation?.invalidBooleanValue || 'Invalid boolean value. Please enter "true" or "false".'
        } else if (form.type === 'number' || form.type === 'integer') {
          errorMessage = dictionary?.navigation?.invalidNumberValue?.replace('{type}', form.type) || `Invalid ${form.type} value. Please enter a valid number.`
        }
        
        setError(errorMessage)
        return
      }
      parsedValue = typeInfo.formatValue(form.value)
    } else {
      // For array/json types, validate that it's valid JSON array
      try {
        parsedValue = JSON.parse(form.value)
        if (!Array.isArray(parsedValue)) {
          setError(dictionary?.navigation?.valueMustBeJsonArray || 'Value must be a JSON array')
          return
        }
      } catch {
        setError(dictionary?.navigation?.invalidJsonFormat || 'Invalid JSON format. Please check your syntax and try again.')
        return
      }
    }

    const parameterData: CreateConventionParameterDto = {
      name: form.name,
      value: parsedValue,
    }

    try {
      setLoading(true)

      const updatedParameter = await conventionParameterService.updateConventionParameter(editingParameter.id, parameterData)
      setSuccess(dictionary?.navigation?.parameterUpdatedSuccessfully || 'Parameter updated successfully')
      setError('')
      setDialogOpen(false)
      setEditingParameter(null)
      setForm({
        name: '',
        value: '',
        type: 'string'
      })
      
      // Update local state instead of reloading
      setConventionParameters(prev => 
        prev.map(p => p.id === editingParameter.id ? updatedParameter : p)
      )
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error updating parameter:', err)
      console.error('Parameter data being sent:', parameterData)

      const baseMessage = dictionary?.navigation?.failedToUpdateParameter || 'Failed to update parameter'
      if ((err as any).response?.data) {
        setError(`${baseMessage}: ${JSON.stringify((err as any).response.data)}`)
      } else if ((err as any).response?.status) {
        setError(`${baseMessage}: HTTP ${(err as any).response.status} - ${(err as any).response.statusText}`)
      } else if ((err as any).message) {
        setError(`${baseMessage}: ${(err as any).message}`)
      } else {
        setError(`${baseMessage}: ${dictionary?.navigation?.unknownError || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }, [editingParameter, form, dictionary, lang])

  // Get parameter type icon based on detected type
  const getParameterTypeIcon = (parameter: ConventionParameter) => {
    const detectedType = detectParameterType(parameter.value)
    const typeInfo = getParameterTypeInfo(detectedType)
    return <span>{typeInfo.icon}</span>
  }

  // Start inline editing
  const startInlineEdit = (parameter: ConventionParameter, field: 'name' | 'value') => {
    const detectedType = detectParameterType(parameter.value)
    setEditingRow(parameter.id)
    setEditingField(field)
    setEditingName(parameter.name)
    setEditingValue(formatValueForDisplay(parameter.value, detectedType))
  }

  // Cancel inline editing
  const cancelInlineEdit = () => {
    setEditingRow(null)
    setEditingField(null)
    setEditingValue('')
    setEditingName('')
  }

  // Save inline edit
  const saveInlineEdit = async (parameter: ConventionParameter) => {
    if (editingField === 'name' && !editingName.trim()) {
      setError(dictionary?.navigation?.nameCannotBeEmpty || 'Name cannot be empty')
      return
    }
    
    if (editingField === 'value' && !editingValue.trim()) {
      setError(dictionary?.navigation?.valueCannotBeEmpty || 'Value cannot be empty')
      return
    }

    try {
      setLoading(true)
      setError('')

      let finalName = parameter.name
      let finalValue = parameter.value

      if (editingField === 'name') {
        finalName = editingName.trim()
      }

      if (editingField === 'value') {
        // Detect the type and validate
        const detectedType = detectParameterType(parameter.value)
        const typeInfo = getParameterTypeInfo(detectedType)
        
        if (!typeInfo.validation(editingValue)) {
          const typeLabel = lang === 'fr' ? getTranslatedTypeLabel(detectedType).toLowerCase() : typeInfo.label.toLowerCase()
          let errorMessage = dictionary?.navigation?.invalidValuePleaseCheckFormat?.replace('{type}', typeLabel) || `Invalid ${typeLabel} value. Please check the format.`
          
          if (detectedType === 'object' || detectedType === 'array' || detectedType === 'json') {
            try {
              JSON.parse(editingValue)
              const jsonType = detectedType === 'array' ? 'array' : detectedType === 'object' ? 'object' : 'value'
              errorMessage = dictionary?.navigation?.invalidValuePleaseCheckFormat?.replace('{type}', `${typeLabel} (JSON ${jsonType})`) || `Invalid ${typeLabel} value. Make sure it's a valid JSON ${jsonType}.`
            } catch {
              errorMessage = dictionary?.navigation?.invalidJsonFormat || 'Invalid JSON format. Please check your syntax and try again.'
            }
          } else if (detectedType === 'boolean') {
            errorMessage = dictionary?.navigation?.invalidBooleanValue || 'Invalid boolean value. Please enter "true" or "false".'
          } else if (detectedType === 'number' || detectedType === 'integer') {
            errorMessage = dictionary?.navigation?.invalidNumberValue?.replace('{type}', detectedType) || `Invalid ${detectedType} value. Please enter a valid number.`
          }
          
          setError(errorMessage)
          return
        }

        // Format value based on type
        finalValue = typeInfo.formatValue(editingValue)
      }

      const parameterData: CreateConventionParameterDto = {
        name: finalName,
        value: finalValue,
      }

      await conventionParameterService.updateConventionParameter(parameter.id, parameterData)
      setSuccess(dictionary?.navigation?.parameterUpdatedSuccessfully || 'Parameter updated successfully')
      
      // Update local state to reflect changes without reloading
      setConventionParameters(prev => 
        prev.map(p => 
          p.id === parameter.id 
            ? { ...p, name: finalName, value: finalValue }
            : p
        )
      )
      
      cancelInlineEdit()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error updating parameter:', err)
      const baseMessage = dictionary?.navigation?.failedToUpdateParameter || 'Failed to update parameter'
      setError(`${baseMessage}: ${(err as any).response?.data?.detail || (err as any).message}`)
    } finally {
      setLoading(false)
    }
  }

  // Format parameter value for display
  const formatParameterValue = (parameter: ConventionParameter) => {
    if (parameter.name === 'holidays') {
      const holidays = conventionParameterService.parseHolidaysValue(parameter.value as string | Holiday[])
      return `${holidays.length} holiday(s)`
    }

    // Handle different data types properly
    const value = parameter.value
    
    // If it's null or undefined
    if (value === null || value === undefined) {
      return 'null'
    }
    
    // If it's already a string, return it
    if (typeof value === 'string') {
      return value
    }
    
    // If it's a number or boolean, convert to string
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    
    // If it's an object or array, try to stringify it
    if (typeof value === 'object') {
      try {
        // If it's an array, show length and first few items
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return '[] (empty array)'
          }
          if (value.length <= 3) {
            return `[${value.map(item => 
              typeof item === 'object' ? JSON.stringify(item) : String(item)
            ).join(', ')}]`
          }
          return `[${value.slice(0, 2).map(item => 
            typeof item === 'object' ? JSON.stringify(item) : String(item)
          ).join(', ')}, ...] (${value.length} items)`
        }
        
        // If it's an object, show key count and first few properties
        const keys = Object.keys(value)
        if (keys.length === 0) {
          return '{} (empty object)'
        }
        
        const preview = keys.slice(0, 2).map(key => {
          const val = (value as any)[key]
          if (typeof val === 'object' && val !== null) {
            return Array.isArray(val) ? `[${(val as any[]).length} items]` : '{...}'
          }
          return String(val)
        }).map((val, index) => `${keys[index]}: ${val}`).join(', ')
        
        return keys.length <= 2 ? 
          `{${preview}}` : 
          `{${preview}, ...} (${keys.length} properties)`
          
      } catch (error) {
        return '[Complex Object]'
      }
    }
    
    // Fallback for any other type
    return String(value)
  }

  // Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <Box display='flex' alignItems='center' gap={1} style={{ fontWeight: 700 }}>
{dictionary?.navigation?.parameterName || 'Parameter Name'}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpward fontSize='small' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDownward fontSize='small' />
            ) : null}
          </Box>
        ),
        cell: ({ row }) => {
          const isEditing = editingRow === row.original.id && editingField === 'name'
          
          if (isEditing) {
            return (
              <Box display='flex' alignItems='center' gap={1}>
                <CustomTextField
                  size='small'
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      saveInlineEdit(row.original)
                    } else if (e.key === 'Escape') {
                      cancelInlineEdit()
                    }
                  }}
                  autoFocus
                />
              </Box>
            )
          }
          
          return (
            <Box 
              display='flex' 
              alignItems='center' 
              gap={1}
              onClick={() => startInlineEdit(row.original, 'name')}
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderRadius: 1
                },
                p: 1,
                borderRadius: 1
              }}
            >
              <Typography variant='body2' fontWeight={500}>
                {row.original.name}
              </Typography>
            </Box>
          )
        },
        enableSorting: true
      }),
      columnHelper.accessor('value', {
        header: ({ column }) => (
          <Box style={{ fontWeight: 700 }}>
            {dictionary?.navigation?.value || 'Value'}
          </Box>
        ),
        cell: ({ row }) => {
          const detectedType = detectParameterType(row.original.value)
          const typeInfo = getParameterTypeInfo(detectedType)
          const showChip = detectedType === 'json' || detectedType === 'array' || detectedType === 'object'
          const isEditing = editingRow === row.original.id && editingField === 'value'
          const isArray = Array.isArray(row.original.value)
          
          if (isEditing) {
            return (
              <Box>
                <Box display='flex' alignItems='center' gap={1} sx={{ mb: 1 }}>
                  <CustomTextField
                    fullWidth
                    size='small'
                    value={editingValue}
                    onChange={e => setEditingValue(e.target.value)}
                    multiline={showChip}
                    rows={showChip ? 4 : 1}
                    placeholder={typeInfo.placeholder}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !showChip) {
                        e.preventDefault()
                        saveInlineEdit(row.original)
                      } else if (e.key === 'Escape') {
                        cancelInlineEdit()
                      }
                    }}
                    autoFocus
                  />
                </Box>
                {showChip && (
                  <Chip 
                    label={typeInfo.label} 
                    size='small' 
                    color='info'
                    sx={{ mb: 1 }}
                  />
                )}
              </Box>
            )
          }
          
          // For arrays, display items in a compact, expandable format
          if (isArray && Array.isArray(row.original.value) && row.original.value.length > 0) {
            const arrayValue = row.original.value as any[]
            
            const handleArrayUpdate = async (newArrayValue: any[]) => {
              try {
                setLoading(true)
                const detectedType = detectParameterType(row.original.value)
                const parameterData: CreateConventionParameterDto = {
                  name: row.original.name,
                  value: newArrayValue,
                }

                await conventionParameterService.updateConventionParameter(row.original.id, parameterData)
                setSuccess(dictionary?.navigation?.parameterUpdatedSuccessfully || 'Parameter updated successfully')
                
                // Update local state
                setConventionParameters(prev => 
                  prev.map(p => 
                    p.id === row.original.id 
                      ? { ...p, value: newArrayValue }
                      : p
                  )
                )
                
                setTimeout(() => setSuccess(''), 3000)
              } catch (err) {
                console.error('Error updating parameter:', err)
                const baseMessage = dictionary?.navigation?.failedToUpdateParameter || 'Failed to update parameter'
                setError(`${baseMessage}: ${(err as any).response?.data?.detail || (err as any).message}`)
              } finally {
                setLoading(false)
              }
            }

            return (
              <ArrayValueDisplay 
                value={arrayValue} 
                onUpdate={handleArrayUpdate}
                parameterId={row.original.id}
                lang={lang}
              />
            )
          }
          
          return (
            <Box 
              onClick={() => startInlineEdit(row.original, 'value')}
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderRadius: 1
                },
                p: 1,
                borderRadius: 1
              }}
            >
              <Typography variant='body2'>{formatParameterValue(row.original)}</Typography>
              {showChip && (
                <Chip 
                  label={typeInfo.label} 
                  size='small' 
                  color='info'
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>
          )
        },
        enableSorting: false
      }),
      columnHelper.display({
        id: 'actions',
        header: ({ column }) => (
          <Box style={{ fontWeight: 700 }}>
            {dictionary?.navigation?.actions || 'Actions'}
          </Box>
        ),
        cell: ({ row }) => {
          const isEditing = editingRow === row.original.id
          
          return (
            <Box>
              {isEditing && (
                <IconButton 
                  onClick={() => saveInlineEdit(row.original)}
                  disabled={loading}
                  color='primary'
                >
                  <Check />
                </IconButton>
              )}
              {isEditing && (
                <IconButton 
                  onClick={() => cancelInlineEdit()}
                  disabled={loading}
                  color='secondary'
                >
                  <Close />
                </IconButton>
              )}
              {!isEditing && (
                <IconButton onClick={() => handleDelete(row.original.id)}>
                  <Delete />
                </IconButton>
              )}
            </Box>
          )
        },
        enableSorting: false
      })
    ],
    [columnHelper, handleDelete, editingRow, editingField, editingValue, editingName, saveInlineEdit, cancelInlineEdit, startInlineEdit, loading, dictionary]
  )

  // React Table
  const table = useReactTable({
    data: conventionParameters,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: search,
      sorting
    },
    onGlobalFilterChange: setSearch,
    onSortingChange: setSorting,
    filterFns: {
      fuzzy: () => false
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  if (dictionaryLoading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mb-4'>
          {dictionary?.navigation?.generalParameters || 'General Parameters'}
        </Typography>
        <Typography color='text.secondary' className='mb-6'>
          {dictionary?.navigation?.generalParametersDescription || 'Manage system parameters including TMM rates, bank days, holidays, and custom parameters'}
        </Typography>

        {error && (
          <Alert severity='error' className='mb-4' onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity='success' className='mb-4' onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Card>
          <CardHeader
            title={dictionary?.navigation?.generalParametersManagement || 'General Parameters Management'}
            action={
              <Button variant='contained' startIcon={<Add />} onClick={() => openDialog()}>
                {dictionary?.navigation?.addParameter || 'Add Parameter'}
              </Button>
            }
          />
          <CardContent>
            <Box className='mb-4'>
              <CustomTextField
                fullWidth
                placeholder={dictionary?.navigation?.searchParameters || 'Search parameters...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {loading ? (
              <Box display='flex' justifyContent='center' p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <div 
                  className='overflow-x-auto'
                  onClick={(e) => {
                    // If clicking on the container (not on input fields or buttons), cancel editing
                    if (e.target === e.currentTarget) {
                      cancelInlineEdit()
                    }
                  }}
                >
                  <table className={styles.table}>
                    <thead>
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th
                              key={header.id}
                              style={{
                                cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                userSelect: 'none'
                              }}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePaginationComponent table={table as any} dictionary={dictionary} />
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Dialog */}
      <Dialog
        fullWidth
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setError('')
        }}
        maxWidth='md'
        scroll='body'
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={() => {
          setDialogOpen(false)
          setError('')
        }} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          {editingParameter ? (dictionary?.navigation?.editParameter || 'Edit Parameter') : (dictionary?.navigation?.addNewParameter || 'Add New Parameter')}
          <Typography component='span' className='flex flex-col text-center'>
            {editingParameter ? (dictionary?.navigation?.updateParameterInformation || 'Update parameter information') : (dictionary?.navigation?.addNewGeneralParameter || 'Add a new general parameter')}
          </Typography>
        </DialogTitle>
        <form onSubmit={e => e.preventDefault()}>
          <DialogContent className='pbs-0 sm:pli-16'>
            {error && (
              <Alert severity='error' className='mb-4' onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <Box className='flex flex-col gap-6'>
              <CustomTextField
                fullWidth
                label={dictionary?.navigation?.parameterName || 'Parameter Name'}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder='Entrer le nom du paramètre (ex: TMM, bank_days, holidays, custom_param)'
              />

              <FormControl fullWidth size='small'>
                <InputLabel>{dictionary?.navigation?.parameterType || 'Parameter Type'}</InputLabel>
                <Select
                  value={form.type}
                  label={dictionary?.navigation?.parameterType || 'Parameter Type'}
                  size='small'
                  onChange={e => {
                    const newType = e.target.value as ParameterValueType
                    // Reset value when changing to/from array/json types
                    if ((newType === 'array' || newType === 'json') && (form.type !== 'array' && form.type !== 'json')) {
                      setForm({ ...form, type: newType, value: '[]' })
                    } else if ((form.type === 'array' || form.type === 'json') && (newType !== 'array' && newType !== 'json')) {
                      setForm({ ...form, type: newType, value: '' })
                    } else {
                      setForm({ ...form, type: newType })
                    }
                  }}
                >
                  {Object.values(PARAMETER_TYPES).map(typeInfo => (
                    <MenuItem key={typeInfo.type} value={typeInfo.type}>
                      {getTranslatedTypeLabel(typeInfo.type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {(form.type === 'array' || form.type === 'json') ? (
                <ArrayValueEditor
                  value={form.value}
                  onChange={(value) => setForm({ ...form, value })}
                  onError={(error) => setError(error)}
                />
              ) : (
                <CustomTextField
                  fullWidth
                  label={dictionary?.navigation?.parameterValue || 'Parameter Value'}
                  value={form.value}
                  onChange={e => setForm({ ...form, value: e.target.value })}
                  placeholder={getTranslatedPlaceholder(form.type)}
                  multiline={form.type === 'object'}
                  rows={form.type === 'object' ? 6 : 1}
                  FormHelperTextProps={{ component: 'div' }}
                  helperText={
                    <Box>
                      <Typography variant='caption' display='block'>
                        {getTranslatedDescription(form.type)}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                        Exemples : {getParameterTypeInfo(form.type).examples.join(', ')}
                      </Typography>
                    </Box>
                  }
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions className='gap-2 pbs-0 sm:pbe-16 sm:pli-16'>
            <Button variant='outlined' color='secondary' onClick={() => {
              setDialogOpen(false)
              setError('')
            }}>
{dictionary?.navigation?.cancel || 'Cancel'}
            </Button>
            <Button variant='contained' onClick={editingParameter ? handleUpdate : handleCreate} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : editingParameter ? (dictionary?.navigation?.update || 'Update') : (dictionary?.navigation?.create || 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Grid>
  )
}

export default GeneralParametersPage
