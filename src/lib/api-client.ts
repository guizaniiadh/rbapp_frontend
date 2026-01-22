import axios from 'axios'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
const API_BASE_URL = `${BACKEND_URL}/api`

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// Token refresh function
const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
      refresh: refreshToken
    })
    return response.data.access
  } catch (error) {
    console.error('Token refresh failed:', error)
    throw error
  }
}

// Add a request interceptor
apiClient.interceptors.request.use(
  config => {
    // Add auth token from Redux store or localStorage
    const token = localStorage.getItem('rb_access')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // If data is FormData, remove Content-Type header to let axios set it automatically with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Add a response interceptor for token refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // If token expired and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('rb_refresh')
        if (refreshToken) {
          const newAccessToken = await refreshAccessToken(refreshToken)

          // Update the token in localStorage
          localStorage.setItem('rb_access', newAccessToken)

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('rb_access')
        localStorage.removeItem('rb_refresh')
        localStorage.removeItem('rb_user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    if (error.response) {
      // Don't log 404/400 errors for optional endpoints (like extract-beginning-balance)
      // These are expected and handled gracefully by the calling code
      const isOptionalEndpoint = error.config?.url?.includes('extract-beginning-balance') ||
                                 error.config?.url?.includes('/empty/')
      
      if (!isOptionalEndpoint || (error.response.status !== 404 && error.response.status !== 400)) {
        console.error('API Error:', error.response.data)
        console.error('API Error Status:', error.response.status)
        console.error('API Error Headers:', error.response.headers)
      }
      
      // Return the original error so components can access response.data
      // This allows components to see validation errors and field-specific messages
      return Promise.reject(error)
    } else if (error.request) {
      console.error('No response received:', error.request)
      return Promise.reject({ message: 'No response from server - please check your connection' })
    } else {
      console.error('Request setup error:', error.message)
      return Promise.reject({ message: `Request setup error: ${error.message}` })
    }
  }
)

export default apiClient
