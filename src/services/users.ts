import pb from '@/lib/pocketbase/client'

export interface User {
  id: string
  email: string
  name: string
  profile: 'admin' | 'psicologo' | 'secretaria' | 'paciente'
  status: 'ativo' | 'inativo'
  onboarding_completo?: boolean
  created: string
}

export const getUsers = () => pb.collection('users').getFullList<User>({ sort: '-created' })
export const createUser = (data: any) => pb.collection('users').create(data)
export const updateUser = (id: string, data: any) => pb.collection('users').update(id, data)
export const deleteUser = (id: string) => pb.collection('users').delete(id)
