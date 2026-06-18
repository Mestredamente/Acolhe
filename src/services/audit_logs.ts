import pb from '@/lib/pocketbase/client'

export interface AuditLog {
  id: string
  usuario_id: string
  acao: string
  tabela_afetada: string
  registro_id: string
  descricao: string
  ip_origem: string
  created: string
  expand?: {
    usuario_id?: {
      name: string
      email: string
    }
  }
}

export const getAuditLogs = async (filter?: string) => {
  try {
    return await pb.collection('audit_logs').getFullList<AuditLog>({
      filter: filter || '',
      sort: '-created',
      expand: 'usuario_id',
    })
  } catch {
    return []
  }
}

export const createAuditLog = async (data: Partial<AuditLog>) => {
  return pb.collection('audit_logs').create(data)
}
