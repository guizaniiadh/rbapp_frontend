// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
import CustomChip from '@core/components/mui/Chip'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useAuth } from '@/hooks/useAuth'
import { bankService } from '@/services/bank.service'
import { agencyService } from '@/services/agency.service'
import type { Bank } from '@/types/bank'
import type { Agency } from '@/types/agency'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Menu Data Imports
// import menuData from '@/data/navigation/verticalMenuData'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: number
}

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const { user, accessToken } = useAuth()

  // Calculate isAdmin state
  const isAdmin = accessToken && user && user.is_superuser === true

  // State for banks and agencies
  const [banks, setBanks] = useState<Bank[]>([])
  const [agencies, setAgencies] = useState<Record<string, Agency[]>>({})
  const [loading, setLoading] = useState(true)

  // Fetch banks and agencies
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch banks
        const banksData = await bankService.getBanks()

        setBanks(banksData)

        // Get all agencies
        const allAgencies = await agencyService.getAgencies()

        // Group agencies by bank code
        const agenciesMap: Record<string, Agency[]> = {}

        allAgencies.forEach(agency => {
          if (!agenciesMap[agency.bank]) {
            agenciesMap[agency.bank] = []
          }

          agenciesMap[agency.bank].push(agency)
        })

        // Sort agencies by code within each bank
        Object.keys(agenciesMap).forEach(bankCode => {
          agenciesMap[bankCode].sort((a, b) => a.code.localeCompare(b.code))
        })

        // Only include banks that exist in our banks list
        const filteredAgenciesMap: Record<string, Agency[]> = {}

        banksData.forEach(bank => {
          if (agenciesMap[bank.code]) {
            filteredAgenciesMap[bank.code] = agenciesMap[bank.code]
          } else {
            filteredAgenciesMap[bank.code] = []
          }
        })

        setAgencies(filteredAgenciesMap)
      } catch (error) {
        console.error('Error fetching menu data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!isAdmin) {
      fetchData()
    }
  }, [isAdmin])

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  // Debug: Check if user data is available
  console.log('VerticalMenu - User data:', user)
  console.log('VerticalMenu - Is superuser:', user?.is_superuser)
  console.log('VerticalMenu - Access token:', !!accessToken)

  // isAdmin is now defined at the top of the component

  // Dynamic pages for admin users - empty for now, can be configured later
  const adminPages: Array<{
    href: string
    label: string
    target?: string
  }> = []

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
        triggerPopout="hover"
        subMenuOpenBehavior="collapse"
      >
        {isAdmin ? (
          <>
            <MenuItem href={`/${locale}/dashboard`} icon={<i className='tabler-smart-home' />}>
              {dictionary['navigation'].dashboard}
              </MenuItem>
            <MenuSection label={dictionary['navigation'].appsPages}>
              <SubMenu label={dictionary['navigation'].banks} icon={<i className='tabler-building-bank' />}>
                <MenuItem href={`/${locale}/admin/banques/comptes-bancaires`}>
                  {dictionary['navigation'].bankAccounts}
                </MenuItem>
              </SubMenu>
              <SubMenu label={dictionary['navigation'].company} icon={<i className='tabler-building' />}>
                <MenuItem href={`/${locale}/admin/company/company-list`}>
                  {dictionary['navigation'].companyList}
                </MenuItem>
              </SubMenu>
              <SubMenu label={dictionary['navigation'].parameters} icon={<i className='tabler-adjustments' />}>
                <MenuItem href={`/${locale}/admin/parameters/general`}>
                  {dictionary['navigation'].generalParameters}
                </MenuItem>
                <MenuItem href={`/${locale}/admin/parameters/reconciliation`}>
                  {dictionary['navigation'].reconciliationParameters}
                </MenuItem>
                <MenuItem href={`/${locale}/admin/parameters/convention`}>
                  {dictionary['navigation'].conventionParameters}
                </MenuItem>
              </SubMenu>
              {/* Documents submenu removed due to missing i18n keys */}
              {isAdmin && (
                <SubMenu label={dictionary['navigation'].user} icon={<i className='tabler-user' />}>
                  <MenuItem href={`/${locale}/apps/user/list`}>{dictionary['navigation'].list}</MenuItem>
                  <MenuItem href={`/${locale}/apps/user/view`}>{dictionary['navigation'].view}</MenuItem>
                </SubMenu>
              )}
              <SubMenu label={dictionary['navigation'].rolesPermissions} icon={<i className='tabler-lock' />}>
                <MenuItem href={`/${locale}/apps/roles`}>{dictionary['navigation'].roles}</MenuItem>
                <MenuItem href={`/${locale}/apps/permissions`}>{dictionary['navigation'].permissions}</MenuItem>
              </SubMenu>
              {isAdmin && adminPages.length > 0 && (
                <SubMenu label={dictionary['navigation'].pages} icon={<i className='tabler-file' />}>
                  {adminPages.map((page, index) => (
                    <MenuItem key={index} href={page.href} target={page.target}>
                      {page.label}
                    </MenuItem>
                  ))}
                </SubMenu>
              )}
            </MenuSection>
            <MenuSection label={dictionary['navigation'].chartsMisc}>
              <MenuItem icon={<i className='tabler-lifebuoy' />}>
                {dictionary['navigation'].raiseSupport}
              </MenuItem>
              <MenuItem icon={<i className='tabler-book-2' />}>
                {dictionary['navigation'].documentation}
              </MenuItem>
            </MenuSection>
          </>
        ) : (
          <>
            <MenuSection label={dictionary['navigation'].appsPages}>
              <SubMenu label={dictionary['navigation'].reconciliation} icon={<i className='tabler-files' />}>
                {loading ? (
                  <MenuItem>Loading banks...</MenuItem>
                ) : banks.length > 0 ? (
                  banks.map(bank => (
                    <SubMenu key={bank.code} label={bank.name}>
                      {agencies[bank.code]?.length > 0 ? (
                        agencies[bank.code].map(agency => (
                          <MenuItem key={agency.code} href={`/${locale}/reconciliation/agency/${agency.code}`}>
                            {agency.name} ({agency.code})
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No agencies found</MenuItem>
                      )}
                    </SubMenu>
                  ))
                ) : (
                  <MenuItem disabled>No banks found</MenuItem>
                )}
              </SubMenu>
              <SubMenu label={dictionary['navigation'].documents} icon={<i className='tabler-file-text' />}>
                <MenuItem href={`/${locale}/documents/customer-ledger-entries`}>
                  {dictionary['navigation'].customerDocuments}
                </MenuItem>
                <MenuItem href={`/${locale}/documents/bank-ledger-entries`}>
                  {dictionary['navigation'].bankDocuments}
                </MenuItem>
              </SubMenu>
            </MenuSection>
          </>
        )}
      </Menu>
      {/* <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <GenerateVerticalMenu menuData={menuData(dictionary)} />
      </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu
