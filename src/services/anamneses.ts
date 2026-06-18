import pb from '@/lib/pocketbase/client'

export interface Anamnese {
  id: string
  user_id: string
  patient_id: string
  approach: string
  completion_date: string
  complaint: string
  family_history: string
  medical_history: string
  medications: string
  substance_use: string
  hospitalizations: string
  suicidal_ideation_past: string
  suicide_attempts: string
  family_psych_history: string
  consultation_reason: string
  treatment_expectations: string
  general_observations: string
  tcc_automatic_thoughts: string
  tcc_core_beliefs: string
  tcc_comorbidities: string
  psycho_family_dynamics: string
  psycho_dream_reports: string
  psycho_dev_history: string
  humanist_self_concept: string
  humanist_personal_resources: string
  humanist_support_network: string
  created: string
  updated: string
}

export const getAnamnese = async (patientId: string) => {
  try {
    return await pb
      .collection<Anamnese>('anamneses')
      .getFirstListItem(`patient_id = '${patientId}' && deleted_at = ""`)
  } catch {
    return null
  }
}

export const saveAnamnese = async (data: Partial<Anamnese>) => {
  let anamnese
  if (data.id) {
    anamnese = await pb.collection<Anamnese>('anamneses').update(data.id, data)
  } else {
    anamnese = await pb.collection<Anamnese>('anamneses').create(data)
  }
  await import('@/services/audit_logs').then((m) =>
    m.createAuditLog({
      usuario_id: pb.authStore.record?.id,
      acao: 'escrita',
      tabela_afetada: 'anamneses',
      registro_id: anamnese.id,
      descricao: 'Anamnese atualizada/salva',
    }),
  )
  return anamnese
}
