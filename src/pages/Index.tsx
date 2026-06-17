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
import { PatientFormDialog } from '@/components/PatientFormDialog'
import pb from '@/lib/pocketbase/client'

export default function Index() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const loadData = async () => {
    try {
      const [pts, apts] = await Promise.all([getPatients(), getAppointments()])
      setPatients(pts)
      setAppointments(apts)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('patients', loadData)
  useRealtime('appointments', loadData)

  const activePatients = useMemo(
    () => patients.filter((p) => p.status === 'active').length,
    [patients],
  )

  const { aptsToday, aptsWeek } = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.setHours(0, 0, 0, 0))
    const endOfToday = new Date(now.setHours(23, 59, 59, 999))

    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    let todayCount = 0
    let weekCount = 0

    appointments.forEach((a) => {
      const d = new Date(a.time)
      if (d >= startOfToday && d <= endOfToday) todayCount++
      if (d >= startOfWeek && d <= endOfWeek) weekCount++
    })
    return { aptsToday: todayCount, aptsWeek: weekCount }
  }, [appointments])

  const upcomingApts = appointments.filter((a) => new Date(a.time) >= new Date()).slice(0, 5)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Dashboard</h1>
        <p className="text-muted-foreground">Resumo do seu dia e da clínica.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        <Card className="shadow-sm bg-accent/30 border-primary/20">
          <CardContent className="flex flex-col gap-2 p-4 h-full justify-center">
            <PatientFormDialog
              trigger={
                <Button className="w-full justify-start text-left font-medium" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" /> Novo Paciente
                </Button>
              }
            />
            <Button
              variant="outline"
              className="w-full justify-start text-left font-medium bg-white"
              size="sm"
            >
              <CalendarIcon className="mr-2 h-4 w-4" /> Nova Consulta
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Próximas Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingApts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma consulta futura agendada.</p>
            ) : (
              <div className="space-y-6">
                {upcomingApts.map((apt) => {
                  const d = new Date(apt.time)
                  return (
                    <div key={apt.id} className="flex items-center">
                      <div className="w-20 text-sm font-medium text-muted-foreground">
                        {d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}{' '}
                        {d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex-1 space-y-1 ml-2">
                        <p className="text-sm font-medium leading-none">
                          {apt.expand?.patient_id?.name || 'Desconhecido'}
                        </p>
                        <p className="text-sm text-muted-foreground">{apt.type}</p>
                      </div>
                      <Badge
                        variant={apt.type === 'Online' ? 'secondary' : 'outline'}
                        className="ml-auto"
                      >
                        {apt.type}
                      </Badge>
                    </div>
                  )
                })}
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
