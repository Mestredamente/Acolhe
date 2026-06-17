import { useEffect, useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  DollarSign,
  PieChart,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { getTransactions, Transaction } from '@/services/financeiro'
import { getAppointments, Appointment } from '@/services/appointments'
import { getPatients, Patient } from '@/services/patients'
import { getConfig, ConfigClinica } from '@/services/config_clinica'
import { getAllEvolucoes, Evolucao } from '@/services/evolucoes'
import { getAllDocumentos, Documento } from '@/services/documentos'
import { getAllRespostas, RespostaEscala } from '@/services/escalas'
import { useAuth } from '@/hooks/use-auth'

const generateMockData = () => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const mPts: any[] = [
    { id: 'm_p1', name: 'Ana Silva', created: firstDay },
    { id: 'm_p2', name: 'Carlos Santos', created: firstDay },
  ]
  const mAppts: any[] = []
  const mTrans: any[] = []
  const mEvos: any[] = []
  const mDocs: any[] = [{ id: 'm_d1', created: firstDay }]
  const mResp: any[] = [{ id: 'm_r1', created: firstDay }]

  for (let i = 1; i <= 20; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), i, 10, 0, 0).toISOString()
    const isPaid = i < 15
    const isConcluida = i < 15
    const pt = i % 2 === 0 ? mPts[0] : mPts[1]

    mAppts.push({
      id: `a${i}`,
      patient_id: pt.id,
      patient_name_text: pt.name,
      appointment_date: d,
      status: isConcluida ? 'concluida' : 'agendada',
      expand: { patient_id: pt },
    })

    if (isConcluida) {
      mEvos.push({
        id: `e${i}`,
        patient_id: pt.id,
        session_date: d,
        created: d,
      })
    }

    mTrans.push({
      id: `t${i}`,
      patient_id: pt.id,
      amount: 150,
      description: `Sessão Psicoterapia - ${i}`,
      due_date: d,
      status: isPaid ? 'pago' : 'pendente',
      payment_method: isPaid ? 'pix' : '',
      expand: { patient_id: pt },
    })
  }

  return { mPts, mAppts, mTrans, mEvos, mDocs, mResp }
}

