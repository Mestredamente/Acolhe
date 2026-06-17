import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Clock, Edit2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Automacao, saveAutomacao } from '@/services/automacoes'

interface Props {
  automacoes: Automacao[]
  onUpdate: () => void
}

export function AutomacaoList({ automacoes, onUpdate }: Props) {
  const { toast } = useToast()
  const [editingAuto, setEditingAuto] = useState<Partial<Automacao> | null>(null)

  const confirmacao =
    automacoes.find((a) => a.tipo === 'confirmacao') ||
    ({
      tipo: 'confirmacao',
      status: 'inativo',
      mensagem_padrao:
        'Olá [Nome do Paciente], sua consulta foi agendada para o dia [Data] às [Hora]. Tipo: [Tipo de Consulta].',
    } as Automacao)
  const lembrete =
    automacoes.find((a) => a.tipo === 'lembrete') ||
    ({
      tipo: 'lembrete',
      status: 'inativo',
      dias_antecedencia: 1,
      horario_envio: '18:00',
      mensagem_padrao: 'Lembrete: Você tem uma consulta amanhã, [Data] às [Hora]. Link: [Link].',
    } as Automacao)
  const posSessao =
    automacoes.find((a) => a.tipo === 'pos_sessao') ||
    ({
      tipo: 'pos_sessao',
      status: 'inativo',
      horas_pos_sessao: 2,
      mensagem_padrao:
        'Sua sessão foi concluída! Avalie de 1 a 5: como se sentiu na consulta de hoje?',
    } as Automacao)

  const toggleStatus = async (auto: Partial<Automacao>) => {
    const newStatus = auto.status === 'ativo' ? 'inativo' : 'ativo'
    await saveAutomacao({ ...auto, status: newStatus })
    onUpdate()
  }

  const handleSaveEdit = async () => {
    if (!editingAuto) return
    await saveAutomacao(editingAuto)
    setEditingAuto(null)
    onUpdate()
    toast({ title: 'Sucesso', description: 'Automação atualizada.' })
  }

  const renderCard = (data: Automacao, title: string, desc: string) => (
    <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div
        className={`absolute top-0 left-0 w-1 h-full ${data.status === 'ativo' ? 'bg-cyan-600' : 'bg-slate-300'}`}
      />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1 text-xs">{desc}</CardDescription>
          </div>
          <Switch checked={data.status === 'ativo'} onCheckedChange={() => toggleStatus(data)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-600 line-clamp-3 italic mb-4 min-h-[60px]">
          "{data.mensagem_padrao}"
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          {data.tipo === 'lembrete' && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {data.dias_antecedencia} dia(s) antes às{' '}
              {data.horario_envio}
            </span>
          )}
          {data.tipo === 'pos_sessao' && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {data.horas_pos_sessao}h após
            </span>
          )}
          {data.tipo === 'confirmacao' && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Imediato
            </span>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full text-cyan-800 border-cyan-200 hover:bg-cyan-50"
          onClick={() => setEditingAuto(data)}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Editar Mensagem
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderCard(confirmacao, 'Confirmação de Consulta', 'Enviado logo após o agendamento.')}
        {renderCard(lembrete, 'Lembrete de Consulta', 'Enviado antes da sessão.')}
        {renderCard(posSessao, 'Pós-Sessão', 'Enviado após a conclusão.')}
      </div>

      <Dialog open={!!editingAuto} onOpenChange={(open) => !open && setEditingAuto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              Editar {editingAuto?.tipo?.replace('_', ' ')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingAuto?.tipo === 'lembrete' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dias de antecedência</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editingAuto.dias_antecedencia || ''}
                    onChange={(e) =>
                      setEditingAuto({ ...editingAuto, dias_antecedencia: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Horário de envio</Label>
                  <Input
                    type="time"
                    value={editingAuto.horario_envio || ''}
                    onChange={(e) =>
                      setEditingAuto({ ...editingAuto, horario_envio: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
            {editingAuto?.tipo === 'pos_sessao' && (
              <div>
                <Label>Horas após a sessão</Label>
                <Input
                  type="number"
                  min={1}
                  value={editingAuto.horas_pos_sessao || ''}
                  onChange={(e) =>
                    setEditingAuto({ ...editingAuto, horas_pos_sessao: Number(e.target.value) })
                  }
                />
              </div>
            )}
            <div>
              <Label>Mensagem</Label>
              <Textarea
                rows={5}
                value={editingAuto?.mensagem_padrao || ''}
                onChange={(e) =>
                  setEditingAuto({ ...editingAuto, mensagem_padrao: e.target.value })
                }
              />
              <p className="text-xs text-slate-400 mt-2">
                Variáveis disponíveis: [Nome do Paciente], [Data], [Hora], [Tipo de Consulta],
                [Link]
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAuto(null)}>
              Cancelar
            </Button>
            <Button className="bg-cyan-700" onClick={handleSaveEdit}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
