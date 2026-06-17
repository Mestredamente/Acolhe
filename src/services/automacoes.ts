import pb from '@/lib/pocketbase/client'

export interface Automacao {
  id: string
  user_id: string
  tipo: 'confirmacao' | 'lembrete' | 'pos_sessao'
  status: 'ativo' | 'inativo'
  horario_envio?: string
  mensagem_padrao?: string
  dias_antecedencia?: number
  horas_pos_sessao?: number
  created: string
  updated: string
}

export interface AutomacaoHistorico {
  id: string
  user_id: string
  patient_id: string
  tipo: 'confirmacao' | 'lembrete' | 'pos_sessao'
  data_envio: string
  status: 'enviado' | 'falha'
  expand?: {
    patient_id?: {
      id: string
      name: string
    }
  }
  created: string
}

export const getAutomacoes = async (): Promise<Automacao[]> => {
  const records = await pb.collection('automacoes').getFullList<Automacao>({
    sort: 'created',
  })
  return records
}

export const saveAutomacao = async (data: Partial<Automacao>): Promise<Automacao> => {
  if (data.id) {
    return await pb.collection('automacoes').update<Automacao>(data.id, data)
  }
  const userId = pb.authStore.record?.id
  return await pb.collection('automacoes').create<Automacao>({ ...data, user_id: userId })
}

export const getHistorico = async (): Promise<AutomacaoHistorico[]> => {
  const records = await pb.collection('automacoes_historico').getList<AutomacaoHistorico>(1, 50, {
    sort: '-data_envio',
    expand: 'patient_id',
  })
  return records.items
}
