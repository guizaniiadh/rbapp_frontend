// MUI Imports
import type { Theme } from '@mui/material/styles'

const typography = (fontFamily: string): Theme['typography'] =>
  ({
    fontFamily:
      typeof fontFamily === 'undefined' || fontFamily === ''
        ? [
            '"Montserrat"',
            'Helvetica',
            'Arial',
            'serif',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"'
          ].join(',')
        : fontFamily,
    fontSize: 16, // 1rem base font size from Vuexy
    h1: {
      fontSize: '2rem', // $h1-font-size: $font-size-base * 2
      fontWeight: 500,
      lineHeight: 1.45
    },
    h2: {
      fontSize: '1.714rem', // $h2-font-size: $font-size-base * 1.714
      fontWeight: 500,
      lineHeight: 1.45
    },
    h3: {
      fontSize: '1.5rem', // $h3-font-size: $font-size-base * 1.5
      fontWeight: 500,
      lineHeight: 1.45
    },
    h4: {
      fontSize: '1.286rem', // $h4-font-size: $font-size-base * 1.286
      fontWeight: 500,
      lineHeight: 1.45
    },
    h5: {
      fontSize: '1.07rem', // $h5-font-size: $font-size-base * 1.07
      fontWeight: 500,
      lineHeight: 1.45
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.45
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.45
    },
    subtitle2: {
      fontSize: '0.857rem', // $small-font-size: 0.857rem
      fontWeight: 400,
      lineHeight: 1.45
    },
    body1: {
      fontSize: '1rem', // $font-size-base: 1rem
      lineHeight: 1.45 // $line-height-base: 1.45
    },
    body2: {
      fontSize: '0.857rem', // $font-size-sm: ceil($font-size-base * 0.85)
      lineHeight: 1.45
    },
    button: {
      fontSize: '1rem',
      lineHeight: 1.45,
      textTransform: 'none'
    },
    caption: {
      fontSize: '0.857rem',
      lineHeight: 1.45,
      letterSpacing: '0.4px'
    },
    overline: {
      fontSize: '0.75rem',
      lineHeight: 1.45,
      letterSpacing: '0.8px'
    }
  }) as Theme['typography']

export default typography
