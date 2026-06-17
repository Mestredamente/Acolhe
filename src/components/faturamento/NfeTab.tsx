import { useState, useEffect } from 'react'
import { AlertCircle, Send, Calculator } from 'lucide-react'
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

  useEffect(() => {
    getPatients().then(setPatientsList).catch(console.error)
  }, [])

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

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 14) v = v.substring(0, 14)
    if (v.length <= 11) {
      v = v.replace(/(\d{3})(\d)/, '$1.$2')
      v = v.replace(/(\d{3})(\d)/, '$1.$2')
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    } else {
      v = v.replace(/^(\d{2})(\d)/, '$1.$2')
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
      v = v.replace(/(\d{4})(\d)/, '$1-$2')
    }
    setFormData({ ...formData, documento: v })
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
              <Input
                value={formData.documento}
                onChange={handleDocumentChange}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
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
              <Input
                type="number"
                value={formData.grossValue || ''}
                onChange={(e) => setFormData({ ...formData, grossValue: Number(e.target.value) })}
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
    </div>
  )
}
