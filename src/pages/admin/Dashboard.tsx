import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  DollarSign,
  LifeBuoy,
  Target as TargetIcon,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Settings,
  Send,
  Download,
  ShieldAlert,
  Loader2,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useBranding } from '@/hooks/use-branding'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const { welcomePhrase } = useBranding()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [mrr, setMrr] = useState(0)
  const [activeSubscribers, setActiveSubscribers] = useState(0)
  const [clinicasCount, setClinicasCount] = useState(0)
  const [autonomosCount, setAutonomosCount] = useState(0)
  const [churnRate, setChurnRate] = useState(0)
  const [openTickets, setOpenTickets] = useState(0)
  const [recentSubscribers, setRecentSubscribers] = useState<any[]>([])
  const [delinquentSubscribers, setDelinquentSubscribers] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  const defaultTab =
    user?.profile === 'admin' || user?.profile === 'gestor_saas' ? 'geral' : 'acesso-negado'
  const [activeTab, setActiveTab] = useState(defaultTab)

  useEffect(() => {
    if (user?.profile === 'admin' || user?.profile === 'gestor_saas') {
      setActiveTab('geral')
    }
  }, [user])

  const loadData = async () => {
    if (user?.profile !== 'admin' && user?.profile !== 'gestor_saas') return
    try {
      setError(null)

      const assinaturas = await pb.collection('saas_assinaturas').getFullList({
        expand: 'user_id,id_clinica,plano_id',
        sort: '-data_inicio',
      })

      // MRR & Active
      let totalMrr = 0
      let activeTotal = 0
      let clinics = 0
      let autonomos = 0

      const activeAssinaturas = assinaturas.filter((a) => a.status === 'ativo')
      for (const a of activeAssinaturas) {
        totalMrr += a.valor_mensal || 0
        activeTotal++
        const tipo = a.expand?.plano_id?.tipo || a.plano
        if (tipo === 'clinica') clinics++
        else autonomos++
      }
      setMrr(totalMrr)
      setActiveSubscribers(activeTotal)
      setClinicasCount(clinics)
      setAutonomosCount(autonomos)

      // Churn
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      const threeMonthsAgoStr = threeMonthsAgo.toISOString()

      const cancelledLast3Months = assinaturas.filter(
        (a) => a.status === 'cancelado' && a.updated >= threeMonthsAgoStr,
      ).length
      const totalAtStart = activeTotal + cancelledLast3Months
      if (totalAtStart > 0) {
        setChurnRate((cancelledLast3Months / totalAtStart) * 100)
      } else {
        setChurnRate(0)
      }

      // Tickets
      const tickets = await pb.collection('suporte_tickets').getList(1, 1, {
        filter: "status = 'aberto' || status = 'em_atendimento'",
      })
      setOpenTickets(tickets.totalItems)

      // Recent
      const recent = assinaturas.slice(0, 5).map((a) => ({
        id: a.id,
        name: a.expand?.id_clinica?.nome || a.expand?.user_id?.name || 'Assinante',
        type:
          a.expand?.plano_id?.tipo === 'clinica' || a.plano === 'clinica' ? 'Clínica' : 'Autônomo',
        plan: a.expand?.plano_id?.nome || a.plano,
        date: new Date(a.data_inicio || a.created).toLocaleDateString('pt-BR'),
        status: a.status.charAt(0).toUpperCase() + a.status.slice(1),
      }))
      setRecentSubscribers(recent)

      // Delinquent
      const delinquent = assinaturas
        .filter((a) => a.status === 'suspenso')
        .map((a) => ({
          id: a.id,
          name: a.expand?.id_clinica?.nome || a.expand?.user_id?.name || 'Assinante Suspenso',
          valor_mensal: a.valor_mensal,
        }))
      setDelinquentSubscribers(delinquent)

      // Audit Logs (optional but used in UI)
      try {
        const logs = await pb.collection('audit_logs').getList(1, 5, { sort: '-created' })
        setAuditLogs(logs.items)
      } catch {
        setAuditLogs([])
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e)
      setError('Erro ao carregar dados do dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (user?.profile !== 'admin' && user?.profile !== 'gestor_saas') {
      setLoading(false)
      return
    }
    loadData()
  }, [authLoading, user])

  useRealtime('saas_assinaturas', () => {
    loadData()
  })

  if (authLoading || loading) {
    return (
      <div className="space-y-6 animate-fade-in pb-10 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-9 w-[300px]" />
            <Skeleton className="h-5 w-[200px] mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
      </div>
    )
  }

  if (user?.profile !== 'admin' && user?.profile !== 'gestor_saas') {
    return <Navigate to="/" replace />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-fade-in">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium text-slate-900">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-[1400px] mx-auto">
      {/* Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Executivo</h1>
          <p className="text-slate-500 mt-1">
            {welcomePhrase || 'Visão gerencial da plataforma SaaS.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/assinantes">
              <Building2 className="w-4 h-4 mr-2" /> Assinantes
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/faturamento">
              <DollarSign className="w-4 h-4 mr-2" /> Financeiro
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="assinantes">Assinantes</TabsTrigger>
        </TabsList>
        <TabsContent value="geral" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="rounded-xl shadow-sm border border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  MRR (Receita Recorrente)
                </CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    mrr,
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">Soma das mensalidades ativas</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Assinantes Ativos
                </CardTitle>
                <Building2 className="h-4 w-4 text-[#1E3A8A]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{activeSubscribers}</div>
                <div className="flex flex-col gap-0.5 mt-1 text-xs text-slate-500">
                  <span>{clinicasCount} Clínicas</span>
                  <span>{autonomosCount} Autônomos</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Taxa de Churn (3m)
                </CardTitle>
                <TargetIcon className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{churnRate.toFixed(1)}%</div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Cancelamentos / Total</p>
              </CardContent>
            </Card>

            <Link
              to="/suporte"
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card className="rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Tickets Abertos
                  </CardTitle>
                  <LifeBuoy className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{openTickets}</div>
                  <p className="text-xs text-amber-600 mt-1 flex items-center font-medium">
                    Ver chamados de suporte <ArrowUpRight className="w-3 h-3 ml-1" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Main Column */}
            <div className="md:col-span-2 space-y-6">
              <Card className="rounded-xl shadow-sm border border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Últimos Assinantes</CardTitle>
                  <Button variant="ghost" size="sm" asChild className="text-[#1E3A8A]">
                    <Link to="/admin/assinantes">Ver todos</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {recentSubscribers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentSubscribers.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium text-slate-900">{sub.name}</TableCell>
                            <TableCell className="text-slate-500">{sub.type}</TableCell>
                            <TableCell>{sub.plan}</TableCell>
                            <TableCell className="text-slate-500">{sub.date}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  sub.status.toLowerCase() === 'Ativo'
                                    ? 'text-green-700 bg-green-50 border-green-200'
                                    : 'text-blue-700 bg-blue-50 border-blue-200'
                                }
                              >
                                {sub.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-slate-500 p-4 text-center">
                      Nenhum assinante encontrado
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-sm border-red-200 bg-red-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-700 flex items-center text-base">
                    <AlertCircle className="w-5 h-5 mr-2" /> Alertas de Inadimplência
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {delinquentSubscribers.length > 0 ? (
                      delinquentSubscribers.map((a) => (
                        <div
                          key={a.id}
                          className="flex justify-between items-center bg-white p-3 rounded-lg border border-red-100 shadow-sm"
                        >
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{a.name}</p>
                            <p className="text-xs text-slate-500">
                              Assinatura suspensa •{' '}
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(a.valor_mensal || 0)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            asChild
                          >
                            <Link to="/admin/inadimplencia">Cobrar</Link>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Nenhum dado disponível</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Column */}
            <div className="space-y-6">
              <Card className="rounded-xl shadow-sm border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-slate-500" /> Logs de Auditoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {auditLogs.length > 0 ? (
                    <div className="space-y-3">
                      {auditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                        >
                          <span className="font-semibold text-slate-900 capitalize">
                            {log.acao}
                          </span>
                          <span className="text-slate-500 ml-1">em {log.tabela_afetada}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Nenhum dado disponível
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-sm border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-slate-500" /> Resumo Contábil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Faturamento Bruto</span>
                      <span className="font-semibold text-slate-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(mrr)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200 font-bold">
                      <span className="text-[#1E3A8A]">Receita Líquida Estimada</span>
                      <span className="text-[#1E3A8A]">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(mrr * 0.94)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="assinantes" className="space-y-6">
          <Card className="rounded-xl shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle>Todos os Assinantes (Amostra)</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSubscribers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSubscribers.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium text-slate-900">{sub.name}</TableCell>
                        <TableCell className="text-slate-500">{sub.type}</TableCell>
                        <TableCell>{sub.plan}</TableCell>
                        <TableCell className="text-slate-500">{sub.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              sub.status.toLowerCase() === 'Ativo'
                                ? 'text-green-700 bg-green-50 border-green-200'
                                : 'text-blue-700 bg-blue-50 border-blue-200'
                            }
                          >
                            {sub.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-slate-500 p-4 text-center">
                  Nenhum assinante encontrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Footer */}
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 flex items-start gap-3 mt-8">
        <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-700">
          <p className="font-semibold text-slate-900 mb-1">Painel Administrativo do SaaS</p>
          <p>
            Dados de pacientes e prontuários clínicos são sigilosos e inacessíveis nesta visão.
            Todas as ações do gestor da plataforma respeitam as diretrizes da LGPD e as normas do
            CFP.
          </p>
        </div>
      </div>
    </div>
  )
}
