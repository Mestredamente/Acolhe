import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Mic, Wand2, Loader2, AlertCircle } from 'lucide-react'
import { Appointment } from '@/services/appointments'
import { createEvolucao, updateEvolucao, Evolucao } from '@/services/evolucoes'
import { useToast } from '@/hooks/use-toast'
import { AiValidationModal } from '@/components/AiValidationModal'
import { isRecordLocked } from '@/lib/compliance'

interface Props {
  patientId: string
  appointments: Appointment[]
  evolution?: Evolucao | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  consentimentoIaAceito?: boolean
}

export function EvolutionFormDialog({
  patientId,
  appointments,
  evolution,
  open,
  onOpenChange,
  onSaved,
  consentimentoIaAceito = false,
}: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [hasAudio, setHasAudio] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  const [appointmentId, setAppointmentId] = useState('')
  const [content, setContent] = useState('')
  const [aiSummary, setAiSummary] = useState('')
  const [isSigned, setIsSigned] = useState(false)

  const [pendingAiContent, setPendingAiContent] = useState('')
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false)

  const isLocked = isRecordLocked(evolution?.created)

  useEffect(() => {
    if (open) {
      if (evolution) {
        setAppointmentId(evolution.appointment_id)
        setContent(evolution.content)
        setAiSummary(evolution.ai_summary)
        setIsSigned(evolution.is_signed)
        if (evolution.content && evolution.content.includes('Sessão 1 com o paciente')) {
          setHasAudio(true)
        } else {
          setHasAudio(false)
        }
      } else {
        setAppointmentId(appointments[0]?.id || '')
        setContent('')
        setAiSummary('')
        setIsSigned(false)
        setHasAudio(false)
      }
    }
  }, [open, evolution, appointments])

  const handleSimulateRecording = () => {
    setIsRecording(true)
    setTimeout(() => {
      setIsRecording(false)
      setHasAudio(true)
      toast({
        title: 'Gravação concluída',
        description: 'Áudio gravado com sucesso. Você pode transcrevê-lo agora.',
      })
    }, 2000)
  }

  const handleSimulateTranscription = () => {
    setIsTranscribing(true)
    setTimeout(() => {
      setContent(
        (prev) =>
          prev +
          (prev ? '\n\n' : '') +
          '[Transcrição automática]: Paciente relata que a semana foi produtiva, conseguiu aplicar as técnicas de respiração durante as crises de ansiedade. Mencionou leve desconforto no trabalho, mas lidou bem com a situação após aplicar os exercícios propostos.',
      )
      setIsTranscribing(false)
      toast({
        title: 'Transcrição concluída',
        description: 'O texto foi adicionado às notas da sessão.',
      })
    }, 2500)
  }

  const handleSimulateAI = () => {
    if (!content) {
      toast({
        title: 'Aviso',
        description: 'Preencha as notas da sessão primeiro para gerar o resumo.',
      })
      return
    }
    setIsGeneratingSummary(true)
    setTimeout(() => {
      const simulatedOutput =
        'Paciente relata progresso com técnicas de respiração para manejo de crises de ansiedade. Leve desconforto laboral contornado com sucesso.'

      import('@/lib/ai-safety').then(({ checkClinicalSafety, logAiUsage }) => {
        const isSafe = checkClinicalSafety(simulatedOutput)
        if (!isSafe) {
          logAiUsage({
            tipo_operacao: 'evolução',
            provedor_usado: 'Claude',
            resumo_prompt: 'Gerar resumo da sessão baseada nas notas inseridas pelo profissional',
            resumo_resposta: '[BLOQUEADO] ' + simulatedOutput.substring(0, 50) + '...',
            status: 'falha',
          })
          toast({
            title: 'Bloqueio de Segurança',
            description:
              'Conteúdo bloqueado por segurança clínica (ex: diagnóstico definitivo, prescrição). Edite manualmente.',
            variant: 'destructive',
          })
          setIsGeneratingSummary(false)
          return
        }

        setPendingAiContent(simulatedOutput)
        setIsValidationModalOpen(true)
        setIsGeneratingSummary(false)
      })
    }, 1500)
  }

  const handleApproveAi = () => {
    setAiSummary(pendingAiContent)
    import('@/lib/ai-safety').then(({ logAiUsage }) => {
      logAiUsage({
        tipo_operacao: 'evolução',
        provedor_usado: 'Claude',
        resumo_prompt: 'Gerar resumo da sessão baseada nas notas',
        resumo_resposta: pendingAiContent.substring(0, 100) + '...',
        status: 'sucesso',
      })
    })
  }

  const handleRejectAi = () => {
    setAiSummary(pendingAiContent)
    import('@/lib/ai-safety').then(({ logAiUsage }) => {
      logAiUsage({
        tipo_operacao: 'evolução',
        provedor_usado: 'Claude',
        resumo_prompt: 'Gerar resumo da sessão baseada nas notas',
        resumo_resposta: pendingAiContent.substring(0, 100) + '...',
        status: 'aguardando validação',
      })
    })
  }

  const handleSave = async () => {
    if (!appointmentId || !content) {
      toast({
        title: 'Erro',
        description: 'Selecione a sessão e preencha as notas.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const apt = appointments.find((a) => a.id === appointmentId)

      let dateStr = new Date().toISOString()
      const sourceDate = apt?.appointment_date || apt?.time
      if (sourceDate) {
        const normalizedDate = sourceDate.replace(' ', 'T')
        const d = new Date(normalizedDate)
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString()
        } else if (typeof sourceDate === 'string' && sourceDate.length >= 10) {
          dateStr = `${sourceDate.substring(0, 10)}T12:00:00.000Z`
        }
      }

      const data = {
        patient_id: patientId,
        appointment_id: appointmentId,
        session_date: dateStr,
        content,
        ai_summary: aiSummary,
        is_signed: isSigned,
      }

      if (evolution) {
        await updateEvolucao(evolution.id, data)
      } else {
        await createEvolucao(data)
      }

      toast({ title: 'Sucesso', description: 'Evolução salva com sucesso.' })
      onSaved()
      onOpenChange(false)
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Erro ao salvar evolução.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{evolution ? 'Editar Evolução' : 'Nova Evolução'}</DialogTitle>
            <DialogDescription>
              Registre as notas da sessão. Utilize transcrição de voz e geração de resumos via IA
              para facilitar seu trabalho.
            </DialogDescription>
          </DialogHeader>

          {isLocked && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md flex items-start gap-2 mt-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Prontuário fechado.</strong> Edição bloqueada após 24 horas do registro.
                Conforme CFP.
              </div>
            </div>
          )}

          <div className="space-y-6 py-4">
            {!consentimentoIaAceito && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-start gap-2 border border-red-200 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Consentimento para uso de IA pendente. Solicite ao paciente a autorização antes de
                  utilizar transcrição ou resumos automatizados.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Sessão Relacionada</Label>
              <Select value={appointmentId} onValueChange={setAppointmentId} disabled={isLocked}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a sessão" />
                </SelectTrigger>
                <SelectContent>
                  {appointments.map((apt) => {
                    const sourceDate = apt.appointment_date || apt.time || ''
                    const d = new Date(sourceDate.replace(' ', 'T'))
                    const dateString = !isNaN(d.getTime())
                      ? d.toLocaleDateString('pt-BR')
                      : 'Data inválida'
                    return (
                      <SelectItem key={apt.id} value={apt.id}>
                        {dateString !== 'Data inválida' ? `${dateString} - ` : ''}
                        {apt.type} {apt.start_time ? `às ${apt.start_time}` : ''}
                      </SelectItem>
                    )
                  })}
                  {appointments.length === 0 && (
                    <SelectItem value="none" disabled>
                      Nenhuma sessão encontrada
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>Notas da Sessão</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSimulateRecording}
                      disabled={isRecording || isTranscribing || isLocked}
                      className={
                        isRecording
                          ? 'text-teal-700 animate-pulse border-teal-700 bg-teal-50'
                          : 'text-teal-700 border-teal-200 hover:bg-teal-50'
                      }
                    >
                      {isRecording ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Mic className="h-4 w-4 mr-2" />
                      )}
                      {isRecording ? 'Gravando...' : 'Gravar Áudio'}
                    </Button>

                    {hasAudio ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleSimulateTranscription}
                        disabled={
                          isTranscribing || isRecording || !consentimentoIaAceito || isLocked
                        }
                        className="bg-teal-50 text-teal-800 hover:bg-teal-100 disabled:opacity-50"
                      >
                        {' '}
                        {isTranscribing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Wand2 className="h-4 w-4 mr-2" />
                        )}
                        {isTranscribing
                          ? 'Convertendo áudio para texto... Aguarde'
                          : 'Transcrever Gravação'}
                      </Button>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled
                                className="bg-teal-50 text-teal-800 hover:bg-teal-100 disabled:opacity-50"
                              >
                                <Wand2 className="h-4 w-4 mr-2" />
                                Transcrever Gravação
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Gravar áudio primeiro para transcrever</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
                <Textarea
                  className="min-h-[150px] resize-y"
                  placeholder="Digite as observações clínicas aqui..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isLocked}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A transcrição é automatizada para auxiliar no registro. Revise o conteúdo antes de
                  salvar. Conforme CFP.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Resumo (IA)</Label>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSimulateAI}
                  disabled={isGeneratingSummary || !content || !consentimentoIaAceito || isLocked}
                >
                  {isGeneratingSummary ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  {isGeneratingSummary ? 'Gerando...' : 'Gerar Resumo'}
                </Button>
              </div>
              <Textarea
                className="min-h-[80px] bg-muted/50"
                placeholder="O resumo gerado pela IA aparecerá aqui..."
                value={aiSummary}
                onChange={(e) => setAiSummary(e.target.value)}
                disabled={isLocked}
              />
            </div>

            <div className="flex items-center space-x-2 bg-muted/20 p-3 rounded-md border">
              <Checkbox
                id="is_signed"
                checked={isSigned}
                onCheckedChange={(checked) => setIsSigned(checked as boolean)}
                disabled={isLocked}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="is_signed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Assinar digitalmente
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Ao marcar, você assina esta evolução em conformidade com as resoluções do CFP.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {!isLocked && (
              <Button onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Salvar Evolução
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AiValidationModal
        open={isValidationModalOpen}
        onOpenChange={setIsValidationModalOpen}
        content={pendingAiContent}
        onApprove={handleApproveAi}
        onReject={handleRejectAi}
      />
    </>
  )
}
