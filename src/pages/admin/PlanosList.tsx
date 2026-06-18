import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Plus, Edit3 } from 'lucide-react'
import { getSaasPlanos, SaasPlano } from '@/services/saas'

export default function PlanosList() {
  const [planos, setPlanos] = useState<SaasPlano[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        let res = await getSaasPlanos().catch(() => [] as SaasPlano[])
        if (res.length === 0) {
          res = [
            {
              id: '1',
              nome: 'Starter',
              tipo: 'clinica',
              descricao: 'Para clínicas pequenas',
              valor_mensal: 199,
              limite_psicologos: 2,
              status: 'ativo',
              features: ['Agenda', 'Prontuário'],
              created: '',
              updated: '',
            },
            {
              id: '2',
              nome: 'Professional',
              tipo: 'clinica',
              descricao: 'Para clínicas em crescimento',
              valor_mensal: 399,
              limite_psicologos: 5,
              status: 'ativo',
              features: ['Agenda', 'Prontuário', 'Faturamento'],
              created: '',
              updated: '',
            },
            {
              id: '3',
              nome: 'Enterprise',
              tipo: 'clinica',
              descricao: 'Para grandes clínicas',
              valor_mensal: 799,
              limite_psicologos: 999,
              status: 'ativo',
              features: ['Tudo ilimitado'],
              created: '',
              updated: '',
            },
            {
              id: '4',
              nome: 'Free',
              tipo: 'autonomo',
              descricao: 'Gratuito para começar',
              valor_mensal: 0,
              limite_psicologos: 1,
              status: 'ativo',
              features: ['Agenda básica'],
              created: '',
              updated: '',
            },
            {
              id: '5',
              nome: 'Profissional',
              tipo: 'autonomo',
              descricao: 'Funcionalidades avançadas',
              valor_mensal: 99,
              limite_psicologos: 1,
              status: 'ativo',
              features: ['Prontuário IA', 'Faturamento'],
              created: '',
              updated: '',
            },
          ]
        }
        setPlanos(res)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const clinicasPlans = planos.filter((p) => p.tipo === 'clinica' && p.status === 'ativo')
  const autonomosPlans = planos.filter((p) => p.tipo === 'autonomo' && p.status === 'ativo')

  const PlanCard = ({ plan }: { plan: SaasPlano }) => (
    <Card className="flex flex-col h-full rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl font-bold text-slate-900">{plan.nome}</CardTitle>
          <Badge variant="secondary">{plan.status}</Badge>
        </div>
        <CardDescription className="h-10">{plan.descricao}</CardDescription>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-[#1E3A8A]">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              plan.valor_mensal,
            )}
          </span>
          <span className="text-sm text-slate-500 font-medium">/mês</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-4 text-sm font-medium text-slate-700">
          Limite de Profissionais:{' '}
          {plan.limite_psicologos === 999 ? 'Ilimitado' : plan.limite_psicologos}
        </div>
        <ul className="space-y-3 text-sm text-slate-600">
          {plan.features?.map((feature, idx) => (
            <li key={idx} className="flex gap-2">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full text-[#1E3A8A] border-[#1E3A8A]/20 hover:bg-blue-50"
        >
          <Edit3 className="w-4 h-4 mr-2" /> Editar Plano
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Planos e Preços</h1>
          <p className="text-slate-500 mt-1">Configure as ofertas e limites do SaaS.</p>
        </div>
        <Button className="bg-[#1E3A8A] hover:bg-blue-800 text-white">
          <Plus className="h-4 w-4 mr-2" /> Novo Plano
        </Button>
      </div>

      <Tabs defaultValue="clinicas" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="clinicas">Planos para Clínicas</TabsTrigger>
          <TabsTrigger value="autonomos">Planos para Autônomos</TabsTrigger>
        </TabsList>
        <div className="mt-8">
          <TabsContent value="clinicas" className="m-0">
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {clinicasPlans.map((p) => (
                  <PlanCard key={p.id} plan={p} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="autonomos" className="m-0">
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {autonomosPlans.map((p) => (
                  <PlanCard key={p.id} plan={p} />
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
