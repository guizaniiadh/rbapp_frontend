'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

// Type Imports
import type { SystemMode } from '@core/types'
import type { Locale } from '@configs/i18n'
import type { RootState } from '@/redux-store'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Redux Imports
import { loginStart, loginSuccess, loginFailure } from '@/redux-store/slices/auth'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { getDictionaryClient } from '@/utils/getDictionaryClient'

// Backend URL from environment variable
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

// Debug: Log BASE_URL to see what value is being used
console.log('BASE_URL from env:', BASE_URL)
console.log('NEXT_PUBLIC_BACKEND_URL env var:', process.env.NEXT_PUBLIC_BACKEND_URL)
  
// Styled Custom Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const LoginV2 = ({ mode }: { mode: SystemMode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [dictionary, setDictionary] = useState<any>(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(true)

  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // Redux state
  const { loading, error } = useSelector((state: RootState) => state.auth)

  // Load dictionary
  useEffect(() => {
    if (!locale) {
      setDictionaryLoading(false)
      return
    }
    
    const loadDictionary = async () => {
      try {
        const dict = await getDictionaryClient(locale as Locale)
        setDictionary(dict)
        setDictionaryLoading(false)
      } catch (err) {
        console.error('Dictionary load failed:', err)
        setDictionaryLoading(false)
      }
    }
    
    loadDictionary()
  }, [locale])

  // Fallback dictionary
  const safeDictionary = dictionary || { navigation: {} }

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      dispatch(loginFailure(safeDictionary?.navigation?.pleaseFillAllFields || 'Please fill in all fields'))

      return
    }

    dispatch(loginStart())

    try {
      // Step 1: Get JWT tokens from Django REST Framework
      const tokenUrl = `${BASE_URL}/api/token/`
      console.log('Login - Calling token URL:', tokenUrl)
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: email, // Django uses 'username' field
          password: password
        })
      })

      const tokenData = await tokenResponse.json()

      if (!tokenResponse.ok) {
        // Map known backend auth errors to localized messages
        let errorMessage = tokenData.detail as string | undefined

        if (errorMessage === 'No active account found with the given credentials') {
          errorMessage =
            safeDictionary?.navigation?.noActiveAccount ||
            'No active account found with the given credentials'
        }

        dispatch(
          loginFailure(errorMessage || safeDictionary?.navigation?.invalidCredentials || 'Invalid credentials')
        )

        return
      }

      // Step 2: Get user data using the access token
      const userResponse = await fetch(`${BASE_URL}/api/current-user/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokenData.access}`,
          'Content-Type': 'application/json'
        }
      })

      const userData = await userResponse.json()

      if (!userResponse.ok) {
        dispatch(loginFailure(safeDictionary?.navigation?.failedToFetchUserData || 'Failed to fetch user data'))

        return
      }

      // Transform user data to match AuthUser type
      const transformedUserData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        is_superuser: userData.is_superuser || false,
        is_staff: userData.is_staff || false,
        image: userData.image || '/images/avatars/1.png'
      }

      dispatch(
        loginSuccess({
          accessToken: tokenData.access,
          refreshToken: tokenData.refresh,
          user: transformedUserData
        })
      )

      // Redirect based on user role
      // Check for redirectTo parameter, but ensure admin users always go to /dashboard
      const redirectTo = searchParams.get('redirectTo')
      let redirectUrl: string
      
      if (transformedUserData.is_superuser || transformedUserData.is_staff) {
        // Admin users always go to /dashboard, ignore redirectTo if it points to /admin/dashboard
        if (redirectTo && !redirectTo.includes('/admin/dashboard')) {
          redirectUrl = redirectTo.startsWith('/') ? redirectTo : `/${locale}${redirectTo}`
        } else {
          redirectUrl = getLocalizedUrl('/dashboard', locale as Locale)
        }
      } else {
        // Regular users can use redirectTo or go to /home
        redirectUrl = redirectTo 
          ? (redirectTo.startsWith('/') ? redirectTo : `/${locale}${redirectTo}`)
          : getLocalizedUrl('/home', locale as Locale)
      }

      router.push(redirectUrl)
    } catch (error) {
      console.error('Login error:', error)
      dispatch(loginFailure(safeDictionary?.navigation?.networkError || 'Network error. Please try again.'))
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <LoginIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && (
          <MaskImg
            alt='mask'
            src={authBackground}
            className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
          />
        )}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/', locale as Locale)}
          className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>{`${safeDictionary?.navigation?.welcomeTo || 'Welcome to'} ${themeConfig.templateName}! 👋🏻`}</Typography>
            <Typography>{safeDictionary?.navigation?.pleaseSignIn || 'Please sign-in to your account and start the adventure'}</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-6'>
            {error && (
              <Alert severity='error' onClose={() => dispatch(loginFailure(''))}>
                {error}
              </Alert>
            )}

            <CustomTextField
              id='login-email'
              autoFocus
              fullWidth
              label={safeDictionary?.navigation?.emailOrUsername || 'Email or Username'}
              placeholder={safeDictionary?.navigation?.enterEmailOrUsername || 'Enter your email or username'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
            <CustomTextField
              fullWidth
              label={safeDictionary?.navigation?.password || 'Password'}
              placeholder='············'
              id='outlined-adornment-password'
              type={isPasswordShown ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                        <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
              <FormControlLabel
                control={
                  <Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} disabled={loading} />
                }
                label={safeDictionary?.navigation?.rememberMe || 'Remember me'}
              />
              <Typography
                className='text-end'
                color='primary.main'
                component={Link}
                href={getLocalizedUrl('/pages/auth/forgot-password-v2', locale as Locale)}
              >
                {safeDictionary?.navigation?.forgotPasswordQuestion || 'Forgot password?'}
              </Typography>
            </div>
            <Button
              fullWidth
              variant='contained'
              type='submit'
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? (safeDictionary?.navigation?.loggingIn || 'Logging in...') : (safeDictionary?.navigation?.login || 'Login')}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>{safeDictionary?.navigation?.newOnPlatform || 'New on our platform?'}</Typography>
              <Typography
                component={Link}
                href={getLocalizedUrl('/pages/auth/register-v2', locale as Locale)}
                color='primary.main'
              >
                {safeDictionary?.navigation?.createAccount || 'Create an account'}
              </Typography>
            </div>
            <Divider className='gap-2 text-textPrimary'>{safeDictionary?.navigation?.or || 'or'}</Divider>
            <div className='flex justify-center items-center gap-1.5'>
              <IconButton className='text-facebook' size='small'>
                <i className='tabler-brand-facebook-filled' />
              </IconButton>
              <IconButton className='text-twitter' size='small'>
                <i className='tabler-brand-twitter-filled' />
              </IconButton>
              <IconButton className='text-textPrimary' size='small'>
                <i className='tabler-brand-github-filled' />
              </IconButton>
              <IconButton className='text-error' size='small'>
                <i className='tabler-brand-google-filled' />
              </IconButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginV2
