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

export const getAnamnese = async (patientId: string): Promise<Anamnese | null> => {
  try {
    return await pb
      .collection<Anamnese>('anamneses')
      .getFirstListItem(`patient_id = '${patientId}'`)
  } catch (err: any) {
    if (err.status === 404) return null
    throw err
  }
}

export const saveAnamnese = async (data: Partial<Anamnese>): Promise<Anamnese> => {
  if (data.id) {
    return pb.collection<Anamnese>('anamneses').update(data.id, data)
  } else {
    return pb
      .collection<Anamnese>('anamneses')
      .create({ ...data, user_id: pb.authStore.record?.id })
  }
}
