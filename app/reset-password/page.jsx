'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isValidLink, setIsValidLink] = useState(true)
  const { updatePassword, user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Don't validate until auth loading is complete
    if (authLoading) return

    // Check for error parameters first
    const urlError = searchParams.get('error')
    const errorCode = searchParams.get('error_code')

    if (urlError) {
      setIsValidLink(false)
      if (errorCode === 'otp_expired') {
        setError('This password reset link has expired. Please request a new password reset.')
      } else if (urlError === 'access_denied') {
        setError('Access denied. This reset link is invalid or has been used already.')
      } else {
        setError('Invalid reset link. Please request a new password reset.')
      }
      return
    }

    // Check for recovery type in URL hash (Supabase sends this)
    const hash = window.location.hash
    const hashParams = new URLSearchParams(hash.substring(1))
    const type = hashParams.get('type')

    // If we have a recovery type or user is authenticated, it's valid
    if (type === 'recovery' || user) {
      setIsValidLink(true)
      setError('')
    } else {
      setIsValidLink(false)
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [searchParams, authLoading, user])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isValidLink) {
      toast.error('Invalid reset link. Please request a new password reset.')
      return
    }

    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const { error } = await updatePassword(password)

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Password updated successfully!')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 text-green-600">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
              {error.includes('Invalid reset link') && (
                <div className="mt-2">
                  <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
                    Go back to login
                  </Link>
                </div>
              )}
            </div>
          )}

          {isValidLink && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating password...' : 'Update password'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-green-600 hover:text-green-500">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}