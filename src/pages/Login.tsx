import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { BrainCircuit, Lock, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export function Login() {
  const { signIn, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('mestredamente1@gmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: 'Verifique suas credenciais ou se o usuário está ativo.',
        variant: 'destructive',
      })
    } else {
      const user = pb.authStore.record
      if (user?.status === 'inativo') {
        pb.authStore.clear()
        toast({ title: 'Acesso negado', description: 'Usuário inativo.', variant: 'destructive' })
        setLoading(false)
        return
      }
      if (user?.profile === 'paciente') navigate('/portal')
      else if (user?.profile === 'secretaria') navigate('/secretaria/dashboard')
      else navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-teal-700 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-teal-800 opacity-20 blur-2xl transform scale-150 rotate-12"></div>
          <BrainCircuit className="w-14 h-14 text-white mx-auto mb-4 relative z-10" />
          <h1 className="text-3xl font-bold text-white tracking-tight relative z-10">
            PsicoGestão
          </h1>
          <p className="text-teal-100 mt-2 text-sm relative z-10">Acesso ao Sistema</p>
        </div>

        <div className="p-8">
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
        </div>
      </div>
    </div>
  )
}
