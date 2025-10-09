/**
 * Centralized API Client for SafarSaga
 * Standardized error handling and authentication across all services
 */

import axios, { AxiosInstance, AxiosError } from 'axios'
import { TokenManager } from './auth-api'
import { toast } from '@/hooks/use-toast'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors consistently
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as any

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          TokenManager.clear()
          toast({
            title: 'Session Expired',
            description: 'Your session has expired. Please log in again.',
            variant: 'destructive',
          })
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
          break
        case 403:
          // Forbidden - access denied
          console.error('Access denied:', data.detail)
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to perform this action.',
            variant: 'destructive',
          })
          break
        case 404:
          // Not found
          console.error('Resource not found:', data.detail)
          toast({
            title: 'Not Found',
            description: 'The requested resource could not be found.',
            variant: 'destructive',
          })
          break
        case 422:
          // Validation error
          console.error('Validation error:', data.detail)
          const validationMsg = typeof data.detail === 'string' 
            ? data.detail 
            : 'Please check your input and try again.'
          toast({
            title: 'Validation Error',
            description: validationMsg,
            variant: 'destructive',
          })
          break
        case 500:
          // Server error
          console.error('Server error:', data.detail)
          toast({
            title: 'Server Error',
            description: 'A server error occurred. Please try again later.',
            variant: 'destructive',
          })
          break
        default:
          // Other errors
          toast({
            title: 'Error',
            description: data.detail || data.message || 'An unexpected error occurred.',
            variant: 'destructive',
          })
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message)
      toast({
        title: 'Network Error',
        description: 'Please check your internet connection and try again.',
        variant: 'destructive',
      })
    } else {
      // Other error
      console.error('Request error:', error.message)
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      })
    }

    return Promise.reject(error)
  }
)

export default apiClient

// Helper function to extract error message
export function getErrorMessage(error: any): string {
  if (error.response?.data?.detail) {
    if (typeof error.response.data.detail === 'string') {
      return error.response.data.detail
    }
    if (error.response.data.detail.message) {
      return error.response.data.detail.message
    }
  }
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Helper function for silent API calls (no toast notifications)
export const silentApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Add auth token to silent client
silentApiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
