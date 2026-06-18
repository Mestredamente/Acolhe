import pb from '@/lib/pocketbase/client'
import type { Patient } from './patients'
import type { User } from './users'

export interface GrupoTerapeutico {
  id: string
  nome: string
  tema: string
  descricao: string
  id_clinica: string
  limite_participantes: number
  data_inicio: string
  status: 'ativo' | 'inativo'
  user_id: string
  participantes: string[]
  created: string
  updated: string
  expand?: {
    user_id?: User
    participantes?: Patient[]
  }
}

export const getGrupos = () =>
  pb
    .collection<GrupoTerapeutico>('grupos_terapeuticos')
    .getFullList({ expand: 'user_id,participantes' })

export const getGrupo = (id: string) =>
  pb
    .collection<GrupoTerapeutico>('grupos_terapeuticos')
    .getOne(id, { expand: 'user_id,participantes' })

export const createGrupo = (data: Partial<GrupoTerapeutico>) =>
  pb
    .collection<GrupoTerapeutico>('grupos_terapeuticos')
    .create({ ...data, user_id: pb.authStore.record?.id })

export const updateGrupo = (id: string, data: Partial<GrupoTerapeutico>) =>
  pb.collection<GrupoTerapeutico>('grupos_terapeuticos').update(id, data)

export const deleteGrupo = (id: string) =>
  pb.collection<GrupoTerapeutico>('grupos_terapeuticos').delete(id)
