import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Heart } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export function PortalLogin() {
  const { signIn, isAuthenticated, user, signOut } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('ana.silva@email.com')
  const [loading, setLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(isAuthenticated)

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      pb.collection('patients')
        .getFirstListItem(`email="${user.email}"`)
        .then(() => navigate('/portal', { replace: true }))
        .catch(() => setIsChecking(false))
    } else {
      setIsChecking(false)
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, 'Skip@Pass')
    if (error) {
      toast({
        title: 'Erro ao acessar',
        description: 'Não foi possível encontrar seu acesso.',
        variant: 'destructive',
      })
      setLoading(false)
    }
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
              <Heart className="w-10 h-10 fill-current" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-emerald-900 tracking-tight">
            Portal do Paciente
          </CardTitle>
          <CardDescription className="text-emerald-700 text-base">
            Acesse seu espaço seguro e acolhedor
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-10">
          {isAuthenticated && user ? (
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
