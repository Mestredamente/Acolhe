import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getRespostasPendenteForPortal, RespostaEscala } from '@/services/escalas'
import { EscalaResponderDialog } from '@/components/EscalaResponderDialog'
import { Button } from '@/components/ui/button'
import { FileText, ClipboardList } from 'lucide-react'

export function PortalTarefas() {
  const [respostas, setRespostas] = useState<RespostaEscala[]>([])
  const [selected, setSelected] = useState<RespostaEscala | null>(null)
  const [open, setOpen] = useState(false)

  const loadData = async () => {
    try {
      setRespostas(await getRespostasPendenteForPortal())
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-3xl font-bold text-emerald-900 tracking-tight">Tarefas e Escalas</h2>
      <Card className="border-emerald-100 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
          <CardTitle className="text-emerald-800 text-xl">Escalas Pendentes</CardTitle>
          <CardDescription className="text-base mt-1">
            Responda aos questionários solicitados pelo seu profissional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {respostas.length === 0 ? (
            <div className="text-center py-12 text-emerald-700/60">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Nenhuma escala pendente no momento.</p>
            </div>
          ) : (
            respostas.map((resp) => {
              const esc = resp.expand?.scale_id
              if (!esc) return null
              return (
                <div
                  key={resp.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white rounded-xl border border-emerald-200 shadow-sm hover:border-emerald-300 transition-colors gap-4"
                >
                  <div className="flex gap-4 items-start">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700 shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-900 text-lg">{esc.name}</h3>
                      <p className="text-sm text-emerald-700/80 mt-1 leading-relaxed max-w-xl">
                        {esc.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                    onClick={() => {
                      setSelected(resp)
                      setOpen(true)
                    }}
                  >
                    Responder
                  </Button>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <EscalaResponderDialog
        open={open}
        onOpenChange={setOpen}
        resposta={selected}
        onSaved={loadData}
      />
    </div>
  )
}
