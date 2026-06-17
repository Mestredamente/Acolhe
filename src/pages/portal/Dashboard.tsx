import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookHeart,
  CheckSquare,
  FileText,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import type { Appointment } from '@/services/appointments'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { usePatientContext } from '@/components/portal/PortalProtectedRoute'
import { getConfig, ConfigClinica } from '@/services/config_clinica'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function PortalDashboard() {
  const { patient } = usePatientContext()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [psicoConfig, setPsicoConfig] = useState<ConfigClinica | null>(null)
  const { toast } = useToast()

  const loadData = () => {
    pb.collection<Appointment>('appointments')
      .getFullList({
        filter: `patient_id="${patient.id}" && appointment_date >= "${new Date().toISOString().substring(0, 10)} 00:00:00.000Z"`,
        sort: 'appointment_date,start_time',
      })
      .then((items) => {
        const now = new Date()
        const filtered = items.filter((a) => {
          const dtStr = a.appointment_date.substring(0, 10)
          const aptDate = new Date(`${dtStr}T${a.start_time || '00:00'}:00-03:00`)
          return (
            aptDate > now ||
            a.appointment_date.substring(0, 10) >= now.toISOString().substring(0, 10)
          )
        })
        setAppointments(filtered)
      })
      .catch(console.error)

    if (patient.user_id) {
      getConfig(patient.user_id).then(setPsicoConfig).catch(console.error)
    }
  }

  useEffect(() => {
    loadData()
  }, [patient.id, patient.user_id])

  const handleConfirm = async (id: string) => {
    try {
      await pb.collection('appointments').update(id, { status: 'confirmada' })
      toast({ title: 'Presença confirmada!' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao confirmar', variant: 'destructive' })
    }
  }

  const upcomingToConfirm = appointments.find((a) => {
    if (a.status !== 'agendada') return false
    const now = new Date()
    const dtStr = a.appointment_date.substring(0, 10)
    const [h, m] = (a.start_time || '00:00').split(':').map(Number)
    const aptDate = new Date(
      `${dtStr}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00-03:00`,
    )

    const diffHours = (aptDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours > 0 && diffHours <= 48
  })

  const diffHoursUpcoming = upcomingToConfirm
    ? (() => {
        const dtStr = upcomingToConfirm.appointment_date.substring(0, 10)
        const [h, m] = (upcomingToConfirm.start_time || '00:00').split(':').map(Number)
        const aptDate = new Date(
          `${dtStr}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00-03:00`,
        )
        return (aptDate.getTime() - new Date().getTime()) / (1000 * 60 * 60)
      })()
    : 999

  return (
    <div className="space-y-8 animate-fade-in-up">
      {upcomingToConfirm && (
        <Card
          className={`border ${diffHoursUpcoming <= 24 ? 'border-orange-300 bg-orange-50' : 'border-sky-300 bg-sky-50'} shadow-sm`}
        >
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`mt-1 rounded-full p-2 ${diffHoursUpcoming <= 24 ? 'bg-orange-100' : 'bg-sky-100'}`}
              >
                <AlertTriangle
                  className={`w-6 h-6 ${diffHoursUpcoming <= 24 ? 'text-orange-600' : 'text-sky-600'}`}
                />
              </div>
              <div>
                <h3
                  className={`font-bold ${diffHoursUpcoming <= 24 ? 'text-orange-900' : 'text-sky-900'}`}
                >
                  {diffHoursUpcoming <= 24
                    ? 'Lembrete: Sessão em breve!'
                    : 'Confirme sua próxima sessão'}
                </h3>
                <p
                  className={`text-sm mt-1 ${diffHoursUpcoming <= 24 ? 'text-orange-800' : 'text-sky-800'}`}
                >
                  Você tem uma consulta com{' '}
                  <strong>{psicoConfig?.nome_profissional || 'seu psicólogo(a)'}</strong> em{' '}
                  <strong>
                    {format(
                      new Date(upcomingToConfirm.appointment_date.substring(0, 10) + 'T12:00:00Z'),
                      "dd/MM 'às'",
                      { locale: ptBR },
                    )}{' '}
                    {upcomingToConfirm.start_time}
                  </strong>
                  . Por favor, confirme sua presença.
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleConfirm(upcomingToConfirm.id)}
              className={`${diffHoursUpcoming <= 24 ? 'bg-orange-600 hover:bg-orange-700' : 'bg-sky-600 hover:bg-sky-700'} text-white whitespace-nowrap shrink-0`}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirmar Presença
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="bg-emerald-100/80 rounded-3xl p-8 shadow-sm border border-emerald-200 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-emerald-900 tracking-tight">
            Bem-vindo(a), {patient.name.split(' ')[0]}!
          </h2>
          <p className="text-emerald-700 mt-3 text-lg font-medium">
            Este é o seu espaço seguro. Como você está se sentindo hoje?
          </p>
        </div>
        <img
          src="https://img.usecurling.com/i?q=meditation&color=spring-green&shape=lineal-color"
          alt="Meditation"
          className="w-32 h-32 object-contain mix-blend-multiply opacity-90 relative z-10"
        />
        {/* Decorative background blob */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-200/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sky-200/50 rounded-full blur-3xl" />
      </div>

      {psicoConfig?.nome_profissional && (
        <Card className="border-emerald-100 shadow-sm bg-white overflow-hidden rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-emerald-50">
                <AvatarImage
                  src={
                    psicoConfig.logo
                      ? pb.files.getUrl(
                          {
                            collectionId: psicoConfig.id,
                            collectionName: 'config_clinica',
                            id: psicoConfig.id,
                            logo: psicoConfig.logo,
                          } as any,
                          psicoConfig.logo,
                        )
                      : ''
                  }
                />
                <AvatarFallback className="bg-emerald-100 text-emerald-800 text-2xl font-bold">
                  {psicoConfig.nome_profissional.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-xl font-bold text-emerald-900">
                  {psicoConfig.nome_profissional}
                </h3>
                {psicoConfig.abordagem_principal && (
                  <p className="text-emerald-700 font-medium mb-3">
                    {psicoConfig.abordagem_principal}
                  </p>
                )}
                {psicoConfig.texto_apresentacao && (
                  <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
                    {psicoConfig.texto_apresentacao}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/portal/diario" className="block group">
          <Card className="hover:shadow-lg transition-all duration-300 border-emerald-100 bg-white h-full group-hover:-translate-y-1">
            <CardHeader className="pb-2">
              <div className="bg-sky-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BookHeart className="w-7 h-7 text-sky-600" />
              </div>
              <CardTitle className="text-emerald-800 text-xl">Diário Pessoal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-600/80 text-sm leading-relaxed">
                Registre suas emoções, pensamentos e reflexões diárias de forma particular.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/portal/tarefas" className="block group">
          <Card className="hover:shadow-lg transition-all duration-300 border-emerald-100 bg-white h-full group-hover:-translate-y-1">
            <CardHeader className="pb-2">
              <div className="bg-emerald-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-7 h-7 text-emerald-600" />
              </div>
              <CardTitle className="text-emerald-800 text-xl">Tarefas e Escalas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-600/80 text-sm leading-relaxed">
                Acompanhe atividades sugeridas pelo seu terapeuta e marque as concluídas.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/portal/documentos" className="block group">
          <Card className="hover:shadow-lg transition-all duration-300 border-emerald-100 bg-white h-full group-hover:-translate-y-1">
            <CardHeader className="pb-2">
              <div className="bg-sky-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-sky-600" />
              </div>
              <CardTitle className="text-emerald-800 text-xl">Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-600/80 text-sm leading-relaxed">
                Acesse facilmente arquivos, recibos e materiais de apoio compartilhados.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="border-emerald-100 shadow-sm bg-white overflow-hidden rounded-2xl">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 py-4">
          <CardTitle className="flex items-center gap-2 text-emerald-800 text-lg">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            Próximas Sessões
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {appointments.length > 0 ? (
            <div className="divide-y divide-emerald-100">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-emerald-900 capitalize text-base">
                      {format(
                        new Date(apt.time || apt.appointment_date + 'T' + apt.start_time),
                        "EEEE, d 'de' MMMM",
                        { locale: ptBR },
                      )}
                    </p>
                    <p className="text-sm text-emerald-700 mt-1 flex items-center gap-2">
                      <span className="font-medium">
                        {format(
                          new Date(apt.time || apt.appointment_date + 'T' + apt.start_time),
                          'HH:mm',
                        )}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                      {apt.type}
                    </p>
                  </div>
                  <div
                    className={`px-4 py-1.5 rounded-full text-sm font-medium shadow-sm border capitalize ${
                      apt.status === 'confirmada'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : apt.status === 'concluida'
                          ? 'bg-[#e0fbfc] text-[#0f4c5c] border-[#98c1d9]'
                          : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {apt.status || 'Agendada'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-emerald-600/80 text-center py-8">
              Nenhuma sessão futura encontrada.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
