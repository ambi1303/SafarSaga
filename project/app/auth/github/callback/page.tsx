'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export default function GitHubCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { githubSignIn } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleGitHubCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (error) {
        setStatus('error')
        setMessage(errorDescription || 'GitHub authentication was cancelled or failed')
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('No authorization code received from GitHub')
        return
      }

      try {
        const result = await githubSignIn(code)
        
        if (result.error) {
          setStatus('error')
          setMessage(result.error)
        } else {
          setStatus('success')
          setMessage('Successfully signed in with GitHub!')
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }
      } catch (error) {
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'GitHub authentication failed')
      }
    }

    handleGitHubCallback()
  }, [searchParams, githubSignIn, router])

  const handleRetry = () => {
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            GitHub Authentication
          </h2>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {status === 'loading' && (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Completing GitHub Sign-In
              </h3>
              <p className="text-gray-600">
                Please wait while we verify your GitHub account...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sign-In Successful!
              </h3>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to your dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Authentication Failed
              </h3>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <button
                onClick={handleRetry}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Having trouble?{' '}
            <a
              href="/contact"
              className="font-medium text-orange-500 hover:text-orange-600"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}