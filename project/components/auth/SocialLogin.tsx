'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'

// Google Sign-In types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, config: any) => void
          prompt: () => void
          disableAutoSelect: () => void
        }
      }
    }
    FB?: {
      init: (config: any) => void
      login: (callback: (response: any) => void, config?: any) => void
      getLoginStatus: (callback: (response: any) => void) => void
    }
    fbAsyncInit?: () => void
  }
}

interface SocialLoginProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  showTitle?: boolean
  className?: string
}

export function SocialLogin({ 
  onSuccess, 
  onError, 
  showTitle = true,
  className = "" 
}: SocialLoginProps) {
  const { googleSignIn, facebookSignIn, githubSignIn } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const [facebookLoaded, setFacebookLoaded] = useState(false)

  useEffect(() => {
    // Load Google Sign-In
    loadGoogleSignIn()
    
    // Load Facebook SDK
    loadFacebookSDK()
  }, [])

  const loadGoogleSignIn = () => {
    if (window.google) {
      initializeGoogle()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      initializeGoogle()
    }
    document.head.appendChild(script)
  }

  const initializeGoogle = () => {
    if (!window.google || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.warn('Google Sign-In not configured')
      return
    }

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    })

    setGoogleLoaded(true)
  }

  const loadFacebookSDK = () => {
    if (window.FB) {
      setFacebookLoaded(true)
      return
    }

    window.fbAsyncInit = () => {
      if (!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
        console.warn('Facebook Sign-In not configured')
        return
      }

      window.FB!.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      })

      setFacebookLoaded(true)
    }

    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }

  const handleGoogleResponse = async (response: any) => {
    if (!response.credential) {
      setError('Google authentication failed')
      onError?.('Google authentication failed')
      return
    }

    try {
      setLoading('google')
      setError('')
      
      const result = await googleSignIn(response.credential)
      
      if (result.error) {
        setError(result.error)
        onError?.(result.error)
      } else {
        onSuccess?.()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google authentication failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(null)
    }
  }

  const handleGoogleSignIn = () => {
    if (!googleLoaded || !window.google) {
      setError('Google Sign-In not loaded')
      return
    }

    try {
      window.google.accounts.id.prompt()
    } catch (error) {
      setError('Failed to open Google Sign-In')
    }
  }

  const handleFacebookSignIn = () => {
    if (!facebookLoaded || !window.FB) {
      setError('Facebook SDK not loaded')
      return
    }

    setLoading('facebook')
    setError('')

    window.FB.login(async (response) => {
      try {
        if (response.authResponse && response.authResponse.accessToken) {
          const result = await facebookSignIn(response.authResponse.accessToken)
          
          if (result.error) {
            setError(result.error)
            onError?.(result.error)
          } else {
            onSuccess?.()
          }
        } else {
          setError('Facebook authentication cancelled')
          onError?.('Facebook authentication cancelled')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Facebook authentication failed'
        setError(errorMessage)
        onError?.(errorMessage)
      } finally {
        setLoading(null)
      }
    }, { scope: 'email,public_profile' })
  }

  const handleGitHubSignIn = () => {
    if (!process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID) {
      setError('GitHub Sign-In not configured')
      return
    }

    setLoading('github')
    setError('')

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=user:email&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/github/callback')}`
    
    window.location.href = githubAuthUrl
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showTitle && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">Or continue with</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {/* Google Sign-In */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={!googleLoaded || loading === 'google'}
          className="w-full flex items-center justify-center gap-3 py-3 border-gray-300 hover:bg-gray-50"
        >
          {loading === 'google' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span className="text-sm font-medium">
            {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
          </span>
        </Button>

        {/* Facebook Sign-In */}
        <Button
          type="button"
          variant="outline"
          onClick={handleFacebookSignIn}
          disabled={!facebookLoaded || loading === 'facebook'}
          className="w-full flex items-center justify-center gap-3 py-3 border-gray-300 hover:bg-gray-50"
        >
          {loading === 'facebook' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
          <span className="text-sm font-medium">
            {loading === 'facebook' ? 'Signing in...' : 'Continue with Facebook'}
          </span>
        </Button>

        {/* GitHub Sign-In */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGitHubSignIn}
          disabled={loading === 'github'}
          className="w-full flex items-center justify-center gap-3 py-3 border-gray-300 hover:bg-gray-50"
        >
          {loading === 'github' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          )}
          <span className="text-sm font-medium">
            {loading === 'github' ? 'Signing in...' : 'Continue with GitHub'}
          </span>
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-orange-500 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-orange-500 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}

export default SocialLogin