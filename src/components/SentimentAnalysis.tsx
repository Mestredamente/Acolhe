import { useMemo } from 'react'
import { format, subDays, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DiarioEntry } from '@/services/diario'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Activity, CalendarClock, Info } from 'lucide-react'

const SCORES: Record<string, number> = {
  'muito feliz': 5,
  feliz: 4,
  neutro: 3,
  ansioso: 2,
  triste: 1,
  irritado: 1,
}

const chartConfig = {
  score: {
    label: 'Sentimento',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

interface SentimentAnalysisProps {
  entries: DiarioEntry[]
  isPsychologistView?: boolean
  onAction?: () => void
}

export function SentimentAnalysis({
  entries,
  isPsychologistView,
  onAction,
}: SentimentAnalysisProps) {
  const sorted = useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime(),
    )
  }, [entries])

  const chartData = useMemo(() => {
    const recent = sorted.filter((e) => isAfter(new Date(e.entry_date), subDays(new Date(), 30)))
    const grouped = recent.reduce(
      (acc, e) => {
        const d = format(new Date(e.entry_date), 'yyyy-MM-dd')
        acc[d] = acc[d] ? [...acc[d], SCORES[e.sentiment] || 3] : [SCORES[e.sentiment] || 3]
        return acc
      },
      {} as Record<string, number[]>,
    )

    return Object.entries(grouped).map(([date, scores]) => ({
      date,
      displayDate: format(new Date(date), 'dd/MM'),
      score: scores.reduce((a, b) => a + b, 0) / scores.length,
    }))
  }, [sorted])

  const avg = useMemo(() => {
    const week = sorted.filter((e) => isAfter(new Date(e.entry_date), subDays(new Date(), 7)))
    return week.length
      ? week.reduce((a, e) => a + (SCORES[e.sentiment] || 3), 0) / week.length
      : null
  }, [sorted])

  const insights = useMemo(() => {
    if (sorted.length < 3) return []
    const res = []
    const last = sorted[sorted.length - 1]

    if (Date.now() - new Date(last.entry_date).getTime() > 7 * 86400000) {
      res.push({
        type: 'inactivity',
        title: 'Inatividade',
        msg: 'Você não registrou seu diário há alguns dias. Registrar ajuda no acompanhamento.',
        icon: CalendarClock,
        cls: 'text-slate-500 bg-slate-50 border-slate-200',
      })
    }

    if (
      sorted.slice(-7).length >= 7 &&
      sorted.slice(-7).every((e) => (SCORES[e.sentiment] || 0) >= 4)
    ) {
      res.push({
        type: 'stability',
        title: 'Estabilidade Positiva',
        msg: 'Período de estabilidade emocional positiva. Ótimo momento para refletir sobre o que tem funcionado.',
        icon: TrendingUp,
        cls: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      })
    }

    if (
      sorted.slice(-3).length >= 3 &&
      sorted.slice(-3).every((e) => (SCORES[e.sentiment] || 0) <= 2)
    ) {
      res.push({
        type: 'negative',
        title: 'Padrão Desfavorável',
        msg: 'Padrão de sentimentos desfavoráveis detectado nos últimos dias. Considere conversar com seu psicólogo.',
        icon: TrendingDown,
        cls: 'text-rose-600 bg-rose-50 border-rose-200',
      })
    }

    let switches = 0,
      lastState: string | null = null
    sorted
      .filter((e) => isAfter(new Date(e.entry_date), subDays(new Date(), 7)))
      .forEach((e) => {
        const st =
          (SCORES[e.sentiment] || 3) >= 4 ? 'pos' : (SCORES[e.sentiment] || 3) <= 2 ? 'neg' : 'neu'
        if (lastState && st !== 'neu' && lastState !== 'neu' && st !== lastState) switches++
        if (st !== 'neu') lastState = st
      })

    if (switches >= 2) {
      res.push({
        type: 'osc',
        title: 'Variação de Humor',
        msg: 'Variação de humor intensa identificada nos últimos 7 dias. Monitorar pode ajudar.',
        icon: Activity,
        cls: 'text-amber-600 bg-amber-50 border-amber-200',
      })
    }
    return res
  }, [sorted])

  if (sorted.length < 3) return null

  const lastUpdate = format(new Date(sorted[sorted.length - 1].entry_date), "dd 'de' MMMM", {
    locale: ptBR,
  })

  return (
    <div className="space-y-6">
      {isPsychologistView && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md flex items-start gap-3">
          <Info className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Aviso:</strong> Análise automatizada para apoio clínico. Não substitui avaliação
            profissional. Conforme CFP.
          </div>
        </div>
      )}
      <Card
        className={
          isPsychologistView ? 'border-slate-200 shadow-sm' : 'border-emerald-100 shadow-sm'
        }
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Análise de Sentimentos</CardTitle>
            <span className="text-xs text-muted-foreground">Atualizada em {lastUpdate}</span>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length >= 2 ? (
            <ChartContainer config={chartConfig} className="h-[250px] w-full mt-4">
              <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--muted-foreground)/0.2)"
                />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                  stroke="hsl(var(--muted-foreground))"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                {avg !== null && (
                  <ReferenceLine
                    y={avg}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    label={{
                      position: 'insideTopLeft',
                      value: 'Média 7d',
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 10,
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={isPsychologistView ? 'hsl(var(--primary))' : '#10b981'}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-[150px] flex items-center justify-center text-muted-foreground text-sm">
              Registre mais dias para visualizar o gráfico.
            </div>
          )}
          <div className="mt-6 space-y-3">
            {insights.map((ins, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center gap-4 ${ins.cls}`}
              >
                <div className="p-2 rounded-full bg-white/50">
                  <ins.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{ins.title}</h4>
                  <p className="text-sm mt-1">{ins.msg}</p>
                </div>
                {!isPsychologistView && ins.type === 'inactivity' && onAction && (
                  <Button
                    onClick={onAction}
                    variant="outline"
                    className="mt-2 sm:mt-0 bg-white hover:bg-slate-50 shrink-0"
                  >
                    Registrar Agora
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
