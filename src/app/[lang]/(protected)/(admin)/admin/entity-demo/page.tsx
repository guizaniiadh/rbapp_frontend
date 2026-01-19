'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Alert
} from '@mui/material'
import { Business, Person, AccountBalance, Group } from '@mui/icons-material'

// Components
import EntityDetailCard from '@/components/EntityDetailCard'

// Config
import { entityConfigs, getEntityConfig } from '@/configs/entityConfigs'

// Types
import type { EntityConfig } from '@/components/EntityDetailCard'

const EntityDemoPage = () => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const [entityData, setEntityData] = useState<any>(null)

  // Mock data for different entities
  const mockData = {
    company: {
      id: '1',
      code: 'COMP001',
      name: 'Acme Corporation',
      description: 'A leading technology company specializing in innovative solutions.',
      website: 'https://acme.com',
      email: 'contact@acme.com',
      phone: '+1 (555) 123-4567',
      address: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'US',
      isActive: true,
      isPublic: true,
      foundedDate: '2010-01-15',
      industry: 'technology',
      employeeCount: 250
    },
    user: {
      id: '1',
      username: 'john.doe',
      email: 'john.doe@acme.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1 (555) 987-6543',
      isActive: true,
      isStaff: true,
      isSuperuser: false,
      role: 'manager'
    },
    agency: {
      id: '1',
      code: 'AGY001',
      name: 'Global Marketing Agency',
      description: 'Full-service marketing agency providing digital and traditional marketing solutions.',
      email: 'info@globalmarketing.com',
      phone: '+1 (555) 456-7890',
      isActive: true
    },
    bank: {
      id: '1',
      code: 'BNK001',
      name: 'First National Bank',
      swiftCode: 'FNBKUS33',
      address: '456 Financial District\nNew York, NY 10004',
      isActive: true
    }
  }

  const handleEntitySelect = (entityType: string) => {
    setSelectedEntity(entityType)
    setEntityData(mockData[entityType as keyof typeof mockData] || null)
  }

  const handleSave = async (data: any) => {
    console.log('Saving entity data:', data)
    // In real implementation, you would call the API
    setEntityData(data)
  }

  const handleDelete = async (id: string) => {
    console.log('Deleting entity:', id)
    // In real implementation, you would call the API
    setSelectedEntity(null)
    setEntityData(null)
  }

  const handleRefresh = async () => {
    console.log('Refreshing entity data')
    // In real implementation, you would reload data
  }

  const handleBack = () => {
    setSelectedEntity(null)
    setEntityData(null)
  }

  const availableEntities = [
    { type: 'company', label: 'Company', icon: <Business />, color: 'primary' },
    { type: 'user', label: 'User', icon: <Person />, color: 'secondary' },
    { type: 'agency', label: 'Agency', icon: <Group />, color: 'success' },
    { type: 'bank', label: 'Bank', icon: <AccountBalance />, color: 'info' }
  ]

  if (selectedEntity && entityData) {
    const entityConfig = getEntityConfig(selectedEntity)
    if (!entityConfig) {
      return (
        <Box p={3}>
          <Alert severity="error">Entity configuration not found</Alert>
        </Box>
      )
    }

    const configWithHandlers: EntityConfig = {
      ...entityConfig,
      onSave: handleSave,
      onDelete: handleDelete,
      onRefresh: handleRefresh,
      onBack: handleBack
    }

    return (
      <Box>
        <EntityDetailCard
          config={configWithHandlers}
          data={entityData}
          onDataChange={setEntityData}
        />
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dynamic Entity Card Demo
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Click on any entity below to see the dynamic card component in action. 
        Each entity has its own configuration with different fields, tabs, and behaviors.
      </Typography>

      <Grid container spacing={3} mt={2}>
        {availableEntities.map((entity) => (
          <Grid item xs={12} sm={6} md={3} key={entity.type}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => handleEntitySelect(entity.type)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box mb={2}>
                  {entity.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {entity.label}
                </Typography>
                <Chip 
                  label={entity.type} 
                  color={entity.color as any}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary" mt={2}>
                  Click to view {entity.label.toLowerCase()} details
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Features Demonstrated
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Dynamic Form Generation"
              secondary="Forms are generated based on entity configuration"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Tabbed Interface"
              secondary="Organize fields into logical tabs (General, Address, Settings)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Multiple Field Types"
              secondary="Text, email, phone, select, boolean, date, textarea, URL fields"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Edit Mode Toggle"
              secondary="Switch between view and edit modes"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="CRUD Operations"
              secondary="Create, Read, Update, Delete operations with loading states"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Responsive Design"
              secondary="Works on all screen sizes with Material-UI components"
            />
          </ListItem>
        </List>
      </Box>
    </Box>
  )
}

export default EntityDemoPage
