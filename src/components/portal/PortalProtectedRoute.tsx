import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Patient } from '@/services/patients'

interface PatientContextType {
  patient: Patient
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

export const usePatientContext = () => {
  const context = useContext(PatientContext)
  if (!context) throw new Error('usePatientContext must be used within PortalProtectedRoute')
  return context
}

export function PortalProtectedRoute() {
  const { isAuthenticated, is2FAVerified, user, loading } = useAuth()
  const location = useLocation()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (isAuthenticated && is2FAVerified && user?.email) {
      pb.collection('patients')
        .getFirstListItem(`email="${user.email}"`)
        .then((p) => setPatient(p as Patient))
        .catch(() => setPatient(null))
        .finally(() => setChecking(false))
    } else {
      setChecking(false)
    }
  }, [isAuthenticated, is2FAVerified, user])

  if (loading || checking)
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center text-emerald-800">
        Verificando acesso...
      </div>
    )

  if (!isAuthenticated || !is2FAVerified) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <h2 className="text-xl font-bold text-emerald-900 mb-2">Acesso Restrito</h2>
          <p className="text-emerald-700">Seu e-mail não está vinculado a um paciente ativo.</p>
        </div>
      </div>
    )
  }

  return (
    <PatientContext.Provider value={{ patient }}>
      <Outlet />
    </PatientContext.Provider>
  )
}
