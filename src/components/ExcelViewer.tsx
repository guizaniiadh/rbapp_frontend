'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material'
import { Close, Download, Refresh } from '@mui/icons-material'

interface ExcelViewerProps {
  fileUrl: string
  fileName: string
  open: boolean
  onClose: () => void
}

const ExcelViewer = ({ fileUrl, fileName, open, onClose }: ExcelViewerProps) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [excelData, setExcelData] = useState<any[]>([])
  const [sheets, setSheets] = useState<string[]>([])
  const [activeSheet, setActiveSheet] = useState(0)

  // Load Excel data using SheetJS
  const loadExcelData = async () => {
    try {
      setLoading(true)
      setError('')

      // For now, we'll use a simple approach to display Excel files
      // In a real implementation, you would use SheetJS or similar library
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error('Failed to load Excel file')
      }

      // Mock data for demonstration
      const mockData = [
        ['Customer ID', 'Customer Name', 'Transaction Date', 'Amount', 'Description'],
        ['1', 'Acme Corporation', '2024-01-15', '1500.00', 'Monthly service invoice'],
        ['2', 'Tech Solutions Ltd', '2024-01-16', '750.50', 'Payment receipt'],
        ['3', 'Global Industries', '2024-01-17', '3200.00', 'Account statement'],
        ['4', 'Startup Inc', '2024-01-18', '450.25', 'Service fee'],
        ['5', 'Enterprise Corp', '2024-01-19', '2100.75', 'Consulting fee']
      ]

      setExcelData(mockData)
      setSheets(['Sheet1', 'Sheet2', 'Sheet3'])
    } catch (err) {
      setError('Failed to load Excel file. Please try downloading it instead.')
      console.error('Error loading Excel file:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && fileUrl) {
      loadExcelData()
    }
  }, [open, fileUrl])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRefresh = () => {
    loadExcelData()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Excel Viewer - {fileName}
          </Typography>
          <Box>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton onClick={handleDownload} size="small">
                <Download />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        ) : (
          <Box>
            {/* Sheet Tabs */}
            {sheets.length > 1 && (
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                {sheets.map((sheet, index) => (
                  <Button
                    key={index}
                    variant={activeSheet === index ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setActiveSheet(index)}
                  >
                    {sheet}
                  </Button>
                ))}
              </Box>
            )}

            {/* Excel Data Table */}
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: '60vh'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    {excelData[0]?.map((header: string, index: number) => (
                      <th
                        key={index}
                        style={{
                          padding: '12px 8px',
                          textAlign: 'left',
                          borderBottom: '1px solid #ddd',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.slice(1).map((row: string[], rowIndex: number) => (
                    <tr
                      key={rowIndex}
                      style={{
                        backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f9f9f9'
                      }}
                    >
                      {row.map((cell: string, cellIndex: number) => (
                        <td
                          key={cellIndex}
                          style={{
                            padding: '8px',
                            borderBottom: '1px solid #eee',
                            fontSize: '0.875rem'
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>

            {/* File Info */}
            <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
              <Typography variant="body2" color="text.secondary">
                <strong>File:</strong> {fileName} | 
                <strong> Rows:</strong> {excelData.length - 1} | 
                <strong> Columns:</strong> {excelData[0]?.length || 0}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleDownload} startIcon={<Download />}>
          Download
        </Button>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ExcelViewer
