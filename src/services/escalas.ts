import pb from '@/lib/pocketbase/client'

export interface QuestionOption {
  text: string
  value: number
}

export interface Question {
  id: string
  text: string
  options: QuestionOption[]
}

export interface Escala {
  id: string
  name: string
  description: string
  category: string
  application_instructions: string
  questions: Question[]
  created: string
  updated: string
}

export interface RespostaItem {
  question_id: string
  value: number
}

export interface RespostaEscala {
  id: string
  user_id: string
  patient_id: string
  scale_id: string
  response_date?: string
  responses_list?: RespostaItem[]
  total_score?: number
  ai_interpretation?: string
  status: 'pendente' | 'respondido'
  created: string
  updated: string
  expand?: {
    scale_id?: Escala
    patient_id?: any
  }
}

export const getEscalas = () => {
  return pb.collection<Escala>('escalas').getFullList({ sort: 'name' })
}

export const getRespostasByPatient = (patientId: string) => {
  return pb.collection<RespostaEscala>('respostas_escala').getFullList({
    filter: `patient_id = '${patientId}'`,
    sort: '-created',
    expand: 'scale_id',
  })
}

export const getRespostasPendenteForPortal = () => {
  return pb.collection<RespostaEscala>('respostas_escala').getFullList({
    filter: `status = 'pendente'`,
    sort: '-created',
    expand: 'scale_id',
  })
}

export const assignEscalaToPatient = (userId: string, patientId: string, scaleId: string) => {
  return pb.collection<RespostaEscala>('respostas_escala').create({
    user_id: userId,
    patient_id: patientId,
    scale_id: scaleId,
    status: 'pendente',
  })
}

export const saveResposta = (id: string, data: Partial<RespostaEscala>) => {
  return pb.collection<RespostaEscala>('respostas_escala').update(id, data)
}

export const getAllPendingRespostas = () => {
  return pb.collection<RespostaEscala>('respostas_escala').getFullList({
    filter: `status = 'pendente'`,
    expand: 'patient_id,scale_id',
  })
}

export const getAllRespostas = () => {
  return pb.collection<RespostaEscala>('respostas_escala').getFullList({
    sort: '-created',
  })
}
