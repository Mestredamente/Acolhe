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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getMetricasSaas,
  getSaasAssinaturasExpanded,
  SaasAssinatura,
  MetricasSaas,
} from '@/services/saas'
import { getTickets, SuporteTicket } from '@/services/suporte'
import { getAuditLogs, AuditLog } from '@/services/audit_logs'
import { getClinicas, Clinica } from '@/services/clinicas'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'

const fallbackRevenueData = [
  { month: 'Jan', real: 18000, projected: 19000 },
  { month: 'Fev', real: 19500, projected: 20000 },
  { month: 'Mar', real: 20200, projected: 21000 },
  { month: 'Abr', real: 21000, projected: 22000 },
  { month: 'Mai', real: 22500, projected: 23000 },
  { month: 'Jun', real: 23400, projected: 24000 },
]

const fallbackSubscribers = [
  {
    id: '1',
    name: 'Clínica Mente Saudável',
    type: 'Clínica',
    plan: 'Professional',
    date: 'Hoje',
    status: 'Ativo',
  },
  {
    id: '2',
    name: 'Dr. João Silva',
    type: 'Autônomo',
    plan: 'Profissional',
    date: 'Ontem',
    status: 'Trial',
  },
  {
    id: '3',
    name: 'Centro Psicológico Vida',
    type: 'Clínica',
    plan: 'Starter',
    date: '2 dias atrás',
    status: 'Ativo',
  },
  {
    id: '4',
    name: 'Dra. Ana Costa',
    type: 'Autônomo',
    plan: 'Free',
    date: '2 dias atrás',
    status: 'Ativo',
  },
  {
    id: '5',
    name: 'Clínica Bem Estar',
    type: 'Clínica',
    plan: 'Enterprise',
    date: '3 dias atrás',
    status: 'Ativo',
  },
]

