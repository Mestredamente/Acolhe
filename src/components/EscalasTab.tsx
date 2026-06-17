import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Plus, ClipboardList, CheckCircle2 } from 'lucide-react'
import {
  Escala,
  RespostaEscala,
  getEscalas,
  getRespostasByPatient,
  assignEscalaToPatient,
} from '@/services/escalas'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { EscalaResponderDialog } from './EscalaResponderDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function EscalasTab({ patientId }: { patientId: string }) {
  const { toast } = useToast()
  const [escalas, setEscalas] = useState<Escala[]>([])
  const [respostas, setRespostas] = useState<RespostaEscala[]>([])
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedEscalaId, setSelectedEscalaId] = useState<string>('')

  const [responderOpen, setResponderOpen] = useState(false)
  const [selectedResposta, setSelectedResposta] = useState<RespostaEscala | null>(null)

  const loadData = async () => {
    try {
      const [esc, resp] = await Promise.all([getEscalas(), getRespostasByPatient(patientId)])
      setEscalas(esc)
      setRespostas(resp)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [patientId])

  useRealtime('respostas_escala', (e) => {
    if (e.record.patient_id === patientId) loadData()
  })

  const handleAssign = async () => {
    if (!selectedEscalaId) return
    try {
      await assignEscalaToPatient(pb.authStore.record!.id, patientId, selectedEscalaId)
      toast({ title: 'Sucesso', description: 'Escala atribuída ao paciente.' })
      setAssignOpen(false)
      setSelectedEscalaId('')
      loadData()
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Erro ao atribuir escala',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Escalas e Questionários</h3>
        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Atribuir Escala
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atribuir Nova Escala</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Select value={selectedEscalaId} onValueChange={setSelectedEscalaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma escala" />
                </SelectTrigger>
                <SelectContent>
                  {escalas.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAssign} className="w-full" disabled={!selectedEscalaId}>
                Confirmar Atribuição
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {respostas.map((resp) => {
          const esc = resp.expand?.scale_id
          if (!esc) return null
          const isResponded = resp.status === 'respondido'

          return (
            <Card
              key={resp.id}
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-primary/20"
              onClick={() => {
                setSelectedResposta(resp)
                setResponderOpen(true)
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{esc.name}</CardTitle>
                    <CardDescription>{esc.category}</CardDescription>
                  </div>
                  <Badge
                    variant={isResponded ? 'default' : 'secondary'}
                    className={isResponded ? 'bg-teal-600' : ''}
                  >
                    {isResponded ? 'Respondido' : 'Pendente'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  {isResponded ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      <span>Pontuação: {resp.total_score}</span>
                    </>
                  ) : (
                    <>
                      <ClipboardList className="h-4 w-4" />
                      <span>Aguardando resposta do paciente</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
        {respostas.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
            <ClipboardList className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>Nenhuma escala atribuída a este paciente.</p>
          </div>
        )}
      </div>

      <EscalaResponderDialog
        open={responderOpen}
        onOpenChange={setResponderOpen}
        resposta={selectedResposta}
        onSaved={loadData}
      />
    </div>
  )
}
