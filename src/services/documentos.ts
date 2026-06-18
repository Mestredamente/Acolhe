import pb from '@/lib/pocketbase/client'

export interface Documento {
  id: string
  patient_id: string
  file_name: string
  doc_type: string
  status: string
  is_ai_generated: boolean
  created: string
  deleted_at?: string
}

export const getDocumentosByPatient = async (patientId: string) => {
  return await pb
    .collection<Documento>('documentos')
    .getFullList({ filter: `patient_id = '${patientId}' && deleted_at = ""`, sort: '-created' })
}

export const getPortalDocumentos = async (patientId: string) => {
  return await pb
    .collection<Documento>('documentos')
    .getFullList({
      filter: `patient_id = '${patientId}' && status = 'visivel_paciente' && deleted_at = ""`,
      sort: '-created',
    })
}

export const getAllDocumentos = async () => {
  return await pb
    .collection<Documento>('documentos')
    .getFullList({ filter: 'deleted_at = ""', sort: '-created' })
}

export const createDocumento = async (data: Partial<Documento>) => {
  const doc = await pb.collection<Documento>('documentos').create(data)
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'escrita',
      tabela_afetada: 'documentos',
      registro_id: doc.id,
      descricao: 'Documento criado',
    }),
  )
  return doc
}

export const updateDocumento = async (id: string, data: Partial<Documento>) => {
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'escrita',
      tabela_afetada: 'documentos',
      registro_id: id,
      descricao: 'Documento atualizado',
    }),
  )
  return await pb.collection<Documento>('documentos').update(id, data)
}

export const deleteDocumento = async (id: string) => {
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'exclusao_logica',
      tabela_afetada: 'documentos',
      registro_id: id,
      descricao: 'Documento excluído logicamente',
    }),
  )
  return await pb
    .collection<Documento>('documentos')
    .update(id, { deleted_at: new Date().toISOString() })
}

export const generateDocumentContent = async (params: any) => {
  return await pb.send('/backend/v1/generate-document', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })
}
