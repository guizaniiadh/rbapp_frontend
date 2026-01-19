// Component Imports
import UserProfile from '@views/pages/user-profile'

// Data Imports
import { getProfileData } from '@/app/server/actions'

// Type Imports
import type { Locale } from '@configs/i18n'

type Props = {
  params: { lang: Locale }
}

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/pages/profile` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getProfileData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/pages/profile`)

  if (!res.ok) {
    throw new Error('Failed to fetch profileData')
  }

  return res.json()
} */

const ProfilePage = async ({ params }: Props) => {
  // Get profile data
  const data = await getProfileData()
  
  return <UserProfile data={data} />
}

export default ProfilePage
