import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function ProtectedRoute() {
  const { isAuthenticated, is2FAVerified, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">Verificando sessão...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !is2FAVerified) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
