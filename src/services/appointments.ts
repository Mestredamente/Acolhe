import pb from '@/lib/pocketbase/client'

export interface Appointment {
  id: string
  patient_id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  type: string
  time: string
  cancel_reason?: string
  canceled_at?: string
  deleted_at?: string
  link_sessao?: string
  tipo_link?: 'proprio' | 'externo'
  data_geracao_link?: string
  expand?: any
}

export const getAppointments = async () => {
  return await pb
    .collection<Appointment>('appointments')
    .getFullList({ filter: 'deleted_at = ""', sort: '-appointment_date' })
}

export const createAppointment = async (data: Partial<Appointment>) => {
  const apt = await pb.collection<Appointment>('appointments').create(data)
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'escrita',
      tabela_afetada: 'appointments',
      registro_id: apt.id,
      descricao: 'Agendamento criado',
    }),
  )
  return apt
}

export const updateAppointment = async (id: string, data: Partial<Appointment>) => {
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'escrita',
      tabela_afetada: 'appointments',
      registro_id: id,
      descricao: 'Agendamento atualizado',
    }),
  )
  return await pb.collection<Appointment>('appointments').update(id, data)
}

export const deleteAppointment = async (id: string) => {
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'exclusao_logica',
      tabela_afetada: 'appointments',
      registro_id: id,
      descricao: 'Agendamento excluído logicamente',
    }),
  )
  return await pb
    .collection<Appointment>('appointments')
    .update(id, { deleted_at: new Date().toISOString() })
}