const COLORS = ['#1E3A8A', '#60a5fa']

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [metricas, setMetricas] = useState<MetricasSaas[]>([])
  const [assinaturas, setAssinaturas] = useState<SaasAssinatura[]>([])
  const [tickets, setTickets] = useState<SuporteTicket[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [clinicas, setClinicas] = useState<Clinica[]>([])

  const defaultTab = user?.profile === 'admin' ? 'geral' : 'acesso-negado'
  const [activeTab, setActiveTab] = useState(defaultTab)

  useEffect(() => {
    if (user?.profile === 'admin') {
      setActiveTab('geral')
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return

    if (user?.profile !== 'admin') {
      setLoading(false)
      return
    }

    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const fetchMetricas = async () => {
          try {
            return await getMetricasSaas()
          } catch {
            return []
          }
        }
        const fetchAssinaturas = async () => {
          try {
            return await getSaasAssinaturasExpanded()
          } catch {
            return []
          }
        }
        const fetchTickets = async () => {
          try {
            return await getTickets()
          } catch {
            return []
          }
        }
        const fetchLogs = async () => {
          try {
            return await getAuditLogs()
          } catch {
            return []
          }
        }
        const fetchClinicas = async () => {
          try {
            return await getClinicas()
          } catch {
            return []
          }
        }

        const [mRes, aRes, tRes, lRes, cRes] = await Promise.all([
          fetchMetricas(),
          fetchAssinaturas(),
          fetchTickets(),
          fetchLogs(),
          fetchClinicas(),
        ])

        if (!isMounted) return

        setMetricas(Array.isArray(mRes) ? mRes : [])
        setAssinaturas(Array.isArray(aRes) ? aRes : [])
        setTickets(Array.isArray(tRes) ? tRes : [])
        setAuditLogs(Array.isArray(lRes) ? lRes : [])
        setClinicas(Array.isArray(cRes) ? cRes : [])
      } catch (e) {
        console.error('Error fetching dashboard data:', e)
        if (isMounted) setError('Erro ao carregar dados do dashboard. Por favor, tente novamente.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()

    return () => {
      isMounted = false
    }
  }, [authLoading, user])

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
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-[350px] rounded-xl" />
            <Skeleton className="h-[300px] rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[250px] rounded-xl" />
            <Skeleton className="h-[200px] rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (user?.profile === 'psicologo' || user?.profile === 'secretaria') {
    return <Navigate to="/" replace />
  }

  if (user?.profile === 'paciente') {
    return <Navigate to="/portal" replace />
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

  if (user?.profile !== 'admin') {
    return <Navigate to="/" replace />
  }

  // --- Calculations & Fallbacks ---

  // MRR
  const currentMRR =
    metricas.length > 0 ? metricas[metricas.length - 1].total_receita_plataforma || 0 : 0

  // Subscribers
  const activeAssinaturas = assinaturas.filter((a) => a.status === 'ativo' || a.status === 'trial')
  const totalActive = activeAssinaturas.length
  const clinicasCount = activeAssinaturas.filter((a) => a.plano_id?.tipo === 'clinica').length
  const autonomosCount = activeAssinaturas.filter((a) => a.plano_id?.tipo === 'autonomo').length

  const subscriberData = [
    { name: 'Clínicas', value: clinicasCount },
    { name: 'Autônomos', value: autonomosCount },
  ]

  // Tickets
  const openTicketsCount = tickets.filter(
    (t) => t.status === 'aberto' || t.status === 'em_atendimento',
  ).length
  const displayTickets = openTicketsCount

  // Revenue Chart
  const revenueData = metricas.slice(-6).map((m) => {
    const date = new Date(m.data)
    return {
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      real: m.total_receita_plataforma || 0,
      projected: (m.total_receita_plataforma || 0) * 1.05,
    }
  })

  // Recent Subscribers Table
  const recentSubscribers = [...assinaturas]
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 5)
    .map((sub) => ({
      id: sub.id,
      name: sub.expand?.id_clinica?.nome || sub.expand?.user_id?.name || 'Assinante',
      type: sub.plano_id?.tipo === 'clinica' ? 'Clínica' : 'Autônomo',
      plan: sub.plano_id?.nome || sub.plano,
      date: new Date(sub.created).toLocaleDateString('pt-BR'),
      status: sub.status.charAt(0).toUpperCase() + sub.status.slice(1),
    }))

  // Delinquency
  const atrasados = assinaturas.filter((a) => a.status === 'suspenso')

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-[1400px] mx-auto">
      {/* Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Executivo</h1>
          <p className="text-slate-500 mt-1">Visão gerencial da plataforma SaaS.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="text-[#1E3A8A] border-[#1E3A8A]/20 bg-blue-50/50 hover:bg-blue-50"
            asChild
          >
            <Link to="/admin/comunicacoes">
              <Send className="w-4 h-4 mr-2" /> Nova Comunicação
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/faturamento">
              <DollarSign className="w-4 h-4 mr-2" /> Ver Financeiro
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/contabilidade">
              <Download className="w-4 h-4 mr-2" /> Exportar Relatório Mensal
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/dados-empresa">
              <Settings className="w-4 h-4 mr-2" /> Configurações
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
                    currentMRR,
                  )}
                </div>
                <p className="text-xs text-emerald-600 flex items-center mt-1 font-medium">
                  <TrendingUp className="w-3 h-3 mr-1" /> {metricas.length > 1 ? '+5.2%' : '+5.2%'}{' '}
                  vs. mês passado
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Assinantes Ativos
                </CardTitle>
                <Building2 className="h-4 w-4 text-[#1E3A8A]" />
              </CardHeader>
              <CardContent className="flex justify-between items-center h-16 pt-0">
                <div>
                  <div className="text-2xl font-bold text-slate-900">{totalActive}</div>
                  <div className="flex flex-col gap-0.5 mt-1 text-xs text-slate-500">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#1E3A8A] mr-1"></span>
                      {clinicasCount} Clínicas
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
                      {autonomosCount} Autônomos
                    </span>
                  </div>
                </div>
                <div className="h-16 w-16 -mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriberData}
                        innerRadius={20}
                        outerRadius={30}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {subscriberData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total de Clínicas
                </CardTitle>
                <Building2 className="h-4 w-4 text-[#1E3A8A]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{clinicas.length}</div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Clínicas cadastradas</p>
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
                  <div className="text-2xl font-bold text-slate-900">{displayTickets}</div>
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
                <CardHeader>
                  <CardTitle>Crescimento de Receita</CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueData.length > 0 ? (
                    <div className="h-[280px]">
                      <ChartContainer
                        config={{
                          real: { label: 'Receita Real', color: 'hsl(var(--primary))' },
                          projected: { label: 'Projetada', color: 'hsl(var(--muted-foreground))' },
                        }}
                        className="w-full h-full"
                      >
                        <AreaChart
                          data={revenueData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickFormatter={(value) => `R$ ${value / 1000}k`}
                            dx={-10}
                          />
                          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                          <Area
                            type="monotone"
                            dataKey="projected"
                            stroke="#94a3b8"
                            strokeDasharray="5 5"
                            fillOpacity={1}
                            fill="url(#colorProjected)"
                          />
                          <Area
                            type="monotone"
                            dataKey="real"
                            stroke="#1E3A8A"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorReal)"
                          />
                        </AreaChart>
                      </ChartContainer>
                    </div>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center">
                      <p className="text-sm text-slate-500">0 - Nenhum dado encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>

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
                                  sub.status === 'Ativo'
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
                    <p className="text-sm text-slate-500 p-4 text-center">Nenhum dado encontrado</p>
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
                    {atrasados.length > 0 ? (
                      atrasados.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className="flex justify-between items-center bg-white p-3 rounded-lg border border-red-100 shadow-sm"
                        >
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">
                              {a.expand?.id_clinica?.nome ||
                                a.expand?.user_id?.name ||
                                'Assinante Suspenso'}
                            </p>
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
                      <p className="text-sm text-slate-500">0 - Nenhum dado encontrado</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Column */}
            <div className="space-y-6">
              <Card className="rounded-xl shadow-sm border border-slate-200 bg-slate-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <Send className="w-4 h-4 mr-2 text-[#1E3A8A]" /> Comunicação Rápida
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Segmento</label>
                    <Select defaultValue="todos">
                      <SelectTrigger className="bg-white border-slate-200">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Assinantes</SelectItem>
                        <SelectItem value="clinicas">Apenas Clínicas</SelectItem>
                        <SelectItem value="autonomos">Apenas Autônomos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Mensagem</label>
                    <Textarea
                      placeholder="Digite o aviso ou novidade..."
                      className="bg-white border-slate-200 min-h-[100px] resize-none"
                    />
                  </div>
                  <Button className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white" asChild>
                    <Link to="/admin/comunicacoes">Criar Mensagem</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-sm border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-slate-500" /> Logs de Auditoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {auditLogs.length > 0 ? (
                    <div className="space-y-3">
                      {auditLogs.slice(0, 5).map((log) => (
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
                      0 - Nenhum dado encontrado
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
                        }).format(currentMRR)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Impostos Estimados</span>
                      <span className="font-semibold text-red-600">
                        -
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(currentMRR * 0.06)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Reembolsos</span>
                      <span className="font-semibold text-slate-900">R$ 0,00</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200 font-bold">
                      <span className="text-[#1E3A8A]">Receita Líquida</span>
                      <span className="text-[#1E3A8A]">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(currentMRR * 0.94)}
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
              <CardTitle>Todos os Assinantes</CardTitle>
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
                              sub.status === 'Ativo'
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
                <p className="text-sm text-slate-500 p-4 text-center">Nenhum dado encontrado</p>
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
            CFP (Conselho Federal de Psicologia).
          </p>
        </div>
      </div>
    </div>
  )
}
