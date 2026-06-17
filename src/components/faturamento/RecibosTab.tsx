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
import { Assinatura, getAssinaturasByUser, createAssinatura } from '@/services/assinaturas'
import { SignatureDialog } from '@/components/SignatureDialog'
import pb from '@/lib/pocketbase/client'
import { getConfig, ConfigClinica } from '@/services/config_clinica'
import { BadgeCheck, PenTool } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function RecibosTab() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([])
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [config, setConfig] = useState<ConfigClinica | null>(null)
  const [signModalOpen, setSignModalOpen] = useState(false)
  const [signTarget, setSignTarget] = useState<Transaction | null>(null)

  const loadData = async () => {
    try {
      const userId = pb.authStore.record?.id
      if (userId) {
        setConfig(await getConfig(userId))
        setAssinaturas(await getAssinaturasByUser(userId))
      }
      const txs = await getTransactions()
      setTransactions(txs.filter((t) => t.receipt_number || t.status === 'pago'))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSignatureConfirm = async (signatureData: string) => {
    if (!signTarget) return
    try {
      await createAssinatura({
        registro_id: signTarget.id,
        tipo_registro: 'recibo',
        patient_id: signTarget.patient_id,
        identificador_signatario: pb.authStore.record?.name || 'Psicólogo',
        signature_data: signatureData,
      })
      toast({ title: 'Sucesso', description: 'Recibo assinado com sucesso.' })
      setSignModalOpen(false)
      loadData()
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível assinar o recibo.',
        variant: 'destructive',
      })
    }
  }

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
              {transactions.map((t) => {
                const isSigned = assinaturas.some(
                  (a) => a.tipo_registro === 'recibo' && a.registro_id === t.id,
                )
                return (
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
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(t.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={t.status === 'pago' ? 'default' : 'secondary'}
                        className={t.status === 'pago' ? 'bg-teal-600' : ''}
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      {t.receipt_number && !isSigned && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-teal-700 border-teal-200 hover:bg-teal-50"
                          onClick={() => {
                            setSignTarget(t)
                            setSignModalOpen(true)
                          }}
                        >
                          <PenTool className="h-3 w-3 mr-1" /> Assinar
                        </Button>
                      )}
                      {isSigned && (
                        <Badge
                          variant="outline"
                          className="text-teal-700 border-teal-200 bg-teal-50 flex items-center gap-1 py-1 px-2 h-9"
                        >
                          <BadgeCheck className="w-3 h-3" /> Assinado
                        </Badge>
                      )}
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
                )
              })}
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

      <SignatureDialog
        open={signModalOpen}
        onOpenChange={setSignModalOpen}
        onConfirm={handleSignatureConfirm}
        defaultSignature={
          config?.assinatura_padrao ? pb.files.getURL(config, config.assinatura_padrao) : undefined
        }
      />
    </div>
  )
}
