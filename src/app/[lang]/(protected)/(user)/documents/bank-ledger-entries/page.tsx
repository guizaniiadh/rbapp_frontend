'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

import {
  Typography,
  Grid,
  Card,
  CardHeader,
  Button,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  Avatar,
  Tooltip,
  Chip,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material'
import { Search, Visibility, Download, CloudUpload, Delete, Refresh, ViewModule, ViewList, ArrowUpward, ArrowDownward, Edit, Save, Cancel } from '@mui/icons-material'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import ExcelViewer from '@/components/ExcelViewer'
import FileUpload from '@/components/FileUpload'

// Service Imports
import { bankLedgerEntryService } from '@/services/bankLedgerEntry.service'
import { agencyService } from '@/services/agency.service'

// Type Imports
import type {
  BankLedgerEntry,
  BankLedgerEntryFilters,
  BankLedgerEntryUpload
} from '@/types/bankLedgerEntry'
import type { Agency } from '@/types/agency'

const BankLedgerEntriesPage = () => {
  const [entries, setEntries] = useState<BankLedgerEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [excelViewerOpen, setExcelViewerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ url: string; name: string } | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [sortField, setSortField] = useState<keyof BankLedgerEntry | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedAgency, setSelectedAgency] = useState<string>('')
  const [renamingEntryId, setRenamingEntryId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState<string>('')

  // Load entries
  const loadEntries = useCallback(async (agencyFilter?: string) => {
    try {
      setLoading(true)
      setError('')
      
      const filters = agencyFilter ? { agency: agencyFilter } : undefined
      const data = await bankLedgerEntryService.getBankLedgerEntries(filters)
      setEntries(data)
    } catch (err) {
      console.error('Error loading entries:', err)
      setError(`Failed to load documents: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load agencies for filtering
  const loadFilterData = useCallback(async () => {
    try {
      const agenciesData = await agencyService.getAgencies()
      setAgencies(agenciesData)
    } catch (err) {
      console.error('Error loading agencies:', err)
    }
  }, [])

  // Handle upload
  const handleUpload = async (file: File, name?: string, agency?: string) => {
    if (!agency) {
      setError('Please select an agency')
      return
    }
    
    try {
      await bankLedgerEntryService.uploadDocument({ file, name, agency })
      setSuccess('Document uploaded successfully')
      setTimeout(() => setSuccess(''), 3000)
      await loadEntries()
    } catch (err) {
      setError('Failed to upload document')
      console.error('Error uploading document:', err)
      throw err
    }
  }

  // Handle download
  const handleDownload = (fileUrl: string, fileName: string) => {
    bankLedgerEntryService.downloadDocument(fileUrl, fileName)
    setSuccess('Document downloaded successfully')
    setTimeout(() => setSuccess(''), 3000)
  }

  // Handle preview
  const handlePreview = (entry: BankLedgerEntry) => {
    setSelectedFile({
      url: entry.file,
      name: entry.name || bankLedgerEntryService.getFileNameFromUrl(entry.file)
    })
    setExcelViewerOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await bankLedgerEntryService.deleteDocument(id)
        setSuccess('Document deleted successfully')
        setTimeout(() => setSuccess(''), 3000)
        await loadEntries()
      } catch (err) {
        setError('Failed to delete document')
        console.error('Error deleting document:', err)
      }
    }
  }

  // Handle rename start
  const handleRenameStart = (entry: BankLedgerEntry) => {
    setRenamingEntryId(entry.id)
    setRenameValue(entry.name || '')
  }

  // Handle rename cancel
  const handleRenameCancel = () => {
    setRenamingEntryId(null)
    setRenameValue('')
  }

  // Handle rename save
  const handleRenameSave = async (id: number) => {
    try {
      await bankLedgerEntryService.updateDocument(id, { name: renameValue })
      setSuccess('Document renamed successfully')
      setTimeout(() => setSuccess(''), 3000)
      setRenamingEntryId(null)
      setRenameValue('')
      await loadEntries()
    } catch (err) {
      setError('Failed to rename document')
      console.error('Error renaming document:', err)
    }
  }

  // Handle sorting
  const handleSort = (field: keyof BankLedgerEntry) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Get sort icon
  const getSortIcon = (field: keyof BankLedgerEntry) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ArrowUpward /> : <ArrowDownward />
  }

  // Filter and sort entries
  const getFilteredAndSortedEntries = () => {
    let filtered = entries

    // Apply search filter
    if (search) {
      filtered = filtered.filter(entry =>
        (entry.name || '').toLowerCase().includes(search.toLowerCase()) ||
        bankLedgerEntryService.getFileNameFromUrl(entry.file).toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply agency filter
    if (selectedAgency) {
      filtered = filtered.filter(entry => entry.agency === selectedAgency)
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = a[sortField]
        let bValue: any = b[sortField]

        // Handle special cases
        if (sortField === 'file') {
          aValue = bankLedgerEntryService.getFileNameFromUrl(aValue)
          bValue = bankLedgerEntryService.getFileNameFromUrl(bValue)
        } else if (sortField === 'uploaded_at') {
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
        }

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }

  const filteredEntries = getFilteredAndSortedEntries()

  // Load entries and filter data on mount
  useEffect(() => {
    loadEntries()
    loadFilterData()
  }, [loadEntries, loadFilterData])

  // Reload entries when agency filter changes
  useEffect(() => {
    if (selectedAgency) {
      loadEntries(selectedAgency)
    } else {
      loadEntries()
    }
  }, [selectedAgency, loadEntries])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant='h4' gutterBottom>
              Bank Ledger Entries
            </Typography>
            <Typography color='text.secondary'>
              View and manage Excel documents and bank ledger entries
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant='outlined'
              startIcon={<Refresh />}
              onClick={() => loadEntries()}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant='contained'
              startIcon={<CloudUpload />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Upload Document
            </Button>
          </Box>
        </Box>

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
          <CardHeader title='Documents' />

          {loading ? (
            <Box display='flex' justifyContent='center' p={4}>
              <CircularProgress />
            </Box>
          ) : filteredEntries.length === 0 ? (
            <Box display='flex' flexDirection='column' alignItems='center' p={6}>
              <i className='tabler-file-x' style={{ fontSize: 64, color: '#ccc', marginBottom: 16 }} />
              <Typography variant='h6' color='text.secondary' gutterBottom>
                No documents found
              </Typography>
              <Typography color='text.secondary' textAlign='center' mb={3}>
                {search ? 'No documents match your search criteria.' : 'Upload your first Excel document to get started.'}
              </Typography>
              {!search && (
                <Button
                  variant='contained'
                  startIcon={<CloudUpload />}
                  onClick={() => setUploadDialogOpen(true)}
                >
                  Upload Document
                </Button>
              )}
            </Box>
          ) : viewMode === 'grid' ? (
            <>
              {/* Grid View Filter Bar */}
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#fafafa',
                  borderBottom: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexWrap: 'wrap'
                }}
              >
                <CustomTextField
                  placeholder='Search files...'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  size='small'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Search />
                      </InputAdornment>
                    )
                  }}
                  sx={{ minWidth: 200 }}
                />
                <FormControl size='small' sx={{ minWidth: 180 }}>
                  <InputLabel>Filter by Agency</InputLabel>
                  <Select
                    value={selectedAgency}
                    label='Filter by Agency'
                    onChange={e => setSelectedAgency(e.target.value)}
                  >
                    <MenuItem value=''>All Agencies</MenuItem>
                    {agencies.map(agency => (
                      <MenuItem key={agency.code} value={agency.code}>
                        {agency.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size='small' sx={{ minWidth: 150 }}>
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={sortField || ''}
                    label='Sort by'
                    onChange={e => setSortField(e.target.value as keyof BankLedgerEntry || null)}
                  >
                    <MenuItem value=''>None</MenuItem>
                    <MenuItem value='file'>File Name</MenuItem>
                    <MenuItem value='uploaded_at'>Date</MenuItem>
                    <MenuItem value='agency'>Agency</MenuItem>
                  </Select>
                </FormControl>
                {sortField && (
                  <FormControl size='small' sx={{ minWidth: 140 }}>
                    <InputLabel>Order</InputLabel>
                    <Select
                      value={sortDirection}
                      label='Order'
                      onChange={e => setSortDirection(e.target.value as 'asc' | 'desc')}
                    >
                      <MenuItem value='asc'>Ascending</MenuItem>
                      <MenuItem value='desc'>Descending</MenuItem>
                    </Select>
                  </FormControl>
                )}
                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => {
                    setSearch('')
                    setSelectedAgency('')
                    setSortField(null)
                    setSortDirection('asc')
                  }}
                  disabled={!search && !selectedAgency && !sortField}
                  startIcon={<Refresh />}
                >
                  Clear
                </Button>
                
                {/* File count display */}
                <Box display='flex' alignItems='center' gap={1} ml='auto'>
                  <Typography variant='body2' color='text.secondary'>
                    {filteredEntries.length} file{filteredEntries.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
                
                {/* View Mode Toggle */}
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size='small'
                >
                  <ToggleButton value='grid'>
                    <ViewModule />
                  </ToggleButton>
                  <ToggleButton value='list'>
                    <ViewList />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Grid View */}
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: '#f5f5f5',
                  minHeight: '400px',
                  border: '1px solid #e0e0e0',
                  borderTop: 'none'
                }}
              >
              <Grid container spacing={1}>
                {filteredEntries.map((entry) => {
                  const fileName = entry.name || bankLedgerEntryService.getFileNameFromUrl(entry.file)
                  const fileExtension = bankLedgerEntryService.getFileExtension(entry.file)
                  const isExcel = bankLedgerEntryService.isExcelFile(entry.file)
                  const canPreview = bankLedgerEntryService.canPreview(entry.file)
                  const agencyName = agencies.find(a => a.code === entry.agency)?.name || entry.agency
                  
                  return (
                    <Grid item xs={6} sm={4} md={3} lg={2} xl={2} key={entry.id}>
                      <Box
                        sx={{
                          p: 1,
                          m: 0.5,
                          borderRadius: 1,
                          cursor: 'pointer',
                          transition: 'all 0.1s ease',
                          '&:hover': {
                            backgroundColor: '#e3f2fd',
                            border: '1px solid #2196f3'
                          },
                          '&:active': {
                            backgroundColor: '#bbdefb'
                          }
                        }}
                        onDoubleClick={() => canPreview && handlePreview(entry)}
                      >
                        {/* File Icon */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            position: 'relative'
                          }}
                        >
                          {/* File Icon */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 1
                            }}
                          >
                            <i 
                              className={isExcel ? 'tabler-file-text' : bankLedgerEntryService.getFileIcon(entry.file)} 
                              style={{ 
                                fontSize: 48, 
                                color: isExcel ? 'var(--mui-palette-primary-main)' : '#1976d2'
                              }} 
                            />
                          </Box>

                          {/* File Name */}
                          <Typography
                            variant='body2'
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 400,
                              color: '#000',
                              wordBreak: 'break-word',
                              lineHeight: 1.2,
                              maxHeight: '2.4em',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              textAlign: 'center',
                              mb: 0.5
                            }}
                            title={fileName}
                          >
                            {fileName}
                          </Typography>

                          
                          {/* Additional Info */}
                          <Typography
                            variant='caption'
                            sx={{
                              fontSize: '0.6rem',
                              color: '#999',
                              textAlign: 'center',
                              lineHeight: 1,
                              display: 'block'
                            }}
                          >
                            {new Date(entry.uploaded_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Box>

                        {/* Context Menu on Right Click */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 10,
                            display: 'none'
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            // Context menu implementation would go here
                          }}
                        />
                      </Box>
                    </Grid>
                  )
                })}
               </Grid>
             </Box>
            </>
          ) : (
            <>
              {/* Table View Filter Bar */}
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#fafafa',
                  borderBottom: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexWrap: 'wrap'
                }}
              >
                <CustomTextField
                  placeholder='Search files...'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  size='small'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Search />
                      </InputAdornment>
                    )
                  }}
                  sx={{ minWidth: 200 }}
                />
                <FormControl size='small' sx={{ minWidth: 180 }}>
                  <InputLabel>Filter by Agency</InputLabel>
                  <Select
                    value={selectedAgency}
                    label='Filter by Agency'
                    onChange={e => setSelectedAgency(e.target.value)}
                  >
                    <MenuItem value=''>All Agencies</MenuItem>
                    {agencies.map(agency => (
                      <MenuItem key={agency.code} value={agency.code}>
                        {agency.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size='small' sx={{ minWidth: 150 }}>
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={sortField || ''}
                    label='Sort by'
                    onChange={e => setSortField(e.target.value as keyof BankLedgerEntry || null)}
                  >
                    <MenuItem value=''>None</MenuItem>
                    <MenuItem value='file'>File Name</MenuItem>
                    <MenuItem value='uploaded_at'>Date</MenuItem>
                    <MenuItem value='agency'>Agency</MenuItem>
                  </Select>
                </FormControl>
                {sortField && (
                  <FormControl size='small' sx={{ minWidth: 140 }}>
                    <InputLabel>Order</InputLabel>
                    <Select
                      value={sortDirection}
                      label='Order'
                      onChange={e => setSortDirection(e.target.value as 'asc' | 'desc')}
                    >
                      <MenuItem value='asc'>Ascending</MenuItem>
                      <MenuItem value='desc'>Descending</MenuItem>
                    </Select>
                  </FormControl>
                )}
                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => {
                    setSearch('')
                    setSelectedAgency('')
                    setSortField(null)
                    setSortDirection('asc')
                  }}
                  disabled={!search && !selectedAgency && !sortField}
                  startIcon={<Refresh />}
                >
                  Clear
                </Button>
                
                {/* File count display */}
                <Box display='flex' alignItems='center' gap={1} ml='auto'>
                  <Typography variant='body2' color='text.secondary'>
                    {filteredEntries.length} file{filteredEntries.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
                
                {/* View Mode Toggle */}
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size='small'
                >
                  <ToggleButton value='grid'>
                    <ViewModule />
                  </ToggleButton>
                  <ToggleButton value='list'>
                    <ViewList />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <TableContainer>
                <Table>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      onClick={() => handleSort('file')}
                      sx={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <Box display='flex' alignItems='center' gap={1}>
                        File
                        {getSortIcon('file')}
                      </Box>
                    </TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell 
                      onClick={() => handleSort('agency')}
                      sx={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <Box display='flex' alignItems='center' gap={1}>
                        Agency
                        {getSortIcon('agency')}
                      </Box>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('uploaded_at')}
                      sx={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <Box display='flex' alignItems='center' gap={1}>
                        Upload Date
                        {getSortIcon('uploaded_at')}
                      </Box>
                    </TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEntries.map((entry) => {
                    const fileName = entry.name || bankLedgerEntryService.getFileNameFromUrl(entry.file)
                    const fileExtension = bankLedgerEntryService.getFileExtension(entry.file)
                    const isExcel = bankLedgerEntryService.isExcelFile(entry.file)
                    const canPreview = bankLedgerEntryService.canPreview(entry.file)
                    const agencyName = agencies.find(a => a.code === entry.agency)?.name || entry.agency
                    
                    return (
                      <TableRow key={entry.id} hover>
                        <TableCell>
                          <Box display='flex' alignItems='center' gap={2}>
                            <i 
                              className={isExcel ? 'tabler-file-text' : bankLedgerEntryService.getFileIcon(entry.file)} 
                              style={{ 
                                fontSize: 32, 
                                color: isExcel ? 'var(--mui-palette-primary-main)' : '#1976d2'
                              }} 
                            />
                            <Box sx={{ flex: 1 }}>
                              {renamingEntryId === entry.id ? (
                                <TextField
                                  size='small'
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleRenameSave(entry.id)
                                    } else if (e.key === 'Escape') {
                                      handleRenameCancel()
                                    }
                                  }}
                                  autoFocus
                                  sx={{ minWidth: 200 }}
                                />
                              ) : (
                                <Typography variant='body2' fontWeight={500}>
                                  {fileName}
                                </Typography>
                              )}
                              <Typography variant='caption' color='text.secondary'>
                                ID: {entry.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={fileExtension.toUpperCase()}
                            size='small'
                            color={isExcel ? 'success' : 'primary'}
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' color='text.secondary'>
                            {agencyName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>
                            {new Date(entry.uploaded_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box display='flex' gap={1} justifyContent='flex-end'>
                            {renamingEntryId === entry.id ? (
                              <>
                                <Tooltip title="Save">
                                  <IconButton
                                    size='small'
                                    onClick={() => handleRenameSave(entry.id)}
                                    color='primary'
                                  >
                                    <Save />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                  <IconButton
                                    size='small'
                                    onClick={handleRenameCancel}
                                    color='default'
                                  >
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : (
                              <>
                                {canPreview && (
                                  <Tooltip title="Preview">
                                    <IconButton
                                      size='small'
                                      onClick={() => handlePreview(entry)}
                                    >
                                      <Visibility />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Download">
                                  <IconButton
                                    size='small'
                                    onClick={() => handleDownload(entry.file, fileName)}
                                  >
                                    <Download />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Rename">
                                  <IconButton
                                    size='small'
                                    onClick={() => handleRenameStart(entry)}
                                    color='primary'
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size='small'
                                    onClick={() => handleDelete(entry.id)}
                                    color='error'
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            </>
          )}
        </Card>

        {/* Upload Dialog */}
        <FileUpload
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          onUpload={handleUpload}
          acceptedTypes={['.xlsx', '.xls', '.pdf', '.doc', '.docx']}
          maxSize={10}
        />

        {/* Excel Viewer Dialog */}
        {selectedFile && (
          <ExcelViewer
            open={excelViewerOpen}
            onClose={() => setExcelViewerOpen(false)}
            fileUrl={selectedFile.url}
            fileName={selectedFile.name}
          />
        )}
      </Grid>
    </Grid>
  )
}

export default BankLedgerEntriesPage
