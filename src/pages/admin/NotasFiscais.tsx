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
import { Button } from '@/components/ui/button'
import { Search, Download, FileText, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const notasMock = [
  {
    id: '2023001',
    cliente: 'Clínica Mente Saudável',
    valor: 399,
    dataEmissao: '01/10/2023',
    status: 'Emitida',
    comp: '10/2023',
  },
  {
    id: '2023002',
    cliente: 'Dr. João Silva',
    valor: 99,
    dataEmissao: '05/10/2023',
    status: 'Emitida',
    comp: '10/2023',
  },
  {
    id: '2023003',
    cliente: 'Centro Psicológico Vida',
    valor: 199,
    dataEmissao: '-',
    status: 'Pendente',
    comp: '10/2023',
  },
  {
    id: '2023004',
    cliente: 'Clínica Bem Estar',
    valor: 799,
    dataEmissao: '10/10/2023',
    status: 'Emitida',
    comp: '10/2023',
  },
]

export default function NotasFiscais() {
  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Notas Fiscais (NFS-e)
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie a emissão de notas fiscais para seus assinantes.
          </p>
        </div>
        <Button className="bg-[#1E3A8A] hover:bg-blue-800 text-white">
          <Plus className="h-4 w-4 mr-2" /> Emitir Avulsa
        </Button>
      </div>

      <Card className="rounded-xl shadow-sm border-slate-200">
        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-100">
          <CardTitle className="text-lg font-medium">Histórico de Emissões</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" /> Exportar XMLs
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por cliente ou NF..." className="pl-9" />
            </div>
            <div className="flex gap-4">
              <Select defaultValue="10/2023">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Competência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10/2023">Outubro / 2023</SelectItem>
                  <SelectItem value="09/2023">Setembro / 2023</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="todos">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="emitida">Emitida</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="erro">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Número da NF</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Competência</TableHead>
                  <TableHead>Emissão</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notasMock.map((nota, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-slate-700">{nota.id}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{nota.cliente}</TableCell>
                    <TableCell className="text-slate-500">{nota.comp}</TableCell>
                    <TableCell className="text-slate-500">{nota.dataEmissao}</TableCell>
                    <TableCell className="font-medium text-slate-700">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(nota.valor)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          nota.status === 'Emitida'
                            ? 'text-green-700 bg-green-50 border-green-200'
                            : 'text-amber-700 bg-amber-50 border-amber-200'
                        }
                      >
                        {nota.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {nota.status === 'Emitida' ? (
                        <Button variant="ghost" size="sm" className="text-[#1E3A8A]">
                          <FileText className="w-4 h-4 mr-2" /> PDF
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[#1E3A8A] border-[#1E3A8A]/20 hover:bg-blue-50"
                        >
                          Emitir Agora
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
