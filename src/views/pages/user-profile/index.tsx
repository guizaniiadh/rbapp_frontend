'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'
import type { SyntheticEvent } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Type Imports
import type { Data } from '@/types/pages/profileTypes'

// Component Imports
import UserProfileHeader from './UserProfileHeader'
import CustomTabList from '@core/components/mui/TabList'

// Dynamic imports for tab content
const ProfileTab = dynamic(() => import('./profile'))
const TeamsTab = dynamic(() => import('./teams'))
const ProjectsTab = dynamic(() => import('./projects'))
const ConnectionsTab = dynamic(() => import('./connections'))

const UserProfile = ({ data }: { data?: Data }) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<string>('profile')
  const [isMounted, setIsMounted] = useState(false)
  
  // Create tab content after mount
  const tabContentList = useMemo(() => ({
    profile: <ProfileTab data={data?.users?.profile} />,
    teams: <TeamsTab data={data?.users?.teams} />,
    projects: <ProjectsTab data={data?.users?.projects} />,
    connections: <ConnectionsTab data={data?.users?.connections} />
  }), [data])
  
  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  // Show loading state until component is mounted
  if (!isMounted) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <UserProfileHeader data={data?.profileHeader} />
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UserProfileHeader data={data?.profileHeader} />
      </Grid>
      <Grid size={{ xs: 12 }} className='flex flex-col gap-6'>
        <TabContext value={activeTab}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='tabler-user-check text-lg' />
                    Profile
                  </div>
                }
                value='profile'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='tabler-users text-lg' />
                    Teams
                  </div>
                }
                value='teams'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='tabler-layout-grid text-lg' />
                    Projects
                  </div>
                }
                value='projects'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='tabler-link text-lg' />
                    Connections
                  </div>
                }
                value='connections'
              />
            </CustomTabList>

            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </TabContext>
      </Grid>
    </Grid>
  )
}

export default UserProfile
