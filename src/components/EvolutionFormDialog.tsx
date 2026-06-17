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
import { Mic, Wand2, Loader2 } from 'lucide-react'
import { Appointment } from '@/services/appointments'
import { createEvolucao, updateEvolucao, Evolucao } from '@/services/evolucoes'
import { useToast } from '@/hooks/use-toast'

interface Props {
  patientId: string
  appointments: Appointment[]
  evolution?: Evolucao | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function EvolutionFormDialog({
  patientId,
  appointments,
  evolution,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  const [appointmentId, setAppointmentId] = useState('')
  const [content, setContent] = useState('')
  const [aiSummary, setAiSummary] = useState('')
  const [isSigned, setIsSigned] = useState(false)

  useEffect(() => {
    if (open) {
      if (evolution) {
        setAppointmentId(evolution.appointment_id)
        setContent(evolution.content)
        setAiSummary(evolution.ai_summary)
        setIsSigned(evolution.is_signed)
      } else {
        setAppointmentId(appointments[0]?.id || '')
        setContent('')
        setAiSummary('')
        setIsSigned(false)
      }
    }
  }, [open, evolution, appointments])

  const handleSimulateVoice = () => {
    setIsRecording(true)
    setTimeout(() => {
      setContent(
        (prev) =>
          prev +
          (prev ? '\n' : '') +
          'Paciente relata que a semana foi produtiva, conseguiu aplicar as técnicas de respiração durante as crises de ansiedade. Mencionou leve desconforto no trabalho, mas lidou bem com a situação após aplicar os exercícios propostos.',
      )
      setIsRecording(false)
    }, 2000)
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
      setAiSummary(
        'Paciente relata progresso com técnicas de respiração para manejo de crises de ansiedade. Leve desconforto laboral contornado com sucesso.',
      )
      setIsGeneratingSummary(false)
    }, 1500)
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
      const dateStr = apt?.appointment_date
        ? `${apt.appointment_date} 12:00:00.000Z`
        : apt?.time || new Date().toISOString()

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{evolution ? 'Editar Evolução' : 'Nova Evolução'}</DialogTitle>
          <DialogDescription>
            Registre as notas da sessão. Utilize transcrição de voz e geração de resumos via IA para
            facilitar seu trabalho.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Sessão Relacionada</Label>
            <Select value={appointmentId} onValueChange={setAppointmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a sessão" />
              </SelectTrigger>
              <SelectContent>
                {appointments.map((apt) => {
                  const d = apt.appointment_date
                    ? new Date(apt.appointment_date)
                    : new Date(apt.time || '')
                  return (
                    <SelectItem key={apt.id} value={apt.id}>
                      {d.toLocaleDateString('pt-BR')} - {apt.type}{' '}
                      {apt.start_time ? `às ${apt.start_time}` : ''}
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
            <div className="flex items-center justify-between">
              <Label>Notas da Sessão</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSimulateVoice}
                disabled={isRecording}
                className={isRecording ? 'text-primary animate-pulse border-primary' : ''}
              >
                {isRecording ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4 mr-2" />
                )}
                {isRecording ? 'Gravando...' : 'Transcrever Voz'}
              </Button>
            </div>
            <Textarea
              className="min-h-[150px] resize-y"
              placeholder="Digite as observações clínicas aqui..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Resumo (IA)</Label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSimulateAI}
                disabled={isGeneratingSummary || !content}
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
            />
          </div>

          <div className="flex items-center space-x-2 bg-muted/20 p-3 rounded-md border">
            <Checkbox
              id="is_signed"
              checked={isSigned}
              onCheckedChange={(checked) => setIsSigned(checked as boolean)}
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
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Salvar Evolução
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
