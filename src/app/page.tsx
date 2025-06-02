'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signInWithGoogle, user, loading } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/overview')
    }
  }, [user, loading, router])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
      router.push('/overview')
    } catch (error) {
      console.error('Login failed:', error)
      // You could add error handling UI here
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b border-black"></div>
      </div>
    )
  }

  // Don't show login form if user is authenticated
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-6 sm:space-y-8">
        <div className="bg-white border border-gray-200 p-6 sm:p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase mb-2">
              Sign In
            </h1>
            <p className="text-gray-600 text-sm">Continue with Google</p>
          </div>

          {/* Google Login */}
          <div className="space-y-6 sm:space-y-8">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 sm:py-4 px-4 text-sm font-medium tracking-wide uppercase border border-black bg-white text-black hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:space-x-3 active:scale-95 touch-manipulation"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b border-current mx-auto"></div>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-xs sm:text-sm">Continue with Google</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Terms - Outside the main card */}
        <div className="text-center px-2">
          <p className="text-xs leading-relaxed text-gray-500">
            By continuing you agree to our{' '}
            <a href="#" className="text-black hover:text-gray-700 transition-colors underline">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="text-black hover:text-gray-700 transition-colors underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 