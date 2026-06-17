import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Heart, ShieldCheck } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export function PortalLogin() {
  const { signIn, verify2FA, isAuthenticated, is2FAVerified, user, signOut } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('ana.silva@email.com')
  const [loading, setLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(isAuthenticated && is2FAVerified)

  const [step, setStep] = useState<'login' | '2fa'>('login')
  const [code, setCode] = useState('')
  const [simulatedCode, setSimulatedCode] = useState('')

  useEffect(() => {
    if (isAuthenticated && is2FAVerified && user?.email) {
      pb.collection('patients')
        .getFirstListItem(`email="${user.email}"`)
        .then(() => navigate('/portal', { replace: true }))
        .catch(() => setIsChecking(false))
    } else {
      setIsChecking(false)
    }
  }, [isAuthenticated, is2FAVerified, user, navigate])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error, requires2FA } = await signIn(email, 'Skip@Pass')
    if (error) {
      toast({
        title: 'Erro ao acessar',
        description: 'Não foi possível encontrar seu acesso.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    if (requires2FA) {
      setStep('2fa')
      setSimulatedCode(pb.authStore.record?.codigo_verificacao || '')
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

  if (isChecking)
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center text-emerald-800">
        Verificando acesso...
      </div>
    )

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-emerald-100 bg-white rounded-3xl overflow-hidden">
        <CardHeader className="space-y-3 text-center bg-emerald-50/50 pb-8 pt-10 border-b border-emerald-100">
          <div className="flex justify-center mb-2">
            <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600 shadow-sm">
              {step === 'login' ? (
                <Heart className="w-10 h-10 fill-current" />
              ) : (
                <ShieldCheck className="w-10 h-10" />
              )}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-emerald-900 tracking-tight">
            {step === 'login' ? 'Portal do Paciente' : 'Verificação de Segurança'}
          </CardTitle>
          <CardDescription className="text-emerald-700 text-base">
            {step === 'login'
              ? 'Acesse seu espaço seguro e acolhedor'
              : 'Confirme sua identidade para continuar'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-10">
          {isAuthenticated && user && !is2FAVerified && step === '2fa' ? (
            <form onSubmit={handle2FASubmit} className="space-y-6">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                <p className="text-xs text-emerald-600 font-semibold mb-2 uppercase tracking-wider">
                  Simulated Display (Código Gerado)
                </p>
                <p className="text-4xl font-mono tracking-widest font-bold text-emerald-900">
                  {simulatedCode}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-center block text-emerald-900">
                  Digite o código de 6 dígitos enviado para seu e-mail
                </Label>
                <Input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-3xl tracking-widest h-14 border-emerald-200 focus-visible:ring-emerald-500 rounded-xl bg-slate-50/50"
                  placeholder="000000"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-12 text-base font-medium shadow-sm transition-transform active:scale-95"
                disabled={loading || code.length < 6}
              >
                {loading ? 'Verificando...' : 'Confirmar Código'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full h-12"
                onClick={() => {
                  signOut()
                  setStep('login')
                  setCode('')
                }}
              >
                Voltar
              </Button>
            </form>
          ) : isAuthenticated && user && is2FAVerified ? (
            <div className="text-center space-y-5">
              <p className="text-slate-700 leading-relaxed">
                Você está conectado(a) como <span className="font-semibold">{user.email}</span>, mas
                não possui um perfil de paciente vinculado.
              </p>
              <div className="space-y-3 pt-3">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full border-emerald-200 text-emerald-800 hover:bg-emerald-50 rounded-full h-12 text-base"
                >
                  Ir para Painel da Clínica
                </Button>
                <Button
                  onClick={() => signOut()}
                  variant="ghost"
                  className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-full h-12 text-base"
                >
                  Sair da Conta
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 text-left">
                <label className="text-sm font-semibold text-emerald-900 ml-1">
                  E-mail de Acesso
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="border-emerald-200 focus-visible:ring-emerald-500 rounded-2xl h-12 px-4 bg-slate-50/50"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-12 text-base font-medium shadow-sm transition-transform active:scale-95"
                disabled={loading}
              >
                {loading ? 'Acessando...' : 'Entrar no Portal'}
              </Button>
              <p className="text-sm text-center text-emerald-600/70 pt-4 px-4 leading-relaxed">
                Acesso direto demonstrativo. A senha é preenchida automaticamente.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
