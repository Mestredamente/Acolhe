import { useEffect, useState } from 'react'
import { getDiarioEntries, DiarioEntry } from '@/services/diario'
import { SentimentAnalysis } from './SentimentAnalysis'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Sparkles, Smile, Meh, Frown, Wind, Angry } from 'lucide-react'

const sentMap = {
  'muito feliz': { icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  feliz: { icon: Smile, color: 'text-teal-500', bg: 'bg-teal-100' },
  neutro: { icon: Meh, color: 'text-slate-500', bg: 'bg-slate-100' },
  ansioso: { icon: Wind, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  triste: { icon: Frown, color: 'text-blue-500', bg: 'bg-blue-100' },
  irritado: { icon: Angry, color: 'text-rose-500', bg: 'bg-rose-100' },
}

export function DiarioTab({ patientId }: { patientId: string }) {
  const [entries, setEntries] = useState<DiarioEntry[]>([])

  useEffect(() => {
    getDiarioEntries(patientId).then(setEntries).catch(console.error)
  }, [patientId])

  return (
    <div className="space-y-6">
      <SentimentAnalysis entries={entries} isPsychologistView />
      <h3 className="text-lg font-semibold mt-8">Histórico de Registros</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhum registro encontrado para este paciente.
          </p>
        ) : (
          entries.map((entry) => {
            const cfg = sentMap[entry.sentiment as keyof typeof sentMap] || sentMap['neutro']
            const Icon = cfg.icon
            return (
              <Card key={entry.id} className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between bg-muted/20 border-b">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${cfg.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <span className="font-semibold capitalize text-sm">{entry.sentiment}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.entry_date), 'dd MMM yyyy', { locale: ptBR })}
                  </span>
                </CardHeader>
                <CardContent className="pt-4 text-sm whitespace-pre-wrap">
                  {entry.content}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
