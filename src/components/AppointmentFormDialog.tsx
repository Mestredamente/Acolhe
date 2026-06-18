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
import { Checkbox } from '@/components/ui/checkbox'
import { Patient, getPatients } from '@/services/patients'
import { Appointment, createAppointment, updateAppointment } from '@/services/appointments'
import { toast } from '@/components/ui/use-toast'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckSquare } from 'lucide-react'
import { getConfig, ConfigClinica } from '@/services/config_clinica'
import pb from '@/lib/pocketbase/client'

const schema = z
  .object({
    tipo_sessao: z.enum(['individual', 'grupo']).default('individual'),
    patient_id: z.union([z.string(), z.array(z.string())]),
    grupo_id: z.string().optional(),
    appointment_date: z.string().min(1, 'Data é obrigatória'),
    start_time: z.string().min(1, 'Hora de início obrigatória'),
    end_time: z.string().min(1, 'Hora de término obrigatória'),
    type: z.enum(['Presencial', 'Online']),
    status: z.enum(['agendada', 'confirmada', 'cancelada', 'concluida']),
    observations: z.string().optional(),
    link_or_room: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.tipo_sessao === 'individual' && (!data.patient_id || data.patient_id.length === 0))
        return false
      if (data.tipo_sessao === 'grupo' && (!data.patient_id || data.patient_id.length === 0))
        return false
      return true
    },
    { message: 'Selecione pelo menos um paciente', path: ['patient_id'] },
  )

export function AppointmentFormDialog({
  trigger,
  appointment,
  onClose,
  defaultDate,
  defaultStartTime,
  defaultGrupoId,
  defaultParticipants,
  isGroupMode,
}: {
  trigger?: React.ReactNode
  appointment?: Appointment
  onClose?: () => void
  defaultDate?: string
  defaultStartTime?: string
  defaultGrupoId?: string
  defaultParticipants?: string[]
  isGroupMode?: boolean
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [config, setConfig] = useState<ConfigClinica | null>(null)
  const isEditing = !!appointment

  useEffect(() => {
    if (open) {
      getConfig(pb.authStore.record?.id || '')
        .then(setConfig)
        .catch(console.error)
      getPatients().then(setPatients).catch(console.error)
    }
  }, [open])

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo_sessao: appointment?.tipo_sessao || (isGroupMode ? 'grupo' : 'individual'),
      patient_id: appointment?.patient_id || defaultParticipants || '',
      grupo_id: appointment?.grupo_id || defaultGrupoId || '',
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
        tipo_sessao: appointment.tipo_sessao || 'individual',
        patient_id: appointment.patient_id,
        grupo_id: appointment.grupo_id || '',
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
    } else if (defaultDate || defaultStartTime || defaultGrupoId) {
      form.reset({
        ...form.getValues(),
        appointment_date: defaultDate || '',
        start_time: defaultStartTime || '',
        grupo_id: defaultGrupoId || '',
        patient_id: defaultParticipants || '',
        tipo_sessao: isGroupMode ? 'grupo' : 'individual',
      })
    }
  }, [
    appointment,
    form,
    defaultDate,
    defaultStartTime,
    defaultGrupoId,
    defaultParticipants,
    isGroupMode,
  ])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      if (!isEditing) form.reset()
      onClose?.()
    }
  }

  const tipoSessao = form.watch('tipo_sessao')

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const isGrupo = data.tipo_sessao === 'grupo'
      const patientIds = Array.isArray(data.patient_id) ? data.patient_id : [data.patient_id]

      if (isGrupo) {
        const limit = config?.limite_maximo_participantes_grupo || 15
        if (patientIds.length > limit) {
          form.setError('patient_id', {
            message: `Limite máximo de ${limit} participantes excedido.`,
          })
          return
        }
      }

      const patientNames = patientIds
        .map((id) => patients.find((p) => p.id === id)?.name)
        .filter(Boolean)
        .join(', ')
      const ptNameText = isGrupo ? `Grupo: ${patientNames}` : patientNames

      const payload = {
        ...data,
        patient_id: patientIds,
        patient_name_text: ptNameText,
        appointment_date: new Date(data.appointment_date + 'T12:00:00Z').toISOString(),
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
      } else {
        await createAppointment(payload)
        toast({ title: 'Consulta criada' })
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
                name="tipo_sessao"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Tipo de Sessão</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isEditing || isGroupMode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="grupo">Grupo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {tipoSessao === 'grupo' ? (
                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => {
                    const selected = Array.isArray(field.value) ? field.value : []
                    return (
                      <FormItem className="col-span-2">
                        <FormLabel>
                          Participantes ({selected.length}/
                          {config?.limite_maximo_participantes_grupo || 15})
                        </FormLabel>
                        <FormControl>
                          <div className="border rounded-md p-2 space-y-2 max-h-40 overflow-y-auto">
                            {patients.map((p) => (
                              <div key={p.id} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={selected.includes(p.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) field.onChange([...selected, p.id])
                                    else field.onChange(selected.filter((id) => id !== p.id))
                                  }}
                                />
                                <span className="text-sm">{p.name}</span>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Paciente</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange([val])}
                        value={Array.isArray(field.value) ? field.value[0] : field.value}
                        disabled={isEditing}
                      >
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
              )}

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
                    <FormLabel>Modalidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
                          <SelectValue />
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
                      <Input placeholder="ex: meet..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              {isEditing &&
                appointment?.status !== 'concluida' &&
                appointment?.status !== 'cancelada' && (
                  <Button type="button" variant="destructive" onClick={handleCancel}>
                    Cancelar
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
