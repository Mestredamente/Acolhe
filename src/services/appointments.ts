import pb from '@/lib/pocketbase/client'
import type { Patient } from './patients'

export interface Appointment {
  id: string
  user_id: string
  patient_id: string
  time: string
  type: 'Presencial' | 'Online'
  expand?: {
    patient_id: Patient
  }
}

export const getAppointments = () =>
  pb.collection<Appointment>('appointments').getFullList({ expand: 'patient_id', sort: 'time' })
