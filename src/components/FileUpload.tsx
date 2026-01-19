'use client'

import { useState, useRef } from 'react'
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import { CloudUpload, Close, Delete, Edit, Check } from '@mui/icons-material'

interface FileUploadProps {
  open: boolean
  onClose: () => void
  onUpload: (file: File, name?: string) => Promise<void>
  acceptedTypes?: string[]
  maxSize?: number // in MB
  inline?: boolean // Render inline instead of as dialog
  dictionary?: any // For internationalization
}

const FileUpload = ({ 
  open, 
  onClose, 
  onUpload, 
  acceptedTypes = ['.xlsx', '.xls', '.pdf', '.doc', '.docx'],
  maxSize = 10,
  inline = false,
  dictionary
}: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [displayFileName, setDisplayFileName] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    setError('')
    
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      setError(dictionary?.fileTypeNotSupported || `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`)
      return
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(dictionary?.navigation?.fileSizeTooLarge || dictionary?.fileSizeTooLarge || `File size too large. Maximum size: ${maxSize}MB`)
      return
    }

    setSelectedFile(file)
    const defaultName = file.name.split('.')[0] // Set default name without extension
    setFileName(defaultName)
    setDisplayFileName(file.name) // Display the original file name
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {
    console.log('🔵🔵🔵 FileUpload handleUpload CALLED 🔵🔵🔵')
    console.log('🔵 selectedFile:', selectedFile?.name, selectedFile?.size)
    console.log('🔵 fileName:', fileName)
    console.log('🔵 onUpload type:', typeof onUpload)
    
    if (!selectedFile) {
      console.log('🔵 No file selected, returning early')
      return
    }

    try {
      console.log('🔵 Setting uploading state to true')
      setUploading(true)
      setError('')
      console.log('🔵 About to call onUpload callback')
      console.log('🔵 File:', selectedFile.name, 'Size:', selectedFile.size)
      console.log('🔵 Name param:', fileName || undefined)
      await onUpload(selectedFile, fileName || undefined)
      console.log('🔵 onUpload callback completed successfully')
      handleClose()
    } catch (err) {
      // Don't set error here - let the parent component handle error display
      console.error('🔵🔵🔵 Upload error in FileUpload 🔵🔵🔵')
      console.error('🔵 Error:', err)
      console.error('🔵 Error message:', (err as any)?.message)
      console.error('🔵 Error stack:', (err as any)?.stack)
    } finally {
      console.log('🔵 Setting uploading state to false')
      setUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setFileName('')
    setDisplayFileName('')
    setIsRenaming(false)
    setRenameValue('')
    setError('')
    setUploading(false)
    onClose()
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFileName('')
    setDisplayFileName('')
    setIsRenaming(false)
    setRenameValue('')
    setError('')
  }

  const handleRenameStart = () => {
    setRenameValue(displayFileName || selectedFile?.name || '')
    setIsRenaming(true)
    // Focus the input after state update
    setTimeout(() => {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }, 0)
  }

  const handleRenameSave = () => {
    if (renameValue.trim()) {
      const fileExtension = selectedFile?.name.split('.').pop() || ''
      const nameWithoutExtension = renameValue.endsWith(`.${fileExtension}`) 
        ? renameValue.slice(0, -fileExtension.length - 1)
        : renameValue
      setDisplayFileName(renameValue.trim())
      setFileName(nameWithoutExtension.trim())
    }
    setIsRenaming(false)
    setRenameValue('')
  }

  const handleRenameCancel = () => {
    setIsRenaming(false)
    setRenameValue('')
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSave()
    } else if (e.key === 'Escape') {
      handleRenameCancel()
    }
  }

  const uploadContent = (
    <>
      {!selectedFile ? (
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            border: '2px dashed',
            borderColor: dragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragActive ? 'action.hover' : 'transparent',
            transition: 'all 0.2s ease-in-out',
            minHeight: 280,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 5 }} />
          <Typography variant="h6" gutterBottom>
            {dictionary?.navigation?.dropFileHere || dictionary?.dropFileHere || 'Drop your file here or click to browse'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {dictionary?.navigation?.acceptedFormats || dictionary?.acceptedFormats || 'Accepted formats'}: {acceptedTypes.join(', ')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dictionary?.navigation?.maximumSize || dictionary?.maximumSize || 'Maximum size'}: {maxSize}MB
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </Box>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="flex-end"
          minHeight={280}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 0,
              mb: 6,
              overflow: 'hidden'
            }}
          >
            <img 
              src="/images/icons/excel-logo.png" 
              alt="Excel" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                display: 'block'
              }} 
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p={2}
            border="1px solid"
            borderColor="divider"
            borderRadius={1}
            mb={2}
            sx={{
              maxWidth: 900,
              width: '100%'
            }}
          >
            <Box display="flex" alignItems="center" gap={2} flex={1}>
              <Box flex={1}>
                {isRenaming ? (
                  <TextField
                    inputRef={renameInputRef}
                    size="small"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={handleRenameSave}
                    autoFocus
                    sx={{ width: '100%' }}
                    variant="standard"
                  />
                ) : (
                  <Typography variant="body1" fontWeight={500}>
                    {displayFileName || selectedFile.name}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={0.5}>
              {!isRenaming && !uploading && (
                <IconButton onClick={handleRenameStart} size="small" title={dictionary?.navigation?.rename || dictionary?.rename || 'Rename'}>
                  <Edit />
                </IconButton>
              )}
              {isRenaming && (
                <>
                  <IconButton onClick={handleRenameSave} size="small" title={dictionary?.navigation?.save || dictionary?.save || 'Save'} color="primary">
                    <Check />
                  </IconButton>
                  <IconButton onClick={handleRenameCancel} size="small" title={dictionary?.navigation?.cancel || dictionary?.cancel || 'Cancel'}>
                    <Close />
                  </IconButton>
                </>
              )}
              <IconButton onClick={removeFile} size="small" disabled={uploading} title={dictionary?.navigation?.delete || dictionary?.delete || 'Delete'}>
                <Delete />
              </IconButton>
            </Box>
          </Box>
          {uploading && (
            <Box sx={{ maxWidth: 900, width: '100%', mt: 2, mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                {dictionary?.navigation?.uploadingDocument || dictionary?.uploadingDocument || 'Uploading document...'}
              </Typography>
              <LinearProgress />
            </Box>
          )}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={2} sx={{ maxWidth: 900, width: '100%' }}>
            <Button onClick={handleClose} disabled={uploading}>
              {dictionary?.navigation?.cancel || dictionary?.cancel || 'Cancel'}
            </Button>
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={uploading}
              startIcon={<CloudUpload />}
            >
              {uploading ? (dictionary?.navigation?.uploading || dictionary?.uploading || 'Uploading...') : (dictionary?.navigation?.upload || dictionary?.upload || 'Upload')}
            </Button>
          </Box>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </>
  )

  if (inline) {
    return (
      <Box>
        {uploadContent}
      </Box>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{dictionary?.navigation?.uploadDocument || dictionary?.uploadDocument || 'Upload Document'}</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {uploadContent}
      </DialogContent>

      <DialogActions>
        {selectedFile && (
          <>
            <Button onClick={handleClose} disabled={uploading}>
              {dictionary?.navigation?.cancel || dictionary?.cancel || 'Cancel'}
            </Button>
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={uploading}
              startIcon={<CloudUpload />}
            >
              {uploading ? (dictionary?.navigation?.uploading || dictionary?.uploading || 'Uploading...') : (dictionary?.navigation?.upload || dictionary?.upload || 'Upload')}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default FileUpload



