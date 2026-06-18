import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Info, Calendar, Users, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getGrupo, GrupoTerapeutico, updateGrupo } from '@/services/grupos'
import { AppointmentFormDialog } from '@/components/AppointmentFormDialog'
import { getAppointments, Appointment } from '@/services/appointments'
import { getPatients, Patient } from '@/services/patients'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

export default function GrupoDetails() {
  const { id } = useParams()
  const [grupo, setGrupo] = useState<GrupoTerapeutico | null>(null)
  const [sessoes, setSessoes] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientToAdd, setSelectedPatientToAdd] = useState('')

  const loadData = async () => {
    if (!id) return
    const [g, allAppts, allPatients] = await Promise.all([
      getGrupo(id),
      getAppointments(),
      getPatients(),
    ])
    setGrupo(g)
    setSessoes(allAppts.filter((a) => a.grupo_id === id))
    setPatients(allPatients)
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (!grupo) return null

  const participantesCount = grupo.participantes?.length || 0
  const isFull = participantesCount >= grupo.limite_participantes
  const isAlmostFull = participantesCount >= grupo.limite_participantes - 2 && !isFull

  const handleAddParticipante = async () => {
    if (!selectedPatientToAdd) return
    if (isFull) return toast({ title: 'Grupo lotado', variant: 'destructive' })
    const current = grupo.participantes || []
    if (current.includes(selectedPatientToAdd)) return toast({ title: 'Paciente já está no grupo' })

    await updateGrupo(grupo.id, { participantes: [...current, selectedPatientToAdd] })
    setSelectedPatientToAdd('')
    toast({ title: 'Participante adicionado' })
    loadData()
  }

  const handleRemoveParticipante = async (patientId: string) => {
    if (!confirm('Remover paciente do grupo?')) return
    const current = grupo.participantes || []
    await updateGrupo(grupo.id, { participantes: current.filter((pid) => pid !== patientId) })
    toast({ title: 'Participante removido' })
    loadData()
  }

  const availablePatients = patients.filter((p) => !(grupo.participantes || []).includes(p.id))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{grupo.nome}</h1>
          <p className="text-slate-500">Tema: {grupo.tema}</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md flex gap-3">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm">
          <strong>Aviso Ético:</strong> Atendimentos em grupo seguem as diretrizes do CFP. O sigilo
          clínico é compartilhado entre os participantes do mesmo grupo. Termo de consentimento
          específico recomendado. Acesse o documento de consentimento na aba Documentos do grupo.
        </p>
      </div>

      <Tabs defaultValue="sessoes" className="w-full">
        <TabsList>
          <TabsTrigger value="sessoes">
            <Calendar className="w-4 h-4 mr-2" /> Sessões
          </TabsTrigger>
          <TabsTrigger value="participantes">
            <Users className="w-4 h-4 mr-2" /> Participantes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessoes" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <AppointmentFormDialog
              trigger={
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Agendar Sessão de Grupo
                </Button>
              }
              defaultGrupoId={grupo.id}
              defaultParticipants={grupo.participantes}
              isGroupMode={true}
              onClose={loadData}
            />
          </div>
          <div className="grid gap-4">
            {sessoes.length === 0 && (
              <p className="text-slate-500 text-center py-8">Nenhuma sessão agendada.</p>
            )}
            {sessoes.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {new Date(s.appointment_date).toLocaleDateString('pt-BR')} às {s.start_time}
                    </h3>
                    <p className="text-sm text-slate-500">{s.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{s.patient_name_text}</span>
                    <AppointmentFormDialog
                      appointment={s}
                      trigger={
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      }
                      isGroupMode={true}
                      onClose={loadData}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="participantes" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold">
                    Lotação: {participantesCount} / {grupo.limite_participantes}
                  </h3>
                  {isFull && <Badge variant="destructive">Grupo Lotado</Badge>}
                  {isAlmostFull && (
                    <Badge variant="warning" className="bg-amber-500 text-white">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Quase Lotado
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <Select
                  value={selectedPatientToAdd}
                  onValueChange={setSelectedPatientToAdd}
                  disabled={isFull}
                >
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Selecione um paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePatients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddParticipante} disabled={isFull || !selectedPatientToAdd}>
                  Adicionar
                </Button>
              </div>

              <div className="space-y-2">
                {grupo.expand?.participantes?.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <span className="font-medium">{p.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveParticipante(p.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {(!grupo.expand?.participantes || grupo.expand.participantes.length === 0) && (
                  <p className="text-slate-500 py-4 text-center">Nenhum participante no grupo.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
