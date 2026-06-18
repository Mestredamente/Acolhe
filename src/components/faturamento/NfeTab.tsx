import { useState, useEffect } from 'react'
import { AlertCircle, Send, Calculator, Mail, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { getPatients, Patient } from '@/services/patients'
import { getTransactions, Transaction } from '@/services/financeiro'
import {
  getEnviosDocumentos,
  createEnvioDocumento,
  EnvioDocumento,
} from '@/services/envios_documentos'
import { EmailComposerDialog } from './EmailComposerDialog'
import pb from '@/lib/pocketbase/client'
import { getConfig, ConfigClinica } from '@/services/config_clinica'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CpfCnpjInput, CurrencyInput } from '@/components/ui/masked-inputs'

export function NfeTab() {
  const { toast } = useToast()
  const [patientsList, setPatientsList] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const [formData, setFormData] = useState({
    documento: '',
    address: '',
    description: '',
    grossValue: 0,
    issRate: 5,
  })

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [envios, setEnvios] = useState<EnvioDocumento[]>([])
  const [config, setConfig] = useState<ConfigClinica | null>(null)

  const [composeOpen, setComposeOpen] = useState(false)
  const [composeTarget, setComposeTarget] = useState<{ type: 'nfe'; tx: Transaction } | null>(null)

  const loadData = async () => {
    try {
      setPatientsList(await getPatients())
      const userId = pb.authStore.record?.id
      if (userId) setConfig(await getConfig(userId))
      const txs = await getTransactions()
      setTransactions(txs.filter((t) => t.status === 'pago'))
      setEnvios(await getEnviosDocumentos())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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
      toast({ title: 'Enviado', description: 'NF-e enviada com sucesso (Simulação).' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao enviar.', variant: 'destructive' })
    }
  }

  const copyPatientData = () => {
    if (selectedPatient) {
      setFormData((prev) => ({
        ...prev,
        documento: selectedPatient.billing_id || selectedPatient.cpf || '',
        address: selectedPatient.billing_address || selectedPatient.address || '',
      }))
      toast({ title: 'Dados copiados do paciente.' })
    } else {
      toast({ title: 'Selecione um paciente primeiro.' })
    }
  }

  const netValue = formData.grossValue - (formData.grossValue * formData.issRate) / 100

  const handleSimulate = () => {
    const docClean = formData.documento.replace(/\D/g, '')
    if (docClean.length !== 11 && docClean.length !== 14) {
      toast({ title: 'Erro', description: 'CPF/CNPJ inválido.', variant: 'destructive' })
      return
    }
    toast({
      title: 'NF-e Emitida (Simulação)',
      description: `Valor Líquido: R$ ${netValue.toFixed(2)}. Documento atualizado como Enviado.`,
    })
  }

  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription>
          Emissão de NF-e requer integração com Omie e NFe.io em produção. Esta tela simula o fluxo
          completo de preenchimento e geração. Conformidade fiscal.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emitir Nota Fiscal de Serviço (NF-e)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={copyPatientData}>
              Copiar Dados do Paciente
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tomador (Paciente)</Label>
              <Select
                onValueChange={(v) =>
                  setSelectedPatient(patientsList.find((p) => p.id === v) || null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {patientsList.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>CPF / CNPJ do Tomador</Label>
              <CpfCnpjInput
                value={formData.documento}
                onChange={(e: any) => setFormData({ ...formData, documento: e.target.value })}
                onFetchData={(data: any) => {
                  setFormData({
                    ...formData,
                    address: `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.cidade} - ${data.estado}, ${data.cep}`,
                  })
                }}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Endereço do Serviço</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Endereço completo"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Descrição dos Serviços</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Sessões de psicoterapia referentes ao mês..."
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Bruto (R$)</Label>
              <CurrencyInput
                value={formData.grossValue}
                onChange={(val: number) => setFormData({ ...formData, grossValue: val })}
              />
            </div>
            <div className="space-y-2">
              <Label>Alíquota ISS (%)</Label>
              <Input
                type="number"
                value={formData.issRate || ''}
                onChange={(e) => setFormData({ ...formData, issRate: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2 col-span-2 bg-muted/50 p-4 rounded-md flex items-center justify-between border">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <span className="font-medium">Valor Líquido Calculado:</span>
              </div>
              <span className="text-lg font-bold text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  netValue,
                )}
              </span>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSimulate}>
              <Send className="h-4 w-4 mr-2" /> Gerar NF-e (Simulação)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">NF-e Emitidas (Simulação)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 5).map((t) => {
                const envio = envios.find(
                  (e) => e.documento_id === t.id && e.tipo_documento === 'nfe',
                )
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      {new Date(t.payment_date || t.created).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{t.expand?.patient_id?.name || 'Desconhecido'}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(t.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {envio ? (
                        <Badge
                          variant="outline"
                          className="text-sky-700 border-sky-200 bg-sky-50 py-1 px-2 inline-flex items-center gap-1 h-9"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Enviado em{' '}
                          {new Date(envio.data_envio).toLocaleDateString('pt-BR')}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-sky-700 border-sky-200 hover:bg-sky-50"
                          onClick={() => {
                            setComposeTarget({ type: 'nfe', tx: t })
                            setComposeOpen(true)
                          }}
                        >
                          <Mail className="h-3 w-3 mr-1" /> Enviar por E-mail
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Nenhuma emissão encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmailComposerDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        patientEmail={composeTarget?.tx.expand?.patient_id?.email || ''}
        patientName={composeTarget?.tx.expand?.patient_id?.name || ''}
        documentType="nfe"
        documentId={composeTarget?.tx.id || ''}
        amount={composeTarget?.tx.amount || 0}
        date={composeTarget?.tx.payment_date || composeTarget?.tx.created || ''}
        clinicName={config?.nome_clinica || ''}
        onSend={handleSendEmail}
      />
    </div>
  )
}
