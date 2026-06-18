import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  Activity,
  ShieldAlert,
  BarChart3,
  AlertTriangle,
  PauseCircle,
  Download,
} from 'lucide-react'
import { getClinicas, Clinica } from '@/services/clinicas'
import { getUsers, User } from '@/services/users'
import { getPatients, Patient } from '@/services/patients'
import { getAppointments, Appointment } from '@/services/appointments'
import {
  getSaasAssinaturas,
  updateSaasAssinatura,
  getMetricasSaas,
  SaasAssinatura,
  MetricasSaas,
} from '@/services/saas'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

const PLAN_DETAILS = {
  free: { name: 'Free', preco: 0, limite: 1 },
  profissional: { name: 'Profissional', preco: 97, limite: 1 },
  clinica: { name: 'Clínica', preco: 297, limite: 5 },
  corporativo: { name: 'Corporativo', preco: 997, limite: 20 },
}

const chartConfig = {
  clinicas: {
    label: 'Clínicas Ativas',
    color: '#1E40AF',
  },
}

export default function AdminDashboard() {
  const [clinicas, setClinicas] = useState<Clinica[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [assinaturas, setAssinaturas] = useState<SaasAssinatura[]>([])
  const [metricas, setMetricas] = useState<MetricasSaas[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAssinatura, setSelectedAssinatura] = useState<SaasAssinatura | null>(null)
  const [newPlan, setNewPlan] = useState<string>('')

  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [cRes, uRes, pRes, aRes, assRes, mRes] = await Promise.all([
        getClinicas(),
        getUsers(),
        getPatients(),
        getAppointments(),
        getSaasAssinaturas(),
        getMetricasSaas(),
      ])
      setClinicas(cRes)
      setUsers(uRes)
      setPatients(pRes)
      setAppointments(aRes)
      setAssinaturas(assRes)
      setMetricas(mRes)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const kpis = useMemo(() => {
    const totalClinicas = clinicas.filter((c) => c.status === 'ativa').length
    const totalPsicologos = users.filter(
      (u) => u.profile === 'psicologo' && u.status === 'ativo',
    ).length
    const totalPacientes = patients.length

    const thisMonth = new Date().getMonth()
    const consultasMes = appointments.filter(
      (a) =>
        a.status === 'concluida' &&
        new Date(a.appointment_date || a.created).getMonth() === thisMonth,
    ).length

    const receita = assinaturas
      .filter((a) => a.status === 'ativo')
      .reduce((acc, a) => acc + (a.valor_mensal || 0), 0)

    let growth = 0
    if (metricas.length >= 2) {
      const last = metricas[metricas.length - 1].total_receita_plataforma
      const prev = metricas[metricas.length - 2].total_receita_plataforma
      if (prev > 0) {
        growth = ((last - prev) / prev) * 100
      }
    }

    return { totalClinicas, totalPsicologos, totalPacientes, consultasMes, receita, growth }
  }, [clinicas, users, patients, appointments, assinaturas, metricas])

  const chartData = useMemo(() => {
    return metricas.map((m) => ({
      month: format(new Date(m.data), 'MMM/yy', { locale: ptBR }),
      clinicas: m.total_clinicas_ativas,
      receita: m.total_receita_plataforma,
    }))
  }, [metricas])

  const alerts = useMemo(() => {
    const now = new Date()
    const list: any[] = []

    assinaturas.forEach((ass) => {
      const clinica = ass.expand?.id_clinica
      if (!clinica) return

      if (ass.status === 'trial' && ass.data_renovacao) {
        const daysLeft = differenceInDays(new Date(ass.data_renovacao), now)
        if (daysLeft >= 0 && daysLeft <= 7) {
          list.push({
            id: ass.id,
            type: 'yellow',
            clinicaName: clinica.nome,
            message: `Trial expira em ${daysLeft} dias`,
            action: 'Enviar email',
            icon: AlertTriangle,
            color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          })
        }
      }

      if (ass.status === 'suspenso') {
        list.push({
          id: ass.id,
          type: 'red',
          clinicaName: clinica.nome,
          message: `Pagamento suspenso`,
          action: 'Reativar',
          icon: PauseCircle,
          color: 'text-red-600 bg-red-50 border-red-200',
        })
      }

      const daysInactive = differenceInDays(now, new Date(clinica.updated))
      if (daysInactive > 30 && ass.status === 'ativo') {
        list.push({
          id: ass.id,
          type: 'gray',
          clinicaName: clinica.nome,
          message: `Inativa há ${daysInactive} dias`,
          action: 'Suspender',
          icon: Activity,
          color: 'text-slate-600 bg-slate-100 border-slate-200',
        })
      }
    })
    return list
  }, [assinaturas])

  const filteredAssinaturas = assinaturas.filter((a) => {
    const c = a.expand?.id_clinica
    if (!c) return false
    if (planFilter !== 'todos' && a.plano !== planFilter) return false
    if (statusFilter !== 'todos' && a.status !== statusFilter) return false
    if (search && !c.nome.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleOpenModal = (ass: SaasAssinatura) => {
    setSelectedAssinatura(ass)
    setNewPlan(ass.plano)
    setModalOpen(true)
  }

  const handleUpdatePlan = async () => {
    if (!selectedAssinatura) return
    const planDetails = PLAN_DETAILS[newPlan as keyof typeof PLAN_DETAILS]
    if (!planDetails) return

    try {
      await updateSaasAssinatura(selectedAssinatura.id, {
        plano: newPlan as any,
        valor_mensal: planDetails.preco,
        limite_psicologos: planDetails.limite,
      })
      toast({ title: 'Plano atualizado com sucesso' })
      setModalOpen(false)
      loadData()
    } catch (error) {
      toast({ title: 'Erro ao atualizar plano', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-md flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />
        <div className="text-sm text-slate-700">
          <strong>Dashboard do Gestor SaaS — dados sensíveis de negócio.</strong> Acesso restrito a
          administradores da plataforma. Conformidade LGPD na gestão de dados de tenant.
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E40AF] flex items-center gap-2">
            <BarChart3 className="h-6 w-6" /> Visão Global SaaS
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitore a saúde da plataforma, métricas de crescimento e assinaturas.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exportar Relatório
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clínicas Ativas
            </CardTitle>
            <Building2 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : kpis.totalClinicas}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Psicólogos Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : kpis.totalPsicologos}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pacientes Total
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : kpis.totalPacientes}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consultas (Mês)
            </CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : kpis.consultasMes}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              MRR Estimado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {loading
                ? '-'
                : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    kpis.receita,
                  )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Crescimento</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${kpis.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
            >
              {loading ? '-' : `${kpis.growth > 0 ? '+' : ''}${kpis.growth.toFixed(1)}%`}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm col-span-2">
          <CardHeader>
            <CardTitle>Crescimento de Clínicas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="clinicas" fill="var(--color-clinicas)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Alertas Operacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum alerta pendente.
                </p>
              )}
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${alert.color} bg-opacity-30`}
                >
                  <div className={`p-2 rounded-full bg-white`}>
                    <alert.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{alert.clinicaName}</p>
                    <p className="text-xs">{alert.message}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs border border-white/50 bg-white hover:bg-white/80"
                  >
                    {alert.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Gestão de Assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Buscar clínica..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Planos</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="profissional">Profissional</SelectItem>
                  <SelectItem value="clinica">Clínica</SelectItem>
                  <SelectItem value="corporativo">Corporativo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clínica</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Uso (Psicólogos)</TableHead>
                  <TableHead className="text-right">Valor Mensal</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssinaturas.map((ass) => {
                  const clinica = ass.expand?.id_clinica
                  const usage = users.filter(
                    (u) => u.id_clinica === clinica?.id && u.profile === 'psicologo',
                  ).length

                  let statusBadge = 'bg-slate-100 text-slate-800'
                  if (ass.status === 'ativo') statusBadge = 'bg-green-100 text-green-800'
                  if (ass.status === 'trial') statusBadge = 'bg-yellow-100 text-yellow-800'
                  if (ass.status === 'suspenso') statusBadge = 'bg-red-100 text-red-800'

                  return (
                    <TableRow key={ass.id}>
                      <TableCell className="font-medium text-[#1E40AF]">
                        {clinica?.nome || 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {clinica?.cnpj || '-'}
                      </TableCell>
                      <TableCell className="capitalize">{ass.plano}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`border-none ${statusBadge}`}>
                          {ass.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={usage > ass.limite_psicologos ? 'text-red-600 font-bold' : ''}
                        >
                          {usage} / {ass.limite_psicologos}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(ass.valor_mensal || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(ass)}>
                          Alterar Plano
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredAssinaturas.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Nenhuma assinatura encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Plano da Clínica</DialogTitle>
            <DialogDescription>
              Selecione o novo plano para{' '}
              <strong>{selectedAssinatura?.expand?.id_clinica?.nome}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={newPlan} onValueChange={setNewPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLAN_DETAILS).map(([key, p]) => (
                  <SelectItem key={key} value={key}>
                    {p.name} — até {p.limite} psicólogos (
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      p.preco,
                    )}
                    /mês)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              A atualização do plano refletirá imediatamente no limite de psicólogos permitidos para
              esta clínica.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-[#1E40AF] text-white hover:bg-blue-800"
              onClick={handleUpdatePlan}
            >
              Confirmar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
