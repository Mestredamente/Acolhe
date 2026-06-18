import pb from '@/lib/pocketbase/client'

export interface Clinica {
  id: string
  nome: string
  cnpj: string
  telefone: string
  email: string
  cep: string
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  pais: string
  status: 'ativa' | 'inativa'
  admin_id: string
  created: string
  updated: string
}

export const getClinicas = () =>
  pb.collection<Clinica>('clinicas').getFullList({ sort: '-created' })
export const getClinica = (id: string) => pb.collection<Clinica>('clinicas').getOne(id)
export const createClinica = (data: Partial<Clinica>) =>
  pb.collection<Clinica>('clinicas').create({ ...data, admin_id: pb.authStore.record?.id })
export const updateClinica = (id: string, data: Partial<Clinica>) =>
  pb.collection<Clinica>('clinicas').update(id, data)
export const deleteClinica = (id: string) => pb.collection<Clinica>('clinicas').delete(id)
