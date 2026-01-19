import plugin from 'tailwindcss/plugin'

export default plugin(function () {}, {
  theme: {
    colors: {
      // Vuexy color system
      primary: {
        50: '#f3f2ff',
        100: '#e8e6ff',
        500: '#7367f0', // $purple: #7367f0
        600: '#675dd8',
        700: '#5b52c7'
      },
      secondary: '#82868b', // $secondary: #82868b
      success: '#28c76f', // $green: #28c76f
      info: '#00cfe8', // $blue: #00cfe8
      warning: '#ff9f43', // $orange: #ff9f43
      error: '#ea5455', // $red: #ea5455
      gray: {
        50: '#f6f6f6', // $gray-50: #f6f6f6
        100: '#babfc7', // $gray-100: #babfc7
        200: '#ededed', // $gray-200: #ededed
        300: '#dae1e7', // $gray-300: #dae1e7
        400: '#636363', // $gray-400: #636363
        500: '#adb5bd', // $gray-500: #adb5bd
        600: '#b8c2cc', // $gray-600: #b8c2cc
        700: '#4e5154', // $gray-700: #4e5154
        800: '#1e1e1e', // $gray-800: #1e1e1e
        900: '#2a2e30' // $gray-900: #2a2e30
      }
    },
    borderColor: ({ theme }) => ({
      ...theme('colors'),
      DEFAULT: 'var(--border-color, currentColor)'
    }),
    borderRadius: {
      none: '0px',
      xs: 'var(--mui-shape-customBorderRadius-xs)',
      sm: 'var(--mui-shape-customBorderRadius-sm)',
      DEFAULT: '0.375rem',
      md: 'var(--mui-shape-customBorderRadius-md)',
      lg: 'var(--mui-shape-customBorderRadius-lg)',
      xl: 'var(--mui-shape-customBorderRadius-xl)',
      '2xl': '0.75rem',
      '3xl': '1rem',
      '4xl': '1.5rem',
      full: '9999px'
    },
    screens: {
      sm: '600px',
      md: '900px',
      lg: '1200px',
      xl: '1536px',
      '2xl': '1920px'
    },
    extend: {
      boxShadow: {
        xs: 'var(--mui-customShadows-xs)',
        sm: 'var(--mui-customShadows-sm)',
        DEFAULT: 'var(--mui-customShadows-md)',
        md: 'var(--mui-customShadows-md)',
        lg: 'var(--mui-customShadows-lg)',
        xl: 'var(--mui-customShadows-xl)',
        primarySm: 'var(--mui-customShadows-primary-sm)',
        primaryMd: 'var(--mui-customShadows-primary-md)',
        primaryLg: 'var(--mui-customShadows-primary-lg)',
        secondarySm: 'var(--mui-customShadows-secondary-sm)',
        secondaryMd: 'var(--mui-customShadows-secondary-md)',
        secondaryLg: 'var(--mui-customShadows-secondary-lg)',
        errorSm: 'var(--mui-customShadows-error-sm)',
        errorMd: 'var(--mui-customShadows-error-md)',
        errorLg: 'var(--mui-customShadows-error-lg)',
        warningSm: 'var(--mui-customShadows-warning-sm)',
        warningMd: 'var(--mui-customShadows-warning-md)',
        warningLg: 'var(--mui-customShadows-warning-lg)',
        infoSm: 'var(--mui-customShadows-info-sm)',
        infoMd: 'var(--mui-customShadows-info-md)',
        infoLg: 'var(--mui-customShadows-info-lg)',
        successSm: 'var(--mui-customShadows-success-sm)',
        successMd: 'var(--mui-customShadows-success-md)',
        successLg: 'var(--mui-customShadows-success-lg)'
      },
      colors: {
        primary: 'var(--primary-color)',
        primaryLight: 'var(--mui-palette-primary-lightOpacity)',
        primaryLighter: 'var(--mui-palette-primary-lighterOpacity)',
        secondary: 'var(--mui-palette-secondary-main)',
        error: 'var(--mui-palette-error-main)',
        errorLight: 'var(--mui-palette-error-lightOpacity)',
        errorLighter: 'var(--mui-palette-error-lighterOpacity)',
        warning: 'var(--mui-palette-warning-main)',
        info: 'var(--mui-palette-info-main)',
        success: 'var(--mui-palette-success-main)',
        textPrimary: 'var(--mui-palette-text-primary)',
        textSecondary: 'var(--mui-palette-text-secondary)',
        textDisabled: 'var(--mui-palette-text-disabled)',
        actionActive: 'var(--mui-palette-action-active)',
        actionHover: 'var(--mui-palette-action-hover)',
        actionSelected: 'var(--mui-palette-action-selected)',
        actionFocus: 'var(--mui-palette-action-focus)',
        backgroundPaper: 'var(--mui-palette-background-paper)',
        backgroundDefault: 'var(--mui-palette-background-default)',
        backgroundChat: 'var(--mui-palette-customColors-chatBg)',
        backdrop: 'var(--backdrop-color)',
        facebook: '#4267B2',
        twitter: '#1DA1F2',
        linkedin: '#007BB6'
      },
      zIndex: {
        header: 'var(--header-z-index)',
        footer: 'var(--footer-z-index)',
        customizer: 'var(--customizer-z-index)',
        search: 'var(--search-z-index)',
        drawer: 'var(--drawer-z-index)'
      }
    }
  }
})
