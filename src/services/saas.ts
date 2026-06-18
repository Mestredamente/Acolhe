import pb from '@/lib/pocketbase/client'
import { Clinica } from './clinicas'

export interface SaasAssinatura {
  id: string
  id_clinica: string
  plano: 'free' | 'profissional' | 'clinica' | 'corporativo'
  status: 'ativo' | 'trial' | 'suspenso' | 'cancelado'
  data_inicio: string
  data_renovacao: string
  valor_mensal: number
  limite_psicologos: number
  created: string
  updated: string
  expand?: {
    id_clinica?: Clinica
  }
}

export interface MetricasSaas {
  id: string
  data: string
  total_clinicas_ativas: number
  total_psicologos_ativos: number
  total_pacientes_cadastrados: number
  total_consultas_mes: number
  total_nfe_emitidas: number
  total_receita_plataforma: number
  ticket_medio_clinica: number
  created: string
  updated: string
}

export const getSaasAssinaturas = () =>
  pb
    .collection<SaasAssinatura>('saas_assinaturas')
    .getFullList({ expand: 'id_clinica', sort: '-created' })

export const updateSaasAssinatura = (id: string, data: Partial<SaasAssinatura>) =>
  pb.collection<SaasAssinatura>('saas_assinaturas').update(id, data)

export const getMetricasSaas = () =>
  pb.collection<MetricasSaas>('metricas_saas').getFullList({ sort: 'data' })
