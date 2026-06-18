import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrainCircuit, Building2, User, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'

export function Register() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [tipo, setTipo] = useState<'clinica' | 'autonomo' | null>(null)
  const [planos, setPlanos] = useState<any[]>([])
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    nome_clinica: '',
    nome_admin: '',
    cnpj_cpf: '',
    telefone: '',
    cep: '',
    logradouro: '',
    cidade: '',
    estado: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (pb.authStore.isValid) {
      pb.authStore.clear()
    }

    pb.collection('saas_planos')
      .getFullList({ sort: 'valor_mensal', filter: 'status="ativo"' })
      .then((data) => setPlanos(data))
      .catch((err) => {
        console.error('Error loading plans:', err)
      })
  }, [])

  const handleNextStep = () => {
    if (step === 1 && !tipo) return
    if (step === 2 && !selectedPlan) return
    setStep((s) => s + 1)
  }

  const handlePrevStep = () => {
    setStep((s) => Math.max(1, s - 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrs: Record<string, string> = {}

    if (formData.password !== formData.confirmPassword) {
      newErrs.confirmPassword = 'As senhas não coincidem'
    }
    if (formData.password.length < 8) {
      newErrs.password = 'A senha deve ter no mínimo 8 caracteres'
    }

    const docDigits = formData.cnpj_cpf.replace(/\D/g, '')
    if (tipo === 'clinica' && docDigits.length !== 14) {
      newErrs.cnpj_cpf = 'CNPJ inválido (14 dígitos)'
    }
    if (tipo === 'autonomo' && docDigits.length !== 11) {
      newErrs.cnpj_cpf = 'CPF inválido (11 dígitos)'
    }

    if (Object.keys(newErrs).length > 0) {
      setErrors(newErrs)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      await pb.send('/backend/v1/register', {
        method: 'POST',
        body: JSON.stringify({
          tipo,
          plano_id: selectedPlan.id,
          clinic_data: {
            nome: tipo === 'clinica' ? formData.nome_clinica : formData.nome_admin,
            cnpj_cpf: docDigits,
            telefone: formData.telefone,
            cep: formData.cep,
            logradouro: formData.logradouro,
            cidade: formData.cidade,
            estado: formData.estado,
            email: formData.email,
          },
          user_data: {
            name: formData.nome_admin,
            email: formData.email,
            password: formData.password,
          },
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      toast({
        title: 'Sucesso',
        description: 'Conta criada com sucesso! Faça login para acessar o sistema.',
      })
      navigate('/login')
    } catch (err: any) {
      const msg = err?.response?.message || err.message || 'Ocorreu um erro ao realizar o cadastro.'
      toast({
        title: 'Erro no cadastro',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="mb-8 flex items-center justify-center">
        <BrainCircuit className="w-10 h-10 text-blue-900 mr-3" />
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">PsicoGestão</h1>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {step < 4 && (
          <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevStep}
                className="-ml-3 text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center space-x-2 text-sm font-medium text-slate-500">
              <span className={cn(step >= 1 ? 'text-blue-900' : '')}>Perfil</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
              <span className={cn(step >= 2 ? 'text-blue-900' : '')}>Plano</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
              <span className={cn(step >= 3 ? 'text-blue-900' : '')}>Dados</span>
            </div>
            <div />
          </div>
        )}

        <div className="p-8">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
                Qual é o seu perfil?
              </h2>
              <p className="text-slate-500 text-center mb-8">
                Escolha a opção que melhor descreve sua forma de atuação.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                  className={cn(
                    'cursor-pointer transition-all border-2 hover:border-blue-400',
                    tipo === 'clinica'
                      ? 'border-blue-900 bg-blue-50/50 shadow-md'
                      : 'border-slate-200 bg-white hover:shadow-md',
                  )}
                  onClick={() => setTipo('clinica')}
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div
                      className={cn(
                        'w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors',
                        tipo === 'clinica' ? 'bg-blue-900 text-white' : 'bg-blue-50 text-blue-900',
                      )}
                    >
                      <Building2 className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900">Clínica</h3>
                    <p className="text-sm text-slate-500">
                      Tenho uma clínica com múltiplos profissionais e necessito de gestão
                      centralizada.
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={cn(
                    'cursor-pointer transition-all border-2 hover:border-blue-400',
                    tipo === 'autonomo'
                      ? 'border-blue-900 bg-blue-50/50 shadow-md'
                      : 'border-slate-200 bg-white hover:shadow-md',
                  )}
                  onClick={() => setTipo('autonomo')}
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div
                      className={cn(
                        'w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors',
                        tipo === 'autonomo' ? 'bg-blue-900 text-white' : 'bg-blue-50 text-blue-900',
                      )}
                    >
                      <User className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900">Autônomo</h3>
                    <p className="text-sm text-slate-500">
                      Sou psicólogo(a) independente e gerencio meus próprios pacientes.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-10 flex justify-center">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-12 bg-blue-900 hover:bg-blue-800"
                  disabled={!tipo}
                  onClick={handleNextStep}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
                Escolha seu Plano
              </h2>
              <p className="text-slate-500 text-center mb-8">
                Selecione o plano ideal para suas necessidades.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {planos
                  .filter((p) => p.tipo === tipo)
                  .map((p) => (
                    <Card
                      key={p.id}
                      className={cn(
                        'cursor-pointer transition-all border-2 hover:border-blue-400 flex flex-col',
                        selectedPlan?.id === p.id
                          ? 'border-blue-900 ring-2 ring-blue-900/20 bg-blue-50/20 shadow-md'
                          : 'border-slate-200 hover:shadow-md',
                      )}
                      onClick={() => setSelectedPlan(p)}
                    >
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg text-slate-900">{p.nome}</h3>
                        <div className="mt-4 mb-4">
                          <span className="text-3xl font-extrabold text-blue-900">
                            R$ {p.valor_mensal}
                          </span>
                          <span className="text-sm text-slate-500">/mês</span>
                        </div>
                        <p className="text-sm text-slate-600 flex-1">{p.descricao}</p>
                        <div className="mt-6 space-y-2 text-xs text-slate-600">
                          <div className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                            Até {p.limite_psicologos > 900
                              ? 'Ilimitados'
                              : p.limite_psicologos}{' '}
                            profissionais
                          </div>
                          <div className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                            Até {p.limite_pacientes > 9000 ? 'Ilimitados' : p.limite_pacientes}{' '}
                            pacientes
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {planos.filter((p) => p.tipo === tipo).length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-500">
                    Nenhum plano encontrado para este perfil no momento.
                  </div>
                )}
              </div>

              <div className="mt-10 flex justify-center">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-12 bg-blue-900 hover:bg-blue-800"
                  disabled={!selectedPlan}
                  onClick={handleNextStep}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Seus Dados</h2>
              <p className="text-slate-500 text-center mb-8">
                Preencha as informações para criar sua conta.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl space-y-4 border border-slate-100">
                  <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider mb-4">
                    {tipo === 'clinica' ? 'Dados da Clínica' : 'Dados Profissionais'}
                  </h3>

                  {tipo === 'clinica' && (
                    <div className="space-y-2">
                      <Label>Nome da Clínica (Razão Social/Fantasia)</Label>
                      <Input
                        required
                        value={formData.nome_clinica}
                        onChange={(e) => setFormData({ ...formData, nome_clinica: e.target.value })}
                        placeholder="Ex: Clínica Mente Saudável"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{tipo === 'clinica' ? 'CNPJ' : 'CPF'}</Label>
                      <Input
                        required
                        value={formData.cnpj_cpf}
                        onChange={(e) => setFormData({ ...formData, cnpj_cpf: e.target.value })}
                        placeholder={tipo === 'clinica' ? '00.000.000/0000-00' : '000.000.000-00'}
                        className={errors.cnpj_cpf ? 'border-red-500' : ''}
                      />
                      {errors.cnpj_cpf && <p className="text-xs text-red-500">{errors.cnpj_cpf}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        required
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <Input
                        value={formData.cep}
                        onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Cidade</Label>
                      <Input
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        placeholder="São Paulo"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl space-y-4 border border-slate-100">
                  <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider mb-4">
                    Dados de Acesso (Administrador)
                  </h3>

                  <div className="space-y-2">
                    <Label>Seu Nome Completo</Label>
                    <Input
                      required
                      value={formData.nome_admin}
                      onChange={(e) => setFormData({ ...formData, nome_admin: e.target.value })}
                      placeholder="Maria Silva"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>E-mail (Login)</Label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="maria@exemplo.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Senha</Label>
                      <Input
                        required
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmar Senha</Label>
                      <Input
                        required
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end pt-4 border-t border-slate-100">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto px-12 bg-blue-900 hover:bg-blue-800"
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Finalizar Cadastro'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Já tem uma conta?{' '}
        <Link to="/login" className="text-blue-900 font-medium hover:underline">
          Faça login
        </Link>
      </p>
    </div>
  )
}
