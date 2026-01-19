// Next Imports
import dynamic from 'next/dynamic'


// Component Imports
import AccountSettings from '@views/pages/account-settings'

// Vars
const AccountTab = dynamic(() => import('@views/pages/account-settings/account'))
const SecurityTab = dynamic(() => import('@views/pages/account-settings/security'))
const BillingPlansTab = dynamic(() => import('@views/pages/account-settings/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/pages/account-settings/notifications'))
const ConnectionsTab = dynamic(() => import('@views/pages/account-settings/connections'))

// Vars
const tabContentList = (tab: string) => {
  switch (tab) {
    case 'account':
      return <AccountTab />
    case 'security':
      return <SecurityTab />
    case 'billing-plans':
      return <BillingPlansTab />
    case 'notifications':
      return <NotificationsTab />
    case 'connections':
      return <ConnectionsTab />
    default:
      return <AccountTab />
  }
}

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

const AccountSettingsPage = ({ searchParams }: Props) => {
  const tab = Array.isArray(searchParams.tab) ? searchParams.tab[0] : searchParams.tab || 'account'
  
  return <AccountSettings tabContentList={{ [tab]: tabContentList(tab) }} />
}

export default AccountSettingsPage
