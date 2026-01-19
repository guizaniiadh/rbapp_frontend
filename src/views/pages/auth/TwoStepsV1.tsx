'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Third-party Imports
import { OTPInput } from 'input-otp'
import type { SlotProps } from 'input-otp'
import classnames from 'classnames'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { getDictionaryClient } from '@/utils/getDictionaryClient'

// Styled Component Imports
import AuthIllustrationWrapper from './AuthIllustrationWrapper'

// Style Imports
import styles from '@/libs/styles/inputOtp.module.css'

const Slot = (props: SlotProps) => {
  return (
    <div className={classnames(styles.slot, { [styles.slotActive]: props.isActive })}>
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  )
}

const FakeCaret = () => {
  return (
    <div className={styles.fakeCaret}>
      <div className='w-px h-5 bg-textPrimary' />
    </div>
  )
}

const TwoStepsV1 = () => {
  // States
  const [otp, setOtp] = useState<string | null>(null)
  const [dictionary, setDictionary] = useState<any>(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(true)

  // Hooks
  const { lang: locale } = useParams()

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
              {safeDictionary?.navigation?.twoStepVerificationTitle || 'Two Step Verification'} 💬
            </Typography>
            <Typography>
              {safeDictionary?.navigation?.twoStepVerificationDescription ||
                'We sent a verification code to your mobile. Enter the code from the mobile in the field below.'}
            </Typography>
            <Typography className='font-medium' color='text.primary'>
              ******1234
            </Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()} className='flex flex-col gap-6'>
            <div className='flex flex-col gap-2'>
              <Typography>
                {safeDictionary?.navigation?.twoStepVerificationPrompt || 'Type your 6 digit security code'}
              </Typography>
              <OTPInput
                onChange={setOtp}
                value={otp ?? ''}
                maxLength={6}
                containerClassName='flex items-center'
                render={({ slots }) => (
                  <div className='flex items-center justify-between w-full gap-4'>
                    {slots.slice(0, 6).map((slot, idx) => (
                      <Slot key={idx} {...slot} />
                    ))}
                  </div>
                )}
              />
            </div>
            <Button fullWidth variant='contained' type='submit'>
              {safeDictionary?.navigation?.verifyMyAccount || 'Verify my account'}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>{safeDictionary?.navigation?.didntGetCode || "Didn't get the code?"}</Typography>
              <Typography color='primary.main' component={Link} href='/' onClick={e => e.preventDefault()}>
                {safeDictionary?.navigation?.resend || 'Resend'}
              </Typography>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default TwoStepsV1
