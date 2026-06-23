import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrainCircuit, Mail, Lock, User, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'autonomo' as 'autonomo' | 'clinica',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' })
      return
    }

    setLoading(true)
    setFieldErrors({})
    try {
      const profile = formData.type === 'autonomo' ? 'psicologo' : 'owner_clinica'

      await pb.collection('users').create({
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
        name: formData.name,
        profile: profile,
        status: 'ativo',
      })

      toast({
        title: 'Sucesso',
        description: 'Conta criada com sucesso! Faça login para acessar o sistema.',
      })
      navigate('/login')
    } catch (error: any) {
      const errors = extractFieldErrors(error)

      if (error?.response?.data?.email?.code === 'validation_not_unique') {
        errors.email = 'Este e-mail já está cadastrado no sistema.'
      }

      setFieldErrors(errors)

      if (Object.keys(errors).length === 0) {
        toast({
          title: 'Erro',
          description: 'Erro ao criar conta. Verifique os dados.',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-blue-900 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-950 opacity-20 blur-2xl transform scale-150 rotate-12"></div>
          <BrainCircuit className="w-14 h-14 text-white mx-auto mb-4 relative z-10" />
          <h1 className="text-3xl font-bold text-white tracking-tight relative z-10">Nova Conta</h1>
          <p className="text-blue-100 mt-2 text-sm relative z-10">
            Junte-se à plataforma de Gestão Clínica
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-slate-700">
                Como você deseja usar a plataforma?
              </Label>
              <RadioGroup
                defaultValue="autonomo"
                value={formData.type}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, type: val as 'autonomo' | 'clinica' }))
                }
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="autonomo" id="autonomo" className="peer sr-only" />
                  <Label
                    htmlFor="autonomo"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 bg-transparent p-4 hover:bg-slate-50 hover:text-slate-900 peer-data-[state=checked]:border-blue-900 peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:text-blue-900 cursor-pointer transition-colors"
                  >
                    <User className="mb-3 h-6 w-6" />
                    <span className="text-sm font-medium">Autônomo</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="clinica" id="clinica" className="peer sr-only" />
                  <Label
                    htmlFor="clinica"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 bg-transparent p-4 hover:bg-slate-50 hover:text-slate-900 peer-data-[state=checked]:border-blue-900 peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:text-blue-900 cursor-pointer transition-colors"
                  >
                    <Building2 className="mb-3 h-6 w-6" />
                    <span className="text-sm font-medium">Clínica</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Nome Completo</Label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={cn('pl-10', fieldErrors.name && 'border-red-500')}
                  placeholder="Seu nome"
                  required
                />
              </div>
              {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Email</Label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={cn('pl-10', fieldErrors.email && 'border-red-500')}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-red-500">
                  {fieldErrors.email}
                  {fieldErrors.email.includes('cadastrado') && (
                    <span className="ml-1">
                      <Link to="/login" className="underline font-bold hover:text-red-700">
                        Faça login
                      </Link>
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Senha</Label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={cn('pl-10', fieldErrors.password && 'border-red-500')}
                    placeholder="Min. 8 chars"
                    required
                    minLength={8}
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-red-500">{fieldErrors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={cn('pl-10', fieldErrors.passwordConfirm && 'border-red-500')}
                    placeholder="Repita a senha"
                    required
                    minLength={8}
                  />
                </div>
                {fieldErrors.passwordConfirm && (
                  <p className="text-sm text-red-500">{fieldErrors.passwordConfirm}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-800 text-white py-6 text-lg mt-2"
              disabled={loading}
            >
              {loading ? 'Criando Conta...' : 'Criar Conta'}
            </Button>

            <div className="mt-4 text-center border-t border-slate-100 pt-5">
              <p className="text-sm text-slate-600">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-blue-900 hover:text-blue-800 hover:underline"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
