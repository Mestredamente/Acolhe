import pb from '@/lib/pocketbase/client'

export type EnvioDocumento = {
  id: string
  user_id: string
  patient_id: string
  tipo_documento: 'recibo' | 'nfe'
  documento_id: string
  destinatario: string
  data_envio: string
  status: 'enviado' | 'falha'
  mensagem_erro?: string
  visualizado: boolean
  created: string
  updated: string
  expand?: any
}

export const getEnviosDocumentos = async () => {
  return pb.collection('envios_documentos').getFullList<EnvioDocumento>({
    sort: '-data_envio',
    expand: 'patient_id',
  })
}

export const getEnviosDocumentosByPatient = async (patientId: string) => {
  return pb.collection('envios_documentos').getFullList<EnvioDocumento>({
    filter: `patient_id = '${patientId}'`,
    sort: '-data_envio',
    expand: 'patient_id',
  })
}

export const createEnvioDocumento = async (data: Partial<EnvioDocumento>) => {
  return pb.collection('envios_documentos').create<EnvioDocumento>(data)
}

export const updateEnvioDocumento = async (id: string, data: Partial<EnvioDocumento>) => {
  return pb.collection('envios_documentos').update<EnvioDocumento>(id, data)
}
