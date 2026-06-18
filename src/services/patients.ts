import pb from '@/lib/pocketbase/client'

export interface Patient {
  id: string
  user_id: string
  name: string
  cpf?: string
  birth_date?: string
  phone?: string
  email?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  guardian_name?: string
  guardian_phone?: string
  billing_id?: string
  billing_address?: string
  status?: string
  avatar?: string
  last_consultation?: string
  link_convite?: string
  status_convite?: string
  guardian_cpf?: string
  guardian_relationship?: string
  guardian_consent_status?: string
  guardian_observations?: string
  cep?: string
  logradouro?: string
  numero?: string
  bairro?: string
  cidade?: string
  estado?: string
  pais?: string
  billing_cep?: string
  billing_logradouro?: string
  billing_numero?: string
  billing_bairro?: string
  billing_cidade?: string
  billing_estado?: string
  billing_pais?: string
  id_clinica?: string
  created: string
  updated: string
  deleted_at?: string
  is_teste?: boolean
}

export const getPatients = async () => {
  return await pb
    .collection<Patient>('patients')
    .getFullList({ filter: 'deleted_at = ""', sort: '-created' })
}

export const getPatient = async (id: string) => {
  return await pb.collection<Patient>('patients').getOne(id)
}

export const createPatient = async (data: Partial<Patient>) => {
  data.user_id = pb.authStore.record?.id
  const pt = await pb.collection<Patient>('patients').create(data)
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'escrita',
      tabela_afetada: 'patients',
      registro_id: pt.id,
      descricao: 'Paciente criado',
    }),
  )
  return pt
}

export const updatePatient = async (id: string, data: Partial<Patient>) => {
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'escrita',
      tabela_afetada: 'patients',
      registro_id: id,
      descricao: 'Paciente atualizado',
    }),
  )
  return await pb.collection<Patient>('patients').update(id, data)
}

export const deletePatient = async (id: string) => {
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'exclusao_logica',
      tabela_afetada: 'patients',
      registro_id: id,
      descricao: 'Paciente excluído logicamente',
    }),
  )
  return await pb
    .collection<Patient>('patients')
    .update(id, { deleted_at: new Date().toISOString() })
}
