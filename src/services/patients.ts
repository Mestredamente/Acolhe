import pb from '@/lib/pocketbase/client'

export interface Patient {
  id: string
  name: string
  cpf: string
  birth_date: string
  phone: string
  email: string
  address: string
  emergency_contact_name: string
  emergency_contact_phone: string
  guardian_name: string
  guardian_phone: string
  billing_id: string
  billing_address: string
  status: 'active' | 'inactive'
  avatar: string
  last_consultation: string
  link_convite?: string
  status_convite?: 'pendente' | 'enviado' | 'aceito'
  created: string
  updated: string
  user_id: string
}

export const getPatients = () =>
  pb.collection<Patient>('patients').getFullList({ sort: '-created' })

export const getPatient = (id: string) => pb.collection<Patient>('patients').getOne(id)

export const createPatient = (data: Partial<Patient>) => {
  return pb.collection<Patient>('patients').create({ ...data, user_id: pb.authStore.record?.id })
}

export const updatePatient = (id: string, data: Partial<Patient>) => {
  return pb.collection<Patient>('patients').update(id, data)
}

export const deletePatient = (id: string) => pb.collection<Patient>('patients').delete(id)
