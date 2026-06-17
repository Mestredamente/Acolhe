import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar as CalendarIcon, UserPlus, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRealtime } from '@/hooks/use-realtime'
import { getPatients, Patient } from '@/services/patients'
import { getAppointments, Appointment } from '@/services/appointments'
import { getAllPendingRespostas, RespostaEscala } from '@/services/escalas'
import { ClipboardList, AlertCircle, DollarSign, FileSignature } from 'lucide-react'
import { PatientFormDialog } from '@/components/PatientFormDialog'
import { AppointmentFormDialog } from '@/components/AppointmentFormDialog'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const statusColors: Record<string, string> = {
  agendada: 'text-gray-500 bg-gray-100 border-gray-200',
  confirmada: 'text-green-600 bg-green-100 border-green-200',
  cancelada: 'text-red-600 bg-red-100 border-red-200',
  concluida: 'text-blue-600 bg-blue-100 border-blue-200',
}

const statusLabels: Record<string, string> = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  concluida: 'Concluída',
}

export default function Index() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [pendingEscalas, setPendingEscalas] = useState<RespostaEscala[]>([])
  const [alerts, setAlerts] = useState({
    unconfirmedApts: 0,
    overduePayments: 0,
    pendingSignatures: 0,
    pendingScales: 0,
  })

  const loadData = async () => {
    try {
      const [pts, apts, escalas] = await Promise.all([
        getPatients(),
        getAppointments(),
        getAllPendingRespostas(),
      ])
      setPatients(pts)
      setAppointments(apts)
      setPendingEscalas(escalas)

      const todayStr = new Date().toISOString().split('T')[0]
      const [unconf, overdue, sigs, pScales] = await Promise.all([
        pb
          .collection('appointments')
          .getList(1, 1, { filter: `appointment_date = "${todayStr}" && status = "agendada"` }),
        pb.collection('financeiro').getList(1, 1, { filter: `status = "atrasado"` }),
        pb.collection('documentos').getList(1, 1, { filter: `status = "pendente_assinatura"` }),
        pb.collection('respostas_escala').getList(1, 1, { filter: `status = "pendente"` }),
      ])

      setAlerts({
        unconfirmedApts: unconf.totalItems,
        overduePayments: overdue.totalItems,
        pendingSignatures: sigs.totalItems,
        pendingScales: pScales.totalItems,
      })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('patients', loadData)
  useRealtime('appointments', loadData)
  useRealtime('respostas_escala', loadData)
  useRealtime('financeiro', loadData)
  useRealtime('documentos', loadData)

  const activePatients = useMemo(
    () => patients.filter((p) => p.status === 'active').length,
    [patients],
  )

  const { aptsToday, aptsWeek, todayAppointments } = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    let todayCount = 0
    let weekCount = 0
    const todayList: typeof appointments = []

    appointments.forEach((a) => {
      if (!a.appointment_date) return
      const d = new Date(a.appointment_date)
      if (d >= startOfToday && d <= endOfToday) {
        todayCount++
        todayList.push(a)
      }
      if (d >= startOfWeek && d <= endOfWeek) weekCount++
    })

    todayList.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))

    return { aptsToday: todayCount, aptsWeek: weekCount, todayAppointments: todayList }
  }, [appointments])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Dashboard</h1>
        <p className="text-muted-foreground">Resumo do seu dia e da clínica.</p>
      </div>

      <div className="flex flex-col gap-3">
        {alerts.unconfirmedApts > 0 && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Consultas não confirmadas hoje</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              Você tem {alerts.unconfirmedApts}{' '}
              {alerts.unconfirmedApts === 1 ? 'consulta' : 'consultas'} para hoje aguardando
              confirmação.
              <Button variant="link" className="text-destructive h-auto p-0 font-semibold" asChild>
                <Link to="/agenda">Ver Agenda</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {alerts.overduePayments > 0 && (
          <Alert className="bg-orange-500/10 text-orange-700 border-orange-500/20">
            <DollarSign className="h-4 w-4" />
            <AlertTitle>Pagamentos em atraso</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              Há {alerts.overduePayments}{' '}
              {alerts.overduePayments === 1
                ? 'registro financeiro atrasado'
                : 'registros financeiros atrasados'}
              .
              <Button variant="link" className="text-orange-700 h-auto p-0 font-semibold" asChild>
                <Link to="/financeiro">Ver Financeiro</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {alerts.pendingSignatures > 0 && (
          <Alert className="bg-blue-500/10 text-blue-700 border-blue-500/20">
            <FileSignature className="h-4 w-4" />
            <AlertTitle>Assinaturas Pendentes</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              Você tem {alerts.pendingSignatures}{' '}
              {alerts.pendingSignatures === 1 ? 'documento aguardando' : 'documentos aguardando'}{' '}
              assinatura.
              <Button variant="link" className="text-blue-700 h-auto p-0 font-semibold" asChild>
                <Link to="/pacientes">Ver Documentos</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {alerts.pendingScales > 0 && (
          <Alert className="bg-amber-500/10 text-amber-700 border-amber-500/20">
            <FileSignature className="h-4 w-4" />
            <AlertTitle>Escalas Pendentes</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              Há {alerts.pendingScales}{' '}
              {alerts.pendingScales === 1
                ? 'escala aguardando resposta'
                : 'escalas aguardando respostas'}{' '}
              dos pacientes.
              <Button variant="link" className="text-amber-700 h-auto p-0 font-semibold" asChild>
                <Link to="/pacientes">Acompanhar</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activePatients}</div>
            <p className="text-xs text-muted-foreground">Total na base: {patients.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <CalendarIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{aptsToday}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas da Semana</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{aptsWeek}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalas Pendentes</CardTitle>
            <ClipboardList className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingEscalas.length}</div>
            <p className="text-xs text-muted-foreground">Aguardando pacientes</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-accent/30 border-primary/20">
          <CardContent className="flex flex-col gap-2 p-4 h-full justify-center">
            <PatientFormDialog
              trigger={
                <Button className="w-full justify-start text-left font-medium" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" /> Novo Paciente
                </Button>
              }
            />
            <AppointmentFormDialog
              trigger={
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-medium bg-white"
                  size="sm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" /> Nova Consulta
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-3 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Consultas de Hoje</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {todayAppointments.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma consulta agendada para hoje.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {todayAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center">
                    <div className="w-16 text-sm font-medium text-foreground">{apt.start_time}</div>
                    <div className="flex-1 space-y-1 ml-2">
                      <p className="text-sm font-medium leading-none">
                        {apt.patient_name_text || apt.expand?.patient_id?.name || 'Desconhecido'}
                      </p>
                      <p className="text-xs text-muted-foreground">{apt.type}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('ml-auto border', statusColors[apt.status] || '')}
                    >
                      {statusLabels[apt.status] || apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Lista de Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Última Consulta</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.slice(0, 5).map((patient) => {
                    const avatarUrl = patient.avatar ? pb.files.getURL(patient, patient.avatar) : ''
                    return (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={avatarUrl} alt={patient.name} />
                              <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium text-sm">{patient.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={patient.status === 'active' ? 'default' : 'secondary'}
                            className={
                              patient.status === 'active' ? 'bg-teal-600 hover:bg-teal-700' : ''
                            }
                          >
                            {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {patient.last_consultation
                            ? new Date(patient.last_consultation).toLocaleDateString('pt-BR')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-primary hover:bg-primary/10"
                          >
                            <Link to={`/pacientes/${patient.id}`}>Abrir Ficha</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {patients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhum paciente encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {patients.length > 5 && (
              <div className="mt-4 text-center">
                <Button variant="link" asChild>
                  <Link to="/pacientes">Ver todos os pacientes</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
