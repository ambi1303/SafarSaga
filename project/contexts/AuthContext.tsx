'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthAPI, TokenManager, User, SocialAuthRequest } from '@/lib/auth-api'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ error?: string }>
  socialSignIn: (authRequest: SocialAuthRequest) => Promise<{ error?: string }>
  googleSignIn: (credential: string) => Promise<{ error?: string }>
  facebookSignIn: (accessToken: string) => Promise<{ error?: string }>
  githubSignIn: (code: string) => Promise<{ error?: string }>
  verifyEmail: (token: string) => Promise<{ error?: string }>
  resendVerification: (email: string) => Promise<{ error?: string }>
  isAuthenticated: boolean
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Initialize auth state from localStorage
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const storedToken = TokenManager.getToken()
      const storedUser = TokenManager.getUser()

      if (storedToken && storedUser) {
        // Check if token is expired
        if (TokenManager.isTokenExpired(storedToken)) {
          // Try to refresh token
          try {
            const response = await AuthAPI.refreshToken(storedToken)
            TokenManager.setToken(response.access_token)
            TokenManager.setUser(response.user)
            setToken(response.access_token)
            setUser(response.user)
          } catch (error) {
            // Refresh failed, clear auth state
            clearAuthState()
          }
        } else {
          // Token is valid, verify with server
          try {
            const currentUser = await AuthAPI.getCurrentUser(storedToken)
            TokenManager.setUser(currentUser)
            setToken(storedToken)
            setUser(currentUser)
          } catch (error) {
            // Token is invalid, clear auth state
            clearAuthState()
          }
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      clearAuthState()
    } finally {
      setLoading(false)
    }
  }

  const clearAuthState = () => {
    TokenManager.clear()
    setToken(null)
    setUser(null)
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await AuthAPI.signIn(email, password)
      
      // Store auth data
      TokenManager.setToken(response.access_token)
      TokenManager.setUser(response.user)
      setToken(response.access_token)
      setUser(response.user)

      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)
      const response = await AuthAPI.signUp(email, password, fullName)
      
      // Store auth data
      TokenManager.setToken(response.access_token)
      TokenManager.setUser(response.user)
      setToken(response.access_token)
      setUser(response.user)

      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      if (token) {
        await AuthAPI.signOut(token)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthState()
      setLoading(false)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user || !token) {
      return { error: 'No user logged in' }
    }

    try {
      const updatedUser = await AuthAPI.updateProfile(token, data)
      
      // Update local state
      TokenManager.setUser(updatedUser)
      setUser(updatedUser)
      
      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed'
      return { error: errorMessage }
    }
  }

  const socialSignIn = async (authRequest: SocialAuthRequest) => {
    try {
      setLoading(true)
      const response = await AuthAPI.socialAuth(authRequest)
      
      // Store auth data
      TokenManager.setToken(response.access_token)
      TokenManager.setUser(response.user)
      setToken(response.access_token)
      setUser(response.user)

      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `${authRequest.provider} authentication failed`
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const googleSignIn = async (credential: string) => {
    try {
      setLoading(true)
      const response = await AuthAPI.googleSignIn(credential)
      
      // Store auth data
      TokenManager.setToken(response.access_token)
      TokenManager.setUser(response.user)
      setToken(response.access_token)
      setUser(response.user)

      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google authentication failed'
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const facebookSignIn = async (accessToken: string) => {
    try {
      setLoading(true)
      const response = await AuthAPI.facebookSignIn(accessToken)
      
      // Store auth data
      TokenManager.setToken(response.access_token)
      TokenManager.setUser(response.user)
      setToken(response.access_token)
      setUser(response.user)

      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Facebook authentication failed'
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const githubSignIn = async (code: string) => {
    try {
      setLoading(true)
      const response = await AuthAPI.githubSignIn(code)
      
      // Store auth data
      TokenManager.setToken(response.access_token)
      TokenManager.setUser(response.user)
      setToken(response.access_token)
      setUser(response.user)

      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'GitHub authentication failed'
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (verificationToken: string) => {
    try {
      await AuthAPI.verifyEmail(verificationToken)
      
      // Refresh user data to get updated verification status
      if (token) {
        const updatedUser = await AuthAPI.getCurrentUser(token)
        TokenManager.setUser(updatedUser)
        setUser(updatedUser)
      }
      
      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed'
      return { error: errorMessage }
    }
  }

  const resendVerification = async (email: string) => {
    try {
      await AuthAPI.resendVerification(email)
      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification email'
      return { error: errorMessage }
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    socialSignIn,
    googleSignIn,
    facebookSignIn,
    githubSignIn,
    verifyEmail,
    resendVerification,
    isAuthenticated: !!user && !!token,
    token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}