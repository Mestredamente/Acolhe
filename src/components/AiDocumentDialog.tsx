import { useState } from 'react'
import { Wand2, Loader2, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createDocumento, generateDocumentContent } from '@/services/documentos'
import pb from '@/lib/pocketbase/client'
import { AiValidationModal } from '@/components/AiValidationModal'
import { checkClinicalSafety, logAiUsage } from '@/lib/ai-safety'

export function AiDocumentDialog({
  open,
  onOpenChange,
  patientId,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  onSaved: () => void
}) {
  const { toast } = useToast()
  const [step, setStep] = useState<'form' | 'loading' | 'review'>('form')
  const [docType, setDocType] = useState('Laudo Psicológico')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [context, setContext] = useState('')
  const [generatedText, setGeneratedText] = useState('')

  const [pendingAiContent, setPendingAiContent] = useState('')
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false)

  const handleGenerate = async () => {
    try {
      setStep('loading')
      const result = await generateDocumentContent({
        patient_id: patientId,
        doc_type: docType,
        context,
        date,
      })

      const isSafe = checkClinicalSafety(result.content)
      if (!isSafe) {
        logAiUsage({
          tipo_operacao: 'documento',
          provedor_usado: 'Claude',
          resumo_prompt: `Gerar ${docType} com contexto: ${context.substring(0, 30)}`,
          resumo_resposta: '[BLOQUEADO] ' + result.content.substring(0, 50),
          status: 'falha',
        })
        toast({
          title: 'Bloqueio de Segurança',
          description:
            'Conteúdo bloqueado por segurança clínica (ex: diagnóstico definitivo, prescrição). Edite manualmente.',
          variant: 'destructive',
        })
        setStep('form')
        return
      }

      setPendingAiContent(result.content)
      setIsValidationModalOpen(true)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao gerar documento com IA.',
        variant: 'destructive',
      })
      setStep('form')
    }
  }

  const handleSave = async () => {
    try {
      let internalDocType = 'outro'
      if (docType === 'Laudo Psicológico') internalDocType = 'laudo'
      else if (docType === 'Atestado de Comparecimento') internalDocType = 'atestado'
      else if (docType === 'Relatório de Evolução' || docType === 'Relatório de Sessão')
        internalDocType = 'evolucao'

      await createDocumento({
        patient_id: patientId,
        user_id: pb.authStore.record?.id,
        file_name: `${docType} - ${new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`,
        doc_type: internalDocType,
        description: generatedText,
        status: 'privado',
        is_ai_generated: true,
      })
      toast({ title: 'Sucesso', description: 'Documento gerado e salvo.' })
      onSaved()
      handleClose()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao salvar documento.',
        variant: 'destructive',
      })
    }
  }

  const handleClose = () => {
    setStep('form')
    setContext('')
    setGeneratedText('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-lg shadow-lg border border-slate-200 font-sans">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Wand2 className="h-5 w-5" /> Geração Inteligente de Documento
          </DialogTitle>
          <DialogDescription>
            Crie documentos clínicos estruturados utilizando o histórico do paciente.
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-4 py-2">
            <div className="bg-sky-50 border border-sky-100 p-3 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-sky-600 mt-0.5 shrink-0" />
              <div className="text-xs text-sky-800 leading-relaxed">
                Documento gerado com apoio de IA para agilidade administrativa. O psicólogo deve
                revisar e validar o conteúdo antes de assinar ou emitir. Conforme CFP e LGPD. Não
                substitui julgamento clínico.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laudo Psicológico">Laudo Psicológico</SelectItem>
                    <SelectItem value="Atestado de Comparecimento">
                      Atestado de Comparecimento
                    </SelectItem>
                    <SelectItem value="Relatório de Evolução">Relatório de Evolução</SelectItem>
                    <SelectItem value="Relatório de Sessão">Relatório de Sessão</SelectItem>
                    <SelectItem value="Encaminhamento">Encaminhamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data Referência</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contexto da Sessão (Opcional)</Label>
              <Textarea
                placeholder="Insira notas adicionais ou observações que a IA deve considerar na geração..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleGenerate}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                <Wand2 className="w-4 h-4 mr-2" /> Gerar Documento
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'loading' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Gerando documento... Analisando dados do prontuário
            </p>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4 py-2 flex flex-col h-[60vh]">
            <div className="bg-amber-50 border border-amber-200 p-2 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800">
                Revise cuidadosamente o conteúdo gerado antes de salvar.
              </p>
            </div>

            <div className="flex-1 min-h-0 relative">
              <Textarea
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                className="h-full resize-none font-mono text-sm leading-relaxed p-4 border-slate-200 focus-visible:ring-primary shadow-sm"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => setStep('form')}>
                Refazer
              </Button>
              <Button onClick={handleSave} className="shadow-sm">
                Salvar Documento
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>

      <AiValidationModal
        open={isValidationModalOpen}
        onOpenChange={setIsValidationModalOpen}
        content={pendingAiContent}
        onApprove={async () => {
          setGeneratedText(pendingAiContent)

          logAiUsage({
            tipo_operacao: 'documento',
            provedor_usado: 'Claude',
            resumo_prompt: `Gerar ${docType}`,
            resumo_resposta: pendingAiContent.substring(0, 100) + '...',
            status: 'sucesso',
          })

          try {
            let internalDocType = 'outro'
            if (docType === 'Laudo Psicológico') internalDocType = 'laudo'
            else if (docType === 'Atestado de Comparecimento') internalDocType = 'atestado'
            else if (docType === 'Relatório de Evolução' || docType === 'Relatório de Sessão')
              internalDocType = 'evolucao'

            await createDocumento({
              patient_id: patientId,
              user_id: pb.authStore.record?.id,
              file_name: `${docType} - ${new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`,
              doc_type: internalDocType,
              description: pendingAiContent,
              status: 'privado',
              is_ai_generated: true,
            })
            toast({ title: 'Sucesso', description: 'Documento gerado, validado e salvo.' })
            onSaved()
            setStep('form')
            setContext('')
            setGeneratedText('')
            onOpenChange(false)
          } catch (error: any) {
            toast({
              title: 'Erro',
              description: error.message || 'Falha ao salvar documento.',
              variant: 'destructive',
            })
          }
        }}
        onReject={() => {
          setGeneratedText(pendingAiContent)
          setStep('review')
          logAiUsage({
            tipo_operacao: 'documento',
            provedor_usado: 'Claude',
            resumo_prompt: `Gerar ${docType}`,
            resumo_resposta: pendingAiContent.substring(0, 100) + '...',
            status: 'aguardando validação',
          })
        }}
      />
    </Dialog>
  )
}
