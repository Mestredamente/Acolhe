import { useState, useEffect, useMemo } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'

export default function MinhasFaturas() {
  const { user } = useAuth()
  const [faturas, setFaturas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const loadData = async () => {
      try {
        const records = await pb.collection('financeiro').getFullList({
          filter: `user_id = '${user.id}'`,
          sort: '-due_date',
        })
        setFaturas(records)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user.id])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return faturas
    return faturas.filter((f) => f.status === statusFilter)
  }, [faturas, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return <Badge className="bg-green-500 hover:bg-green-600">Pago</Badge>
      case 'pendente':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendente</Badge>
      case 'atrasado':
        return <Badge className="bg-red-500 hover:bg-red-600">Atrasado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Minhas Faturas</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Histórico de Faturas</CardTitle>
          <div className="w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vencimento</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhuma fatura encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{new Date(f.due_date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{f.description}</TableCell>
                    <TableCell>R$ {f.amount?.toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell>{getStatusBadge(f.status)}</TableCell>
                    <TableCell>
                      {f.payment_date ? new Date(f.payment_date).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
