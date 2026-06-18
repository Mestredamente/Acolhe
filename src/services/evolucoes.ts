import pb from '@/lib/pocketbase/client'

export interface Evolucao {
  id: string
  patient_id: string
  appointment_id: string
  session_date: string
  content: string
  ai_summary: string
  is_signed: boolean
  deleted_at?: string
}

export const getEvolucoes = async (patientId: string) => {
  return await pb.collection<Evolucao>('evolucoes').getFullList({
    filter: `patient_id = '${patientId}' && deleted_at = ""`,
    sort: '-session_date',
  })
}

export const getAllEvolucoes = async () => {
  return await pb
    .collection<Evolucao>('evolucoes')
    .getFullList({ filter: 'deleted_at = ""', sort: '-session_date' })
}

export const createEvolucao = async (data: Partial<Evolucao>) => {
  const evo = await pb.collection<Evolucao>('evolucoes').create(data)
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'escrita',
      tabela_afetada: 'evolucoes',
      registro_id: evo.id,
      descricao: 'Evolução criada',
    }),
  )
  return evo
}

export const updateEvolucao = async (id: string, data: Partial<Evolucao>) => {
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'escrita',
      tabela_afetada: 'evolucoes',
      registro_id: id,
      descricao: 'Evolução atualizada',
    }),
  )
  return await pb.collection<Evolucao>('evolucoes').update(id, data)
}

export const deleteEvolucao = async (id: string) => {
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'exclusao_logica',
      tabela_afetada: 'evolucoes',
      registro_id: id,
      descricao: 'Evolução excluída logicamente',
    }),
  )
  return await pb
    .collection<Evolucao>('evolucoes')
    .update(id, { deleted_at: new Date().toISOString() })
}
