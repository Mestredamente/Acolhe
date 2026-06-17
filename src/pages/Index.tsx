import { Link } from 'react-router-dom'
import { Users, Calendar as CalendarIcon, FilePlus, UserPlus, Clock } from 'lucide-react'
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
import { mockPatients, mockAppointments } from '@/lib/mock-data'

export default function Index() {
  const activePatients = mockPatients.filter((p) => p.status === 'Ativo').length

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
            <p className="text-xs text-muted-foreground">+2 novos este mês</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <CalendarIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockAppointments.length}</div>
            <p className="text-xs text-muted-foreground">0 cancelamentos</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas da Semana</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">14</div>
            <p className="text-xs text-muted-foreground">3 disponíveis</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-accent/30 border-primary/20">
          <CardContent className="flex flex-col gap-2 p-4 h-full justify-center">
            <Button className="w-full justify-start text-left font-medium" size="sm">
              <UserPlus className="mr-2 h-4 w-4" /> Novo Paciente
            </Button>
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
            <div className="space-y-6">
              {mockAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center">
                  <div className="w-16 text-sm font-medium text-muted-foreground">{apt.time}</div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{apt.patientName}</p>
                    <p className="text-sm text-muted-foreground">{apt.type}</p>
                  </div>
                  <Badge
                    variant={apt.type === 'Online' ? 'secondary' : 'outline'}
                    className="ml-auto"
                  >
                    {apt.type}
                  </Badge>
                </div>
              ))}
            </div>
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
                  {mockPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={patient.photoUrl} alt={patient.name} />
                            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium text-sm">{patient.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={patient.status === 'Ativo' ? 'default' : 'secondary'}
                          className={
                            patient.status === 'Ativo' ? 'bg-green-600 hover:bg-green-700' : ''
                          }
                        >
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {patient.lastAppointment}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Link to={`/pacientes/${patient.id}`}>Abrir Ficha</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
