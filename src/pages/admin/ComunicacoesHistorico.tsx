import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const historicoMock = [
  {
    id: 1,
    assunto: 'Bem-vindos ao PsicoGestão 2.0!',
    segmento: 'Todos',
    envios: 18,
    aberturas: '85%',
    data: '10/10/2023 09:00',
    status: 'Concluído',
  },
  {
    id: 2,
    assunto: 'Treinamento sobre o Prontuário Eletrônico',
    segmento: 'Clínicas',
    envios: 10,
    aberturas: '60%',
    data: '05/10/2023 14:30',
    status: 'Concluído',
  },
  {
    id: 3,
    assunto: 'Aviso de Manutenção Programada',
    segmento: 'Todos',
    envios: 18,
    aberturas: '40%',
    data: '01/10/2023 20:00',
    status: 'Concluído',
  },
]

export default function ComunicacoesHistorico() {
  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Histórico de Envios</h1>
        <p className="text-slate-500 mt-1">
          Acompanhe as métricas de engajamento das suas comunicações.
        </p>
      </div>

      <Card className="rounded-xl shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Campanhas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Data de Envio</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead className="text-right">Entregues</TableHead>
                <TableHead className="text-right">Taxa de Abertura</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historicoMock.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-slate-500">{item.data}</TableCell>
                  <TableCell className="font-medium text-slate-900">{item.assunto}</TableCell>
                  <TableCell className="text-slate-600">{item.segmento}</TableCell>
                  <TableCell className="text-right font-medium">{item.envios}</TableCell>
                  <TableCell className="text-right text-emerald-600 font-semibold">
                    {item.aberturas}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="text-slate-600 bg-slate-50 border-slate-200"
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
