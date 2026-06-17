import { useEffect, useState } from 'react'
import { Calendar, Users, Plus } from 'lucide-react'
import { format, isToday } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PatientFormDialog } from '@/components/PatientFormDialog'
import { getAppointments, Appointment } from '@/services/appointments'
import { getPatients, Patient } from '@/services/patients'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function SecretaryDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([getAppointments(), getPatients()]).then(([apts, pts]) => {
      setAppointments(apts.filter((a) => isToday(new Date(a.time))))
      setPatients(pts)
    })
  }, [])

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Painel da Recepção</h1>
          <p className="text-slate-500 mt-1">Gerencie a agenda do dia e o cadastro de pacientes.</p>
        </div>
        <PatientFormDialog
          trigger={
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors shadow-sm">
              <Plus className="w-5 h-5" /> Novo Paciente
            </button>
          }
          onSaved={() => getPatients().then(setPatients)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Agenda de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Nenhum agendamento para hoje.</div>
              ) : (
                appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-teal-50 text-teal-700 font-bold px-3 py-1.5 rounded-md text-sm">
                        {format(new Date(apt.time), 'HH:mm')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {apt.expand?.patient_id?.name || 'Paciente'}
                        </p>
                        <p className="text-xs text-slate-500">{apt.type}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-slate-600 border-slate-200"
                    >
                      {apt.status || 'Agendada'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 space-y-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Pacientes Cadastrados
            </CardTitle>
            <Input
              placeholder="Buscar paciente por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white"
            />
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                        Nenhum paciente encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-slate-800">{p.name}</TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {p.phone || p.email || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              p.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }
                          >
                            {p.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
