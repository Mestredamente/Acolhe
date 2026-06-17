import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Transaction, updateTransaction, createTransaction } from '@/services/financeiro'
import { getConfig, ConfigClinica } from '@/services/config_clinica'
import { getPatient, getPatients, Patient } from '@/services/patients'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Mail, Download, CheckCircle2 } from 'lucide-react'

export function ReceiptDialog({
  open,
  onOpenChange,
  transaction,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  onSaved?: () => void
}) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<ConfigClinica | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [patientsList, setPatientsList] = useState<Patient[]>([])

  const [formData, setFormData] = useState({
    cpf: '',
    address: '',
    description: '',
    amount: 0,
    date: '',
  })

  useEffect(() => {
    if (open && user) {
      loadData()
    }
  }, [open, transaction, user])

  const loadData = async () => {
    try {
      setLoading(true)
      const conf = await getConfig(user.id)
      setConfig(conf)
      const pts = await getPatients()
      setPatientsList(pts)

      if (transaction?.patient_id) {
        const pat = await getPatient(transaction.patient_id)
        setPatient(pat)
        setFormData({
          cpf: pat.billing_id || pat.cpf || '',
          address: pat.billing_address || pat.address || '',
          description: transaction.description || '',
          amount: transaction.amount || 0,
          date: transaction.payment_date
            ? new Date(transaction.payment_date).toISOString().substring(0, 10)
            : new Date().toISOString().substring(0, 10),
        })
      } else {
        setPatient(null)
        setFormData({
          cpf: '',
          address: '',
          description: '',
          amount: 0,
          date: new Date().toISOString().substring(0, 10),
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handlePatientChange = (patId: string) => {
    const pat = patientsList.find((p) => p.id === patId)
    if (pat) setPatient(pat)
  }

  const copyPatientData = () => {
    if (patient) {
      setFormData((p) => ({
        ...p,
        cpf: patient.billing_id || patient.cpf || '',
        address: patient.billing_address || patient.address || '',
      }))
      toast({ title: 'Dados copiados do paciente.' })
    }
  }

  const handleEmit = async () => {
    if (!patient) {
      toast({ title: 'Aviso', description: 'Selecione um paciente.' })
      return
    }
    try {
      setLoading(true)
      const receiptNum = `REC-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')}`

      if (transaction) {
        await updateTransaction(transaction.id, {
          receipt_number: receiptNum,
          receipt_issued_date: new Date().toISOString(),
          amount: formData.amount,
          description: formData.description,
        })
      } else {
        // Create new financeiro record to link the receipt
        await createTransaction({
          patient_id: patient.id,
          amount: formData.amount,
          description: formData.description,
          status: 'pago',
          due_date: new Date(formData.date).toISOString(),
          payment_date: new Date(formData.date).toISOString(),
          receipt_number: receiptNum,
          receipt_issued_date: new Date().toISOString(),
        })
      }
      toast({ title: 'Sucesso', description: 'Recibo emitido com sucesso!' })
      onSaved?.()
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao emitir recibo', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleEmail = () => {
    toast({ title: 'Enviado', description: 'O recibo foi enviado por e-mail (Simulação).' })
  }

  const isEmitted = !!transaction?.receipt_number

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEmitted ? 'Visualizar Recibo' : 'Emitir Recibo'}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isEmitted && transaction ? (
          <div className="space-y-6">
            <div className="bg-white p-8 border rounded-lg shadow-sm text-black relative">
              <div className="absolute top-4 right-4 text-xs text-muted-foreground font-mono">
                {transaction.receipt_number}
              </div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold uppercase">
                  {config?.nome_clinica || 'Clínica Psicológica'}
                </h2>
                <p className="text-sm">Psicólogo(a): {config?.nome_profissional || user?.name}</p>
                {config?.crp_psicologo && <p className="text-sm">CRP: {config.crp_psicologo}</p>}
              </div>
              <div className="mb-6 space-y-4 text-sm leading-relaxed">
                <p>
                  Recebi de <strong>{patient?.name || '________________'}</strong>, inscrito(a) no
                  CPF/CNPJ <strong>{formData.cpf || '________________'}</strong>, a importância de{' '}
                  <strong>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      transaction.amount,
                    )}
                  </strong>
                  .
                </p>
                <p>Referente a: {transaction.description}.</p>
                {formData.address && <p>Endereço do paciente: {formData.address}</p>}
              </div>
              <div className="mt-12 text-center text-sm">
                <p>
                  Data:{' '}
                  {new Date(
                    transaction.receipt_issued_date || transaction.created,
                  ).toLocaleDateString('pt-BR')}
                </p>
                <div className="mt-8 border-t border-black w-64 mx-auto pt-2">Assinatura</div>
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleEmail}>
                  <Mail className="w-4 h-4 mr-2" /> Enviar por E-mail
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" /> PDF
                </Button>
              </div>
              <Button onClick={() => onOpenChange(false)}>Fechar</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={copyPatientData}>
                Copiar Dados do Paciente
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                {transaction ? (
                  <Input value={patient?.name || ''} disabled />
                ) : (
                  <Select value={patient?.id || ''} onValueChange={handlePatientChange}>
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
                )}
              </div>
              <div className="space-y-2">
                <Label>CPF / CNPJ</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Endereço</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Endereço completo"
                />
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Emissão</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Referente a</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEmit}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Gerar Recibo
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
