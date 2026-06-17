import pb from '@/lib/pocketbase/client'

export interface Assinatura {
  id: string
  registro_id: string
  tipo_registro: 'evolucao' | 'documento' | 'recibo'
  patient_id: string
  user_id: string
  data_assinatura: string
  status: 'assinado' | 'pendente'
  identificador_signatario: string
  signature_data?: string
  created: string
  updated: string
}

export const getAssinaturasByPatient = (patientId: string) => {
  return pb.collection<Assinatura>('assinaturas').getFullList({
    filter: `patient_id = '${patientId}'`,
  })
}

export const getAssinaturasByUser = (userId: string) => {
  return pb.collection<Assinatura>('assinaturas').getFullList({
    filter: `user_id = '${userId}'`,
  })
}

export const createAssinatura = (data: Partial<Assinatura>) => {
  return pb.collection<Assinatura>('assinaturas').create({
    ...data,
    user_id: pb.authStore.record?.id,
    data_assinatura: new Date().toISOString(),
    status: 'assinado',
  })
}
