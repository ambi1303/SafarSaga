'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { LogIn, UserPlus, X } from 'lucide-react'

interface LoginRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  actionText?: string
  onLoginSuccess?: () => void
}

export function LoginRequiredModal({
  isOpen,
  onClose,
  title = "Login Required",
  message = "You need to be logged in to book a trip. Please sign in or create an account to continue.",
  actionText = "book this trip",
  onLoginSuccess
}: LoginRequiredModalProps) {
  const router = useRouter()

  const handleLogin = () => {
    // Store the current page to redirect back after login
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
    }
    router.push('/auth/login')
    onClose()
  }

  const handleSignUp = () => {
    // Store the current page to redirect back after signup
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
    }
    router.push('/auth/register')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-gray-600 mt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <Button
            onClick={handleLogin}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In to Continue
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <Button
            onClick={handleSignUp}
            variant="outline"
            className="w-full border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create New Account
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook for handling login required scenarios
 */
export function useLoginRequired() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    title: "Login Required",
    message: "You need to be logged in to continue.",
    actionText: "continue"
  })

  const showLoginRequired = (config?: Partial<typeof modalConfig>) => {
    if (config) {
      setModalConfig(prev => ({ ...prev, ...config }))
    }
    setIsModalOpen(true)
  }

  const hideLoginRequired = () => {
    setIsModalOpen(false)
  }

  const LoginRequiredComponent = () => (
    <LoginRequiredModal
      isOpen={isModalOpen}
      onClose={hideLoginRequired}
      {...modalConfig}
    />
  )

  return {
    showLoginRequired,
    hideLoginRequired,
    LoginRequiredModal: LoginRequiredComponent,
    isModalOpen
  }
}