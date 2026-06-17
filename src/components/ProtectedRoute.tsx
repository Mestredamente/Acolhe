import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function ProtectedRoute() {
  const { isAuthenticated, is2FAVerified, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!isAuthenticated || !is2FAVerified) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
