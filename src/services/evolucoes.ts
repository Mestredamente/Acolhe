import pb from '@/lib/pocketbase/client'
import type { Patient } from './patients'
import type { Appointment } from './appointments'

export interface Evolucao {
  id: string
  user_id: string
  patient_id: string
  appointment_id: string
  session_date: string
  content: string
  ai_summary: string
  is_signed: boolean
  created: string
  updated: string
  expand?: {
    patient_id?: Patient
    appointment_id?: Appointment
  }
}

export const getEvolucoes = (patientId: string) =>
  pb.collection<Evolucao>('evolucoes').getFullList({
    filter: `patient_id = '${patientId}'`,
    sort: '-session_date',
    expand: 'appointment_id',
  })

export const createEvolucao = (data: Partial<Evolucao>) =>
  pb.collection<Evolucao>('evolucoes').create({ ...data, user_id: pb.authStore.record?.id })

export const updateEvolucao = (id: string, data: Partial<Evolucao>) =>
  pb.collection<Evolucao>('evolucoes').update(id, data)

export const deleteEvolucao = (id: string) => pb.collection<Evolucao>('evolucoes').delete(id)
