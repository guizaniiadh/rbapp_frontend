'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Typography,
  Divider,
  Alert
} from '@mui/material'
import { Add, Delete, Edit, Save, Cancel } from '@mui/icons-material'
import CustomTextField from '@core/components/mui/TextField'

interface ArrayValueEditorProps {
  value: string
  onChange: (value: string) => void
  onError?: (error: string) => void
}

interface ArrayItem {
  [key: string]: any
}

const ArrayValueEditor: React.FC<ArrayValueEditorProps> = ({ value, onChange, onError }) => {
  const [items, setItems] = useState<ArrayItem[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingItem, setEditingItem] = useState<ArrayItem | null>(null)
  const [error, setError] = useState<string>('')
  const isInternalUpdateRef = React.useRef<boolean>(false)
  const lastValueRef = React.useRef<string>('')
  const isInitializedRef = React.useRef<boolean>(false)

  // Parse initial value - only when value prop changes externally
  useEffect(() => {
    // Skip if this is an internal update (from our onChange)
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false
      return
    }

    // Only parse if value actually changed
    if (lastValueRef.current === value) {
      return
    }

    try {
      if (!value || value.trim() === '') {
        setItems((prevItems) => {
          if (prevItems.length > 0) {
            lastValueRef.current = value || ''
            isInitializedRef.current = true
            return []
          }
          return prevItems
        })
        if (!isInitializedRef.current) {
          lastValueRef.current = value || ''
          isInitializedRef.current = true
        }
        return
      }

      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        // Check if array contains objects
        let newItems: ArrayItem[]
        if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null && !Array.isArray(parsed[0])) {
          newItems = parsed
        } else {
          // Simple array of primitives - convert to objects with 'value' key
          newItems = parsed.map((item, index) => ({ value: item, _index: index }))
        }
        
        // Only update if items actually changed
        setItems((prevItems) => {
          const itemsString = JSON.stringify(prevItems)
          const newItemsString = JSON.stringify(newItems)
          if (itemsString !== newItemsString) {
            lastValueRef.current = value
            isInitializedRef.current = true
            return newItems
          }
          return prevItems
        })
      } else {
        setError('La valeur doit être un tableau JSON')
        if (onError) onError('La valeur doit être un tableau JSON')
        setItems((prevItems) => {
          if (prevItems.length > 0) {
            lastValueRef.current = value
            isInitializedRef.current = true
            return []
          }
          return prevItems
        })
      }
    } catch (err) {
      setError('Format JSON invalide')
      if (onError) onError('Format JSON invalide')
      setItems((prevItems) => {
        if (prevItems.length > 0) {
          lastValueRef.current = value
          isInitializedRef.current = true
          return []
        }
        return prevItems
      })
    }
  }, [value, onError])

  // Update parent when items change (only from user interaction)
  useEffect(() => {
    // Skip if not initialized yet (wait for value prop to be parsed first)
    if (!isInitializedRef.current) {
      return
    }

    // Generate the new value string
    let newValueString: string
    if (items.length === 0) {
      newValueString = '[]'
    } else {
      // Check if items are objects with '_index' (simple array items)
      const isSimpleArray = items.every(item => Object.keys(item).length === 1 && 'value' in item)
      
      if (isSimpleArray) {
        // Convert back to simple array
        const simpleArray = items.map(item => item.value)
        newValueString = JSON.stringify(simpleArray, null, 2)
      } else {
        // Complex objects - remove _index if present
        const cleanItems = items.map(({ _index, ...rest }) => rest)
        newValueString = JSON.stringify(cleanItems, null, 2)
      }
    }

    // Only call onChange if the value actually changed and it's not from external prop update
    if (newValueString !== lastValueRef.current) {
      isInternalUpdateRef.current = true
      lastValueRef.current = newValueString
      onChange(newValueString)
    }
  }, [items, onChange])

  // Get object keys from first item (for object arrays)
  const getObjectKeys = (): string[] => {
    if (items.length === 0) return []
    const firstItem = items[0]
    if (typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem)) {
      return Object.keys(firstItem).filter(key => key !== '_index')
    }
    return []
  }

  const isObjectArray = items.length > 0 && 
    typeof items[0] === 'object' && 
    items[0] !== null && 
    !Array.isArray(items[0]) &&
    !('value' in items[0] && Object.keys(items[0]).length === 1)

  // Add new item
  const handleAddItem = () => {
    if (isObjectArray) {
      const keys = getObjectKeys()
      if (keys.length === 0) {
        // If no existing items, create a default structure with common fields
        // Check if we can infer from the name (e.g., holidays might have date and name/label)
        const newItem: ArrayItem = { date: '', name: '' }
        setItems([...items, newItem])
        setEditingIndex(items.length)
        setEditingItem({ ...newItem })
      } else {
        const newItem: ArrayItem = {}
        keys.forEach(key => {
          newItem[key] = ''
        })
        setItems([...items, newItem])
        setEditingIndex(items.length)
        setEditingItem({ ...newItem })
      }
    } else {
      // Simple array
      const newItem = { value: '', _index: items.length }
      setItems([...items, newItem])
      setEditingIndex(items.length)
      setEditingItem({ ...newItem })
    }
  }

  // Start editing
  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setEditingItem({ ...items[index] })
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditingItem(null)
  }

  // Save edited item
  const handleSaveEdit = () => {
    if (editingIndex === null || editingItem === null) return

    const newItems = [...items]
    newItems[editingIndex] = { ...editingItem }
    setItems(newItems)
    setEditingIndex(null)
    setEditingItem(null)
  }

  // Delete item
  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    if (editingIndex === index) {
      setEditingIndex(null)
      setEditingItem(null)
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1)
    }
  }

  // Update editing item field
  const handleUpdateEditingItem = (key: string, newValue: any) => {
    if (editingItem === null) return
    setEditingItem({ ...editingItem, [key]: newValue })
  }

  // Render item display
  const renderItem = (item: ArrayItem, index: number) => {
    if (editingIndex === index) {
      // Editing mode
      if (isObjectArray) {
        const keys = getObjectKeys()
        return (
          <Paper sx={{ p: 2, mb: 1, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Modifier l'élément {index + 1}</Typography>
            {keys.map(key => (
              <Box key={key} sx={{ mb: 1 }}>
                <CustomTextField
                  fullWidth
                  size="small"
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={editingItem?.[key] || ''}
                  onChange={(e) => handleUpdateEditingItem(key, e.target.value)}
                  placeholder={`Entrer ${key}`}
                />
              </Box>
            ))}
            <Box display="flex" gap={1} mt={1}>
              <Button
                size="small"
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveEdit}
              >
                Enregistrer
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancelEdit}
              >
                Annuler
              </Button>
            </Box>
          </Paper>
        )
      } else {
        // Simple array editing
        return (
          <Paper sx={{ p: 2, mb: 1, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Modifier l'élément {index + 1}</Typography>
            <CustomTextField
              fullWidth
              size="small"
              label="Valeur"
              value={editingItem?.value || ''}
              onChange={(e) => handleUpdateEditingItem('value', e.target.value)}
              placeholder="Entrer la valeur"
            />
            <Box display="flex" gap={1} mt={1}>
              <Button
                size="small"
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveEdit}
              >
                Enregistrer
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancelEdit}
              >
                Annuler
              </Button>
            </Box>
          </Paper>
        )
      }
    }

    // Display mode
    return (
      <ListItem
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          mb: 1,
          bgcolor: 'background.paper'
        }}
      >
        <ListItemText
          primary={
            isObjectArray ? (
              <Box>
                {Object.entries(item)
                  .filter(([key]) => key !== '_index')
                  .map(([key, value]) => (
                    <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
                      <strong>{key}:</strong> {String(value)}
                    </Typography>
                  ))}
              </Box>
            ) : (
              <Typography variant="body2">{String(item.value)}</Typography>
            )
          }
        />
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            size="small"
            onClick={() => handleStartEdit(index)}
            sx={{ mr: 1 }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            edge="end"
            size="small"
            onClick={() => handleDeleteItem(index)}
            color="error"
          >
            <Delete fontSize="small" />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          {isObjectArray ? 'Éléments du tableau (Objets)' : 'Éléments du tableau'}
          {items.length > 0 && ` (${items.length} élément${items.length !== 1 ? 's' : ''})`}
        </Typography>
        <Box
          display="flex"
          alignItems="center"
          gap={0.5}
          onClick={handleAddItem}
          sx={{
            cursor: 'pointer',
            color: 'primary.main',
            '&:hover': {
              color: 'primary.dark'
            }
          }}
        >
          <Add color="primary" />
          <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
            Ajouter un élément
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {items.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover' }}>
          <Typography variant="body2" color="text.secondary">
            Aucun élément dans le tableau. Cliquez sur "Ajouter un élément" pour ajouter votre premier élément.
          </Typography>
        </Paper>
      ) : (
        <List>
          {items.map((item, index) => (
            <Box key={index}>
              {renderItem(item, index)}
            </Box>
          ))}
        </List>
      )}

      {isObjectArray && items.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Pour ajouter des éléments, ajoutez d'abord un élément et définissez sa structure. La structure sera utilisée pour tous les éléments suivants.
        </Alert>
      )}
    </Box>
  )
}

export default ArrayValueEditor

