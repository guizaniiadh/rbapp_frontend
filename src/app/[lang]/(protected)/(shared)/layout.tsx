// MUI Imports

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Layout Imports
import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'
import HorizontalLayout from '@layouts/HorizontalLayout'

// Component Imports
import Providers from '@components/Providers'
import Navigation from '@components/layout/vertical/Navigation'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'
import Header from '@components/layout/horizontal/Header'
import HorizontalFooter from '@components/layout/horizontal/Footer'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import { getMode, getSystemMode } from '@core/utils/serverHelpers'

const SharedLayout = async (props: ChildrenType & { params: { lang: Locale } }) => {
  const { children, params } = props

  // Vars
  const direction = i18n.langDirection[params.lang]
  const dictionary = await getDictionary(params.lang)
  const mode = await getMode()
  const systemMode = await getSystemMode()

  // Use the full dictionary for navigation
  const navigationDictionary = dictionary

  return (
    <Providers direction={direction}>
      <LayoutWrapper
        systemMode={systemMode}
        verticalLayout={
          <VerticalLayout
            navigation={<Navigation dictionary={navigationDictionary} mode={mode} />}
            navbar={<Navbar />}
            footer={<VerticalFooter />}
          >
            {children}
          </VerticalLayout>
        }
        horizontalLayout={
          <HorizontalLayout
            header={<Header />}
            footer={<HorizontalFooter />}
          >
            {children}
          </HorizontalLayout>
        }
      />
    </Providers>
  )
}

export default SharedLayout
