'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

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

// Type Imports
import type { SystemMode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { getDictionaryClient } from '@/utils/getDictionaryClient'

// Backend URL from environment variable
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

// Styled Custom Components
const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 600,
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
  maxBlockSize: 345,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const RegisterV2 = ({ mode }: { mode: SystemMode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [dictionary, setDictionary] = useState<any>(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(true)

  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

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
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'

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

    if (!username || !email || !password) {
      setError(safeDictionary?.navigation?.pleaseFillAllFields || 'Please fill in all fields')
      return
    }

    if (!agreeToTerms) {
      setError(safeDictionary?.navigation?.pleaseAgreeToTerms || 'Please agree to the terms and conditions')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${BASE_URL}/api/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          email,
          password
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirect to login page after successful registration
        setTimeout(() => {
          router.push(getLocalizedUrl('/login', locale as Locale))
        }, 2000)
      } else {
        // Handle validation errors
        if (data.username) {
          setError(`Username: ${data.username[0]}`)
        } else if (data.email) {
          setError(`Email: ${data.email[0]}`)
        } else if (data.password) {
          setError(`Password: ${data.password[0]}`)
        } else {
          setError(safeDictionary?.navigation?.registrationFailed || 'Registration failed. Please try again.')
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError(safeDictionary?.navigation?.networkError || 'Network error. Please try again.')
    } finally {
      setLoading(false)
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
        <RegisterIllustration src={characterIllustration} alt='character-illustration' />
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
            <Typography variant='h4'>{safeDictionary?.navigation?.adventureStartsHere || 'Adventure starts here'} 🚀</Typography>
            <Typography>{safeDictionary?.navigation?.makeAppManagementEasy || 'Make your app management easy and fun!'}</Typography>
          </div>

          {success && <Alert severity='success'>{safeDictionary?.navigation?.registrationSuccessful || 'Registration successful! Redirecting to login...'}</Alert>}

          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-6'>
            {error && (
              <Alert severity='error' onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <CustomTextField
              autoFocus
              fullWidth
              label={safeDictionary?.navigation?.username || 'Username'}
              placeholder={safeDictionary?.navigation?.enterUsername || 'Enter your username'}
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
            />
            <CustomTextField
              fullWidth
              label={safeDictionary?.navigation?.email || 'Email'}
              placeholder={safeDictionary?.navigation?.enterEmail || 'Enter your email'}
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
            <CustomTextField
              fullWidth
              label={safeDictionary?.navigation?.password || 'Password'}
              placeholder='············'
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
            <FormControlLabel
              control={
                <Checkbox checked={agreeToTerms} onChange={e => setAgreeToTerms(e.target.checked)} disabled={loading} />
              }
              label={
                <>
                  <span>{safeDictionary?.navigation?.iAgreeTo || 'I agree to'} </span>
                  <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                    {safeDictionary?.navigation?.privacyPolicyTerms || 'privacy policy & terms'}
                  </Link>
                </>
              }
            />
            <Button
              fullWidth
              variant='contained'
              type='submit'
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? (safeDictionary?.navigation?.creatingAccount || 'Creating Account...') : (safeDictionary?.navigation?.signUp || 'Sign Up')}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>{safeDictionary?.navigation?.alreadyHaveAccount || 'Already have an account?'}</Typography>
              <Typography
                component={Link}
                href={getLocalizedUrl('/pages/auth/login-v2', locale as Locale)}
                color='primary.main'
              >
                {safeDictionary?.navigation?.signInInstead || 'Sign in instead'}
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

export default RegisterV2
