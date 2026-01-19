// MUI Imports
import type { Theme } from '@mui/material/styles'

const table: Theme['components'] = {
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 600, // Semi-bold - thickest available Montserrat weight
        fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
        fontSize: '0.8125rem',
        letterSpacing: '0.2px',
        lineHeight: 1.8462,
        textTransform: 'capitalize' // First character uppercase, rest lowercase
      }
    }
  }
}

export default table
