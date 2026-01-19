import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: Request) {
  console.log('API route /api/user called')
  
  try {
    console.log('Making direct request to Django backend with authentication...')
    
    // Get authentication headers from the request
    const authHeader = request.headers.get('authorization')
    console.log('Auth header received:', authHeader ? 'Present' : 'Not present')
    
    // Prepare headers for Django backend
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    
    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    // Make direct request to Django backend with authentication
    const response = await axios.get('http://127.0.0.1:8000/api/users/', {
      headers
    })
    
    console.log('Django response received:', response.data)
    const realUsers = response.data
    
    console.log('Users fetched from Django backend:', realUsers)
    console.log('Number of users:', realUsers?.length || 0)
    
    // Check if we got any users
    if (!realUsers || realUsers.length === 0) {
      console.log('No users found from Django backend, returning empty array')
      return NextResponse.json([])
    }
    
    // Transform the real data to match the lookup component format
    const transformedUsers = realUsers.map((user: any) => ({
      id: user.id,
      name: user.full_name || user.username, // Use full_name or username
      email: user.email,
      status: user.is_active ? 'Active' : 'Inactive'
    }))
    
    console.log('Transformed users:', transformedUsers)
    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error('Error fetching users from Django backend:', error)
    console.error('Error details:', error.message)
    console.error('Error response:', error.response?.data)
    
    // If it's a 401 error, return a more specific message
    if (error.response?.status === 401) {
      return NextResponse.json(
        { 
          error: 'Authentication required to fetch users', 
          details: 'The Django backend requires authentication. Please check if the /api/users/ endpoint is accessible without authentication or if authentication headers need to be passed from the frontend.',
          suggestion: 'You may need to make the Django endpoint public or pass authentication tokens from the frontend to this API route.'
        },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch users from backend', details: error.message },
      { status: 500 }
    )
  }
}
