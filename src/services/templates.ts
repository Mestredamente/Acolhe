import pb from '@/lib/pocketbase/client'

export interface TemplateEvolucao {
  id: string
  psicologo_id: string
  titulo: string
  abordagem:
    | 'TCC'
    | 'Psicanálise'
    | 'Gestalt'
    | 'Humanista'
    | 'Comportamental'
    | 'EMDR'
    | 'Integrativa'
  conteudo: string
  status: 'ativo' | 'inativo'
  is_padrao: boolean
  created: string
  updated: string
}

export const getTemplates = async () => {
  return await pb.collection<TemplateEvolucao>('templates_evolucao').getFullList({
    sort: '-is_padrao,titulo',
  })
}

export const createTemplate = async (data: Partial<TemplateEvolucao>) => {
  return await pb.collection<TemplateEvolucao>('templates_evolucao').create({
    ...data,
    psicologo_id: pb.authStore.record?.id,
    is_padrao: false,
  })
}

export const updateTemplate = async (id: string, data: Partial<TemplateEvolucao>) => {
  return await pb.collection<TemplateEvolucao>('templates_evolucao').update(id, data)
}

export const deleteTemplate = async (id: string) => {
  return await pb.collection<TemplateEvolucao>('templates_evolucao').delete(id)
}
