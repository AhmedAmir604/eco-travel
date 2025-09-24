import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Hook to handle authentication-based redirects
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireAuth - Whether the page requires authentication
 * @param {boolean} options.redirectIfAuth - Whether to redirect if user is authenticated
 * @param {string} options.redirectTo - Where to redirect (defaults: '/' for auth pages, '/login' for protected pages)
 */
export function useAuthRedirect({ 
  requireAuth = false, 
  redirectIfAuth = false, 
  redirectTo = null 
} = {}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return

    // If page requires auth and user is not authenticated
    if (requireAuth && !user) {
      router.replace(redirectTo || '/login')
      return
    }

    // If page should redirect authenticated users (like login/signup pages)
    if (redirectIfAuth && user) {
      router.replace(redirectTo || '/')
      return
    }
  }, [user, loading, requireAuth, redirectIfAuth, redirectTo, router])

  return { user, loading }
}