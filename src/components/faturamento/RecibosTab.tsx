import { useState, useEffect } from 'react'
import { Plus, Eye, CheckCircle2, Mail } from 'lucide-react'
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
import {
  getEnviosDocumentos,
  createEnvioDocumento,
  EnvioDocumento,
} from '@/services/envios_documentos'
import { EmailComposerDialog } from './EmailComposerDialog'
import { useRealtime } from '@/hooks/use-realtime'

export function RecibosTab() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([])
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [config, setConfig] = useState<ConfigClinica | null>(null)
  const [signModalOpen, setSignModalOpen] = useState(false)
  const [signTarget, setSignTarget] = useState<Transaction | null>(null)
  const [envios, setEnvios] = useState<EnvioDocumento[]>([])
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeTarget, setComposeTarget] = useState<{
    type: 'recibo' | 'nfe'
    tx: Transaction
  } | null>(null)

  const loadData = async () => {
    try {
      const userId = pb.authStore.record?.id
      if (userId) {
        setConfig(await getConfig(userId))
        setAssinaturas(await getAssinaturasByUser(userId))
      }
      const txs = await getTransactions()
      setTransactions(txs.filter((t) => t.receipt_number || t.status === 'pago'))
      setEnvios(await getEnviosDocumentos())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('envios_documentos', () => loadData())

  const handleSendEmail = async (data: any) => {
    if (!composeTarget?.tx) return
    try {
      await createEnvioDocumento({
        user_id: pb.authStore.record!.id,
        patient_id: composeTarget.tx.patient_id,
        tipo_documento: data.documentType,
        documento_id: data.documentId,
        destinatario: data.email,
        data_envio: new Date().toISOString().replace('T', ' '),
        status: 'enviado',
        visualizado: false,
      })
      toast({ title: 'Enviado', description: 'Documento enviado com sucesso.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao enviar documento.', variant: 'destructive' })
    }
  }

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
                      {(() => {
                        const envio = envios.find(
                          (e) => e.documento_id === t.id && e.tipo_documento === 'recibo',
                        )
                        return t.receipt_number && envio ? (
                          <Badge
                            variant="outline"
                            className="text-sky-700 border-sky-200 bg-sky-50 py-1 px-2 flex items-center gap-1 h-9"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Enviado em{' '}
                            {new Date(envio.data_envio).toLocaleDateString('pt-BR')}
                          </Badge>
                        ) : t.receipt_number ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-sky-700 border-sky-200 hover:bg-sky-50"
                            onClick={() => {
                              setComposeTarget({ type: 'recibo', tx: t })
                              setComposeOpen(true)
                            }}
                          >
                            <Mail className="h-3 w-3 mr-1" /> Enviar por E-mail
                          </Button>
                        ) : null
                      })()}
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

      <EmailComposerDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        patientEmail={composeTarget?.tx.expand?.patient_id?.email || ''}
        patientName={composeTarget?.tx.expand?.patient_id?.name || ''}
        documentType={composeTarget?.type || 'recibo'}
        documentId={composeTarget?.tx.id || ''}
        amount={composeTarget?.tx.amount || 0}
        date={composeTarget?.tx.receipt_issued_date || composeTarget?.tx.created || ''}
        clinicName={config?.nome_clinica || ''}
        onSend={handleSendEmail}
      />
    </div>
  )
}
