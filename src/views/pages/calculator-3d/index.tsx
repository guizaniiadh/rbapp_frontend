'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import Calculator3D from '@/components/Calculator3D'

const Calculator3DPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col gap-4'>
            <div>
              <Typography variant='h4' className='mbe-2'>
                3D Styled Calculator
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                A modern, interactive calculator with 3D CSS transforms, depth effects, and smooth animations.
                Experience buttons with realistic depth and shadow effects that respond to your interactions.
              </Typography>
            </div>
            <div className='flex justify-center items-center py-8'>
              <Calculator3D />
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Calculator3DPage































