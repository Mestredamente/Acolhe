import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, DollarSign, AlertTriangle } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-700">
          <p className="font-semibold text-slate-900 mb-1">Modo de Simulação e Privacidade</p>
          <p>
            Visualizar como permite testar a jornada do usuário sem logout. Dados de paciente são
            sempre fictícios para o gestor da plataforma. Ações são registradas para auditoria.
            Nenhum dado real é exposto.
          </p>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard SaaS</h1>
        <p className="text-slate-500 mt-1">Visão geral da plataforma.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clínicas Ativas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">148</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Recorrente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 4.250</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
