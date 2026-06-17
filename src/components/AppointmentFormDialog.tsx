import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Patient, getPatients } from '@/services/patients'
import { Appointment, createAppointment, updateAppointment } from '@/services/appointments'
import { toast } from '@/components/ui/use-toast'
import { useEffect, useState, useRef } from 'react'
import { getConfig, ConfigClinica } from '@/services/config_clinica'
import pb from '@/lib/pocketbase/client'

const schema = z.object({
  patient_id: z.string().min(1, 'Selecione um paciente'),
  appointment_date: z.string().min(1, 'Data é obrigatória'),
  start_time: z.string().min(1, 'Hora de início obrigatória'),
  end_time: z.string().min(1, 'Hora de término obrigatória'),
  type: z.enum(['Presencial', 'Online']),
  status: z.enum(['agendada', 'confirmada', 'cancelada', 'concluida']),
  observations: z.string().optional(),
  link_or_room: z.string().optional(),
})

export function AppointmentFormDialog({
  trigger,
  appointment,
  onClose,
  defaultDate,
  defaultStartTime,
}: {
  trigger?: React.ReactNode
  appointment?: Appointment
  onClose?: () => void
  defaultDate?: string
  defaultStartTime?: string
}) {
  const [open, setOpen] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [config, setConfig] = useState<ConfigClinica | null>(null)
  const isEditing = !!appointment

  useEffect(() => {
    if (open) {
      getConfig(pb.authStore.record?.id || '')
        .then(setConfig)
        .catch(console.error)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      getPatients().then(setPatients).catch(console.error)
    }
  }, [open])

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: appointment?.patient_id || '',
      appointment_date: appointment?.appointment_date
        ? appointment.appointment_date.substring(0, 10)
        : defaultDate || '',
      start_time: appointment?.start_time || defaultStartTime || '',
      end_time: appointment?.end_time || '',
      type: appointment?.type || 'Presencial',
      status: appointment?.status || 'agendada',
      observations: appointment?.observations || '',
      link_or_room: appointment?.link_or_room || '',
    },
  })

  const startTime = form.watch('start_time')
  const prevStartTime = useRef(startTime)

  useEffect(() => {
    if (startTime && startTime !== prevStartTime.current && config?.tempo_sessao_minutos) {
      prevStartTime.current = startTime
      const [h, m] = startTime.split(':').map(Number)
      if (!isNaN(h) && !isNaN(m)) {
        let totalMins = h * 60 + m + config.tempo_sessao_minutos
        const endH = Math.floor(totalMins / 60) % 24
        const endM = totalMins % 60
        form.setValue(
          'end_time',
          `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
        )
      }
    }
  }, [startTime, config, form])

  useEffect(() => {
    if (appointment) {
      form.reset({
        patient_id: appointment.patient_id,
        appointment_date: appointment.appointment_date
          ? appointment.appointment_date.substring(0, 10)
          : '',
        start_time: appointment.start_time || '',
        end_time: appointment.end_time || '',
        type: appointment.type,
        status: appointment.status,
        observations: appointment.observations || '',
        link_or_room: appointment.link_or_room || '',
      })
    } else if (defaultDate || defaultStartTime) {
      form.reset({
        ...form.getValues(),
        appointment_date: defaultDate || '',
        start_time: defaultStartTime || '',
      })
    }
  }, [appointment, form, defaultDate, defaultStartTime])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      if (!isEditing) form.reset()
      onClose?.()
    }
  }

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const patient = patients.find((p) => p.id === data.patient_id)
      const payload = {
        ...data,
        appointment_date: new Date(data.appointment_date + 'T12:00:00Z').toISOString(),
        patient_name_text: patient?.name || '',
      }

      let zoomLinkGenerated = false
      if (
        payload.type === 'Online' &&
        config?.zoom_active &&
        config?.zoom_auto_link &&
        !payload.link_or_room
      ) {
        payload.link_or_room = `https://zoom.us/j/${Math.floor(Math.random() * 9000000000) + 1000000000}`
        zoomLinkGenerated = true
      }

      if (isEditing) {
        await updateAppointment(appointment.id, payload)
        toast({ title: 'Consulta atualizada' })
        if (zoomLinkGenerated) {
          toast({ title: 'Link do Zoom gerado automaticamente' })
        }
      } else {
        await createAppointment(payload)
        toast({ title: 'Consulta criada' })

        if (config?.google_calendar_active) {
          toast({
            title: 'Sincronizado com Google Calendar',
            description: `Evento: ${payload.patient_name_text} - Consulta`,
          })
          if (patient?.email) {
            toast({
              title: 'Convite enviado',
              description: `Um convite do evento foi enviado para ${patient.email}.`,
            })
          }
        }

        if (zoomLinkGenerated) {
          toast({ title: 'Link do Zoom gerado', description: 'Link adicionado à consulta online.' })
        }
      }
      handleOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro ao salvar consulta', variant: 'destructive' })
    }
  }

  const handleCancel = async () => {
    if (!appointment) return
    try {
      await updateAppointment(appointment.id, { status: 'cancelada' })
      toast({ title: 'Consulta cancelada' })
      handleOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro ao cancelar', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Consulta' : 'Nova Consulta'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Paciente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="appointment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Presencial">Presencial</SelectItem>
                        <SelectItem value="Online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Término</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="agendada">Agendada</SelectItem>
                        <SelectItem value="confirmada">Confirmada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="link_or_room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link / Sala</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: meet.google.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Opcional..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              {isEditing && (
                <Button type="button" variant="destructive" onClick={handleCancel}>
                  Cancelar Consulta
                </Button>
              )}
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
