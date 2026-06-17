import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Heart, Loader2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

export function PortalOnboarding() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isAuthenticated, user, signOut } = useAuth()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [patientData, setPatientData] = useState<{
    id: string
    name: string
    email: string
  } | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [lgpdAccepted, setLgpdAccepted] = useState(false)
  const [consentAccepted, setConsentAccepted] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/portal/login')
      return
    }

    const checkToken = async () => {
      try {
        const res = await pb.send(`/backend/v1/invites/${token}`, { method: 'GET' })
        setPatientData(res)
        if (res.email) setEmail(res.email)
      } catch (err: any) {
        toast({
          title: 'Convite inválido',
          description: err.message || 'Este link expirou ou não é mais válido.',
          variant: 'destructive',
        })
        navigate('/portal/login')
      } finally {
        setLoading(false)
      }
    }

    checkToken()
  }, [token, navigate, toast])

  useEffect(() => {
    if (isAuthenticated && user?.profile === 'paciente') {
      navigate('/portal', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted || !lgpdAccepted || !consentAccepted) {
      toast({
        title: 'Aceite os termos',
        description: 'Você precisa aceitar todos os termos para prosseguir.',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      if (isAuthenticated) {
        signOut()
      }

      await pb.send(`/backend/v1/invites/${token}/accept`, {
        method: 'POST',
        body: JSON.stringify({ email, password, terms_accepted: true }),
        headers: { 'Content-Type': 'application/json' },
      })

      toast({
        title: 'Conta criada!',
        description: 'Sua conta foi criada com sucesso. Por favor, faça login.',
      })
      navigate('/portal/login')
    } catch (err: any) {
      toast({
        title: 'Erro ao criar conta',
        description: err.message || 'Ocorreu um erro ao processar seu cadastro.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center text-emerald-800">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-4 py-12">
      <Card className="w-full max-w-lg shadow-xl border-emerald-100 bg-white rounded-3xl overflow-hidden">
        <CardHeader className="space-y-3 text-center bg-emerald-50/50 pb-8 pt-10 border-b border-emerald-100">
          <div className="flex justify-center mb-2">
            <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600 shadow-sm">
              <Heart className="w-10 h-10 fill-current" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-emerald-900 tracking-tight">
            Bem-vindo(a) ao Portal
          </CardTitle>
          <CardDescription className="text-emerald-700 text-base">
            Olá, {patientData?.name?.split(' ')[0]}. Conclua seu cadastro para acessar seu espaço
            seguro.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <Label className="text-emerald-900 ml-1">E-mail</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="border-emerald-200 focus-visible:ring-emerald-500 rounded-2xl h-12 px-4 bg-slate-50/50"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label className="text-emerald-900 ml-1">Crie uma Senha</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo de 8 caracteres"
                  className="border-emerald-200 focus-visible:ring-emerald-500 rounded-2xl h-12 px-4 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(c) => setTermsAccepted(c as boolean)}
                  className="mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-emerald-900"
                  >
                    Aceito os Termos de Serviço
                  </label>
                  <p className="text-sm text-emerald-600/80">
                    Concordo com as condições de uso do portal.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="lgpd"
                  checked={lgpdAccepted}
                  onCheckedChange={(c) => setLgpdAccepted(c as boolean)}
                  className="mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="lgpd"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-emerald-900"
                  >
                    Aceito a Política de Privacidade LGPD
                  </label>
                  <p className="text-sm text-emerald-600/80">
                    Autorizo o tratamento dos meus dados para fins clínicos.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consentAccepted}
                  onCheckedChange={(c) => setConsentAccepted(c as boolean)}
                  className="mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="consent"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-emerald-900"
                  >
                    Confirmo o consentimento informado
                  </label>
                  <p className="text-sm text-emerald-600/80">
                    Estou ciente das normas e do formato do tratamento.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-12 text-base font-medium shadow-sm transition-transform active:scale-95"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar conta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
