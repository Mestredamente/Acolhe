import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Users,
  Calendar as CalendarIcon,
  TrendingUp,
  Activity,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  User,
  Video,
  Bell,
  CreditCard,
  CheckCircle2,
} from 'lucide-react'
import { getAppointments } from '@/services/appointments'
import { getPatients } from '@/services/patients'
import { getTransactions } from '@/services/financeiro'
import { getAllDiarios } from '@/services/diario'
import { getAllPendingRespostas } from '@/services/escalas'
import { getClinicas } from '@/services/clinicas'
import { getUsers } from '@/services/users'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'

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
  const { user, loading: authLoading } = useAuth()
  const isAdmin = user?.profile === 'admin'

  const [stats, setStats] = useState({
    patientsCount: 0,
    appointmentsToday: 0,
    revenueMonth: 0,
    saasPlanName: '-',
    saasPlanStatus: '-',
    activeClinics: 0,
    linkedProfessionals: 0,
    topClinicName: '',
  })
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([])
  const [patientScores, setPatientScores] = useState<Record<string, number>>({})
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    if (
      user?.profile === 'admin' ||
      user?.profile === 'secretaria' ||
      user?.profile === 'paciente'
    ) {
      setLoading(false)
      return
    }

    async function loadData() {
      try {
        const [
          patients,
          appointments,
          transactions,
          diarios,
          escalasPendentes,
          clinicas,
          usersData,
          notifsData,
        ] = await Promise.all([
          getPatients(),
          getAppointments(),
          getTransactions(),
          getAllDiarios().catch(() => []),
          getAllPendingRespostas().catch(() => []),
          isAdmin ? getClinicas().catch(() => []) : Promise.resolve([]),
          isAdmin ? getUsers().catch(() => []) : Promise.resolve([]),
          pb
            .collection('notificacoes')
            .getFullList({
              filter: `user_id="${user?.id}" && status="nao_lida"`,
              sort: '-created',
              limit: 20,
            })
            .catch(() => []),
        ])

        setNotifications(notifsData)

        let saasPlanName = '-'
        let saasPlanStatus = '-'
        try {
          const saasRecords = await pb.collection('saas_assinaturas').getFullList({
            filter: `user_id="${user?.id}"${user?.id_clinica ? ` || id_clinica="${user.id_clinica}"` : ''}`,
            expand: 'plano_id',
          })
          if (saasRecords.length > 0) {
            const saas = saasRecords[0]
            saasPlanName = saas.expand?.plano_id?.nome || saas.plano || 'Profissional'
            saasPlanStatus = saas.status
          }
        } catch (e) {
          // Fallback gracefully if API rule limits access
        }

        const todayDate = new Date()
        const offset = todayDate.getTimezoneOffset()
        const localToday = new Date(todayDate.getTime() - offset * 60 * 1000)
        const today = localToday.toISOString().split('T')[0]

        const activePatients = patients.filter((p) => !p.deleted_at)

        const todayAppointments = appointments.filter(
          (a) =>
            a.appointment_date?.startsWith(today) &&
            a.status !== 'cancelada' &&
            a.status !== 'cancelada_pelo_paciente' &&
            !a.deleted_at,
        )

        const currentMonth = todayDate.getMonth()
        const currentYear = todayDate.getFullYear()

        const revenue = transactions
          .filter(
            (t) =>
              t.status === 'pago' &&
              t.payment_date &&
              new Date(t.payment_date).getMonth() === currentMonth &&
              new Date(t.payment_date).getFullYear() === currentYear &&
              !t.deleted_at,
          )
          .reduce((acc, curr) => acc + (curr.amount || 0), 0)

        let topClinicName = '-'
        if (isAdmin && clinicas.length > 0 && patients.length > 0) {
          const counts: Record<string, number> = {}
          patients.forEach((p) => {
            if (p.id_clinica) counts[p.id_clinica] = (counts[p.id_clinica] || 0) + 1
          })
          const topClinicId = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0]
          if (topClinicId) {
            topClinicName = clinicas.find((c) => c.id === topClinicId)?.nome || '-'
          }
        }

        setStats({
          patientsCount: activePatients.length || 0,
          appointmentsToday: todayAppointments.length || 0,
          revenueMonth: revenue || 0,
          saasPlanName,
          saasPlanStatus,
          activeClinics: clinicas.filter((c) => c.status === 'ativa').length || 0,
          linkedProfessionals:
            usersData.filter((u) => u.id_clinica && ['psicologo', 'secretaria'].includes(u.profile))
              .length || 0,
          topClinicName,
        })

        // Generate Predictive Alerts
        const newAlerts: PredictiveAlert[] = []
        const newScores: Record<string, number> = {}

        patients.forEach((patient) => {
          if (patient.deleted_at) return
          let score = 0

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

        setAlerts(newAlerts)
        setPatientScores(newScores)

        const upcomingList = todayAppointments.sort(
          (a, b) =>
            new Date(`${a.appointment_date.split(' ')[0]}T${a.start_time || '00:00'}`).getTime() -
            new Date(`${b.appointment_date.split(' ')[0]}T${b.start_time || '00:00'}`).getTime(),
        )

        setUpcomingAppointments(upcomingList)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user?.profile === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (user?.profile === 'secretaria') {
    return <Navigate to="/secretaria/dashboard" replace />
  }
  if (user?.profile === 'paciente') {
    return <Navigate to="/portal" replace />
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
          </CardContent>
        </Card>

        <Card className="standard-card border-none shadow-elevation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-800">Plano Atual</CardTitle>
            <div className="bg-purple-100 p-2 rounded-full">
              <CreditCard className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold capitalize truncate">{stats.saasPlanName}</div>
            <p className="text-xs text-muted-foreground mt-1 capitalize flex items-center gap-1">
              {stats.saasPlanStatus !== '-' && (
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    stats.saasPlanStatus === 'ativo' ? 'bg-success' : 'bg-warning',
                  )}
                ></span>
              )}
              {stats.saasPlanStatus}
            </p>
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
              <div className="col-span-full py-8 text-center text-muted-foreground bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>Nenhum alerta preditivo no momento.</p>
              </div>
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
            <CardTitle>Atendimentos de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {upcomingAppointments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                  <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>Nenhum atendimento agendado para hoje.</p>
                </div>
              ) : (
                upcomingAppointments.map((app) => {
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
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div>
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
                          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                            {app.type}
                            {app.type === 'Online' && app.link_sessao && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse"></span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium shadow-sm whitespace-nowrap hidden sm:block',
                              app.status === 'confirmada'
                                ? 'bg-success/10 text-success'
                                : 'bg-slate-100 text-slate-600',
                            )}
                          >
                            {app.status}
                          </div>

                          {app.type === 'Online' && app.link_sessao && (
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-blue-700 hover:bg-blue-800 text-white text-xs whitespace-nowrap h-8"
                              onClick={() => window.open(app.link_sessao, '_blank')}
                            >
                              <Video className="w-3 h-3 mr-1.5" />
                              Iniciar Sessão
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 standard-card border-none shadow-elevation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notificações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>Você não tem novas notificações.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <Link key={notif.id} to={notif.link || '/notificacoes'} className="block">
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-gray-200">
                      <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                        <Bell className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">{notif.title}</h4>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {new Date(notif.created).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(notif.created).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
