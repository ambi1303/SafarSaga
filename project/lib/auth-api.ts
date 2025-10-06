/**
 * Authentication API service for SafarSaga
 * Integrates with the FastAPI backend and supports social login
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  provider?: 'email' | 'google' | 'facebook' | 'github'
  is_admin: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface SocialAuthRequest {
  provider: 'google' | 'facebook' | 'github'
  credential: string
  client_id?: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface AuthError {
  error: string
  status_code: number
}

export class AuthAPI {
  private static getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  /**
   * Sign up a new user
   */
  static async signUp(email: string, password: string, fullName: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        email,
        password,
        full_name: fullName
      })
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle different error response formats
      const errorMessage = data.detail?.message || data.detail || data.error || 'Registration failed'
      throw new Error(errorMessage)
    }

    return data
  }

  /**
   * Sign in an existing user
   */
  static async signIn(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        email,
        password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle different error response formats
      const errorMessage = data.detail?.message || data.detail || data.error || 'Login failed'
      throw new Error(errorMessage)
    }

    return data
  }

  /**
   * Sign out the current user
   */
  static async signOut(token: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(token)
      })
    } catch (error) {
      // Even if logout fails on server, we'll clear local storage
      console.warn('Logout request failed:', error)
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(token)
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.detail?.message || data.detail || data.error || 'Failed to get user profile'
      throw new Error(errorMessage)
    }

    return data
  }

  /**
   * Update user profile
   */
  static async updateProfile(token: string, updates: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(updates)
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.detail?.message || data.detail || data.error || 'Failed to update profile'
      throw new Error(errorMessage)
    }

    return data
  }

  /**
   * Refresh access token
   */
  static async refreshToken(token: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: this.getAuthHeaders(token)
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.detail?.message || data.detail || data.error || 'Failed to refresh token'
      throw new Error(errorMessage)
    }

    return data
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email })
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.detail?.message || data.detail || data.error || 'Failed to send password reset email'
      throw new Error(errorMessage)
    }
  }

  /**
   * Social authentication (Google, Facebook, GitHub)
   */
  static async socialAuth(authRequest: SocialAuthRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/social`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(authRequest)
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.detail?.message || data.detail || data.error || `${authRequest.provider} authentication failed`
      throw new Error(errorMessage)
    }

    return data
  }

  /**
   * Google Sign-In with credential
   */
  static async googleSignIn(credential: string): Promise<LoginResponse> {
    return this.socialAuth({
      provider: 'google',
      credential,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    })
  }

  /**
   * Facebook Sign-In with access token
   */
  static async facebookSignIn(accessToken: string): Promise<LoginResponse> {
    return this.socialAuth({
      provider: 'facebook',
      credential: accessToken
    })
  }

  /**
   * GitHub Sign-In with code
   */
  static async githubSignIn(code: string): Promise<LoginResponse> {
    return this.socialAuth({
      provider: 'github',
      credential: code
    })
  }

  /**
   * Verify email address
   */
  static async verifyEmail(token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ token })
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.detail?.message || data.detail || data.error || 'Email verification failed'
      throw new Error(errorMessage)
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerification(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email })
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.detail?.message || data.detail || data.error || 'Failed to resend verification email'
      throw new Error(errorMessage)
    }
  }
}

/**
 * Token management utilities
 */
export class TokenManager {
  private static readonly TOKEN_KEY = 'safarsaga_auth_token'
  private static readonly USER_KEY = 'safarsaga_user'

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY)
    }
    return null
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY)
    }
  }

  static setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    }
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY)
      if (userStr) {
        try {
          return JSON.parse(userStr)
        } catch {
          return null
        }
      }
    }
    return null
  }

  static removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_KEY)
    }
  }

  static clear(): void {
    this.removeToken()
    this.removeUser()
  }

  /**
   * Check if token is expired (basic check)
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      return payload.exp < now
    } catch {
      return true
    }
  }
}