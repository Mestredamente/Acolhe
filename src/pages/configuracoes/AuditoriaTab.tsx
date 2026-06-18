import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getAuditLogs, AuditLog } from '@/services/audit_logs'

export function AuditoriaTab() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAuditLogs().then((data) => {
      setLogs(data)
      setLoading(false)
    })
  }, [])

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Logs de Auditoria</CardTitle>
        <CardDescription>
          Histórico de ações realizadas na plataforma para conformidade de segurança.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-slate-500 py-4">Carregando logs...</div>
        ) : logs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Tabela</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.created).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>{log.expand?.usuario_id?.name || log.usuario_id}</TableCell>
                  <TableCell className="capitalize">{log.acao}</TableCell>
                  <TableCell>{log.tabela_afetada}</TableCell>
                  <TableCell>{log.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-slate-500 py-4 text-center">Nenhum log encontrado.</p>
        )}
      </CardContent>
    </Card>
  )
}
