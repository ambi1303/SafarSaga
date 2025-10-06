'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo,
  fallback
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (requireAuth && !isAuthenticated) {
      // Redirect to login if authentication is required
      const redirect = redirectTo || '/auth/login'
      router.push(redirect)
      return
    }

    if (requireAdmin && (!user || !user.is_admin)) {
      // Redirect to dashboard if admin access is required but user is not admin
      router.push('/dashboard')
      return
    }
  }, [user, loading, isAuthenticated, requireAuth, requireAdmin, redirectTo, router])

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check authentication requirements
  if (requireAuth && !isAuthenticated) {
    return null // Will redirect in useEffect
  }

  if (requireAdmin && (!user || !user.is_admin)) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}

/**
 * Hook for checking authentication in components
 */
export function useRequireAuth(redirectTo?: string) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo || '/auth/login')
    }
  }, [isAuthenticated, loading, redirectTo, router])

  return { user, loading, isAuthenticated }
}

/**
 * Hook for checking admin access in components
 */
export function useRequireAdmin(redirectTo?: string) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (!user?.is_admin) {
        router.push(redirectTo || '/dashboard')
      }
    }
  }, [user, loading, isAuthenticated, redirectTo, router])

  return { user, loading, isAuthenticated, isAdmin: user?.is_admin || false }
}