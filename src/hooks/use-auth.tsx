import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  is2FAVerified: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: any; requires2FA?: boolean; simulatedCode?: string }>
  verify2FA: (code: string, trustDevice?: boolean) => Promise<{ error: any }>
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

  const generateDeviceId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const signIn = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      await import('@/services/audit_logs').then((m) =>
        m.createAuditLog({
          usuario_id: authData.record.id,
          acao: 'login',
          tabela_afetada: 'users',
          descricao: 'Tentativa/sucesso de login',
        }),
      )

      if (authData.record.dois_fa_ativo) {
        let deviceId = localStorage.getItem('device_identifier')
        if (!deviceId) {
          deviceId = generateDeviceId()
          localStorage.setItem('device_identifier', deviceId)
        }

        try {
          const nowStr = new Date().toISOString().replace('T', ' ')
          const trusted = await pb
            .collection('dispositivos_confiaveis')
            .getFirstListItem(
              `user_id = "${authData.record.id}" && device_identifier = "${deviceId}" && expires_at > "${nowStr}"`,
            )
          if (trusted) {
            setIs2FAVerified(true)
            sessionStorage.setItem('2fa_verified', 'true')
            return { error: null, requires2FA: false }
          }
        } catch (e) {
          // not trusted or not found
        }

        setIs2FAVerified(false)
        sessionStorage.removeItem('2fa_verified')

        const res = await pb.send('/backend/v1/auth/request-2fa', { method: 'POST' })

        return { error: null, requires2FA: true, simulatedCode: res.simulatedCode }
      } else {
        setIs2FAVerified(true)
        sessionStorage.setItem('2fa_verified', 'true')
        return { error: null, requires2FA: false }
      }
    } catch (error) {
      return { error, requires2FA: false }
    }
  }

  const verify2FA = async (code: string, trustDevice: boolean = false) => {
    try {
      const u = pb.authStore.record
      if (!u) return { error: new Error('Não autenticado') }

      const record = await pb.collection('users').getOne(u.id)
      if (record.codigo_verificacao === code) {
        setIs2FAVerified(true)
        sessionStorage.setItem('2fa_verified', 'true')
        await pb.collection('users').update(u.id, { codigo_verificacao: '' })

        if (trustDevice) {
          let deviceId = localStorage.getItem('device_identifier')
          if (!deviceId) {
            deviceId = generateDeviceId()
            localStorage.setItem('device_identifier', deviceId)
          }
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 30)

          await pb.collection('dispositivos_confiaveis').create({
            user_id: u.id,
            device_identifier: deviceId,
            expires_at: expiresAt.toISOString(),
          })
        }

        return { error: null }
      }
      return { error: new Error('Código inválido') }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    const userId = pb.authStore.record?.id
    if (userId) {
      import('@/services/audit_logs')
        .then((m) =>
          m.createAuditLog({
            usuario_id: userId,
            acao: 'logout',
            tabela_afetada: 'users',
            descricao: 'Logout efetuado',
          }),
        )
        .finally(() => {
          pb.authStore.clear()
          setIs2FAVerified(false)
          sessionStorage.removeItem('2fa_verified')
        })
    } else {
      pb.authStore.clear()
      setIs2FAVerified(false)
      sessionStorage.removeItem('2fa_verified')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        is2FAVerified,
        signUp,
        signIn,
        verify2FA,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
