import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RespostaEscala, saveResposta } from '@/services/escalas'
import { useToast } from '@/hooks/use-toast'
import { getBeckClassification } from '@/lib/escalas'
import { AlertTriangle, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function EscalaResponderDialog({
  resposta,
  open,
  onOpenChange,
  onSaved,
}: {
  resposta: RespostaEscala | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const { toast } = useToast()
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const escala = resposta?.expand?.scale_id

  useEffect(() => {
    if (open && resposta) {
      if (resposta.status === 'respondido' && resposta.responses_list) {
        const ans: Record<string, number> = {}
        resposta.responses_list.forEach((r) => (ans[r.question_id] = r.value))
        setAnswers(ans)
      } else {
        setAnswers({})
      }
    }
  }, [open, resposta])

  if (!resposta || !escala) return null

  const isResponded = resposta.status === 'respondido'
  const isComplete = escala.questions.every((q) => answers[q.id] !== undefined)

  const handleSubmit = async () => {
    if (!isComplete) {
      toast({
        title: 'Atenção',
        description: 'Responda todas as perguntas.',
        variant: 'destructive',
      })
      return
    }
    setIsSubmitting(true)
    try {
      const responses_list = Object.entries(answers).map(([question_id, value]) => ({
        question_id,
        value,
      }))
      const total_score = responses_list.reduce((acc, curr) => acc + curr.value, 0)
      const classification = getBeckClassification(escala.name, total_score)
      const ai_interpretation = `Classificação: ${classification}. O paciente pontuou ${total_score} na escala ${escala.name}.`

      await saveResposta(resposta.id, {
        responses_list,
        total_score,
        ai_interpretation,
        status: 'respondido',
        response_date: new Date().toISOString(),
      })
      toast({ title: 'Sucesso', description: 'Respostas salvas com sucesso.' })
      onSaved?.()
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{escala.name}</DialogTitle>
          <DialogDescription>{escala.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-1">
          {isResponded ? (
            <div className="space-y-6">
              <div className="bg-muted/30 p-6 rounded-xl border space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pontuação Total</p>
                    <p className="text-3xl font-bold text-primary">{resposta.total_score}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Classificação</p>
                    <p className="text-xl font-semibold text-primary mt-1">
                      {getBeckClassification(escala.name, resposta.total_score || 0)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Interpretação</p>
                  <p className="text-sm">{resposta.ai_interpretation}</p>
                </div>
                <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium ml-2">
                    Interpretação meramente orientativa. Avaliação clínica completa é
                    responsabilidade exclusiva do profissional.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Respostas do Paciente</h3>
                {escala.questions.map((q, idx) => {
                  const selectedVal = answers[q.id]
                  const selectedOpt = q.options.find((o) => o.value === selectedVal)
                  return (
                    <div key={q.id} className="text-sm border-b pb-3">
                      <p className="font-medium mb-1">
                        {idx + 1}. {q.text}
                      </p>
                      <p className="text-muted-foreground">
                        R: {selectedOpt?.text} (Peso: {selectedVal})
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-8 py-4">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm flex items-start gap-3">
                <Info className="h-5 w-5 shrink-0 mt-0.5" />
                <p>{escala.application_instructions}</p>
              </div>

              {escala.questions.map((q, idx) => (
                <div key={q.id} className="space-y-3">
                  <Label className="text-base font-medium">
                    {idx + 1}. {q.text}
                  </Label>
                  <RadioGroup
                    value={answers[q.id]?.toString()}
                    onValueChange={(val) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: parseInt(val) }))
                    }
                    className="flex flex-col space-y-1"
                  >
                    {q.options.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <RadioGroupItem value={opt.value.toString()} id={`${q.id}-${opt.value}`} />
                        <Label
                          htmlFor={`${q.id}-${opt.value}`}
                          className="cursor-pointer flex-1 font-normal"
                        >
                          {opt.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {!isResponded && (
          <div className="pt-4 border-t flex justify-end gap-2 mt-4 shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !isComplete}>
              {isSubmitting ? 'Salvando...' : 'Salvar Respostas'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
