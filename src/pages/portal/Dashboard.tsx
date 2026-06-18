import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, FileText, CheckSquare, MessageSquare } from 'lucide-react'
import { getAppointments } from '@/services/appointments'
import { useAuth } from '@/hooks/use-auth'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function PortalDashboard() {
  const { user } = useAuth()
  const [nextAppointment, setNextAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const appointments = await getAppointments()
        const future = appointments
          .filter((a) => new Date(a.appointment_date) >= new Date())
          .sort(
            (a, b) =>
              new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime(),
          )
        if (future.length > 0) {
          setNextAppointment(future[0])
        }
      } catch (err) {
        // Fallback for demo
        setNextAppointment({
          appointment_date: new Date(Date.now() + 86400000).toISOString(),
          start_time: '15:00',
          status: 'confirmada',
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
        <h1>Olá, {user?.name?.split(' ')[0] || 'Paciente'}!</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo ao seu portal de acompanhamento.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="standard-card border-none shadow-elevation bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Calendar className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-white text-xl">Próxima Sessão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {nextAppointment ? (
              <>
                <div className="text-3xl font-bold">
                  {new Date(nextAppointment.appointment_date).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                  })}
                </div>
                <div className="text-xl opacity-90">às {nextAppointment.start_time}</div>
                <div className="pt-4">
                  <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                    {nextAppointment.status === 'confirmada' ? 'Confirmada' : 'Agendada'}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-4">Nenhuma sessão futura agendada.</div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Link to="/portal/diario" className="group">
            <Card className="standard-card h-full border-none shadow-elevation hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3 h-full">
                <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900">Diário Pessoal</h3>
                <p className="text-xs text-gray-500">Registre seus pensamentos e sentimentos</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/portal/tarefas" className="group">
            <Card className="standard-card h-full border-none shadow-elevation hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3 h-full">
                <div className="p-3 bg-success/10 rounded-full group-hover:bg-success group-hover:text-white transition-colors text-success">
                  <CheckSquare className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900">Tarefas</h3>
                <p className="text-xs text-gray-500">Atividades e escalas recomendadas</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <Card className="standard-card border-none shadow-elevation">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
          <CardTitle>Mensagens Recentes</CardTitle>
          <Button variant="ghost" className="text-primary hover:bg-primary/5" asChild>
            <Link to="/portal/mensagens">Ver todas</Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-colors">
              <div className="p-2 bg-primary/10 rounded-full shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Psicólogo(a)</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Lembrete: Não esqueça de preencher a escala de ansiedade antes da nossa próxima
                  sessão.
                </p>
                <p className="text-xs text-gray-400 mt-2">Hoje, 09:41</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
