// Next Imports
import { Montserrat } from 'next/font/google'

// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { Settings } from '@core/contexts/settingsContext'
import type { SystemMode, Skin } from '@core/types'

// Theme Options Imports
import overrides from './overrides'
import colorSchemes from './colorSchemes'
import spacing from './spacing'
import shadows from './shadows'
import customShadows from './customShadows'
import typography from './typography'

const montserrat = Montserrat({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  preload: true,
  variable: '--font-montserrat',
  adjustFontFallback: false
})

const theme = (settings: Settings, mode: SystemMode, direction: Theme['direction']): Theme => {
  return {
    direction,
    components: overrides(settings.skin as Skin),
    colorSchemes: colorSchemes(settings.skin as Skin),
    ...spacing,
    shape: {
      borderRadius: 0.357, // $border-radius: 0.357rem
      customBorderRadius: {
        xs: 0.25, // $border-radius-sm: 0.25rem
        sm: 0.25,
        md: 0.357, // $border-radius: 0.357rem
        lg: 0.6, // $border-radius-lg: 0.6rem
        xl: 0.6
      }
    },
    shadows: shadows(mode),
    typography: typography(montserrat.style.fontFamily),
    customShadows: customShadows(mode),
    mainColorChannels: {
      light: '47 43 61',
      dark: '225 222 245',
      lightShadow: '47 43 61',
      darkShadow: '19 17 32'
    }
  } as Theme
}

export default theme
