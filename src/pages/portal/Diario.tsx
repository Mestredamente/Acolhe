import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getDiarioEntries, createDiarioEntry, type DiarioEntry } from '@/services/diario'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Smile, Meh, Frown, Wind, Angry, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { usePatientContext } from '@/components/portal/PortalProtectedRoute'
import { SentimentAnalysis } from '@/components/SentimentAnalysis'

const sentiments = [
  {
    value: 'muito feliz',
    icon: Sparkles,
    label: 'Muito Feliz',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100 hover:bg-emerald-200',
  },
  {
    value: 'feliz',
    icon: Smile,
    label: 'Feliz',
    color: 'text-teal-500',
    bg: 'bg-teal-100 hover:bg-teal-200',
  },
  {
    value: 'neutro',
    icon: Meh,
    label: 'Neutro',
    color: 'text-slate-500',
    bg: 'bg-slate-100 hover:bg-slate-200',
  },
  {
    value: 'ansioso',
    icon: Wind,
    label: 'Ansioso',
    color: 'text-indigo-500',
    bg: 'bg-indigo-100 hover:bg-indigo-200',
  },
  {
    value: 'triste',
    icon: Frown,
    label: 'Triste',
    color: 'text-blue-500',
    bg: 'bg-blue-100 hover:bg-blue-200',
  },
  {
    value: 'irritado',
    icon: Angry,
    label: 'Irritado',
    color: 'text-rose-500',
    bg: 'bg-rose-100 hover:bg-rose-200',
  },
] as const

export function PortalDiario() {
  const { patient } = usePatientContext()
  const { toast } = useToast()
  const [entries, setEntries] = useState<DiarioEntry[]>([])
  const [content, setContent] = useState('')
  const [sentiment, setSentiment] = useState<DiarioEntry['sentiment']>('feliz')
  const [loading, setLoading] = useState(false)

  const focusInput = () => {
    const textarea = document.getElementById('diario-textarea')
    if (textarea) {
      textarea.focus()
      window.scrollTo({ top: textarea.offsetTop - 100, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    getDiarioEntries(patient.id).then(setEntries).catch(console.error)
  }, [patient.id])

  const handleSave = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      const newEntry = await createDiarioEntry({
        patient_id: patient.id,
        entry_date: new Date().toISOString(),
        content,
        sentiment,
      })
      setEntries([newEntry, ...entries])
      setContent('')
      toast({ title: 'Entrada salva!', description: 'Seu registro foi guardado com segurança.' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Não foi possível salvar.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-emerald-900 tracking-tight">Diário Pessoal</h2>
      </div>

      <Card className="border-emerald-100 shadow-md bg-white overflow-hidden rounded-2xl">
        <CardHeader className="bg-emerald-50/70 border-b border-emerald-100 pb-5">
          <CardTitle className="text-emerald-800 text-xl">Nova Reflexão</CardTitle>
          <CardDescription className="text-emerald-600/80 text-base mt-1">
            Como você está se sentindo neste momento?
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="overflow-x-auto pb-2 -mx-2 px-2">
            <div className="flex gap-3 w-max">
              {sentiments.map((s) => {
                const Icon = s.icon
                const isSelected = sentiment === s.value
                return (
                  <button
                    key={s.value}
                    onClick={() => setSentiment(s.value as any)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all min-w-[80px] ${
                      isSelected
                        ? 'bg-white shadow-md ring-2 ring-emerald-400 scale-105'
                        : `${s.bg} bg-opacity-50`
                    }`}
                  >
                    <Icon className={`w-8 h-8 ${s.color}`} />
                    <span
                      className={`text-xs font-semibold ${isSelected ? 'text-slate-800' : 'text-slate-600'}`}
                    >
                      {s.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <Textarea
            id="diario-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva livremente sobre seus pensamentos, sentimentos ou acontecimentos do dia..."
            className="min-h-[160px] border-emerald-200 focus-visible:ring-emerald-500 resize-none text-base p-5 rounded-xl bg-slate-50/50"
          />

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={loading || !content.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 py-6 text-base font-medium shadow-sm transition-transform active:scale-95"
            >
              {loading ? 'Salvando...' : 'Salvar Entrada'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {entries.length >= 3 && (
        <div className="mt-10">
          <SentimentAnalysis entries={entries} onAction={focusInput} />
        </div>
      )}

      <div className="space-y-5 mt-10">
        <h3 className="text-2xl font-semibold text-emerald-800 tracking-tight">
          Histórico de Registros
        </h3>
        {entries.length === 0 ? (
          <div className="bg-white border border-emerald-100 rounded-2xl p-10 text-center">
            <p className="text-emerald-600/70 text-lg">
              Nenhum registro encontrado. Comece a escrever hoje!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {entries.map((entry) => {
              const sentConfig =
                sentiments.find((s) => s.value === entry.sentiment) || sentiments[0]
              const Icon = sentConfig.icon
              return (
                <Card
                  key={entry.id}
                  className="border-emerald-100 bg-white hover:shadow-md transition-shadow rounded-2xl overflow-hidden"
                >
                  <CardHeader className="pb-3 pt-5 flex flex-row items-center justify-between space-y-0 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${sentConfig.bg}`}>
                        <Icon className={`w-5 h-5 ${sentConfig.color}`} />
                      </div>
                      <span className="font-semibold text-slate-800 capitalize text-base">
                        {entry.sentiment}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                      {format(new Date(entry.entry_date), 'd MMM yyyy', { locale: ptBR })}
                    </span>
                  </CardHeader>
                  <CardContent className="pt-4 pb-5">
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
