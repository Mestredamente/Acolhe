import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Eye, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPortalDocumentos, Documento } from '@/services/documentos'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Assinatura, getAssinaturasByUser, createAssinatura } from '@/services/assinaturas'
import pb from '@/lib/pocketbase/client'
import { SignatureDialog } from '@/components/SignatureDialog'
import { PenTool, BadgeCheck, FileCheck2, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { usePatientContext } from '@/components/portal/PortalProtectedRoute'
import {
  getEnviosDocumentosByPatient,
  updateEnvioDocumento,
  EnvioDocumento,
} from '@/services/envios_documentos'
import { getTransactionsByPatient, Transaction } from '@/services/financeiro'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function PortalDocumentos() {
  const { toast } = useToast()
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingDoc, setViewingDoc] = useState<Documento | null>(null)

  const [signModalOpen, setSignModalOpen] = useState(false)
  const [signTarget, setSignTarget] = useState<Documento | null>(null)

  const { patient } = usePatientContext()
  const [envios, setEnvios] = useState<EnvioDocumento[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [viewingReceipt, setViewingReceipt] = useState<{
    envio: EnvioDocumento
    tx: Transaction
  } | null>(null)

  const loadData = async () => {
    try {
      setDocumentos(await getPortalDocumentos())
      if (patient) {
        setEnvios(await getEnviosDocumentosByPatient(patient.id))
        setTransactions(await getTransactionsByPatient(patient.id))
      }
      const userId = pb.authStore.record?.id
      if (userId) {
        setAssinaturas(await getAssinaturasByUser(userId))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleViewReceipt = async (envio: EnvioDocumento, tx: Transaction) => {
    if (!envio.visualizado) {
      try {
        await updateEnvioDocumento(envio.id, { visualizado: true })
        setEnvios((prev) => prev.map((e) => (e.id === envio.id ? { ...e, visualizado: true } : e)))
      } catch (err) {
        console.error('Failed to mark as viewed', err)
      }
    }
    setViewingReceipt({ envio, tx })
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('documentos', () => {
    loadData()
  })

  useRealtime('assinaturas', () => {
    loadData()
  })

  const handleSignatureConfirm = async (signatureData: string) => {
    if (!signTarget) return
    try {
      await createAssinatura({
        registro_id: signTarget.id,
        tipo_registro: 'documento',
        patient_id: signTarget.patient_id,
        identificador_signatario: pb.authStore.record?.name || 'Paciente',
        signature_data: signatureData,
      })
      toast({ title: 'Sucesso', description: 'Documento assinado com sucesso.' })
      setSignModalOpen(false)
      loadData()
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível assinar o documento.',
        variant: 'destructive',
      })
    }
  }

  const isSignable =
    viewingDoc?.doc_type === 'termo_consentimento_lgpd' || viewingDoc?.doc_type === 'contrato'
  const hasSignature =
    viewingDoc &&
    assinaturas.some((a) => a.tipo_registro === 'documento' && a.registro_id === viewingDoc.id)

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-emerald-900 tracking-tight">Documentos</h2>

      <Tabs defaultValue="clinicos" className="w-full">
        <TabsList className="mb-6 bg-slate-100/50 p-1">
          <TabsTrigger
            value="clinicos"
            className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-lg"
          >
            <FileText className="w-4 h-4 mr-2" />
            Documentos Clínicos
          </TabsTrigger>
          <TabsTrigger
            value="recibos"
            className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-lg"
          >
            <FileCheck2 className="w-4 h-4 mr-2" />
            Recibos e NF-e
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clinicos" className="space-y-6 animate-fade-in-up mt-0">
          <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
            <div className="text-sm text-teal-800">
              <strong>Aviso de Privacidade LGPD:</strong> Seus documentos clínicos são armazenados
              com segurança. Você só tem acesso aos documentos compartilhados explicitamente pelo
              seu profissional de saúde.
            </div>
          </div>

          <Card className="border-emerald-100 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-sky-50/50 border-b border-sky-100">
              <CardTitle className="text-emerald-800 text-xl">Arquivos Compartilhados</CardTitle>
              <CardDescription className="text-base mt-1">
                Atestados, materiais de apoio e outros documentos clínicos liberados pelo
                profissional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : documentos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum documento compartilhado com você no momento.
                </p>
              ) : (
                documentos.map((doc) => {
                  const docIsSigned = assinaturas.some(
                    (a) => a.tipo_registro === 'documento' && a.registro_id === doc.id,
                  )
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 hover:border-sky-200 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-sky-100 p-3 rounded-xl text-sky-600 group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-base">{doc.file_name}</p>
                          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                            Enviado em {new Date(doc.created).toLocaleDateString('pt-BR')} •{' '}
                            {doc.doc_type.replace(/_/g, ' ')}
                            {docIsSigned && (
                              <Badge
                                variant="outline"
                                className="text-teal-700 border-teal-200 bg-teal-50 text-[10px] py-0 px-1 ml-1"
                              >
                                <BadgeCheck className="w-3 h-3 mr-1" /> Assinado
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sky-700 border-sky-200 hover:bg-sky-50 rounded-full px-4"
                        onClick={() => setViewingDoc(doc)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recibos" className="animate-fade-in-up mt-0">
          <Card className="border-emerald-100 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
              <CardTitle className="text-emerald-800 text-xl">Recibos Financeiros</CardTitle>
              <CardDescription className="text-base mt-1">
                Recibos de sessões e pagamentos enviados para você.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="pl-6">Documento</TableHead>
                    <TableHead>Data da Sessão</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {envios
                    .filter((e) => e.tipo_documento === 'recibo' || e.tipo_documento === 'nfe')
                    .map((envio) => {
                      const tx = transactions.find((t) => t.id === envio.documento_id)
                      if (!tx) return null

                      return (
                        <TableRow key={envio.id} className="hover:bg-slate-50">
                          <TableCell className="pl-6 font-medium text-slate-700">
                            {envio.tipo_documento === 'recibo'
                              ? `Recibo ${tx.receipt_number || ''}`
                              : 'NF-e'}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {new Date(tx.due_date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(tx.amount)}
                          </TableCell>
                          <TableCell>
                            {envio.visualizado ? (
                              <Badge
                                variant="outline"
                                className="text-teal-700 border-teal-200 bg-teal-50 flex items-center gap-1 w-fit"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Visualizado
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-slate-600 border-slate-200 bg-slate-100 flex items-center gap-1 w-fit"
                              >
                                <EyeOff className="w-3 h-3" /> Não Visualizado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 rounded-full px-4"
                              onClick={() => handleViewReceipt(envio, tx)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Visualizar
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  {envios.filter((e) => e.tipo_documento === 'recibo' || e.tipo_documento === 'nfe')
                    .length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        Nenhum recibo enviado ainda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewingDoc} onOpenChange={(open) => !open && setViewingDoc(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {viewingDoc?.file_name}
            </DialogTitle>
            <DialogDescription>
              Enviado em{' '}
              {viewingDoc ? new Date(viewingDoc.created).toLocaleDateString('pt-BR') : ''}
            </DialogDescription>
          </DialogHeader>
          {viewingDoc && (
            <div className="space-y-4 mt-2">
              <div>
                <h4 className="text-sm font-semibold mb-1">Tipo de Documento</h4>
                <Badge variant="outline" className="capitalize">
                  {viewingDoc.doc_type.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Conteúdo</h4>
                <div className="bg-muted/20 p-4 rounded-md text-sm whitespace-pre-wrap border min-h-[100px] max-h-[40vh] overflow-y-auto">
                  {viewingDoc.description || 'Sem conteúdo adicional.'}
                </div>
              </div>
            </div>
          )}
          {isSignable && (
            <DialogFooter className="mt-4 border-t pt-4">
              {hasSignature ? (
                <div className="w-full text-center bg-teal-50 border border-teal-200 text-teal-800 rounded-md py-2 text-sm flex justify-center items-center gap-2">
                  <BadgeCheck className="w-4 h-4" /> Você já assinou este documento digitalmente.
                </div>
              ) : (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    setSignTarget(viewingDoc)
                    setViewingDoc(null)
                    setSignModalOpen(true)
                  }}
                >
                  <PenTool className="w-4 h-4 mr-2" /> Assinar Documento
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingReceipt} onOpenChange={(open) => !open && setViewingReceipt(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-800">
              <FileCheck2 className="h-5 w-5" />
              {viewingReceipt?.envio.tipo_documento === 'recibo'
                ? `Recibo de Pagamento - ${viewingReceipt?.tx.receipt_number || ''}`
                : 'Nota Fiscal (NF-e)'}
            </DialogTitle>
          </DialogHeader>
          {viewingReceipt && (
            <div className="space-y-4 mt-2">
              <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 text-sm space-y-3">
                <div className="flex justify-between border-b border-emerald-100 pb-2">
                  <span className="text-emerald-800/70 font-medium">Paciente</span>
                  <span className="font-semibold text-emerald-900">
                    {patient?.name || viewingReceipt.tx.expand?.patient_id?.name}
                  </span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-2">
                  <span className="text-emerald-800/70 font-medium">Data da Sessão</span>
                  <span className="font-semibold text-emerald-900">
                    {new Date(viewingReceipt.tx.due_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-2">
                  <span className="text-emerald-800/70 font-medium">Valor</span>
                  <span className="font-semibold text-emerald-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      viewingReceipt.tx.amount,
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-2">
                  <span className="text-emerald-800/70 font-medium">Data de Emissão</span>
                  <span className="font-semibold text-emerald-900">
                    {new Date(
                      viewingReceipt.tx.receipt_issued_date ||
                        viewingReceipt.tx.payment_date ||
                        viewingReceipt.tx.created,
                    ).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="pt-2">
                  <span className="text-emerald-800/70 font-medium block mb-1">Descrição</span>
                  <p className="text-slate-700 bg-white p-3 rounded-lg border border-emerald-50">
                    {viewingReceipt.tx.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SignatureDialog
        open={signModalOpen}
        onOpenChange={setSignModalOpen}
        onConfirm={handleSignatureConfirm}
      />
    </div>
  )
}
