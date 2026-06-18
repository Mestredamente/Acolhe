import pb from '@/lib/pocketbase/client'

export interface TermoVersionamento {
  id: string
  tipo: 'termos_de_servico' | 'politica_privacidade'
  titulo: string
  conteudo: string
  versao: number
  data_publicacao?: string
  status: 'rascunho' | 'ativo' | 'arquivado'
  obrigatorio: boolean
  created: string
  updated: string
}

export interface AceiteTermo {
  id: string
  usuario_id: string
  termo_id: string
  data_aceite: string
  ip_aceite: string
  created: string
}

export const getTermos = async () => {
  return pb.collection<TermoVersionamento>('termos_versionamento').getFullList({
    sort: '-created',
  })
}

export const getActiveTermos = async () => {
  return pb.collection<TermoVersionamento>('termos_versionamento').getFullList({
    filter: "status = 'ativo'",
  })
}

export const createTermo = async (data: Partial<TermoVersionamento>) => {
  return pb.collection<TermoVersionamento>('termos_versionamento').create(data)
}

export const updateTermo = async (id: string, data: Partial<TermoVersionamento>) => {
  return pb.collection<TermoVersionamento>('termos_versionamento').update(id, data)
}

export const getMyAceites = async (userId: string) => {
  return pb.collection<AceiteTermo>('aceites_termos').getFullList({
    filter: `usuario_id = '${userId}'`,
  })
}

export const createAceite = async (termoId: string, userId: string) => {
  return pb.collection<AceiteTermo>('aceites_termos').create({
    usuario_id: userId,
    termo_id: termoId,
    data_aceite: new Date().toISOString(),
    ip_aceite: '0.0.0.0',
  })
}
