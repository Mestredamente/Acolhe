import pb from '@/lib/pocketbase/client'

export interface Consentimento {
  id: string
  paciente_id: string
  tipo: 'lgpd' | 'uso_ia' | 'telepsicologia' | 'menor_de_idade' | 'termos_plataforma'
  aceito: boolean
  data_aceite?: string
  versao_termo?: string
  ip_aceite?: string
  deleted_at?: string
}

export const getConsentimentos = async (patientId: string) => {
  return await pb.collection<Consentimento>('consentimentos').getFullList({
    filter: `paciente_id = '${patientId}' && deleted_at = ""`,
  })
}

export const updateConsentimento = async (id: string, aceito: boolean) => {
  return await pb.collection('consentimentos').update(id, {
    aceito,
    data_aceite: aceito ? new Date().toISOString() : null,
  })
}

export const createConsentimento = async (data: Partial<Consentimento>) => {
  return await pb.collection('consentimentos').create(data)
}
