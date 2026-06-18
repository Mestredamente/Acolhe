import pb from '@/lib/pocketbase/client'

export const logSessionAccess = async (consulta_id: string, acao: 'entrada' | 'saida') => {
  return pb.send('/backend/v1/log-session', {
    method: 'POST',
    body: JSON.stringify({ consulta_id, acao }),
    headers: { 'Content-Type': 'application/json' },
  })
}
