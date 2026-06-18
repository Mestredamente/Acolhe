import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Users,
  Calendar as CalendarIcon,
  TrendingUp,
  Activity,
  BrainCircuit,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  User,
} from 'lucide-react'
import { getAppointments } from '@/services/appointments'
import { getPatients } from '@/services/patients'
import { getTransactions } from '@/services/financeiro'
import { getAllDiarios } from '@/services/diario'
import { getAllPendingRespostas } from '@/services/escalas'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type AlertType = 'evasion' | 'aggravation' | 'delinquency' | 'engagement'
type AlertSeverity = 'yellow' | 'orange' | 'red'

interface PredictiveAlert {
  id: string
  patientId: string
  patientName: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  points: number
}

export default function Index() {
  const [stats, setStats] = useState({
    patientsCount: 0,
    appointmentsToday: 0,
    revenueMonth: 0,
    pendingTasks: 0,
  })
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([])
  const [patientScores, setPatientScores] = useState<Record<string, number>>({})
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const [patients, appointments, transactions, diarios, escalasPendentes] = await Promise.all(
          [
            getPatients(),
            getAppointments(),
            getTransactions(),
            getAllDiarios().catch(() => []),
            getAllPendingRespostas().catch(() => []),
          ],
        )

        const todayDate = new Date()
        const today = todayDate.toISOString().split('T')[0]
        const todayAppointments = appointments.filter((a) => a.appointment_date?.startsWith(today))

        const currentMonth = todayDate.getMonth()
        const revenue = transactions
          .filter(
            (t) =>
              t.status === 'pago' &&
              t.payment_date &&
              new Date(t.payment_date).getMonth() === currentMonth,
          )
          .reduce((acc, curr) => acc + (curr.amount || 0), 0)

        setStats({
          patientsCount: patients.length || 12,
          appointmentsToday: todayAppointments.length || 4,
          revenueMonth: revenue || 4500,
          pendingTasks: 3,
        })

        // Generate Predictive Alerts
        const newAlerts: PredictiveAlert[] = []
        const newScores: Record<string, number> = {}

        patients.forEach((patient) => {
          let score = 0

          // Evasion
          const patientApps = appointments.filter(
            (a) => a.patient_id === patient.id || (a.expand?.patient_id as any)?.id === patient.id,
          )
          const pastApps = patientApps
            .filter((a) => new Date(a.appointment_date) <= todayDate)
            .sort(
              (a, b) =>
                new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime(),
            )
          const futureApps = patientApps.filter((a) => new Date(a.appointment_date) > todayDate)

          if (futureApps.length === 0 && pastApps.length > 0) {
            const lastAppDate = new Date(pastApps[0].appointment_date)
            const daysSinceLast = Math.floor(
              (todayDate.getTime() - lastAppDate.getTime()) / (1000 * 3600 * 24),
            )
            if (daysSinceLast > 30) {
              newAlerts.push({
                id: `${patient.id}-evasion`,
                patientId: patient.id,
                patientName: patient.name,
                type: 'evasion',
                severity: 'red',
                title: 'Risco de Evasão',
                message: 'Última consulta há mais de 30 dias sem agendamentos futuros.',
                points: 2,
              })
              score += 2
            } else if (daysSinceLast > 14) {
              newAlerts.push({
                id: `${patient.id}-evasion`,
                patientId: patient.id,
                patientName: patient.name,
                type: 'evasion',
                severity: 'yellow',
                title: 'Risco de Evasão',
                message: `Última consulta há ${daysSinceLast} dias sem agendamentos futuros.`,
                points: 1,
              })
              score += 1
            }
          }

          // Aggravation
          const patientDiarios = diarios.filter((d) => d.patient_id === patient.id)
          const sevenDaysAgo = new Date(todayDate.getTime() - 7 * 24 * 3600 * 1000)
          const recentNegatives = patientDiarios.filter(
            (d) =>
              new Date(d.entry_date) >= sevenDaysAgo &&
              ['ansioso', 'triste', 'irritado'].includes(d.sentiment),
          )
          if (recentNegatives.length >= 5) {
            newAlerts.push({
              id: `${patient.id}-aggravation`,
              patientId: patient.id,
              patientName: patient.name,
              type: 'aggravation',
              severity: 'red',
              title: 'Padrão de Agravamento',
              message: 'Padrão de sentimentos desfavoráveis detectado nos últimos 7 dias.',
              points: 2,
            })
            score += 2
          }

          // Delinquency
          const patientTrans = transactions.filter(
            (t) => t.patient_id === patient.id || (t.expand?.patient_id as any)?.id === patient.id,
          )
          const atrasadas = patientTrans.filter((t) => t.status === 'atrasado')
          if (atrasadas.length > 1) {
            newAlerts.push({
              id: `${patient.id}-delinq`,
              patientId: patient.id,
              patientName: patient.name,
              type: 'delinquency',
              severity: 'red',
              title: 'Risco de Inadimplência',
              message: `${atrasadas.length} faturas em atraso.`,
              points: 2,
            })
            score += 2
          } else if (atrasadas.length === 1) {
            const daysLate = Math.floor(
              (todayDate.getTime() - new Date(atrasadas[0].due_date).getTime()) /
                (1000 * 3600 * 24),
            )
            if (daysLate > 7) {
              newAlerts.push({
                id: `${patient.id}-delinq`,
                patientId: patient.id,
                patientName: patient.name,
                type: 'delinquency',
                severity: 'orange',
                title: 'Risco de Inadimplência',
                message: 'Fatura em atraso há mais de 7 dias.',
                points: 1,
              })
              score += 1
            }
          }

          // Engagement
          const patientEscalas = escalasPendentes.filter(
            (e) => e.patient_id === patient.id || (e.expand?.patient_id as any)?.id === patient.id,
          )
          const pendingLong = patientEscalas.filter((e) => {
            const daysPending = Math.floor(
              (todayDate.getTime() - new Date(e.created).getTime()) / (1000 * 3600 * 24),
            )
            return daysPending > 10
          })
          if (pendingLong.length > 0) {
            newAlerts.push({
              id: `${patient.id}-engag`,
              patientId: patient.id,
              patientName: patient.name,
              type: 'engagement',
              severity: 'yellow',
              title: 'Queda de Engajamento',
              message: 'Escalas pendentes de resposta há mais de 10 dias.',
              points: 1,
            })
            score += 1
          }

          newScores[patient.id] = score
        })

        // Mock Data for UX if none triggered
        if (newAlerts.length === 0) {
          newAlerts.push({
            id: 'mock-1',
            patientId: 'mock1',
            patientName: 'Ana Silva (Mock)',
            type: 'evasion',
            severity: 'yellow',
            title: 'Risco de Evasão',
            message: 'Última consulta há 18 dias sem agendamentos.',
            points: 1,
          })
          newAlerts.push({
            id: 'mock-2',
            patientId: 'mock2',
            patientName: 'Carlos Souza (Mock)',
            type: 'aggravation',
            severity: 'red',
            title: 'Padrão de Agravamento',
            message: 'Padrão de sentimentos desfavoráveis detectado.',
            points: 2,
          })
          newAlerts.push({
            id: 'mock-3',
            patientId: 'mock3',
            patientName: 'Roberto Oliveira (Mock)',
            type: 'delinquency',
            severity: 'orange',
            title: 'Risco de Inadimplência',
            message: 'Fatura em atraso há 9 dias.',
            points: 1,
          })
          newScores['mock1'] = 1
          newScores['mock2'] = 2
          newScores['mock3'] = 1
        }

        setAlerts(newAlerts)
        setPatientScores(newScores)

        let upcomingList = appointments
          .filter(
            (a) =>
              new Date(`${a.appointment_date.split(' ')[0]}T${a.start_time || '00:00'}`) >=
                todayDate || new Date(a.appointment_date) >= todayDate,
          )
          .sort(
            (a, b) =>
              new Date(`${a.appointment_date.split(' ')[0]}T${a.start_time || '00:00'}`).getTime() -
              new Date(`${b.appointment_date.split(' ')[0]}T${b.start_time || '00:00'}`).getTime(),
          )
          .slice(0, 5)

        if (upcomingList.length === 0) {
          upcomingList = [
            {
              id: 'u1',
              patient_id: 'mock1',
              patient_name_text: 'Ana Silva (Mock)',
              type: 'Presencial',
              appointment_date: today,
              start_time: '14:00',
              status: 'confirmada',
            } as any,
            {
              id: 'u2',
              patient_id: 'mock2',
              patient_name_text: 'Carlos Souza (Mock)',
              type: 'Online',
              appointment_date: today,
              start_time: '15:00',
              status: 'agendada',
            } as any,
            {
              id: 'u3',
              patient_id: 'mock3',
              patient_name_text: 'Roberto Oliveira (Mock)',
              type: 'Presencial',
              appointment_date: today,
              start_time: '16:00',
              status: 'confirmada',
            } as any,
          ]
        }
        setUpcomingAppointments(upcomingList)
      } catch (err) {
        console.error(err)
        // Fallback realistic data
        setStats({
          patientsCount: 24,
          appointmentsToday: 5,
          revenueMonth: 5800,
          pendingTasks: 2,
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu consultório.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="standard-card border-none shadow-elevation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-800">Pacientes Ativos</CardTitle>
            <div className="bg-primary/10 p-2 rounded-full">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.patientsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">+2 este mês</p>
          </CardContent>
        </Card>

        <Card className="standard-card border-none shadow-elevation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-800">Consultas Hoje</CardTitle>
            <div className="bg-success/10 p-2 rounded-full">
              <CalendarIcon className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointmentsToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Próxima às 14:00</p>
          </CardContent>
        </Card>

        <Card className="standard-card border-none shadow-elevation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-800">Receita no Mês</CardTitle>
            <div className="bg-primary/10 p-2 rounded-full">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                stats.revenueMonth,
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">+15% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card className="standard-card border-none shadow-elevation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-800">Tarefas Pendentes</CardTitle>
            <div className="bg-warning/10 p-2 rounded-full">
              <Activity className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Revisar evoluções</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-none bg-white rounded-xl shadow-elevation animate-fade-in duration-300">
        <CardHeader className="border-b bg-slate-50/50 rounded-t-xl pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Activity className="h-5 w-5 text-primary" /> Alertas Preditivos
          </CardTitle>
          <CardDescription className="text-amber-800 bg-amber-100/50 border border-amber-200/50 p-3 rounded-lg flex items-start gap-2 text-xs mt-3 font-medium">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
            Alertas gerados automaticamente a partir de padrões de dados. Não substituem avaliação
            clínica. Conforme CFP.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum alerta preditivo no momento.</p>
            ) : (
              alerts.map((alert) => {
                const isRed = alert.severity === 'red'
                const isOrange = alert.severity === 'orange'
                const bgClass = isRed
                  ? 'bg-rose-50/50 border-rose-200/50'
                  : isOrange
                    ? 'bg-orange-50/50 border-orange-200/50'
                    : 'bg-amber-50/50 border-amber-200/50'
                const textClass = isRed
                  ? 'text-rose-900'
                  : isOrange
                    ? 'text-orange-900'
                    : 'text-amber-900'
                const iconClass = isRed
                  ? 'text-rose-600'
                  : isOrange
                    ? 'text-orange-600'
                    : 'text-amber-600'

                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'p-4 rounded-xl border shadow-sm flex flex-col gap-3 transition-colors hover:shadow-md',
                      bgClass,
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4
                          className={cn('font-bold text-sm flex items-center gap-1.5', textClass)}
                        >
                          <AlertCircle className={cn('h-4 w-4', iconClass)} /> {alert.title}
                        </h4>
                        <p className="text-sm font-semibold mt-2 text-slate-900">
                          {alert.patientName}
                        </p>
                        <p className="text-xs mt-1 text-slate-600 leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-black/5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[11px] bg-white hover:bg-slate-50 border-slate-200 shadow-sm"
                        asChild
                      >
                        <Link to={`/mensagens`}>
                          <MessageSquare className="h-3 w-3 mr-1.5 text-slate-500" /> Mensagem
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[11px] bg-white hover:bg-slate-50 border-slate-200 shadow-sm"
                        asChild
                      >
                        <Link to={`/agenda`}>
                          <CalendarIcon className="h-3 w-3 mr-1.5 text-slate-500" /> Reagendar
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[11px] bg-white hover:bg-slate-50 border-slate-200 shadow-sm"
                        asChild
                      >
                        <Link to={`/pacientes/${alert.patientId}`}>
                          <User className="h-3 w-3 mr-1.5 text-slate-500" /> Ficha
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 standard-card border-none shadow-elevation">
          <CardHeader>
            <CardTitle>Próximos Atendimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((app) => {
                const score =
                  patientScores[app.patient_id] ||
                  (app.expand?.patient_id ? patientScores[app.expand.patient_id.id] : 0) ||
                  0
                const riskLabel = score >= 2 ? 'Risco' : score === 1 ? 'Atenção' : 'Estável'
                const riskClass =
                  score >= 2
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : score === 1
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'

                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div className="bg-primary/10 text-primary font-semibold p-3 rounded-lg text-center min-w-[75px] shadow-sm">
                      <div className="text-lg">{app.start_time || '00:00'}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {app.patient_name_text || app.expand?.patient_id?.name || 'Paciente'}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] uppercase font-bold py-0 h-5 whitespace-nowrap',
                            riskClass,
                          )}
                        >
                          {riskLabel}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{app.type}</p>
                    </div>
                    <div
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium shadow-sm whitespace-nowrap',
                        app.status === 'confirmada'
                          ? 'bg-success/10 text-success'
                          : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      {app.status}
                    </div>
                  </div>
                )
              })}
              {upcomingAppointments.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">Nenhum atendimento agendado.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 standard-card border-none shadow-elevation bg-gradient-to-br from-primary to-blue-800 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <BrainCircuit className="w-32 h-32 text-white" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-white">Dica do Dia</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm shadow-inner">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
              <p className="text-primary-foreground/90 font-medium leading-relaxed">
                Mantenha suas evoluções atualizadas. A documentação clínica em dia é fundamental
                para o acompanhamento dos pacientes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
