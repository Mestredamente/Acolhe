import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { Appointment } from '@/services/appointments'
import { Transaction, createTransaction, updateTransaction } from '@/services/financeiro'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'

const schema = z.object({
  patient_id: z.string().min(1, 'Selecione um paciente'),
  appointment_id: z.string().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  payment_date: z.string().optional(),
  status: z.enum(['pendente', 'pago', 'atrasado', 'cancelado', 'aguardando']),
  payment_method: z
    .enum([
      'pix',
      'dinheiro',
      'cartao de credito',
      'cartao de debito',
      'boleto',
      'transferencia',
      '',
    ])
    .optional(),
  installments: z.coerce.number().min(1).default(1),
  observations: z.string().optional(),
})

export function FinanceiroFormDialog({
  open,
  onOpenChange,
  transaction,
  defaultPatientId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
  defaultPatientId?: string
}) {
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const isEditing = !!transaction

  useEffect(() => {
    if (open) {
      getPatients().then(setPatients).catch(console.error)
    }
  }, [open])

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: defaultPatientId || '',
      appointment_id: 'none',
      description: '',
      amount: 0,
      due_date: new Date().toISOString().substring(0, 10),
      payment_date: '',
      status: 'pendente',
      payment_method: '',
      installments: 1,
      observations: '',
    },
  })

  useEffect(() => {
    if (open && transaction) {
      form.reset({
        patient_id: transaction.patient_id,
        appointment_id: transaction.appointment_id || 'none',
        description: transaction.description,
        amount: transaction.amount,
        due_date: transaction.due_date ? transaction.due_date.substring(0, 10) : '',
        payment_date: transaction.payment_date ? transaction.payment_date.substring(0, 10) : '',
        status: transaction.status,
        payment_method: transaction.payment_method || '',
        installments: transaction.installments || 1,
        observations: transaction.observations || '',
      })
    } else if (open && !transaction) {
      form.reset({
        patient_id: defaultPatientId || '',
        appointment_id: 'none',
        description: '',
        amount: 0,
        due_date: new Date().toISOString().substring(0, 10),
        payment_date: '',
        status: 'pendente',
        payment_method: '',
        installments: 1,
        observations: '',
      })
    }
  }, [open, transaction, form, defaultPatientId])

  const selectedPatientId = form.watch('patient_id')
  const selectedAppointmentId = form.watch('appointment_id')

  useEffect(() => {
    if (selectedPatientId) {
      pb.collection<Appointment>('appointments')
        .getFullList({
          filter: `patient_id = '${selectedPatientId}'`,
          sort: '-appointment_date',
        })
        .then(setAppointments)
        .catch(console.error)
    } else {
      setAppointments([])
    }
  }, [selectedPatientId])

  useEffect(() => {
    if (selectedAppointmentId && selectedAppointmentId !== 'none' && !transaction) {
      const appt = appointments.find((a) => a.id === selectedAppointmentId)
      if (appt && appt.appointment_date) {
        const dateStr = new Date(appt.appointment_date).toLocaleDateString('pt-BR', {
          timeZone: 'UTC',
        })
        if (!form.getValues('description')) {
          form.setValue('description', `Consulta - ${dateStr}`)
        }
      }
    }
  }, [selectedAppointmentId, appointments, form, transaction])

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const payload = {
        ...data,
        appointment_id: data.appointment_id === 'none' ? '' : data.appointment_id,
        due_date: data.due_date ? new Date(data.due_date + 'T12:00:00Z').toISOString() : '',
        payment_date: data.payment_date
          ? new Date(data.payment_date + 'T12:00:00Z').toISOString()
          : '',
      }

      if (isEditing) {
        await updateTransaction(transaction.id, payload)
        toast({ title: 'Lançamento atualizado' })
      } else {
        await createTransaction(payload)
        toast({ title: 'Lançamento criado' })
      }
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro ao salvar lançamento', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Paciente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isEditing || !!defaultPatientId}
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

              <FormField
                control={form.control}
                name="appointment_id"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Vincular a Consulta</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedPatientId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {appointments.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.appointment_date
                              ? new Date(a.appointment_date).toLocaleDateString('pt-BR', {
                                  timeZone: 'UTC',
                                })
                              : 'Sessão'}{' '}
                            - {a.type}
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
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Sessão de Psicoterapia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parcelas</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
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
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                        <SelectItem value="aguardando">Aguardando</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="cartao de credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="cartao de debito">Cartão de Débito</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Pagamento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                      <Textarea placeholder="Notas adicionais sobre o pagamento..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit">Salvar Lançamento</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
