import { Navigate, Outlet, useOutletContext } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import type { Patient } from '@/services/patients'

export function PortalProtectedRoute() {
  const { user, isAuthenticated, loading } = useAuth()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      pb.collection<Patient>('patients')
        .getFirstListItem(`email="${user.email}"`)
        .then((p) => setPatient(p))
        .catch(() => setPatient(null))
        .finally(() => setIsReady(true))
    } else if (!loading) {
      setIsReady(true)
    }
  }, [isAuthenticated, user, loading])

  if (loading || !isReady)
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 text-emerald-800">
        Carregando portal...
      </div>
    )

  if (!isAuthenticated || !patient) {
    return <Navigate to="/portal/login" replace />
  }

  return <Outlet context={{ patient }} />
}

export function usePatientContext() {
  return useOutletContext<{ patient: Patient }>()
}
