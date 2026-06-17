import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AutomacaoHistorico } from '@/services/automacoes'

export function Historico({ historico }: { historico: AutomacaoHistorico[] }) {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg">Histórico de Disparos</CardTitle>
        <CardDescription>Últimas mensagens simuladas/enviadas pelo sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data do Envio</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Tipo de Mensagem</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historico.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-500 py-6">
                  Nenhum envio registrado
                </TableCell>
              </TableRow>
            ) : (
              historico.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>{new Date(h.data_envio).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{h.expand?.patient_id?.name || 'Desconhecido'}</TableCell>
                  <TableCell className="capitalize">{h.tipo.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <Badge
                      variant={h.status === 'enviado' ? 'default' : 'destructive'}
                      className={
                        h.status === 'enviado'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none'
                          : ''
                      }
                    >
                      {h.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
