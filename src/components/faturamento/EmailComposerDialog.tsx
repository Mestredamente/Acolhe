import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Send, Mail } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export interface EmailComposerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientEmail: string
  patientName: string
  documentType: 'recibo' | 'nfe'
  documentId: string
  amount: number
  date: string
  clinicName: string
  onSend: (data: any) => Promise<void>
}

export function EmailComposerDialog({
  open,
  onOpenChange,
  patientEmail,
  patientName,
  documentType,
  documentId,
  amount,
  date,
  clinicName,
  onSend,
}: EmailComposerDialogProps) {
  const [email, setEmail] = useState(patientEmail)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setEmail(patientEmail || '')
      const docName = documentType === 'recibo' ? 'Recibo de Sessão' : 'Nota Fiscal (NF-e)'
      setSubject(`${docName} — ${clinicName || 'Clínica'}`)

      const formattedAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(amount)
      const formattedDate = new Date(date).toLocaleDateString('pt-BR')

      setBody(
        `Olá, ${patientName},\n\nSegue o seu ${docName.toLowerCase()} referente à sessão do dia ${formattedDate}, no valor de ${formattedAmount}.\n\nVocê também pode acessar e baixar este documento diretamente pelo seu Portal do Paciente.\n\nAtenciosamente,\n${clinicName || 'Sua Clínica'}`,
      )
    }
  }, [open, patientEmail, patientName, documentType, amount, date, clinicName])

  const handleSend = async () => {
    setLoading(true)
    try {
      await onSend({ email, subject, body, documentType, documentId })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sky-800">
            <Mail className="h-5 w-5" />
            Enviar Documento por E-mail
          </DialogTitle>
          <DialogDescription>
            Envie o {documentType === 'recibo' ? 'recibo' : 'NF-e'} diretamente para o paciente. Ele
            poderá visualizar o documento pelo Portal do Paciente.
          </DialogDescription>
        </DialogHeader>

        {documentType === 'nfe' && (
          <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              Envio de NF-e por email requer certificado digital ativo em produção. Conformidade
              fiscal.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Destinatário</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@paciente.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Assunto</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={7}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || !email}
            className="bg-sky-700 hover:bg-sky-800 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
