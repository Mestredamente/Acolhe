import pb from '@/lib/pocketbase/client'

export interface SupervisaoVinculo {
  id: string
  supervisor_id: string
  supervisionado_id: string
  status: 'ativo' | 'inativo'
  data_inicio: string
  created: string
  expand?: { supervisionado_id: any }
}

export interface SupervisaoFeedback {
  id: string
  supervisor_id: string
  supervisionado_id: string
  patient_id?: string
  evolucao_id?: string
  texto_feedback: string
  created: string
  expand?: { patient_id: any; evolucao_id: any }
}
