import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}
