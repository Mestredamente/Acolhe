import pb from '@/lib/pocketbase/client'
import type { Patient } from './patients'

export interface Appointment {
  id: string
  user_id: string
  patient_id: string | string[]
  grupo_id?: string
  tipo_sessao?: 'individual' | 'grupo'
  patient_name_text: string
  appointment_date: string
  start_time: string
  end_time: string
  type: 'Presencial' | 'Online'
  status: 'agendada' | 'confirmada' | 'cancelada' | 'concluida'
  observations: string
  link_or_room: string
  time?: string
  created: string
  updated: string
  expand?: {
    patient_id?: Patient | Patient[]
  }
}

export const getAppointments = () =>
  pb
    .collection<Appointment>('appointments')
    .getFullList({ expand: 'patient_id', sort: 'appointment_date,start_time' })

export const createAppointment = (data: Partial<Appointment>) =>
  pb.collection<Appointment>('appointments').create({ ...data, user_id: pb.authStore.record?.id })

export const updateAppointment = (id: string, data: Partial<Appointment>) =>
  pb.collection<Appointment>('appointments').update(id, data)

export const deleteAppointment = (id: string) =>
  pb.collection<Appointment>('appointments').delete(id)
