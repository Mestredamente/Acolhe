import pb from '@/lib/pocketbase/client'
import type { Patient } from './patients'

export interface Notificacao {
  id: string
  user_id: string
  perfil_destino: 'gestor_saas' | 'owner_clinica' | 'psicologo' | 'secretaria' | 'paciente'
  id_clinica?: string
  tenant_demo_id?: string
  patient_id?: string
  type: 'agenda' | 'prontuario' | 'financeiro' | 'sistema' | 'mensagem'
  title: string
  message: string
  status: 'lida' | 'nao_lida'
  read_date?: string
  is_active: boolean
  link?: string
  created: string
  updated: string
  expand?: {
    patient_id?: Patient
  }
}

export const getNotificacoes = () => {
  return pb.collection<Notificacao>('notificacoes').getFullList({
    sort: '-created',
    expand: 'patient_id',
  })
}

export const markAsRead = (id: string) => {
  return pb.collection<Notificacao>('notificacoes').update(id, {
    status: 'lida',
    read_date: new Date().toISOString(),
  })
}

export const markAllAsRead = async () => {
  const unread = await pb.collection<Notificacao>('notificacoes').getFullList({
    filter: 'status = "nao_lida"',
  })
  const promises = unread.map((n) => markAsRead(n.id))
  await Promise.all(promises)
}
