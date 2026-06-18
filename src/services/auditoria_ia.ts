import pb from '@/lib/pocketbase/client'

export interface AuditoriaIA {
  id: string
  user_id: string
  tipo_operacao: 'evolução' | 'diário' | 'documento' | 'análise de padrões' | 'análise preditiva'
  provedor_usado: string
  resumo_prompt: string
  resumo_resposta: string
  status: 'sucesso' | 'falha' | 'aguardando validação'
  data_hora: string
  created: string
  updated: string
}

export const getAuditorias = async (): Promise<AuditoriaIA[]> => {
  try {
    const records = await pb.collection('auditoria_ia').getFullList({
      sort: '-created',
    })
    return records as unknown as AuditoriaIA[]
  } catch {
    return []
  }
}

export const createAuditoria = async (data: Partial<AuditoriaIA>): Promise<AuditoriaIA | null> => {
  try {
    const record = await pb.collection('auditoria_ia').create(data)
    return record as unknown as AuditoriaIA
  } catch (e) {
    console.error('Error creating auditoria IA log', e)
    return null
  }
}
