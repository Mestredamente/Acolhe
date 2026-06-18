import pb from '@/lib/pocketbase/client'

export interface Transaction {
  id: string
  patient_id: string
  amount: number
  description: string
  due_date: string
  status: string
  receipt_number?: string
  deleted_at?: string
}

export const getTransactions = async () => {
  return await pb
    .collection<Transaction>('financeiro')
    .getFullList({ filter: 'deleted_at = ""', sort: '-due_date' })
}

export const getTransactionsByPatient = async (patientId: string) => {
  return await pb
    .collection<Transaction>('financeiro')
    .getFullList({ filter: `patient_id = '${patientId}' && deleted_at = ""`, sort: '-due_date' })
}

export const createTransaction = async (data: Partial<Transaction>) => {
  const tx = await pb.collection<Transaction>('financeiro').create(data)
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'escrita',
      tabela_afetada: 'financeiro',
      registro_id: tx.id,
      descricao: 'Lançamento criado',
    }),
  )
  return tx
}

export const updateTransaction = async (id: string, data: Partial<Transaction>) => {
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'escrita',
      tabela_afetada: 'financeiro',
      registro_id: id,
      descricao: 'Lançamento atualizado',
    }),
  )
  return await pb.collection<Transaction>('financeiro').update(id, data)
}

export const deleteTransaction = async (id: string) => {
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'exclusao_logica',
      tabela_afetada: 'financeiro',
      registro_id: id,
      descricao: 'Lançamento excluído logicamente',
    }),
  )
  return await pb
    .collection<Transaction>('financeiro')
    .update(id, { deleted_at: new Date().toISOString() })
}
