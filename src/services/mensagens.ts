import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'

export interface Mensagem extends RecordModel {
  sender_id: string
  recipient_id: string
  patient_id: string
  content: string
  read_status: 'lida' | 'nao_lida'
  sender_type: 'psicologo' | 'paciente'
}

export const sendMessage = async (data: {
  patient_id: string
  content: string
  sender_type: 'psicologo' | 'paciente'
}) => {
  return pb.send('/backend/v1/mensagens/send', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const markAsRead = async (messageIds: string[]) => {
  const promises = messageIds.map((id) =>
    pb.collection('mensagens').update(id, { read_status: 'lida' }),
  )
  return Promise.all(promises)
}
