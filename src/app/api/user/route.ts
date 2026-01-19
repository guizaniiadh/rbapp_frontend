import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET() {
  console.log('API route /api/user called')
  
  try {
    console.log('Making request to Django backend...')
    
    // Make direct API call to Django backend with proper headers
    const response = await axios.get('http://127.0.0.1:8000/api/users/', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Django response received:', response.data)
    const realUsers = response.data
    
    // Transform the real data to match the lookup component format
    const transformedUsers = realUsers.map((user: any) => ({
      id: user.id,
      name: user.username, // Use username since first_name and last_name are empty
      email: user.email,
      status: user.is_active ? 'Active' : 'Inactive'
    }))
    
    console.log('Transformed users:', transformedUsers)
    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error('Error fetching users from Django backend:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users from backend', details: error.message },
      { status: 500 }
    )
  }
}
