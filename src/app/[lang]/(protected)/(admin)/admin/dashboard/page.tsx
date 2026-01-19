import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'

export default function AdminDashboard() {
  return (
    <div className='p-6'>
      <Grid container spacing={6}>
        <Grid size={12}>
          <Typography variant='h4' gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography color='text.secondary' paragraph>
            Welcome to the admin dashboard. This is a centralized location for administrative functions.
          </Typography>
        </Grid>

        <Grid size={12} md={6}>
          <div className='p-4 border rounded-lg'>
            <Typography variant='h6' gutterBottom>
              System Overview
            </Typography>
            <Typography color='text.secondary'>
              Monitor system health, user activity, and performance metrics.
            </Typography>
          </div>
        </Grid>

        <Grid size={12} md={6}>
          <div className='p-4 border rounded-lg'>
            <Typography variant='h6' gutterBottom>
              User Management
            </Typography>
            <Typography color='text.secondary'>Manage users, roles, and permissions across the system.</Typography>
          </div>
        </Grid>

        <Grid size={12} md={6}>
          <div className='p-4 border rounded-lg'>
            <Typography variant='h6' gutterBottom>
              Analytics
            </Typography>
            <Typography color='text.secondary'>View detailed analytics and reports for system usage.</Typography>
          </div>
        </Grid>

        <Grid size={12} md={6}>
          <div className='p-4 border rounded-lg'>
            <Typography variant='h6' gutterBottom>
              Settings
            </Typography>
            <Typography color='text.secondary'>Configure system settings and preferences.</Typography>
          </div>
        </Grid>
      </Grid>
    </div>
  )
}
