import pb from '@/lib/pocketbase/client'
import { Clinica } from './clinicas'

export interface SaasPlano {
  id: string
  nome: string
  descricao?: string
  tipo: 'clinica' | 'autonomo'
  valor_mensal: number
  limite_psicologos?: number
  limite_pacientes?: number
  features?: string[]
  status: 'ativo' | 'inativo'
  created: string
  updated: string
}

export interface SaasAssinatura {
  id: string
  id_clinica?: string
  user_id?: string
  plano: string
  plano_id?: string
  status: 'ativo' | 'trial' | 'suspenso' | 'cancelado'
  data_inicio: string
  data_renovacao: string
  valor_mensal: number
  limite_psicologos: number
  created: string
  updated: string
  expand?: {
    id_clinica?: Clinica
    user_id?: any
    plano_id?: SaasPlano
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

export const getSaasPlanos = () =>
  pb.collection<SaasPlano>('saas_planos').getFullList({ sort: '-created' })

export const createSaasPlano = (data: Partial<SaasPlano>) =>
  pb.collection<SaasPlano>('saas_planos').create(data)

export const updateSaasPlano = (id: string, data: Partial<SaasPlano>) =>
  pb.collection<SaasPlano>('saas_planos').update(id, data)

export const getSaasAssinaturas = () =>
  pb
    .collection<SaasAssinatura>('saas_assinaturas')
    .getFullList({ expand: 'id_clinica,user_id,plano_id', sort: '-created' })

export const getSaasAssinaturasExpanded = getSaasAssinaturas

export const updateSaasAssinatura = (id: string, data: Partial<SaasAssinatura>) =>
  pb.collection<SaasAssinatura>('saas_assinaturas').update(id, data)

export const getMetricasSaas = () =>
  pb.collection<MetricasSaas>('metricas_saas').getFullList({ sort: 'data' })
