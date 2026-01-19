'use client'

import React, { useState } from 'react'
import { Box, Typography, Card, CardContent, Grid, Button, Alert } from '@mui/material'
import EntityLookup from '@/components/EntityLookup'

// Mock data for testing
const mockTerritoryData = [
  { id: 1, code: 'TER001', name: 'North Territory', region: 'North' },
  { id: 2, code: 'TER002', name: 'South Territory', region: 'South' },
  { id: 3, code: 'TER003', name: 'East Territory', region: 'East' },
  { id: 4, code: 'TER004', name: 'West Territory', region: 'West' },
  { id: 5, code: 'TER005', name: 'Central Territory', region: 'Central' }
]

const mockVendorData = [
  { id: 1, code: 'VEN001', name: 'ABC Corporation', type: 'Supplier' },
  { id: 2, code: 'VEN002', name: 'XYZ Industries', type: 'Manufacturer' },
  { id: 3, code: 'VEN003', name: 'Global Services', type: 'Service Provider' },
  { id: 4, code: 'VEN004', name: 'Tech Solutions', type: 'Technology' },
  { id: 5, code: 'VEN005', name: 'Logistics Pro', type: 'Logistics' }
]

const EntityLookupDemoPage = () => {
  const [selectedTerritory, setSelectedTerritory] = useState('')
  const [selectedVendor, setSelectedVendor] = useState('')
  const [selectedTerritoryData, setSelectedTerritoryData] = useState<any>(null)
  const [selectedVendorData, setSelectedVendorData] = useState<any>(null)
  const [message, setMessage] = useState('')

  // Mock API endpoints
  const mockApiCall = async (endpoint: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    switch (endpoint) {
      case '/api/territory':
        return mockTerritoryData
      case '/api/vendor':
        return mockVendorData
      default:
        return []
    }
  }

  // Override fetch for demo purposes
  const originalFetch = global.fetch
  global.fetch = async (url: string) => {
    if (url.includes('/api/')) {
      const data = await mockApiCall(url)
      return {
        ok: true,
        json: async () => data
      } as Response
    }
    return originalFetch(url)
  }

  const handleTerritorySelected = (data: any, fieldName: string) => {
    setSelectedTerritory(data[fieldName] || data.name || '')
    setSelectedTerritoryData(data)
    setMessage(`Territory selected: ${data.name} (${data.code})`)
  }

  const handleVendorSelected = (data: any, fieldName: string) => {
    setSelectedVendor(data[fieldName] || data.name || '')
    setSelectedVendorData(data)
    setMessage(`Vendor selected: ${data.name} (${data.code})`)
  }

  const clearSelections = () => {
    setSelectedTerritory('')
    setSelectedVendor('')
    setSelectedTerritoryData(null)
    setSelectedVendorData(null)
    setMessage('')
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        EntityLookup Component Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        This demo showcases the EntityLookup component with different configurations.
        Click the search icons to open the lookup modals.
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Territory Lookup */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Territory Lookup
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select a territory from the list. This lookup includes code, name, and region columns.
              </Typography>
              
              <EntityLookup
                componentName="Territory"
                apiURI="/api/territory"
                selectedItem={selectedTerritory}
                field="name"
                title="Select Territory"
                columnDefs={[
                  { headerName: 'Code', field: 'code', flex: 1 },
                  { headerName: 'Name', field: 'name', flex: 2 },
                  { headerName: 'Region', field: 'region', flex: 1 }
                ]}
                onItemSelected={handleTerritorySelected}
                placeholder="Select a territory..."
                size="md"
                lookupSize="lg"
              />

              {selectedTerritoryData && (
                <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Territory Details:
                  </Typography>
                  <Typography variant="body2">
                    <strong>Code:</strong> {selectedTerritoryData.code}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {selectedTerritoryData.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Region:</strong> {selectedTerritoryData.region}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Vendor Lookup */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vendor Lookup
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select a vendor from the list. This lookup includes code, name, and type columns.
              </Typography>
              
              <EntityLookup
                componentName="Vendor"
                apiURI="/api/vendor"
                selectedItem={selectedVendor}
                field="name"
                title="Select Vendor"
                columnDefs={[
                  { headerName: 'Code', field: 'code', flex: 1 },
                  { headerName: 'Name', field: 'name', flex: 2 },
                  { headerName: 'Type', field: 'type', flex: 1 }
                ]}
                onItemSelected={handleVendorSelected}
                placeholder="Select a vendor..."
                size="md"
                lookupSize="xl"
              />

              {selectedVendorData && (
                <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Vendor Details:
                  </Typography>
                  <Typography variant="body2">
                    <strong>Code:</strong> {selectedVendorData.code}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {selectedVendorData.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {selectedVendorData.type}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Small Size Lookup */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Small Size Lookup
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This lookup uses a smaller input size and modal.
              </Typography>
              
              <EntityLookup
                componentName="Territory"
                apiURI="/api/territory"
                selectedItem=""
                field="name"
                title="Select Territory (Small)"
                columnDefs={[
                  { headerName: 'Code', field: 'code', flex: 1 },
                  { headerName: 'Name', field: 'name', flex: 2 }
                ]}
                onItemSelected={(data) => console.log('Small lookup selected:', data)}
                placeholder="Select territory..."
                size="sm"
                lookupSize="sm"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Large Size Lookup */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Large Size Lookup
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This lookup uses a larger input size and modal.
              </Typography>
              
              <EntityLookup
                componentName="Vendor"
                apiURI="/api/vendor"
                selectedItem=""
                field="name"
                title="Select Vendor (Large)"
                columnDefs={[
                  { headerName: 'Code', field: 'code', flex: 1 },
                  { headerName: 'Name', field: 'name', flex: 2 },
                  { headerName: 'Type', field: 'type', flex: 1 }
                ]}
                onItemSelected={(data) => console.log('Large lookup selected:', data)}
                placeholder="Select vendor..."
                size="lg"
                lookupSize="xl"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3} display="flex" gap={2}>
        <Button variant="outlined" onClick={clearSelections}>
          Clear All Selections
        </Button>
        <Button 
          variant="contained" 
          onClick={() => setMessage('Demo completed successfully!')}
        >
          Test Message
        </Button>
      </Box>

      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Features Demonstrated:
        </Typography>
        <ul>
          <li>Read-only input field with search icon</li>
          <li>Modal with searchable data grid</li>
          <li>Different input sizes (sm, md, lg)</li>
          <li>Different modal sizes (sm, lg, xl)</li>
          <li>Custom column definitions</li>
          <li>Real-time search filtering</li>
          <li>Double-click to select items</li>
          <li>External link to entity management</li>
          <li>Responsive design</li>
        </ul>
      </Box>
    </Box>
  )
}

export default EntityLookupDemoPage
