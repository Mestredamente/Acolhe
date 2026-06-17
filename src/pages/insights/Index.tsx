import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  CalendarX,
  FileCheck,
  HeartPulse,
  LineChart,
  ShieldCheck,
  UserX,
} from 'lucide-react'
import {
  addDays,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isWithinInterval,
  startOfDay,
  subDays,
} from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import pb from '@/lib/pocketbase/client'
import { getPatients, type Patient } from '@/services/patients'
import { getAllEvolucoes, type Evolucao } from '@/services/evolucoes'
import { getAllRespostas, type RespostaEscala } from '@/services/escalas'
import { getAppointments, type Appointment } from '@/services/appointments'
import { getAllDiarios, type DiarioEntry } from '@/services/diario'
import { useRealtime } from '@/hooks/use-realtime'

interface PatientInsight {
  patient: Patient
  status: 'Estável' | 'Atenção' | 'Alerta'
  insights: string[]
  riskCount: number
}

function parseDbDate(dateStr?: string): Date {
  if (!dateStr) return new Date(0)
  return new Date(dateStr)
}

export default function InsightsList() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([])
  const [escalas, setEscalas] = useState<RespostaEscala[]>([])
  const [diarios, setDiarios] = useState<DiarioEntry[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('Todos')
  const [selectedPatient, setSelectedPatient] = useState<PatientInsight | null>(null)

  const loadData = async () => {
    try {
      const [pts, evs, esc, dias, apts] = await Promise.all([
        getPatients(),
        getAllEvolucoes(),
        getAllRespostas(),
        getAllDiarios(),
        getAppointments(),
      ])
      setPatients(pts.filter((p) => p.status === 'active'))
      setEvolucoes(evs)
      setEscalas(esc)
      setDiarios(dias)
      setAppointments(apts)
    } catch {
      // Intentionally ignored
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('patients', loadData)
  useRealtime('evolucoes', loadData)
  useRealtime('respostas_escala', loadData)
  useRealtime('diario_paciente', loadData)
  useRealtime('appointments', loadData)

  const data = useMemo(() => {
    const today = new Date()
    const sevenDaysAgo = subDays(today, 7)
    const fourteenDaysAhead = addDays(today, 14)
    const threeDaysAgo = subDays(today, 3)

    const evolutionActivity = new Set()
    evolucoes.forEach((e) => {
      if (isAfter(parseDbDate(e.session_date), sevenDaysAgo)) {
        evolutionActivity.add(e.patient_id)
      }
    })

    const pendingScales = escalas.filter((e) => e.status === 'pendente').length

    const activeDiaries = new Set()
    diarios.forEach((d) => {
      if (isAfter(parseDbDate(d.entry_date), sevenDaysAgo)) {
        activeDiaries.add(d.patient_id)
      }
    })

    const patientInsights: PatientInsight[] = patients.map((p) => {
      let riskCount = 0
      const pDiarios = diarios.filter((d) => d.patient_id === p.id)
      const last3 = pDiarios.slice(0, 3)
      const hasNegative =
        last3.length >= 3 && last3.every((d) => ['triste', 'ansioso'].includes(d.sentiment))
      if (hasNegative) riskCount++

      const pAppts = appointments.filter((a) => a.patient_id === p.id && a.status !== 'cancelada')
      const futureAppts = pAppts.filter((a) =>
        isAfter(parseDbDate(a.appointment_date), startOfDay(today)),
      )
      const next14Appts = futureAppts.filter((a) =>
        isBefore(parseDbDate(a.appointment_date), fourteenDaysAhead),
      )
      const evasionRisk = next14Appts.length === 0
      if (evasionRisk) riskCount++

      const pEscalas = escalas
        .filter((e) => e.patient_id === p.id && e.status === 'respondido')
        .sort((a, b) => (b.response_date || '').localeCompare(a.response_date || ''))
      const lastEscala = pEscalas[0]
      const hasSevere =
        lastEscala && /moderado|grave|severo/i.test(lastEscala.ai_interpretation || '')
      if (hasSevere) riskCount++

      let status: 'Estável' | 'Atenção' | 'Alerta' = 'Estável'
      if (riskCount >= 2) status = 'Alerta'
      else if (riskCount === 1) status = 'Atenção'

      const insights: string[] = []
      const pEvolucoes = evolucoes.filter((e) => e.patient_id === p.id)
      const lastEvolucao = pEvolucoes[0]

      if (lastEvolucao && isAfter(parseDbDate(lastEvolucao.session_date), threeDaysAgo)) {
        insights.push(
          `Última evolução registrada em ${format(
            parseDbDate(lastEvolucao.session_date),
            'dd/MM/yyyy',
          )}`,
        )
      }
      if (lastEscala) {
        insights.push(
          `${lastEscala.expand?.scale_id?.name || 'Escala'} — Score ${
            lastEscala.total_score || '-'
          } (${lastEscala.ai_interpretation || 'Concluída'})`,
        )
      }
      if (hasNegative) {
        insights.push('Padrão de sentimentos desfavoráveis detectado no diário')
      }

      const nextAppt = futureAppts.find((a) =>
        isWithinInterval(parseDbDate(a.appointment_date), {
          start: startOfDay(today),
          end: endOfDay(addDays(today, 1)),
        }),
      )
      if (nextAppt) {
        insights.push(
          `Próxima sessão em ${format(
            parseDbDate(nextAppt.appointment_date),
            'dd/MM/yyyy',
          )} às ${nextAppt.start_time}`,
        )
      }
      if (evasionRisk) {
        insights.push('Sem sessões agendadas — risco de evasão')
      }

      return {
        patient: p,
        status,
        insights: insights.slice(0, 3),
        riskCount,
      }
    })

    const diaryInactivity = patients.length - activeDiaries.size
    const activeAlerts = patientInsights.filter((p) => p.status === 'Alerta').length

    return {
      evolutionActivity: evolutionActivity.size,
      pendingScales,
      diaryInactivity,
      activeAlerts,
      patientInsights,
    }
  }, [patients, evolucoes, escalas, diarios, appointments])

  const filteredInsights = data.patientInsights.filter((pi) => {
    if (filterStatus !== 'Todos' && pi.status !== filterStatus) return false
    if (search && !pi.patient.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Insights Clínicos</h1>
        <p className="text-muted-foreground">
          Monitoramento proativo automatizado de riscos e padrões baseados nos dados do paciente.
        </p>
      </div>

      <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg flex items-start sm:items-center gap-3">
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-sm">
          <strong>Aviso Legal:</strong> Análise automatizada de padrões para apoio clínico. Não
          substitui avaliação profissional. Conforme recomendações do CFP.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evoluções Recentes</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.evolutionActivity}</div>
            <p className="text-xs text-muted-foreground">Pacientes ativos nos últimos 7 dias</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalas Pendentes</CardTitle>
            <FileCheck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingScales}</div>
            <p className="text-xs text-muted-foreground">Aguardando resposta do paciente</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inatividade Diário</CardTitle>
            <UserX className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.diaryInactivity}</div>
            <p className="text-xs text-muted-foreground">Pacientes inativos nos últimos 7 dias</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">Pacientes requerendo atenção clínica</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <Input
          placeholder="Buscar paciente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os Status</SelectItem>
            <SelectItem value="Alerta">Alerta</SelectItem>
            <SelectItem value="Atenção">Atenção</SelectItem>
            <SelectItem value="Estável">Estável</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInsights.map((pi) => (
          <Card
            key={pi.patient.id}
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/40 group"
            onClick={() => setSelectedPatient(pi)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={pi.patient.avatar ? pb.files.getURL(pi.patient, pi.patient.avatar) : ''}
                    />
                    <AvatarFallback>{pi.patient.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3
                      className="font-semibold text-foreground truncate max-w-[160px]"
                      title={pi.patient.name}
                    >
                      {pi.patient.name}
                    </h3>
                    <Badge
                      variant={
                        pi.status === 'Alerta'
                          ? 'destructive'
                          : pi.status === 'Atenção'
                            ? 'default'
                            : 'secondary'
                      }
                      className={
                        pi.status === 'Atenção'
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : pi.status === 'Estável'
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : ''
                      }
                    >
                      {pi.status}
                    </Badge>
                  </div>
                </div>
                <LineChart className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </div>
              <div className="space-y-2 mt-4">
                {pi.insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                    <span className="leading-snug">{insight}</span>
                  </div>
                ))}
                {pi.insights.length === 0 && (
                  <span className="text-sm text-muted-foreground italic">
                    Nenhum insight recente detectado.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredInsights.length === 0 && (
          <div className="col-span-full py-12 text-center border rounded-xl border-dashed">
            <Activity className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Nenhum paciente encontrado</p>
            <p className="text-sm text-muted-foreground/70">
              Altere os filtros de busca para ver resultados.
            </p>
          </div>
        )}
      </div>

      <Sheet open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l">
          {selectedPatient &&
            (() => {
              const pDiarios = diarios
                .filter((d) => d.patient_id === selectedPatient.patient.id)
                .sort((a, b) => a.entry_date.localeCompare(b.entry_date))

              const chartData = pDiarios.slice(-30).map((d) => ({
                date: format(parseDbDate(d.entry_date), 'dd/MM'),
                score:
                  d.sentiment === 'feliz'
                    ? 5
                    : d.sentiment === 'esperançoso'
                      ? 4
                      : d.sentiment === 'neutro'
                        ? 3
                        : d.sentiment === 'ansioso' || d.sentiment === 'irritado'
                          ? 2
                          : 1,
              }))

              const pEscalas = escalas
                .filter(
                  (e) => e.patient_id === selectedPatient.patient.id && e.status === 'respondido',
                )
                .sort((a, b) => (b.response_date || '').localeCompare(a.response_date || ''))
                .slice(0, 5)

              const pEvolucoes = evolucoes
                .filter((e) => e.patient_id === selectedPatient.patient.id)
                .slice(0, 5)

              const pAppts = appointments
                .filter(
                  (a) =>
                    a.patient_id === selectedPatient.patient.id &&
                    isAfter(parseDbDate(a.appointment_date), new Date()),
                )
                .slice(0, 5)

              return (
                <div className="space-y-8 mt-6">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={
                            selectedPatient.patient.avatar
                              ? pb.files.getURL(
                                  selectedPatient.patient,
                                  selectedPatient.patient.avatar,
                                )
                              : ''
                          }
                        />
                        <AvatarFallback>{selectedPatient.patient.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-xl">{selectedPatient.patient.name}</span>
                        <Badge
                          variant={
                            selectedPatient.status === 'Alerta'
                              ? 'destructive'
                              : selectedPatient.status === 'Atenção'
                                ? 'default'
                                : 'secondary'
                          }
                          className={
                            selectedPatient.status === 'Atenção'
                              ? 'bg-amber-500 text-white'
                              : selectedPatient.status === 'Estável'
                                ? 'bg-emerald-500 text-white'
                                : ''
                          }
                        >
                          {selectedPatient.status}
                        </Badge>
                      </div>
                    </SheetTitle>
                    <SheetDescription className="pt-2">
                      Visão detalhada de insights clínicos e histórico recente.
                    </SheetDescription>
                  </SheetHeader>

                  {chartData.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Tendência de Humor (30 dias)</h4>
                      <div className="h-[200px] w-full border rounded-xl p-4 bg-card shadow-sm">
                        <ChartContainer
                          config={{ score: { label: 'Humor', color: 'hsl(var(--primary))' } }}
                          className="w-full h-full"
                        >
                          <RechartsLineChart
                            data={chartData}
                            margin={{ left: -20, right: 10, top: 10, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                              dataKey="date"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              className="text-xs"
                            />
                            <YAxis
                              domain={[1, 5]}
                              ticks={[1, 2, 3, 4, 5]}
                              tickLine={false}
                              axisLine={false}
                              className="text-xs"
                              tickFormatter={(val) =>
                                ['Triste', 'Ansioso', 'Neutro', 'Esp.', 'Feliz'][val - 1]
                              }
                              width={60}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="var(--color-score)"
                              strokeWidth={2}
                              dot={{ r: 4, strokeWidth: 2 }}
                              activeDot={{ r: 6 }}
                            />
                          </RechartsLineChart>
                        </ChartContainer>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-primary" /> Últimas Escalas
                      </h4>
                      {pEscalas.length > 0 ? (
                        <ul className="space-y-3 text-sm text-muted-foreground border-l-2 border-primary/20 pl-3">
                          {pEscalas.map((e) => (
                            <li key={e.id} className="relative">
                              <span className="font-medium text-foreground">
                                {format(parseDbDate(e.response_date || e.created), 'dd/MM/yy')}
                              </span>{' '}
                              - {e.expand?.scale_id?.name}: Score {e.total_score} (
                              <span className="italic">{e.ai_interpretation}</span>)
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground italic bg-accent/50 p-3 rounded-md">
                          Nenhuma escala respondida recentemente.
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-primary" /> Histórico de Evoluções
                      </h4>
                      {pEvolucoes.length > 0 ? (
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {pEvolucoes.map((e) => (
                            <li
                              key={e.id}
                              className="flex items-center gap-2 bg-accent/50 p-2 rounded-md"
                            >
                              <span className="font-medium min-w-[70px]">
                                {format(parseDbDate(e.session_date), 'dd/MM/yy')}
                              </span>
                              <span className="truncate">Sessão registrada</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground italic bg-accent/50 p-3 rounded-md">
                          Nenhuma evolução recente.
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <CalendarX className="w-4 h-4 text-primary" /> Próximos Agendamentos
                      </h4>
                      {pAppts.length > 0 ? (
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {pAppts.map((a) => (
                            <li
                              key={a.id}
                              className="flex items-center justify-between bg-primary/5 text-primary p-2 rounded-md"
                            >
                              <span className="font-medium">
                                {format(parseDbDate(a.appointment_date), 'dd/MM/yyyy')}
                              </span>
                              <span className="font-mono">{a.start_time}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground italic bg-accent/50 p-3 rounded-md">
                          Sem agendamentos futuros.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t mt-auto">
                    <Button asChild className="w-full h-11" size="lg">
                      <Link to={`/pacientes/${selectedPatient.patient.id}`}>
                        Abrir ficha completa do paciente
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })()}
        </SheetContent>
      </Sheet>
    </div>
  )
}
