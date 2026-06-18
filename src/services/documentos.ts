import pb from '@/lib/pocketbase/client'

export interface Documento {
  id: string
  user_id: string
  patient_id: string
  file_name: string
  doc_type: string
  description: string
  status: 'privado' | 'visivel_paciente' | 'pendente_assinatura'
  file: string
  is_ai_generated?: boolean
  created: string
  updated: string
}

export const getDocumentosByPatient = (patientId: string) => {
  return pb.collection<Documento>('documentos').getFullList({
    filter: `patient_id = '${patientId}'`,
    sort: '-created',
  })
}

export const getPortalDocumentos = () => {
  return pb.collection<Documento>('documentos').getFullList({
    filter: `status = 'visivel_paciente'`,
    sort: '-created',
    expand: 'patient_id',
  })
}

export const getAllDocumentos = () => {
  return pb.collection<Documento>('documentos').getFullList({
    sort: '-created',
  })
}

export const createDocumento = (data: Partial<Documento> | FormData) => {
  return pb.collection<Documento>('documentos').create(data)
}

export const updateDocumento = (id: string, data: Partial<Documento> | FormData) => {
  return pb.collection<Documento>('documentos').update(id, data)
}

export const deleteDocumento = (id: string) => {
  return pb.collection<Documento>('documentos').delete(id)
}

export const generateDocumentContent = async (payload: {
  patient_id: string
  doc_type: string
  context: string
  date: string
}) => {
  const res = await pb.send('/backend/v1/generate-document', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  })
  return res as { content: string }
}