export default function RelatoriosList() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
  })

  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([])
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [respostas, setRespostas] = useState<RespostaEscala[]>([])
  const [config, setConfig] = useState<ConfigClinica | null>(null)
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [pts, appts, trans, evos, docs, resp, conf] = await Promise.all([
          getPatients(),
          getAppointments(),
          getTransactions(),
          getAllEvolucoes(),
          getAllDocumentos(),
          getAllRespostas(),
          user?.id ? getConfig(user.id) : null,
        ])

        const showMocks = pts.length === 0 && appts.length === 0 && trans.length === 0
        const mocks = showMocks ? generateMockData() : null

        setPatients(showMocks ? mocks!.mPts : pts)
        setAppointments(showMocks ? mocks!.mAppts : appts)
        setTransactions(showMocks ? mocks!.mTrans : trans)
        setEvolucoes(showMocks ? mocks!.mEvos : evos)
        setDocumentos(showMocks ? mocks!.mDocs : docs)
        setRespostas(showMocks ? mocks!.mResp : resp)
        setConfig(conf)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user?.id])

  const start = new Date(`${startDate}T00:00:00Z`)
  const end = new Date(`${endDate}T23:59:59Z`)

  const isWithinPeriod = (dateStr: string | undefined) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    return d >= start && d <= end
  }

  const periodTransactions = useMemo(
    () => transactions.filter((t) => isWithinPeriod(t.due_date || t.created)),
    [transactions, startDate, endDate],
  )
  const periodAppointments = useMemo(
    () => appointments.filter((a) => isWithinPeriod(a.appointment_date || a.created)),
    [appointments, startDate, endDate],
  )
  const periodPatients = useMemo(
    () => patients.filter((p) => isWithinPeriod(p.created)),
    [patients, startDate, endDate],
  )
  const periodEvolucoes = useMemo(
    () => evolucoes.filter((e) => isWithinPeriod(e.session_date || e.created)),
    [evolucoes, startDate, endDate],
  )
  const periodDocumentos = useMemo(
    () => documentos.filter((d) => isWithinPeriod(d.created)),
    [documentos, startDate, endDate],
  )
  const periodRespostas = useMemo(
    () => respostas.filter((r) => isWithinPeriod(r.created)),
    [respostas, startDate, endDate],
  )

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  // Financeiro filters
  const [finPatientId, setFinPatientId] = useState('todos')
  const [finStatus, setFinStatus] = useState('todos')

  const filteredFin = useMemo(() => {
    return periodTransactions.filter((t) => {
      if (
        finPatientId !== 'todos' &&
        t.patient_id !== finPatientId &&
        t.expand?.patient_id?.id !== finPatientId
      )
        return false
      if (finStatus !== 'todos' && t.status !== finStatus) return false
      return true
    })
  }, [periodTransactions, finPatientId, finStatus])

  const totalReceived = filteredFin
    .filter((t) => t.status === 'pago')
    .reduce((a, b) => a + b.amount, 0)
  const totalPending = filteredFin
    .filter((t) => t.status === 'pendente')
    .reduce((a, b) => a + b.amount, 0)
  const totalOverdue = filteredFin
    .filter((t) => t.status === 'atrasado')
    .reduce((a, b) => a + b.amount, 0)

  // Clinical Productivity Stats
  const patientStats = useMemo(() => {
    const map = new Map<string, any>()
    patients.forEach((p) => {
      map.set(p.id, {
        name: p.name,
        appointments: 0,
        evolucoes: 0,
        firstDate: null,
        lastDate: null,
      })
    })

    periodAppointments.forEach((a) => {
      const pId = a.patient_id || a.expand?.patient_id?.id
      if (pId && map.has(pId)) {
        const stats = map.get(pId)
        stats.appointments++
        const d = new Date(a.appointment_date || a.created)
        if (!stats.firstDate || d < stats.firstDate) stats.firstDate = d
        if (!stats.lastDate || d > stats.lastDate) stats.lastDate = d
      }
    })

    periodEvolucoes.forEach((e) => {
      const pId = e.patient_id || e.expand?.patient_id?.id
      if (pId && map.has(pId)) {
        map.get(pId).evolucoes++
      }
    })

    return Array.from(map.values()).filter((s) => s.appointments > 0)
  }, [patients, periodAppointments, periodEvolucoes])

  // Chart
  const chartData = useMemo(() => {
    const map = new Map<string, number>()
    periodTransactions
      .filter((t) => t.status === 'pago')
      .forEach((t) => {
        const d = new Date(t.due_date || t.created).toISOString().split('T')[0]
        map.set(d, (map.get(d) || 0) + t.amount)
      })

    const sorted = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    return sorted.map(([date, value]) => {
      const [y, m, d] = date.split('-')
      return {
        date: `${d}/${m}`,
        revenue: value,
      }
    })
  }, [periodTransactions])

  const chartConfig = {
    revenue: {
      label: 'Receita (R$)',
      color: 'hsl(var(--primary))',
    },
  }

  // Occupancy
  const agendaOccupancy = useMemo(() => {
    const diasAtendimento = config?.dias_atendimento || ['1', '2', '3', '4', '5']
    const inicio = config?.horario_inicio || '08:00'
    const fim = config?.horario_fim || '18:00'
    const duracao = config?.tempo_sessao_minutos || 50
    const intervalo = config?.intervalo_consultas_minutos || 10

    const startHour = parseInt(inicio.split(':')[0]) + parseInt(inicio.split(':')[1]) / 60
    const endHour = parseInt(fim.split(':')[0]) + parseInt(fim.split(':')[1]) / 60
    const minutesPerDay = (endHour - startHour) * 60
    const slotsPerDay = Math.floor(minutesPerDay / (duracao + intervalo))

    let workingDays = 0
    let cur = new Date(start)
    while (cur <= end) {
      if (diasAtendimento.includes(String(cur.getUTCDay()))) {
        workingDays++
      }
      cur.setUTCDate(cur.getUTCDate() + 1)
    }

    const totalSlots = slotsPerDay * workingDays
    const scheduled = periodAppointments.length

    return totalSlots > 0 ? Math.min((scheduled / totalSlots) * 100, 100) : 0
  }, [config, start, end, periodAppointments])

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Gerando relatórios e indicadores...
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 pb-20 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-teal-600" /> Relatórios e Indicadores
        </h1>
        <div className="flex gap-2 items-center bg-white p-1 rounded-md shadow-sm border">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border-none shadow-none h-8 w-auto text-sm"
          />
          <span className="text-muted-foreground text-sm font-medium px-2">até</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border-none shadow-none h-8 w-auto text-sm"
          />
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="dashboard">Dashboard Geral</TabsTrigger>
          <TabsTrigger value="financeiro">Relatório Financeiro</TabsTrigger>
          <TabsTrigger value="clinico">Produtividade Clínica</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-teal-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="w-4 h-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-700">
                  {formatCurrency(
                    periodTransactions
                      .filter((t) => t.status === 'pago')
                      .reduce((a, b) => a + b.amount, 0),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Consultas Concluídas</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {periodAppointments.filter((a) => a.status === 'concluida').length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Novos Pacientes</CardTitle>
                <Users className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{periodPatients.length}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pendente/Atrasado</CardTitle>
                <AlertCircle className="w-4 h-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    periodTransactions
                      .filter((t) => ['pendente', 'atrasado'].includes(t.status))
                      .reduce((a, b) => a + b.amount, 0),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taxa Comparecimento</CardTitle>
                <Activity className="w-4 h-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">
                  {periodAppointments.length > 0
                    ? Math.round(
                        (periodAppointments.filter((a) => a.status === 'concluida').length /
                          periodAppointments.length) *
                          100,
                      )
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-full shadow-sm">
                <CardHeader>
                  <CardTitle>Receita por Dia (Período)</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full mt-4">
                      <BarChart data={chartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis tickFormatter={(value) => `R$ ${value}`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground border-dashed border-2 rounded-md">
                      Nenhuma receita registrada no período.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="h-full shadow-sm">
                <CardHeader>
                  <CardTitle>Ocupação da Agenda</CardTitle>
                  <CardDescription>Capacidade utilizada no período</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-8">
                  <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        className="text-gray-100 stroke-current"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        className="text-teal-600 stroke-current transition-all duration-1000 ease-in-out"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={502}
                        strokeDashoffset={502 - (502 * agendaOccupancy) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-teal-800">
                        {Math.round(agendaOccupancy)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Sessões agendadas: {periodAppointments.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Baseado na configuração de horário e duração de sessões
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Select value={finPatientId} onValueChange={setFinPatientId}>
              <SelectTrigger className="w-full sm:w-[250px] bg-white">
                <SelectValue placeholder="Paciente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Pacientes</SelectItem>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={finStatus} onValueChange={setFinStatus}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">
                  Recebido
                </div>
                <div className="text-3xl font-bold text-teal-600">
                  {formatCurrency(totalReceived)}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">
                  Pendente
                </div>
                <div className="text-3xl font-bold text-amber-600">
                  {formatCurrency(totalPending)}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">
                  Atrasado
                </div>
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(totalOverdue)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Data</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFin.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {new Date(t.due_date || t.created).toLocaleDateString('pt-BR', {
                        timeZone: 'UTC',
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {t.expand?.patient_id?.name || 'Desconhecido'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t.description}</TableCell>
                    <TableCell className="capitalize">{t.payment_method || '-'}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(t.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.status === 'pago'
                            ? 'default'
                            : t.status === 'atrasado'
                              ? 'destructive'
                              : 'outline'
                        }
                        className={
                          t.status === 'pago'
                            ? 'bg-teal-600'
                            : t.status === 'pendente'
                              ? 'text-amber-600 border-amber-600'
                              : ''
                        }
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredFin.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma transação encontrada para os filtros aplicados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="clinico" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total de Atendimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{periodAppointments.length}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-l-4 border-l-teal-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Evoluções Criadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{periodEvolucoes.length}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-l-4 border-l-indigo-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Escalas Aplicadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{periodRespostas.length}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Documentos Gerados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{periodDocumentos.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg">Atendimentos por Paciente</CardTitle>
              <CardDescription>Resumo de sessões e evoluções no período</CardDescription>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Paciente</TableHead>
                  <TableHead>Qtd. Consultas</TableHead>
                  <TableHead>Primeira Sessão</TableHead>
                  <TableHead>Última Sessão</TableHead>
                  <TableHead>Média Evolução/Sessão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientStats.map((s) => (
                  <TableRow key={s.name}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.appointments}</TableCell>
                    <TableCell>
                      {s.firstDate ? s.firstDate.toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell>
                      {s.lastDate ? s.lastDate.toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium">
                        {(s.evolucoes / s.appointments).toFixed(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {patientStats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Sem dados de atendimento para o período.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
