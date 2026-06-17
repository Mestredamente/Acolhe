import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRealtime } from '@/hooks/use-realtime'
import { getAppointments, Appointment } from '@/services/appointments'
import { AppointmentFormDialog } from '@/components/AppointmentFormDialog'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  agendada: 'bg-gray-100 border-gray-300 text-gray-700',
  confirmada: 'bg-emerald-700 border-emerald-800 text-white shadow-sm',
  cancelada: 'bg-red-100 border-red-300 text-red-800',
  concluida: 'bg-[#0f4c5c] border-[#0a3540] text-white shadow-sm',
}

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const loadData = async () => {
    try {
      const apts = await getAppointments()
      setAppointments(apts)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('appointments', loadData)

  const startOfWeek = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() - currentDate.getDay(),
  )

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d
  })

  const nextWeek = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7),
    )
  const prevWeek = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7),
    )
  const today = () => setCurrentDate(new Date())

  const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 08:00 to 20:00

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Agenda Semanal</h1>
          <p className="text-muted-foreground">
            {weekDays[0].toLocaleDateString('pt-BR')} a {weekDays[6].toLocaleDateString('pt-BR')}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs mt-2 font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border border-gray-300 bg-gray-100"></div> Agendada
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-700"></div> Confirmada
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[#0f4c5c]"></div> Concluída
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border border-red-300 bg-red-100"></div> Cancelada
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={today}>
            Hoje
          </Button>
          <div className="flex items-center gap-1 border rounded-md p-0.5 bg-background">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <AppointmentFormDialog
            trigger={
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nova Consulta
              </Button>
            }
          />
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col shadow-sm">
        <CardContent className="p-0 flex-1 overflow-y-auto">
          <div className="min-w-[800px] flex flex-col bg-background">
            <div className="flex border-b sticky top-0 z-20 bg-background/95 backdrop-blur">
              <div className="w-16 shrink-0 border-r" />
              {weekDays.map((d, i) => (
                <div key={i} className="flex-1 text-center py-3 border-r last:border-r-0">
                  <div className="text-xs text-muted-foreground uppercase font-medium">
                    {d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                  </div>
                  <div
                    className={cn(
                      'text-lg',
                      d.getDate() === new Date().getDate() &&
                        d.getMonth() === new Date().getMonth() &&
                        d.getFullYear() === new Date().getFullYear()
                        ? 'text-primary font-bold'
                        : 'text-foreground font-medium',
                    )}
                  >
                    {d.getDate()}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-1 relative">
              <div className="w-16 shrink-0 border-r bg-muted/20">
                {hours.map((h) => (
                  <div
                    key={h}
                    className="h-20 border-b text-xs text-muted-foreground text-center py-1"
                  >
                    {h.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              <div className="flex-1 flex relative">
                {hours.map((_, i) => (
                  <div
                    key={`grid-h-${i}`}
                    className="absolute w-full border-b pointer-events-none"
                    style={{ top: `${(i + 1) * 80}px` }}
                  />
                ))}

                {weekDays.map((d, i) => {
                  const dayApts = appointments.filter((a) => {
                    if (!a.appointment_date) return false
                    const ad = new Date(a.appointment_date)
                    return (
                      ad.getFullYear() === d.getFullYear() &&
                      ad.getMonth() === d.getMonth() &&
                      ad.getDate() === d.getDate()
                    )
                  })

                  return (
                    <div key={i} className="flex-1 border-r last:border-r-0 relative group/day">
                      {hours.map((h, hi) => (
                        <AppointmentFormDialog
                          key={`new-${h}`}
                          defaultDate={new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                            .toISOString()
                            .substring(0, 10)}
                          defaultStartTime={`${h.toString().padStart(2, '0')}:00`}
                          trigger={
                            <div
                              className="absolute w-full z-0 opacity-0 group-hover/day:opacity-100 hover:bg-primary/5 cursor-pointer transition-colors"
                              style={{ top: `${hi * 80}px`, height: '80px' }}
                            >
                              <div className="p-1 flex items-center justify-center h-full">
                                <Plus className="w-4 h-4 text-primary/50" />
                              </div>
                            </div>
                          }
                        />
                      ))}
                      {dayApts.map((apt) => {
                        const [sH, sM] = (apt.start_time || '08:00').split(':').map(Number)
                        const [eH, eM] = (apt.end_time || '09:00').split(':').map(Number)
                        const top = (((sH - 8) * 60 + sM) / 60) * 80
                        const height = (((eH - 8) * 60 + eM - ((sH - 8) * 60 + sM)) / 60) * 80

                        const displayTop = Math.max(0, top)
                        const displayHeight = Math.max(20, height)

                        if (sH < 8 || sH > 20) return null

                        return (
                          <div
                            key={apt.id}
                            className="absolute w-full px-1 py-0.5 z-10"
                            style={{ top: `${displayTop}px`, height: `${displayHeight}px` }}
                          >
                            <AppointmentFormDialog
                              appointment={apt}
                              trigger={
                                <div
                                  className={cn(
                                    'w-full h-full rounded-md border text-left flex flex-col p-1.5 cursor-pointer shadow-sm hover:brightness-95 transition-all overflow-hidden',
                                    statusColors[apt.status] || statusColors.agendada,
                                  )}
                                >
                                  <div className="text-[10px] font-semibold truncate leading-tight opacity-80">
                                    {apt.start_time} - {apt.end_time}
                                  </div>
                                  <div className="text-xs font-bold truncate leading-tight mt-0.5 flex items-center">
                                    {apt.status === 'confirmada' && (
                                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-200 shrink-0 mr-1" />
                                    )}
                                    {apt.status === 'agendada' && (
                                      <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mr-1.5 shadow-sm" />
                                    )}
                                    <span className="truncate">
                                      {apt.patient_name_text ||
                                        apt.expand?.patient_id?.name ||
                                        'Desconhecido'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] opacity-70 truncate mt-auto">
                                    {apt.type}
                                  </div>
                                </div>
                              }
                            />
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
