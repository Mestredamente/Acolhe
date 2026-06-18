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
  realUser: any
  impersonatedUser: any
  impersonatedPatient: any
  isDemonstrationMode: boolean
  startImpersonation: (type: 'user' | 'patient', target: any) => Promise<void>
  stopImpersonation: () => Promise<void>
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
  const [impersonatedUser, setImpersonatedUser] = useState<any>(() => {
    const stored = sessionStorage.getItem('impersonated_user')
    return stored ? JSON.parse(stored) : null
  })
  const [impersonatedPatient, setImpersonatedPatient] = useState<any>(() => {
    const stored = sessionStorage.getItem('impersonated_patient')
    return stored ? JSON.parse(stored) : null
  })
  const [impersonationId, setImpersonationId] = useState<string | null>(() => {
    return sessionStorage.getItem('impersonation_id')
  })
  const [is2FAVerified, setIs2FAVerified] = useState<boolean>(() => {
    return sessionStorage.getItem('2fa_verified') === 'true'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Monkey patch pb.send to enforce read-only and data masking rules globally
    const originalSend = pb.send.bind(pb)
    pb.send = async (path: string, options?: any) => {
      const isImpersonating =
        sessionStorage.getItem('impersonated_user') ||
        sessionStorage.getItem('impersonated_patient')
      const isDemonstrationMode = pb.authStore.record?.profile === 'admin' && isImpersonating

      const method = options?.method?.toUpperCase() || 'GET'

      if (isImpersonating && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        if (!path.includes('visualizacoes_impersonate') && !path.includes('audit_logs')) {
          window.dispatchEvent(new CustomEvent('demo-mode-mutation-blocked'))
          return Promise.reject(new Error('Ação bloqueada no modo de visualização'))
        }
      }

      const sensitiveCollections = [
        'patients',
        'appointments',
        'evolucoes',
        'documentos',
        'diario_paciente',
        'respostas_escala',
        'anamneses',
      ]
      const isSensitiveQuery = sensitiveCollections.some((c) =>
        path.includes(`/api/collections/${c}/`),
      )

      if (isDemonstrationMode && method === 'GET' && isSensitiveQuery) {
        window.dispatchEvent(new CustomEvent('demo-mode-blocked'))
        return Promise.reject(new Error('Acesso bloqueado a dados de paciente (LGPD)'))
      }

      return originalSend(path, options)
    }

    const clearImpersonation = () => {
      sessionStorage.removeItem('impersonated_user')
      sessionStorage.removeItem('impersonated_patient')
      sessionStorage.removeItem('impersonation_id')
      setImpersonatedUser(null)
      setImpersonatedPatient(null)
    }

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? record : null)
      setIsAuthenticated(pb.authStore.isValid)
      if (!pb.authStore.isValid) {
        setIs2FAVerified(false)
        sessionStorage.removeItem('2fa_verified')
        clearImpersonation()
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
          clearImpersonation()
        })
        .finally(() => setLoading(false))
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      clearImpersonation()
      setLoading(false)
    }
    return () => {
      unsubscribe()
      pb.send = originalSend
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
      await import('@/services/audit_logs').then((m) =>
        m.createAuditLog({
          usuario_id: authData.record.id,
          acao: 'login',
          tabela_afetada: 'users',
          descricao: 'Tentativa/sucesso de login',
        }),
      )
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
    const userId = pb.authStore.record?.id
    setImpersonatedUser(null)
    setImpersonatedPatient(null)
    setImpersonationId(null)
    sessionStorage.removeItem('impersonated_user')
    sessionStorage.removeItem('impersonated_patient')
    sessionStorage.removeItem('impersonation_id')
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

  const startImpersonation = async (type: 'user' | 'patient', target: any) => {
    try {
      let perfil = type === 'user' ? target.profile : 'paciente'
      const isSaaSAdmin = user?.profile === 'admin'
      const dados_ficticios = isSaaSAdmin && type === 'user'

      const visRecord = await pb.collection('visualizacoes_impersonate').create({
        usuario_admin_id: user.id,
        perfil_visualizado: perfil,
        clinica_id: target.id_clinica || target.expand?.id_clinica?.id || null,
        patient_id: type === 'patient' ? target.id : null,
        dados_ficticios,
        data_inicio: new Date().toISOString(),
      })

      await import('@/services/audit_logs').then((m) =>
        m.createAuditLog({
          usuario_id: user.id,
          acao: 'leitura',
          tabela_afetada: type === 'user' ? 'users' : 'patients',
          registro_id: target.id,
          descricao: `Iniciou impersonation como ${perfil} (${target.name || target.nome})`,
        }),
      )

      setImpersonationId(visRecord.id)
      sessionStorage.setItem('impersonation_id', visRecord.id)

      if (type === 'user') {
        setImpersonatedUser(target)
        sessionStorage.setItem('impersonated_user', JSON.stringify(target))
      } else {
        setImpersonatedPatient(target)
        sessionStorage.setItem('impersonated_patient', JSON.stringify(target))
      }

      window.location.href = type === 'patient' ? '/portal/dashboard' : '/'
    } catch (e) {
      console.error(e)
    }
  }

  const stopImpersonation = async () => {
    try {
      if (impersonationId) {
        await pb
          .collection('visualizacoes_impersonate')
          .update(impersonationId, {
            data_fim: new Date().toISOString(),
          })
          .catch(console.error)
      }

      await import('@/services/audit_logs')
        .then((m) =>
          m.createAuditLog({
            usuario_id: user.id,
            acao: 'leitura',
            tabela_afetada: 'visualizacoes_impersonate',
            descricao: `Encerrou impersonation`,
          }),
        )
        .catch(console.error)

      setImpersonatedUser(null)
      setImpersonatedPatient(null)
      setImpersonationId(null)
      sessionStorage.removeItem('impersonated_user')
      sessionStorage.removeItem('impersonated_patient')
      sessionStorage.removeItem('impersonation_id')

      window.location.href = '/'
    } catch (e) {
      console.error(e)
    }
  }

  const effectiveUser = impersonatedUser || user
  const isDemonstrationMode = user?.profile === 'admin' && impersonatedUser != null

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        realUser: user,
        isAuthenticated,
        is2FAVerified,
        signUp,
        signIn,
        verify2FA,
        signOut,
        loading,
        impersonatedUser,
        impersonatedPatient,
        isDemonstrationMode,
        startImpersonation,
        stopImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
