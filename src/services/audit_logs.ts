import pb from '@/lib/pocketbase/client'

export interface AuditLog {
  id: string
  usuario_id: string
  acao: 'leitura' | 'escrita' | 'exclusao_logica' | 'login' | 'logout'
  tabela_afetada: string
  registro_id?: string
  descricao?: string
  ip_origem?: string
  created: string
  expand?: {
    usuario_id?: {
      id: string
      name: string
      email: string
    }
  }
}

export const createAuditLog = async (data: Partial<AuditLog>) => {
  try {
    return await pb.collection('audit_logs').create(data)
  } catch (e) {
    console.error('Audit log failed', e)
  }
}

export const getAuditLogs = async (tabela: string, registro_id: string) => {
  return await pb.collection<AuditLog>('audit_logs').getFullList({
    filter: `tabela_afetada = '${tabela}' && registro_id = '${registro_id}'`,
    sort: '-created',
    expand: 'usuario_id',
  })
}
