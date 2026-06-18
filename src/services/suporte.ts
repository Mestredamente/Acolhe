import pb from '@/lib/pocketbase/client'

export interface SuporteTicket {
  id: string
  usuario_id: string
  categoria: 'tecnico' | 'financeiro' | 'privade' | 'sugestao'
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  titulo: string
  descricao: string
  status: 'aberto' | 'em_atendimento' | 'resolvido' | 'fechado'
  resposta?: string
  data_resposta?: string
  created: string
  updated: string
  expand?: {
    usuario_id?: {
      id: string
      name: string
      email: string
      avatar_url?: string
      avatar?: string
    }
  }
}

export const getTickets = () =>
  pb
    .collection('suporte_tickets')
    .getFullList<SuporteTicket>({ sort: '-created', expand: 'usuario_id' })
export const createTicket = (data: Partial<SuporteTicket>) =>
  pb.collection('suporte_tickets').create<SuporteTicket>(data)
export const updateTicket = (id: string, data: Partial<SuporteTicket>) =>
  pb.collection('suporte_tickets').update<SuporteTicket>(id, data)
