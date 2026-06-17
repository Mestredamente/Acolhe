import { useState, useEffect } from 'react'
import { Plus, Eye, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getTransactions, Transaction } from '@/services/financeiro'
import { ReceiptDialog } from './ReceiptDialog'

export function RecibosTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadData = async () => {
    try {
      const txs = await getTransactions()
      setTransactions(txs.filter((t) => t.receipt_number || t.status === 'pago'))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenDialog = (tx: Transaction | null) => {
    setSelectedTx(tx)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Recibos Emitidos e Pendentes</CardTitle>
          <Button onClick={() => handleOpenDialog(null)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Recibo Avulso
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status Fatura</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">
                    {t.receipt_number || (
                      <span className="text-muted-foreground italic">Não emitido</span>
                    )}
                  </TableCell>
                  <TableCell>{t.expand?.patient_id?.name || 'Desconhecido'}</TableCell>
                  <TableCell>
                    {t.receipt_issued_date
                      ? new Date(t.receipt_issued_date).toLocaleDateString('pt-BR')
                      : new Date(t.created).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      t.amount,
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={t.status === 'pago' ? 'default' : 'secondary'}
                      className={t.status === 'pago' ? 'bg-teal-600' : ''}
                    >
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(t)}>
                      {t.receipt_number ? (
                        <>
                          <Eye className="h-4 w-4 mr-1" /> Visualizar
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1 text-teal-600" /> Emitir
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhum recibo ou lançamento pago encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReceiptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={selectedTx}
        onSaved={loadData}
      />
    </div>
  )
}
