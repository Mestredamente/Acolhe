import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  is2FAVerified: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any; requires2FA?: boolean }>
  verify2FA: (code: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [is2FAVerified, setIs2FAVerified] = useState<boolean>(() => {
    return sessionStorage.getItem('2fa_verified') === 'true'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? record : null)
      setIsAuthenticated(pb.authStore.isValid)
      if (!pb.authStore.isValid) {
        setIs2FAVerified(false)
        sessionStorage.removeItem('2fa_verified')
      }
    })

    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .then((authData) => {
          if (authData.record.dois_fa_ativo && sessionStorage.getItem('2fa_verified') !== 'true') {
            setIs2FAVerified(false)
          } else {
            setIs2FAVerified(true)
            sessionStorage.setItem('2fa_verified', 'true')
          }
        })
        .catch(() => {
          pb.authStore.clear()
          setIs2FAVerified(false)
          sessionStorage.removeItem('2fa_verified')
        })
        .finally(() => setLoading(false))
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setLoading(false)
    }
    return () => {
      unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      await pb.collection('users').create({ email, password, passwordConfirm: password })
      await pb.collection('users').authWithPassword(email, password)
      setIs2FAVerified(true)
      sessionStorage.setItem('2fa_verified', 'true')
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      if (authData.record.dois_fa_ativo) {
        setIs2FAVerified(false)
        sessionStorage.removeItem('2fa_verified')
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        await pb.collection('users').update(authData.record.id, { codigo_verificacao: code })
        return { error: null, requires2FA: true }
      } else {
        setIs2FAVerified(true)
        sessionStorage.setItem('2fa_verified', 'true')
        return { error: null, requires2FA: false }
      }
    } catch (error) {
      return { error, requires2FA: false }
    }
  }

  const verify2FA = async (code: string) => {
    try {
      const u = pb.authStore.record
      if (!u) return { error: new Error('Não autenticado') }

      const record = await pb.collection('users').getOne(u.id)
      if (record.codigo_verificacao === code) {
        setIs2FAVerified(true)
        sessionStorage.setItem('2fa_verified', 'true')
        await pb.collection('users').update(u.id, { codigo_verificacao: '' })
        return { error: null }
      }
      return { error: new Error('Código inválido') }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
    setIs2FAVerified(false)
    sessionStorage.removeItem('2fa_verified')
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, is2FAVerified, signUp, signIn, verify2FA, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
