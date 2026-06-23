import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Video, Calendar as CalendarIcon, Clock, Settings2, Play, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Telepsicologia() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [patients, setPatients] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [config, setConfig] = useState<any>(null)

  const [selectedPatient, setSelectedPatient] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionTime, setSessionTime] = useState('')

  const [platformUrl, setPlatformUrl] = useState('')
  const [sessionDuration, setSessionDuration] = useState('50')

  useEffect(() => {
    if (!user) return

    Promise.all([
      pb.collection('patients').getFullList({ filter: `status='active'`, sort: 'name' }),
      pb.collection('appointments').getFullList({
        filter: `type='Online'`,
        expand: 'patient_id',
        sort: '-appointment_date,-start_time',
      }),
      pb
        .collection('config_clinica')
        .getFirstListItem(`user_id="${user.id}"`)
        .catch(() => null),
    ]).then(([pts, appts, conf]) => {
      setPatients(pts)
      setAppointments(appts)
      if (conf) {
        setConfig(conf)
        setPlatformUrl(conf.zoom_auto_link ? 'https://zoom.us' : '')
        setSessionDuration(conf.tempo_sessao_minutos?.toString() || '50')
      }
    })
  }, [user])

  const handleCreateSession = async () => {
    if (!selectedPatient || !sessionDate || !sessionTime) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' })
      return
    }
    try {
      const dt = new Date(`${sessionDate}T${sessionTime}`)
      const end = new Date(dt.getTime() + parseInt(sessionDuration) * 60000)

      const newAppt = await pb.collection('appointments').create({
        user_id: user?.id,
        patient_id: [selectedPatient],
        type: 'Online',
        tipo_sessao: 'individual',
        status: 'agendada',
        appointment_date: dt.toISOString(),
        start_time: sessionTime,
        end_time: `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`,
        link_sessao: platformUrl || 'https://meet.google.com/new',
      })

      const expanded = await pb
        .collection('appointments')
        .getOne(newAppt.id, { expand: 'patient_id' })
      setAppointments((prev) =>
        [...prev, expanded].sort((a, b) => b.appointment_date.localeCompare(a.appointment_date)),
      )

      toast({ title: 'Sessão agendada com sucesso!' })
      setSelectedPatient('')
      setSessionDate('')
      setSessionTime('')
    } catch (err: any) {
      toast({ title: 'Erro ao agendar', description: err.message, variant: 'destructive' })
    }
  }

  const saveSettings = async () => {
    try {
      if (config) {
        await pb.collection('config_clinica').update(config.id, {
          tempo_sessao_minutos: parseInt(sessionDuration),
        })
      } else {
        const c = await pb.collection('config_clinica').create({
          user_id: user?.id,
          tempo_sessao_minutos: parseInt(sessionDuration),
        })
        setConfig(c)
      }
      toast({ title: 'Configurações salvas' })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    }
  }

  const getDuration = (start: string, end: string) => {
    if (!start || !end) return '50 min'
    const [h1, m1] = start.split(':').map(Number)
    const [h2, m2] = end.split(':').map(Number)
    return `${h2 * 60 + m2 - (h1 * 60 + m1)} min`
  }

  const now = new Date()
  const scheduled = appointments
    .filter((a) => a.status === 'agendada' && new Date(a.appointment_date) >= now)
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date))
  const history = appointments.filter(
    (a) => a.status === 'concluida' || new Date(a.appointment_date) < now,
  )

  return (
    <div className="flex-1 space-y-6 p-8 bg-slate-50 min-h-full font-sans">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-[#1E3A8A]">Telepsicologia</h2>
        <p className="text-slate-500">
          Realize atendimentos online com seus pacientes de forma segura e estruturada.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="bg-[#1E3A8A] text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-white" />
                Nova Sessão Online
              </CardTitle>
              <CardDescription className="text-blue-100">
                Agende uma nova sessão de telepsicologia
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateSession}
                className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white shadow-sm mt-2"
              >
                <CalendarIcon className="w-4 h-4 mr-2" /> Agendar Sessão
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-100 border-b border-slate-200 rounded-t-xl">
              <CardTitle className="text-[#1E3A8A] flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Configurações da Sala
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Plataforma Padrão (URL)</Label>
                <Input
                  placeholder="ex: https://meet.google.com/..."
                  value={platformUrl}
                  onChange={(e) => setPlatformUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Duração Padrão (minutos)</Label>
                <Input
                  type="number"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={saveSettings}
                className="w-full border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A]/10 mt-2"
              >
                <Save className="w-4 h-4 mr-2" /> Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white border-slate-200 h-full shadow-sm">
            <CardHeader className="bg-slate-100 border-b border-slate-200 rounded-t-xl">
              <CardTitle className="text-[#1E3A8A] flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Sessões Agendadas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {scheduled.length === 0 ? (
                <div className="text-center py-6 text-slate-500">Nenhuma sessão agendada</div>
              ) : (
                <div className="space-y-4">
                  {scheduled.map((app) => {
                    const ptName = Array.isArray(app.expand?.patient_id)
                      ? app.expand.patient_id[0]?.name
                      : app.expand?.patient_id?.name
                    return (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white shadow-sm hover:border-[#1E3A8A]/30 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-[#1E3A8A] text-[15px]">
                            {ptName || app.patient_name_text || 'Paciente'}
                          </p>
                          <div className="flex items-center text-sm text-slate-600 gap-2 mt-1">
                            <CalendarIcon className="w-3 h-3" />
                            {format(new Date(app.appointment_date), "dd 'de' MMM, yyyy", {
                              locale: ptBR,
                            })}
                            <Clock className="w-3 h-3 ml-2" />
                            {app.start_time}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90"
                          onClick={() =>
                            window.open(
                              app.link_sessao || platformUrl || 'https://meet.google.com/new',
                              '_blank',
                            )
                          }
                        >
                          <Play className="w-4 h-4 mr-2" /> Iniciar
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-100 border-b border-slate-200 rounded-t-xl">
              <CardTitle className="text-[#1E3A8A] flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Histórico de Sessões
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {history.length === 0 ? (
                <div className="text-center py-6 text-slate-500">Nenhum histórico encontrado</div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {history.map((app) => {
                    const ptName = Array.isArray(app.expand?.patient_id)
                      ? app.expand.patient_id[0]?.name
                      : app.expand?.patient_id?.name
                    return (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50"
                      >
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {ptName || app.patient_name_text || 'Paciente'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {format(new Date(app.appointment_date), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}{' '}
                            às {app.start_time} • Duração:{' '}
                            {getDuration(app.start_time, app.end_time)}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium border border-green-200">
                          Concluída
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
