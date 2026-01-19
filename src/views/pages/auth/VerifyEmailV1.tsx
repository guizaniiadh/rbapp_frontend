'use client'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Link from '@components/Link'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { getDictionaryClient } from '@/utils/getDictionaryClient'

// Styled Component Imports
import AuthIllustrationWrapper from './AuthIllustrationWrapper'

const VerifyEmailV1 = () => {
  // Hooks
  const { lang: locale } = useParams()

  const [dictionary, setDictionary] = useState<any>(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(true)

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

  const safeDictionary = dictionary || { navigation: {} }

  return (
    <AuthIllustrationWrapper>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='sm:!p-12'>
          <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-1 mbe-6'>
            <Typography variant='h4'>
              {safeDictionary?.navigation?.verifyYourEmailTitle || 'Verify your email'} ✉️
            </Typography>
            <Typography>
              {safeDictionary?.navigation?.verifyYourEmailDescription ||
                'Account activation link sent to your email address. Please follow the link inside to continue.'}
            </Typography>
          </div>
          <Button fullWidth variant='contained' type='submit' className='mbe-6'>
            {safeDictionary?.navigation?.skipForNow || 'Skip For Now'}
          </Button>
          <div className='flex justify-center items-center flex-wrap gap-2'>
            <Typography>{safeDictionary?.navigation?.didntGetMail || "Didn't get the mail?"}</Typography>
            <Typography color='primary.main' component={Link}>
              {safeDictionary?.navigation?.resend || 'Resend'}
            </Typography>
          </div>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default VerifyEmailV1
