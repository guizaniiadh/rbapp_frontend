'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'

// Next Imports
import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import { useTheme } from '@mui/material/styles'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Switch from '@mui/material/Switch'
import type { Breakpoint } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'
import { useDebounce, useMedia } from 'react-use'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { Settings } from '@core/contexts/settingsContext'
import type { Direction } from '@core/types'
import type { PrimaryColorConfig } from '@configs/primaryColorConfig'
import type { Locale } from '@configs/i18n'

// Utils Imports
import { getDictionaryClient } from '@/utils/getDictionaryClient'

// Context Imports
import { useTableColumnVisibility } from '@/contexts/tableColumnVisibilityContext'

// Icon Imports
import SkinDefault from '@core/svg/SkinDefault'
import SkinBordered from '@core/svg/SkinBordered'
import LayoutVertical from '@core/svg/LayoutVertical'
import LayoutCollapsed from '@core/svg/LayoutCollapsed'
import LayoutHorizontal from '@core/svg/LayoutHorizontal'
import ContentCompact from '@core/svg/ContentCompact'
import ContentWide from '@core/svg/ContentWide'
import DirectionLtr from '@core/svg/DirectionLtr'
import DirectionRtl from '@core/svg/DirectionRtl'

// Config Imports
import primaryColorConfig from '@configs/primaryColorConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Style Imports
import styles from './styles.module.css'

type CustomizerProps = {
  breakpoint?: Breakpoint | 'xxl' | `${number}px` | `${number}rem` | `${number}em`
  dir?: Direction
  disableDirection?: boolean
}

const getLocalePath = (pathName: string, locale: string) => {
  if (!pathName) return '/'
  const segments = pathName.split('/')

  segments[1] = locale

  return segments.join('/')
}

type DebouncedColorPickerProps = {
  settings: Settings
  isColorFromPrimaryConfig: PrimaryColorConfig | undefined
  handleChange: (field: keyof Settings | 'primaryColor', value: Settings[keyof Settings] | string) => void
  typeAColorPlaceholder?: string
}

const DebouncedColorPicker = (props: DebouncedColorPickerProps) => {
  // Props
  const { settings, isColorFromPrimaryConfig, handleChange } = props

  // States
  const [debouncedColor, setDebouncedColor] = useState(settings.primaryColor ?? primaryColorConfig[0].main)

  // Hooks
  useDebounce(() => handleChange('primaryColor', debouncedColor), 200, [debouncedColor])

  return (
    <>
      <HexColorPicker
        color={!isColorFromPrimaryConfig ? (settings.primaryColor ?? primaryColorConfig[0].main) : '#eee'}
        onChange={setDebouncedColor}
      />
      <HexColorInput
        className={styles.colorInput}
        color={!isColorFromPrimaryConfig ? (settings.primaryColor ?? primaryColorConfig[0].main) : '#eee'}
        onChange={setDebouncedColor}
        prefixed
        placeholder={props.typeAColorPlaceholder || 'Type a color'}
      />
    </>
  )
}

