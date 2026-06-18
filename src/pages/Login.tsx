import { useState, useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { BrainCircuit, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export function Login() {
  const { signIn, verify2FA, isAuthenticated, is2FAVerified, signOut } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('mestredamente1@gmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'login' | '2fa'>('login')
  const [code, setCode] = useState('')
  const [simulatedCode, setSimulatedCode] = useState('')

  useEffect(() => {
    sessionStorage.removeItem('impersonated_user')
    sessionStorage.removeItem('impersonated_patient')
    sessionStorage.removeItem('impersonation_id')
  }, [])

  useEffect(() => {
    if (isAuthenticated && !is2FAVerified && step === 'login') {
      setStep('2fa')
      const generateCode = async () => {
        const u = pb.authStore.record
        if (u) {
          const c = Math.floor(100000 + Math.random() * 900000).toString()
          await pb.collection('users').update(u.id, { codigo_verificacao: c })
          setSimulatedCode(c)
        }
      }
      generateCode()
    }
  }, [isAuthenticated, is2FAVerified, step])

  if (isAuthenticated && is2FAVerified) {
    const u = pb.authStore.record
    if (u?.profile === 'paciente') return <Navigate to="/portal" replace />
    if (u?.profile === 'secretaria') return <Navigate to="/secretaria/dashboard" replace />
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error, requires2FA } = await signIn(email, password)

    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: 'Credenciais inválidas. Verifique seu e-mail e senha.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    const user = pb.authStore.record
    if (user?.status === 'inativo') {
      signOut()
      toast({
        title: 'Acesso negado',
        description: 'Usuário inativo. Por favor, entre em contato com o administrador.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    if (requires2FA) {
      setStep('2fa')
      setSimulatedCode(user?.codigo_verificacao || '')
      setLoading(false)
      return
    }

    setLoading(false)
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await verify2FA(code)
    if (error) {
      toast({
        title: 'Código incorreto',
        description: 'Por favor, tente novamente.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-teal-700 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-teal-800 opacity-20 blur-2xl transform scale-150 rotate-12"></div>
          {step === 'login' ? (
            <BrainCircuit className="w-14 h-14 text-white mx-auto mb-4 relative z-10" />
          ) : (
            <ShieldCheck className="w-14 h-14 text-white mx-auto mb-4 relative z-10" />
          )}
          <h1 className="text-3xl font-bold text-white tracking-tight relative z-10">
            {step === 'login' ? 'PsicoGestão' : 'Verificação Segura'}
          </h1>
          <p className="text-teal-100 mt-2 text-sm relative z-10">
            {step === 'login' ? 'Acesso ao Sistema' : 'Protegendo sua conta'}
          </p>
        </div>

        <div className="p-8">
          {step === 'login' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Senha</label>
                  <Link to="#" className="text-xs text-teal-600 hover:text-teal-700">
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white py-6 text-lg"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wider">
                  Simulated Display (Código Gerado)
                </p>
                <p className="text-4xl font-mono tracking-widest font-bold text-slate-800">
                  {simulatedCode}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-center block text-slate-700">
                  Digite o código de 6 dígitos enviado para seu e-mail
                </Label>
                <Input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-3xl tracking-widest h-14"
                  placeholder="000000"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white py-6 text-lg"
                disabled={loading || code.length < 6}
              >
                {loading ? 'Verificando...' : 'Confirmar Código'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-slate-500 hover:text-slate-700"
                onClick={() => {
                  signOut()
                  setStep('login')
                  setCode('')
                }}
              >
                Voltar para Login
              </Button>
            </form>
          )}

          {step === 'login' && (
            <>
              <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                <Button
                  variant="outline"
                  className="w-full text-teal-700 border-teal-200 hover:bg-teal-50"
                  onClick={() => navigate('/portal/login')}
                >
                  Acesso para Paciente
                </Button>
              </div>
              <div className="mt-6 text-center space-y-2">
                <p className="text-xs text-slate-500">
                  Ao acessar, você concorda com os termos de uso e política de privacidade.
                </p>
                <Link to="#" className="text-xs text-teal-600 hover:underline block font-medium">
                  Termo de Consentimento LGPD
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
