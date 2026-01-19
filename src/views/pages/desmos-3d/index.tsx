'use client'

// React Imports
import { useEffect, useRef } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Type Imports
declare global {
  interface Window {
    Desmos?: {
      Calculator3D: (element: HTMLElement, options?: any) => any
    }
  }
}

const Desmos3D = () => {
  const calculatorRef = useRef<HTMLDivElement>(null)
  const calculatorInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src*="desmos.com/api"]')
    if (existingScript) {
      // Script already exists, just initialize
      if (calculatorRef.current && window.Desmos) {
        calculatorInstanceRef.current = window.Desmos.Calculator3D(calculatorRef.current, {
          expressions: false,
          settingsMenu: true,
          zoomButtons: true,
          expressionsTopbar: true
        })
      }
      return
    }

    // Load Desmos 3D Calculator script
    // Note: API key is optional for basic usage. For production, get your own key from https://www.desmos.com/my-api
    const script = document.createElement('script')
    script.src = 'https://www.desmos.com/api/v1.11/calculator.js'
    script.async = true
    script.onload = () => {
      // Initialize calculator after script loads
      if (calculatorRef.current && window.Desmos) {
        calculatorInstanceRef.current = window.Desmos.Calculator3D(calculatorRef.current, {
          expressions: false,
          settingsMenu: true,
          zoomButtons: true,
          expressionsTopbar: true
        })
      }
    }
    script.onerror = () => {
      console.error('Failed to load Desmos 3D Calculator script')
    }
    document.body.appendChild(script)

    // Cleanup
    return () => {
      if (calculatorInstanceRef.current) {
        try {
          calculatorInstanceRef.current.destroy()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col gap-4'>
            <div>
              <Typography variant='h4' className='mbe-2'>
                Desmos 3D Graphing Calculator
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Interactive 3D mathematical calculator. Rotate, zoom, and explore 3D graphs.
              </Typography>
            </div>
            <div
              ref={calculatorRef}
              style={{
                width: '100%',
                height: '600px',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Desmos3D