const Customizer = ({ breakpoint = 'lg', dir = 'ltr', disableDirection = false }: CustomizerProps) => {
  // States
  const [isOpen, setIsOpen] = useState(false)
  const [direction, setDirection] = useState(dir)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [dictionary, setDictionary] = useState<any>(null)

  // Refs
  const anchorRef = useRef<HTMLDivElement | null>(null)

  // Hooks
  const theme = useTheme()
  const pathName = usePathname()
  const params = useParams()
  const lang = params?.lang as Locale | undefined
  const { settings, updateSettings, resetSettings, isSettingsChanged } = useSettings()
  const isSystemDark = useMedia('(prefers-color-scheme: dark)', false)
  const { getAllTables, updateColumnVisibility } = useTableColumnVisibility()
  
  // Get current pathname for scoping
  const currentPathname = pathName || ''

  // Load dictionary
  useEffect(() => {
    if (!lang) return
    
    const loadDictionary = async () => {
      try {
        const dict = await getDictionaryClient(lang)
        setDictionary(dict)
      } catch (err) {
        console.error('Dictionary load failed:', err)
      }
    }
    
    loadDictionary()
  }, [lang])

  const safeDictionary = dictionary || { navigation: {} }
  // Filter tables by current pathname to avoid cross-page interference
  const registeredTables = getAllTables(pathName || '')

  // Vars
  let breakpointValue: CustomizerProps['breakpoint']

  switch (breakpoint) {
    case 'xxl':
      breakpointValue = '1920px'
      break
    case 'xl':
      breakpointValue = `${theme.breakpoints.values.xl}px`
      break
    case 'lg':
      breakpointValue = `${theme.breakpoints.values.lg}px`
      break
    case 'md':
      breakpointValue = `${theme.breakpoints.values.md}px`
      break
    case 'sm':
      breakpointValue = `${theme.breakpoints.values.sm}px`
      break
    case 'xs':
      breakpointValue = `${theme.breakpoints.values.xs}px`
      break
    default:
      breakpointValue = breakpoint
  }

  const breakpointReached = useMedia(`(max-width: ${breakpointValue})`, false)
  const isMobileScreen = useMedia('(max-width: 600px)', false)
  const isBelowLgScreen = useMedia('(max-width: 1200px)', false)
  const isColorFromPrimaryConfig = primaryColorConfig.find(item => item.main === settings.primaryColor)

  const ScrollWrapper = isBelowLgScreen ? 'div' : PerfectScrollbar

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  // Update Settings
  const handleChange = (field: keyof Settings | 'direction', value: Settings[keyof Settings] | Direction) => {
    // Update direction state
    if (field === 'direction') {
      setDirection(value as Direction)
    } else {
      // Update settings in cookie
      updateSettings({ [field]: value })
    }
  }

  const handleMenuClose = (event: MouseEvent | TouchEvent): void => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return
    }

    setIsMenuOpen(false)
  }

  return (
    !breakpointReached && (
      <div
        className={classnames('customizer', styles.customizer, {
          [styles.show]: isOpen,
          [styles.smallScreen]: isMobileScreen
        })}
      >
        <div className={styles.toggler} onClick={handleToggle}>
          <i className='tabler-settings text-[22px]' />
        </div>
        <div className={styles.header}>
          <div className='flex flex-col'>
            <h4 className={styles.customizerTitle}>{safeDictionary?.navigation?.themeCustomizer || 'Theme Customizer'}</h4>
            <p className={styles.customizerSubtitle}>{safeDictionary?.navigation?.customizeAndPreviewInRealTime || 'Customize & Preview in Real Time'}</p>
          </div>
          <div className='flex gap-4'>
            <div onClick={resetSettings} className='relative flex cursor-pointer'>
              <i className='tabler-refresh text-textPrimary' />
              <div className={classnames(styles.dotStyles, { [styles.show]: isSettingsChanged })} />
            </div>
            <i className='tabler-x text-textPrimary cursor-pointer' onClick={handleToggle} />
          </div>
        </div>
        <ScrollWrapper
          {...(isBelowLgScreen
            ? { className: 'bs-full overflow-y-auto overflow-x-hidden' }
            : { options: { wheelPropagation: false, suppressScrollX: true } })}
        >
          <div className={styles.customizerBody}>
            <div className='flex flex-col gap-6'>
              <Chip label={safeDictionary?.navigation?.theming || 'Theming'} size='small' color='primary' variant='tonal' className='self-start rounded-sm' />
              <div className='flex flex-col gap-2'>
                <p className='font-medium'>{safeDictionary?.navigation?.primaryColor || 'Primary Color'}</p>
                <div className='flex items-center justify-between'>
                  {primaryColorConfig.map(item => (
                    <div
                      key={item.main}
                      className={classnames(styles.primaryColorWrapper, {
                        [styles.active]: settings.primaryColor === item.main
                      })}
                      onClick={() => handleChange('primaryColor', item.main)}
                    >
                      <div className={styles.primaryColor} style={{ backgroundColor: item.main }} />
                    </div>
                  ))}
                  <div
                    ref={anchorRef}
                    className={classnames(styles.primaryColorWrapper, {
                      [styles.active]: !isColorFromPrimaryConfig
                    })}
                    onClick={() => setIsMenuOpen(prev => !prev)}
                  >
                    <div
                      className={classnames(styles.primaryColor, 'flex items-center justify-center')}
                      style={{
                        backgroundColor: !isColorFromPrimaryConfig
                          ? settings.primaryColor
                          : 'var(--mui-palette-action-selected)',
                        color: isColorFromPrimaryConfig
                          ? 'var(--mui-palette-text-primary)'
                          : 'var(--mui-palette-primary-contrastText)'
                      }}
                    >
                      <i className='tabler-color-picker text-xl' />
                    </div>
                  </div>
                  <Popper
                    transition
                    open={isMenuOpen}
                    disablePortal
                    anchorEl={anchorRef.current}
                    placement='bottom-end'
                    className='z-[1]'
                  >
                    {({ TransitionProps }) => (
                      <Fade {...TransitionProps} style={{ transformOrigin: 'right top' }}>
                        <Paper elevation={6} className={styles.colorPopup}>
                          <ClickAwayListener onClickAway={handleMenuClose}>
                            <div>
                              <DebouncedColorPicker
                                settings={settings}
                                isColorFromPrimaryConfig={isColorFromPrimaryConfig}
                                handleChange={handleChange}
                                typeAColorPlaceholder={safeDictionary?.navigation?.typeAColor}
                              />
                            </div>
                          </ClickAwayListener>
                        </Paper>
                      </Fade>
                    )}
                  </Popper>
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                <p className='font-medium'>{safeDictionary?.navigation?.mode || 'Mode'}</p>
                <div className='flex items-center justify-between'>
                  <div className='flex flex-col items-start gap-0.5'>
                    <div
                      className={classnames(styles.itemWrapper, styles.modeWrapper, {
                        [styles.active]: settings.mode === 'light'
                      })}
                      onClick={() => handleChange('mode', 'light')}
                    >
                      <i className='tabler-sun text-[30px]' />
                    </div>
                    <p className={styles.itemLabel} onClick={() => handleChange('mode', 'light')}>
                      {safeDictionary?.navigation?.light || 'Light'}
                    </p>
                  </div>
                  <div className='flex flex-col items-start gap-0.5'>
                    <div
                      className={classnames(styles.itemWrapper, styles.modeWrapper, {
                        [styles.active]: settings.mode === 'dark'
                      })}
                      onClick={() => handleChange('mode', 'dark')}
                    >
                      <i className='tabler-moon-stars text-[30px]' />
                    </div>
                    <p className={styles.itemLabel} onClick={() => handleChange('mode', 'dark')}>
                      {safeDictionary?.navigation?.dark || 'Dark'}
                    </p>
                  </div>
                  <div className='flex flex-col items-start gap-0.5'>
                    <div
                      className={classnames(styles.itemWrapper, styles.modeWrapper, {
                        [styles.active]: settings.mode === 'system'
                      })}
                      onClick={() => handleChange('mode', 'system')}
                    >
                      <i className='tabler-device-laptop text-[30px]' />
                    </div>
                    <p className={styles.itemLabel} onClick={() => handleChange('mode', 'system')}>
                      {safeDictionary?.navigation?.system || 'System'}
                    </p>
                  </div>
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                <p className='font-medium'>{safeDictionary?.navigation?.skin || 'Skin'}</p>
                <div className='flex items-center gap-4'>
                  <div className='flex flex-col items-start gap-0.5'>
                    <div
                      className={classnames(styles.itemWrapper, { [styles.active]: settings.skin === 'default' })}
                      onClick={() => handleChange('skin', 'default')}
                    >
                      <SkinDefault />
                    </div>
                    <p className={styles.itemLabel} onClick={() => handleChange('skin', 'default')}>
                      {safeDictionary?.navigation?.default || 'Default'}
                    </p>
                  </div>
                  <div className='flex flex-col items-start gap-0.5'>
                    <div
                      className={classnames(styles.itemWrapper, { [styles.active]: settings.skin === 'bordered' })}
                      onClick={() => handleChange('skin', 'bordered')}
                    >
                      <SkinBordered />
                    </div>
                    <p className={styles.itemLabel} onClick={() => handleChange('skin', 'bordered')}>
                      {safeDictionary?.navigation?.bordered || 'Bordered'}
                    </p>
                  </div>
                </div>
              </div>
              {settings.mode === 'dark' ||
              (settings.mode === 'system' && isSystemDark) ||
              settings.layout === 'horizontal' ? null : (
                <div className='flex items-center justify-between'>
                  <label className='font-medium cursor-pointer' htmlFor='customizer-semi-dark'>
                    {safeDictionary?.navigation?.semiDark || 'Semi Dark'}
                  </label>
                  <Switch
                    id='customizer-semi-dark'
                    checked={settings.semiDark === true}
                    onChange={() => handleChange('semiDark', !settings.semiDark)}
                  />
                </div>
              )}
            </div>
            <hr className={styles.hr} />
            <div className='flex flex-col gap-6'>
              <Chip label={safeDictionary?.navigation?.layout || 'Layout'} variant='tonal' size='small' color='primary' className='self-start rounded-sm' />
              <div className='flex flex-col gap-2'>
                <p className='font-medium'>{safeDictionary?.navigation?.layouts || 'Layouts'}</p>
                <div className='flex items-center justify-between'>
                  <div className='flex flex-col items-start gap-0.5'>
                    <div
                      className={classnames(styles.itemWrapper, { [styles.active]: settings.layout === 'vertical' })}
                      onClick={() => handleChange('layout', 'vertical')}
                    >
                      <LayoutVertical />
                    </div>
                    <p className={styles.itemLabel} onClick={() => handleChange('layout', 'vertical')}>
                      {safeDictionary?.navigation?.vertical || 'Vertical'}
                    </p>
                  </div>
                  <div className='flex flex-col items-start gap-0.5'>
                    <div
                      className={classnames(styles.itemWrapper, { [styles.active]: settings.layout === 'collapsed' })}
                      onClick={() => handleChange('layout', 'collapsed')}
                    >
                      <LayoutCollapsed />
                    </div>
                    <p className={styles.itemLabel} onClick={() => handleChange('layout', 'collapsed')}>
                      {safeDictionary?.navigation?.collapsed || 'Collapsed'}
                    </p>
                  </div>
                  <div className='flex flex-col items-start gap-0.5'>
                    <div
                      className={classnames(styles.itemWrapper, { [styles.active]: settings.layout === 'horizontal' })}
                      onClick={() => handleChange('layout', 'horizontal')}
                    >
                      <LayoutHorizontal />
                    </div>
                    <p className={styles.itemLabel} onClick={() => handleChange('layout', 'horizontal')}>
                      {safeDictionary?.navigation?.horizontal || 'Horizontal'}
                    </p>
                  </div>
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                <p className='font-medium'>{safeDictionary?.navigation?.content || 'Content'}</p>
                <div className='flex items-center gap-4'>
                  <div className='flex flex-col items-start gap-0.5'>
                    <div
                      className={classnames(styles.itemWrapper, {
                        [styles.active]: settings.contentWidth === 'compact'
                      })}
                      onClick={() =>
                        updateSettings({
                          navbarContentWidth: 'compact',
                          contentWidth: 'compact',
                          footerContentWidth: 'compact'
                        })
                      }
                    >
                      <ContentCompact />
                    </div>
                    <p
                      className={styles.itemLabel}
                      onClick={() =>
                        updateSettings({
                          navbarContentWidth: 'compact',
                          contentWidth: 'compact',
                          footerContentWidth: 'compact'
                        })
                      }
                    >
                      {safeDictionary?.navigation?.compact || 'Compact'}
                    </p>
                  </div>
                  <div className='flex flex-col items-start gap-0.5'>
                    <div
                      className={classnames(styles.itemWrapper, { [styles.active]: settings.contentWidth === 'wide' })}
                      onClick={() =>
                        updateSettings({ navbarContentWidth: 'wide', contentWidth: 'wide', footerContentWidth: 'wide' })
                      }
                    >
                      <ContentWide />
                    </div>
                    <p
                      className={styles.itemLabel}
                      onClick={() =>
                        updateSettings({ navbarContentWidth: 'wide', contentWidth: 'wide', footerContentWidth: 'wide' })
                      }
                    >
                      {safeDictionary?.navigation?.wide || 'Wide'}
                    </p>
                  </div>
                </div>
              </div>
              {!disableDirection && (
                <div className='flex flex-col gap-2'>
                  <p className='font-medium'>{safeDictionary?.navigation?.direction || 'Direction'}</p>
                  <div className='flex items-center gap-4'>
                    <Link href={getLocalePath(pathName, 'en')}>
                      <div className='flex flex-col items-start gap-0.5'>
                        <div
                          className={classnames(styles.itemWrapper, {
                            [styles.active]: direction === 'ltr'
                          })}
                        >
                          <DirectionLtr />
                        </div>
                        <p className={styles.itemLabel}>
                          {safeDictionary?.navigation?.leftToRight || 'Left to Right'} <br />
                          ({safeDictionary?.navigation?.english || 'English'})
                        </p>
                      </div>
                    </Link>
                    <Link href={getLocalePath(pathName, 'ar')}>
                      <div className='flex flex-col items-start gap-0.5'>
                        <div
                          className={classnames(styles.itemWrapper, {
                            [styles.active]: direction === 'rtl'
                          })}
                        >
                          <DirectionRtl />
                        </div>
                        <p className={styles.itemLabel}>
                          {safeDictionary?.navigation?.rightToLeft || 'Right to Left'} <br />
                          ({safeDictionary?.navigation?.arabic || 'Arabic'})
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {registeredTables.length > 0 && (
              <>
                <hr className={styles.hr} />
                <div className='flex flex-col gap-6'>
                  <Chip 
                    label={safeDictionary?.navigation?.pageContent || 'Page Content'} 
                    variant='tonal' 
                    size='small' 
                    color='primary' 
                    className='self-start rounded-sm' 
                  />
                  {registeredTables.map(table => (
                    <div key={table.tableId} className='flex flex-col gap-2'>
                      <Chip
                        label={table.tableName}
                        variant='tonal'
                        size='small'
                        color='secondary'
                        className='self-start rounded-sm font-medium'
                      />
                      <div className='flex flex-col gap-1.5'>
                        {table.columns.map(column => (
                          <div key={column.id} className='flex items-center justify-between'>
                            <label 
                              className='text-sm cursor-pointer flex-1' 
                              htmlFor={`column-${table.tableId}-${column.id}`}
                            >
                              {column.label}
                            </label>
                            <Switch
                              id={`column-${table.tableId}-${column.id}`}
                              checked={column.visible}
                              onChange={(e) => updateColumnVisibility(table.tableId, column.id, e.target.checked, currentPathname)}
                              size='small'
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollWrapper>
      </div>
    )
  )
}

export default Customizer
