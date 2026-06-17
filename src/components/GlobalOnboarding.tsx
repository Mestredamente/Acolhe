import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { OnboardingWizard } from './OnboardingWizard'

export function GlobalOnboarding() {
  const { user, isAuthenticated, is2FAVerified } = useAuth()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (
      isAuthenticated &&
      is2FAVerified &&
      user &&
      user.profile !== 'paciente' &&
      user.onboarding_completo === false
    ) {
      setShow(true)
    }
  }, [isAuthenticated, is2FAVerified, user])

  if (!show) return null

  return <OnboardingWizard open={show} onComplete={() => setShow(false)} />
}
