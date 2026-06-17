import pb from '@/lib/pocketbase/client'

export interface DiarioEntry {
  id: string
  user_id: string
  patient_id: string
  entry_date: string
  content: string
  sentiment: 'feliz' | 'neutro' | 'triste' | 'ansioso' | 'irritado' | 'esperançoso'
  created: string
  updated: string
}

export const getDiarioEntries = (patientId: string) =>
  pb
    .collection<DiarioEntry>('diario_paciente')
    .getFullList({ filter: `patient_id="${patientId}"`, sort: '-entry_date' })

export const getAllDiarios = () =>
  pb.collection<DiarioEntry>('diario_paciente').getFullList({ sort: '-entry_date' })

export const createDiarioEntry = (data: Partial<DiarioEntry>) =>
  pb.collection<DiarioEntry>('diario_paciente').create({
    ...data,
    user_id: pb.authStore.record?.id,
  })
