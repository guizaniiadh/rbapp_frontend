'use client'

// React Imports
import { useCallback, useRef, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { getDictionaryClient } from '@/utils/getDictionaryClient'

export type ShortcutsType = {
  url?: string
  icon: string
  title: string
  subtitle: string
  onClick?: () => void
}

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <div className='overflow-x-hidden bs-full'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const ShortcutsDropdown = ({ shortcuts, size = 'normal' }: { shortcuts: ShortcutsType[]; size?: 'normal' | 'small' | 'medium' }) => {
  // States
  const [open, setOpen] = useState(false)
  const [dictionary, setDictionary] = useState<any>(null)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLDivElement | null>(null)

  // Hooks
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const { settings } = useSettings()
  const { lang: locale } = useParams()

  // Load dictionary
  useEffect(() => {
    if (!locale) return
    
    const loadDictionary = async () => {
      try {
        const dict = await getDictionaryClient(locale as Locale)
        setDictionary(dict)
      } catch (err) {
        console.error('Dictionary load failed:', err)
      }
    }
    
    loadDictionary()
  }, [locale])

  const safeDictionary = dictionary || { navigation: {} }

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleToggle = useCallback(() => {
    setOpen(prevOpen => !prevOpen)
  }, [])

  useEffect(() => {
    const adjustPopoverHeight = () => {
      if (ref.current) {
        // Calculate available height, subtracting any fixed UI elements' height as necessary
        const availableHeight = window.innerHeight - 100

        ref.current.style.height = `${Math.min(availableHeight, 550)}px`
      }
    }

    window.addEventListener('resize', adjustPopoverHeight)
  }, [])

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
        <i className='tabler-layout-grid-add' />
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        ref={ref}
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
              className: `is-full  !mbs-3 z-[9999] max-bs-[517px] ${size === 'small' ? 'shortcuts-small' : ''}`,
              modifiers: [
                {
                  name: 'preventOverflow',
                  options: {
                    padding: themeConfig.layoutPadding
                  }
                }
              ]
            }
          : { className: `is-96  !mbs-3 z-[9999] max-bs-[517px] ${size === 'small' ? 'shortcuts-small' : ''}` })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper 
              className={classnames('bs-full', settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg')}
              sx={size === 'small' ? {
                transform: 'scale(0.6)',
                transformOrigin: 'top right',
                '& .MuiAvatar-root': {
                  width: '30px !important',
                  height: '30px !important',
                  '& i': {
                    fontSize: '1.1rem !important'
                  }
                },
                '& .MuiTypography-h6': {
                  fontSize: '0.875rem !important'
                },
                '& .MuiTypography-body1': {
                  fontSize: '0.75rem !important'
                },
                '& .MuiTypography-body2': {
                  fontSize: '0.65rem !important'
                },
                '& > div': {
                  padding: '8px !important'
                },
                '& [class*="p-6"]': {
                  padding: '12px !important'
                }
              } : size === 'medium' ? {
                transform: 'scale(0.8)',
                transformOrigin: 'top right',
                '& .MuiAvatar-root': {
                  width: '40px !important',
                  height: '40px !important',
                  '& i': {
                    fontSize: '1.3rem !important'
                  }
                },
                '& .MuiTypography-h6': {
                  fontSize: '0.9375rem !important'
                },
                '& .MuiTypography-body1': {
                  fontSize: '0.8125rem !important'
                },
                '& .MuiTypography-body2': {
                  fontSize: '0.7rem !important'
                },
                '& > div': {
                  padding: '10px !important'
                },
                '& [class*="p-6"]': {
                  padding: '16px !important'
                }
              } : {}}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <div className='bs-full flex flex-col'>
                  <div className='flex items-center justify-between plb-3.5 pli-4 is-full gap-2'>
                    <Typography variant='h6' className='flex-auto'>
                      {safeDictionary?.navigation?.shortcuts || 'Shortcuts'}
                    </Typography>
                    <Tooltip
                      title={safeDictionary?.navigation?.addShortcut || 'Add Shortcut'}
                      placement={placement === 'bottom-end' ? 'left' : 'right'}
                      slotProps={{
                        popper: {
                          sx: {
                            '& .MuiTooltip-tooltip': {
                              transformOrigin:
                                placement === 'bottom-end' ? 'right center !important' : 'right center !important'
                            }
                          }
                        }
                      }}
                    >
                      <IconButton size='small' className='text-textPrimary'>
                        <i className='tabler-plus' />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <Divider />
                  <ScrollWrapper hidden={hidden}>
                    <Grid container>
                      {shortcuts.map((shortcut, index) => {
                        const handleShortcutClick = () => {
                          if (shortcut.onClick) {
                            shortcut.onClick()
                            handleClose()
                          }
                        }

                        const content = (
                          <div className='flex items-center flex-col p-6 gap-3 bs-full hover:bg-actionHover cursor-pointer'>
                            <CustomAvatar size={50} className='bg-actionSelected text-textPrimary'>
                              <i className={classnames('text-[1.625rem]', shortcut.icon)} />
                            </CustomAvatar>
                            <div className='flex flex-col items-center text-center'>
                              <Typography className='font-medium' color='text.primary'>
                                {shortcut.title}
                              </Typography>
                              <Typography variant='body2'>{shortcut.subtitle}</Typography>
                            </div>
                          </div>
                        )

                        return (
                        <Grid
                          size={{ xs: 6 }}
                          key={index}
                            onClick={shortcut.onClick ? handleShortcutClick : handleClose}
                          className='[&:not(:last-of-type):not(:nth-last-of-type(2))]:border-be odd:border-ie'
                        >
                            {shortcut.url ? (
                          <Link
                            href={getLocalizedUrl(shortcut.url, locale as Locale)}
                            className='flex items-center flex-col p-6 gap-3 bs-full hover:bg-actionHover'
                          >
                            <CustomAvatar size={50} className='bg-actionSelected text-textPrimary'>
                              <i className={classnames('text-[1.625rem]', shortcut.icon)} />
                            </CustomAvatar>
                            <div className='flex flex-col items-center text-center'>
                              <Typography className='font-medium' color='text.primary'>
                                {shortcut.title}
                              </Typography>
                              <Typography variant='body2'>{shortcut.subtitle}</Typography>
                            </div>
                          </Link>
                            ) : (
                              content
                            )}
                        </Grid>
                        )
                      })}
                    </Grid>
                  </ScrollWrapper>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default ShortcutsDropdown
