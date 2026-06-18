import { createAuditoria } from '@/services/auditoria_ia'
import pb from '@/lib/pocketbase/client'

const BLOCKED_TERMS = [
  'diagnóstico definitivo',
  'prescrição',
  'medicação',
  'receita médica',
  'remédio',
  'fluoxetina',
  'clonazepam',
  'sertralina',
]

export function checkClinicalSafety(text: string): boolean {
  if (!text) return true
  const lower = text.toLowerCase()
  return !BLOCKED_TERMS.some((term) => lower.includes(term))
}

export async function logAiUsage(data: {
  tipo_operacao: 'evolução' | 'diário' | 'documento' | 'análise de padrões' | 'análise preditiva'
  provedor_usado: string
  resumo_prompt: string
  resumo_resposta: string
  status: 'sucesso' | 'falha' | 'aguardando validação'
}) {
  try {
    const userId = pb.authStore.record?.id
    if (!userId) return

    await createAuditoria({
      ...data,
      user_id: userId,
    })
  } catch (e) {
    console.error('Failed to log AI usage', e)
  }
}
