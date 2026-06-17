import pb from '@/lib/pocketbase/client'

export interface ConfigClinica {
  id: string
  user_id: string
  nome_clinica?: string
  crp_psicologo?: string
  documento_identificacao?: string
  endereco_completo?: string
  telefone_ddi?: string
  email_contato?: string
  logo?: string
  cor_primaria?: string
  tempo_sessao_minutos?: number
  valor_consulta_padrao?: number
  intervalo_consultas_minutos?: number
  horario_inicio?: string
  horario_fim?: string
  dias_atendimento?: string[]
  termos_responsabilidade?: string
  nome_profissional?: string
  abordagem_principal?: string
  tempo_formacao?: string
  texto_apresentacao?: string
  metodo_pagamento_preferencial?: string
  texto_recibo_padrao?: string
}

export const getConfig = async (userId: string): Promise<ConfigClinica | null> => {
  try {
    const records = await pb.collection('config_clinica').getList(1, 1, {
      filter: `user_id = '${userId}'`,
    })
    return records.items.length > 0 ? (records.items[0] as unknown as ConfigClinica) : null
  } catch {
    return null
  }
}

export const saveConfig = async (
  userId: string,
  data: Partial<ConfigClinica>,
): Promise<ConfigClinica> => {
  const existing = await getConfig(userId)
  if (existing) {
    return pb
      .collection('config_clinica')
      .update(existing.id, data) as unknown as Promise<ConfigClinica>
  } else {
    return pb
      .collection('config_clinica')
      .create({ ...data, user_id: userId }) as unknown as Promise<ConfigClinica>
  }
}
