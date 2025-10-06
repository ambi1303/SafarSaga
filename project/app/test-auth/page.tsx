'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function TestAuthPage() {
  const { user, signIn, signUp, signOut, loading, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('safarsagatrips@gmail.com')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('Test User')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    const result = await signIn(email, password)
    if (result.error) {
      setError(result.error)
    }
  }

  const handleSignup = async () => {
    setError('')
    const result = await signUp(email, password, fullName)
    if (result.error) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
        
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {!loading && (
          <>
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-green-800">Logged In!</h2>
                  <p className="text-green-700">Name: {user?.full_name}</p>
                  <p className="text-green-700">Email: {user?.email}</p>
                  <p className="text-green-700">Admin: {user?.is_admin ? 'Yes' : 'No'}</p>
                </div>
                <Button onClick={signOut} className="w-full">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name (for signup)
                  </label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Button onClick={handleLogin} className="w-full">
                    Sign In
                  </Button>
                  <Button onClick={handleSignup} variant="outline" className="w-full">
                    Sign Up
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">API Status:</h3>
          <div className="text-xs text-gray-600">
            <p>Backend URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}</p>
            <p>Auth Status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}