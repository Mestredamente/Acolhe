import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Calendar as CalendarIcon, Clock, Video, MapPin, Eye, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'
import { Calendar } from '@/components/ui/calendar'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'
import { format, isBefore, isAfter, startOfDay, addMinutes, parse, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function PortalAtendimentos() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [cancelModal, setCancelModal] = useState<{ open: boolean; apt: any }>({
    open: false,
    apt: null,
  })
  const [cancelReason, setCancelReason] = useState('')

  const [rescheduleModal, setRescheduleModal] = useState<{ open: boolean; apt: any }>({
    open: false,
    apt: null,
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [psychConfig, setPsychConfig] = useState<any>(null)
  const [busySlots, setBusySlots] = useState<string[]>([])

  const [detailsModal, setDetailsModal] = useState<{ open: boolean; apt: any }>({
    open: false,
    apt: null,
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const records = await pb.collection('appointments').getFullList({
        filter: `patient_id.email = '${user.email}' && deleted_at = ""`,
        expand: 'user_id,patient_id',
        sort: '-appointment_date',
      })
      setAppointments(records)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getAptDateTime = (apt: any) => {
    const dateStr = apt.appointment_date.split(' ')[0] || apt.appointment_date.split('T')[0]
    return parse(`${dateStr} ${apt.start_time}`, 'yyyy-MM-dd HH:mm', new Date())
  }

  const isCancellable = (apt: any) => {
    const aptDate = getAptDateTime(apt)
    return (aptDate.getTime() - Date.now()) / (1000 * 60 * 60) >= 24
  }

  const handleCancel = async () => {
    const apt = cancelModal.apt
    if (!apt) return
    try {
      await pb.collection('appointments').update(apt.id, {
        status: 'cancelada_pelo_paciente',
        cancel_reason: cancelReason,
        canceled_at: new Date().toISOString(),
      })
      await pb.collection('notificacoes').create({
        user_id: apt.user_id,
        patient_id: apt.patient_id,
        type: 'sistema',
        title: 'Consulta Cancelada',
        message: `O paciente ${user.name} cancelou a consulta do dia ${format(getAptDateTime(apt), 'dd/MM/yyyy')} às ${apt.start_time}. Motivo: ${cancelReason || 'Não informado'}`,
        status: 'nao_lida',
      })
      toast({ title: 'Consulta cancelada com sucesso.' })
      setCancelModal({ open: false, apt: null })
      setCancelReason('')
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao cancelar', description: err.message, variant: 'destructive' })
    }
  }

  const fetchPsychConfig = async (userId: string) => {
    try {
      const records = await pb
        .collection('config_clinica')
        .getList(1, 1, { filter: `user_id = '${userId}'` })
      if (records.items.length > 0) setPsychConfig(records.items[0])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchBusySlots = async (userId: string, date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const records = await pb.collection('appointments').getFullList({
        filter: `user_id = '${userId}' && appointment_date >= '${dateStr} 00:00:00' && appointment_date <= '${dateStr} 23:59:59' && status != 'cancelada' && status != 'cancelada_pelo_paciente' && deleted_at = ""`,
      })
      setBusySlots(records.map((r) => r.start_time))
    } catch (err) {
      setBusySlots([])
    }
  }

  const handleOpenReschedule = (apt: any) => {
    setRescheduleModal({ open: true, apt })
    setSelectedDate(undefined)
    setSelectedSlot(null)
    setAvailableSlots([])
    fetchPsychConfig(apt.user_id)
  }

  useEffect(() => {
    if (selectedDate && rescheduleModal.apt && psychConfig) {
      fetchBusySlots(rescheduleModal.apt.user_id, selectedDate).then(() => {
        const dayOfWeek = selectedDate.getDay()
        const daysMap = [
          'Domingo',
          'Segunda-feira',
          'Terça-feira',
          'Quarta-feira',
          'Quinta-feira',
          'Sexta-feira',
          'Sábado',
        ]
        const dayName = daysMap[dayOfWeek]

        const diasAtendimento = Array.isArray(psychConfig.dias_atendimento)
          ? psychConfig.dias_atendimento
          : JSON.parse(psychConfig.dias_atendimento || '[]')

        if (!diasAtendimento.includes(dayName)) {
          setAvailableSlots([])
          return
        }

        const start = psychConfig.horario_inicio || '08:00'
        const end = psychConfig.horario_fim || '18:00'
        const duration = psychConfig.tempo_sessao_minutos || 50
        const interval = psychConfig.intervalo_consultas_minutos || 10

        let current = parse(start, 'HH:mm', new Date())
        const endTime = parse(end, 'HH:mm', new Date())
        const slots = []

        while (isBefore(current, endTime) || current.getTime() === endTime.getTime()) {
          const slotStr = format(current, 'HH:mm')
          let isFuture = true
          if (isSameDay(selectedDate, new Date())) {
            const slotDateTime = parse(
              `${format(selectedDate, 'yyyy-MM-dd')} ${slotStr}`,
              'yyyy-MM-dd HH:mm',
              new Date(),
            )
            if (isBefore(slotDateTime, new Date())) {
              isFuture = false
            }
          }

          if (!busySlots.includes(slotStr) && isFuture) {
            slots.push(slotStr)
          }
          current = addMinutes(current, duration + interval)
        }
        setAvailableSlots(slots)
      })
    }
  }, [selectedDate, busySlots, psychConfig])

  const handleReschedule = async () => {
    const apt = rescheduleModal.apt
    if (!apt || !selectedDate || !selectedSlot) return
    try {
      const newDateStr = format(selectedDate, 'yyyy-MM-dd 12:00:00.000') + 'Z'
      const duration = psychConfig?.tempo_sessao_minutos || 50
      const newEnd = format(addMinutes(parse(selectedSlot, 'HH:mm', new Date()), duration), 'HH:mm')

      await pb.collection('appointments').update(apt.id, {
        status: 'reagendada',
        appointment_date: newDateStr,
        start_time: selectedSlot,
        end_time: newEnd,
      })

      await pb.collection('notificacoes').create({
        user_id: apt.user_id,
        patient_id: apt.patient_id,
        type: 'sistema',
        title: 'Consulta Reagendada',
        message: `O paciente ${user.name} reagendou a consulta para o dia ${format(selectedDate, 'dd/MM/yyyy')} às ${selectedSlot}.`,
        status: 'nao_lida',
      })

      toast({ title: 'Consulta reagendada com sucesso.' })
      setRescheduleModal({ open: false, apt: null })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao reagendar', description: err.message, variant: 'destructive' })
    }
  }

  const futureApts = appointments.filter((a) => {
    const d = getAptDateTime(a)
    return (
      isAfter(d, startOfDay(new Date())) &&
      !['cancelada', 'cancelada_pelo_paciente', 'concluida'].includes(a.status)
    )
  })

  const historyApts = appointments.filter((a) => {
    const d = getAptDateTime(a)
    return (
      isBefore(d, startOfDay(new Date())) ||
      ['cancelada', 'cancelada_pelo_paciente', 'concluida'].includes(a.status)
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendada':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Agendada
          </span>
        )
      case 'confirmada':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            Confirmada
          </span>
        )
      case 'reagendada':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Reagendada
          </span>
        )
      case 'cancelada':
      case 'cancelada_pelo_paciente':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
            Cancelada
          </span>
        )
      case 'concluida':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            Concluída
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            {status}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="loading-spinner border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meus Atendimentos</h1>
        <p className="text-slate-500">Acompanhe suas sessões e histórico de consultas.</p>
      </div>

      <Alert className="bg-primary/5 text-primary border-primary/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="ml-2 font-medium">
          Gerencie seus atendimentos. Cancelamentos e reagendamentos notificam automaticamente o
          psicólogo. Conforme política de cancelamento.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="futuras" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="futuras">Próximas Consultas</TabsTrigger>
          <TabsTrigger value="historico">Histórico de Atendimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="futuras" className="mt-6 space-y-4">
          {futureApts.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                <CalendarIcon className="w-12 h-12 mb-4 text-slate-300" />
                <p>Nenhuma consulta futura agendada.</p>
              </CardContent>
            </Card>
          ) : (
            futureApts.map((apt) => {
              const d = getAptDateTime(apt)
              const cancellable = isCancellable(apt)

              const now = new Date()
              const isFutureApt = isAfter(d, now)
              const minsToApt = (d.getTime() - now.getTime()) / 60000
              const isReady = minsToApt <= 15 && minsToApt > -120 // active 15 mins before and up to 2h after
              const isOnline = apt.type === 'Online' && apt.link_sessao

              return (
                <Card key={apt.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row border-l-4 border-l-primary">
                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-slate-400" />
                          <span className="font-medium text-slate-900">
                            {format(d, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {apt.start_time} - {apt.end_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          {apt.type === 'Online' ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <MapPin className="w-4 h-4" />
                          )}
                          <span>
                            {apt.type} {apt.link_or_room && `- ${apt.link_or_room}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 sm:col-span-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                            {apt.expand?.user_id?.name?.charAt(0) || 'P'}
                          </div>
                          <span>Psicólogo: {apt.expand?.user_id?.name || 'Profissional'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-6 flex sm:flex-col items-center justify-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100">
                      {isOnline && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full sm:w-auto">
                              <Button
                                variant="default"
                                className="w-full sm:w-32 bg-blue-700 hover:bg-blue-800 text-white font-medium"
                                disabled={!isReady && isFutureApt}
                                onClick={() => window.open(apt.link_sessao, '_blank')}
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Entrar na Sessão
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {!isReady && isFutureApt && (
                            <TooltipContent side="top">
                              Acesso liberado às{' '}
                              {format(new Date(d.getTime() - 15 * 60000), 'HH:mm')}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-full sm:w-auto">
                            <Button
                              variant="outline"
                              className="w-full sm:w-32 bg-white"
                              disabled={!cancellable}
                              onClick={() => handleOpenReschedule(apt)}
                            >
                              Reagendar
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {!cancellable && (
                          <TooltipContent>
                            Cancelamento apenas com mais de 24 horas de antecedência. Consulte o
                            psicólogo.
                          </TooltipContent>
                        )}
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-full sm:w-auto">
                            <Button
                              variant="destructive"
                              className="w-full sm:w-32"
                              disabled={!cancellable}
                              onClick={() => setCancelModal({ open: true, apt })}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {!cancellable && (
                          <TooltipContent>
                            Cancelamento apenas com mais de 24 horas de antecedência. Consulte o
                            psicólogo.
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="historico" className="mt-6 space-y-4">
          {historyApts.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                <Clock className="w-12 h-12 mb-4 text-slate-300" />
                <p>Nenhum histórico de consultas encontrado.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border bg-white overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Psicólogo</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {historyApts.map((apt) => {
                    const d = getAptDateTime(apt)
                    return (
                      <tr key={apt.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">
                            {format(d, 'dd/MM/yyyy')}
                          </div>
                          <div className="text-xs text-slate-500">{apt.start_time}</div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-slate-600">
                          {apt.expand?.user_id?.name || 'Profissional'}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(apt.status)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailsModal({ open: true, apt })}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={cancelModal.open}
        onOpenChange={(o) => !o && setCancelModal({ open: false, apt: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Consulta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar esta consulta? O psicólogo será notificado.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Motivo do cancelamento (opcional)
            </label>
            <Textarea
              placeholder="Digite o motivo..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModal({ open: false, apt: null })}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rescheduleModal.open}
        onOpenChange={(o) => !o && setRescheduleModal({ open: false, apt: null })}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reagendar Consulta</DialogTitle>
            <DialogDescription>
              Selecione uma nova data e horário disponíveis na agenda do profissional.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Escolha o dia</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
                className="rounded-md border shadow-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Escolha o horário
              </label>
              {!selectedDate ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-500 bg-slate-50 rounded-md border border-dashed p-4 text-center">
                  Selecione uma data para ver os horários
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-500 bg-slate-50 rounded-md border border-dashed p-4 text-center">
                  Nenhum horário disponível para este dia
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedSlot === slot ? 'default' : 'outline'}
                      className={cn(
                        'w-full',
                        selectedSlot === slot && 'ring-2 ring-primary ring-offset-2',
                      )}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRescheduleModal({ open: false, apt: null })}
            >
              Cancelar
            </Button>
            <Button onClick={handleReschedule} disabled={!selectedDate || !selectedSlot}>
              Confirmar Reagendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailsModal.open}
        onOpenChange={(o) => !o && setDetailsModal({ open: false, apt: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Consulta</DialogTitle>
          </DialogHeader>
          {detailsModal.apt && (
            <div className="space-y-4 py-4 text-sm text-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold block text-slate-900">Data</span>
                  {format(getAptDateTime(detailsModal.apt), 'dd/MM/yyyy')}
                </div>
                <div>
                  <span className="font-semibold block text-slate-900">Horário</span>
                  {detailsModal.apt.start_time} às {detailsModal.apt.end_time}
                </div>
                <div>
                  <span className="font-semibold block text-slate-900">Psicólogo</span>
                  {detailsModal.apt.expand?.user_id?.name || 'Não informado'}
                </div>
                <div>
                  <span className="font-semibold block text-slate-900">Modalidade</span>
                  {detailsModal.apt.type}
                </div>
                <div>
                  <span className="font-semibold block text-slate-900">Status</span>
                  <div className="mt-1">{getStatusBadge(detailsModal.apt.status)}</div>
                </div>
                {detailsModal.apt.link_or_room && (
                  <div className="col-span-2">
                    <span className="font-semibold block text-slate-900">Local / Link</span>
                    {detailsModal.apt.link_or_room}
                  </div>
                )}
                {detailsModal.apt.cancel_reason && (
                  <div className="col-span-2 p-3 bg-red-50 text-red-800 rounded-md border border-red-100">
                    <span className="font-semibold block mb-1">Motivo do Cancelamento:</span>
                    {detailsModal.apt.cancel_reason}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsModal({ open: false, apt: null })}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
