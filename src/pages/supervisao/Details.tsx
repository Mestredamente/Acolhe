import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, BadgeCheck, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { SupervisaoFeedback } from '@/services/supervisao'

export default function SupervisaoDetails() {
  const { id } = useParams()
  const { toast } = useToast()

  const [supervisionado, setSupervisionado] = useState<any>(null)
  const [patients, setPatients] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<SupervisaoFeedback[]>([])
  const [evolucoes, setEvolucoes] = useState<any[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState('none')
  const [selectedEvolucao, setSelectedEvolucao] = useState('none')
  const [feedbackText, setFeedbackText] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!id) return
    try {
      const u = await pb.collection('users').getOne(id)
      setSupervisionado(u)

      const p = await pb.collection('patients').getFullList({ filter: `user_id = '${id}'` })
      setPatients(p)

      const f = await pb.collection('supervisao_feedback').getFullList({
        filter: `supervisionado_id = '${id}'`,
        expand: 'patient_id,evolucao_id',
        sort: '-created',
      })
      setFeedbacks(f as SupervisaoFeedback[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  useEffect(() => {
    if (selectedPatient && selectedPatient !== 'none') {
      pb.collection('evolucoes')
        .getFullList({ filter: `patient_id = '${selectedPatient}'`, sort: '-session_date' })
        .then(setEvolucoes)
        .catch(console.error)
    } else {
      setEvolucoes([])
      setSelectedEvolucao('none')
    }
  }, [selectedPatient])

  const handleSaveFeedback = async () => {
    if (!feedbackText) return
    try {
      await pb.collection('supervisao_feedback').create({
        supervisor_id: pb.authStore.record?.id,
        supervisionado_id: id,
        patient_id: selectedPatient !== 'none' ? selectedPatient : null,
        evolucao_id: selectedEvolucao !== 'none' ? selectedEvolucao : null,
        texto_feedback: feedbackText,
      })
      toast({ title: 'Sucesso', description: 'Feedback registrado com sucesso.' })
      setModalOpen(false)
      setFeedbackText('')
      setSelectedPatient('none')
      setSelectedEvolucao('none')
      loadData()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Falha ao salvar.', variant: 'destructive' })
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>
  if (!supervisionado)
    return <div className="p-8 text-center text-muted-foreground">Psicólogo não encontrado.</div>

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/supervisao">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">{supervisionado.name}</h1>
          <p className="text-muted-foreground text-sm">{supervisionado.email}</p>
        </div>
      </div>

      <Tabs defaultValue="pacientes" className="w-full">
        <TabsList className="w-full justify-start h-auto bg-background border-b rounded-none px-0 gap-6">
          <TabsTrigger
            value="pacientes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Pacientes Supervisionados
          </TabsTrigger>
          <TabsTrigger
            value="feedbacks"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Histórico de Feedbacks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pacientes" className="mt-6">
          <Card className="shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Consulta</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={p.status === 'active' ? 'default' : 'secondary'}
                        className={p.status === 'active' ? 'bg-teal-600' : ''}
                      >
                        {p.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.last_consultation
                        ? new Date(p.last_consultation).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/pacientes/${p.id}`}>
                          <Eye className="w-4 h-4 mr-2" /> Revisar Prontuário
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {patients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum paciente cadastrado por este profissional.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="feedbacks" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Feedbacks Aplicados</h3>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Novo Feedback
            </Button>
          </div>

          <div className="space-y-4">
            {feedbacks.map((f) => (
              <Card key={f.id} className="shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-teal-600" />
                        Feedback em {new Date(f.created).toLocaleDateString('pt-BR')}
                      </CardTitle>
                      {(f.expand?.patient_id || f.expand?.evolucao_id) && (
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          {f.expand?.patient_id && (
                            <Badge variant="outline">Paciente: {f.expand.patient_id.name}</Badge>
                          )}
                          {f.expand?.evolucao_id && (
                            <Badge variant="secondary">
                              Evolução:{' '}
                              {new Date(f.expand.evolucao_id.session_date).toLocaleDateString(
                                'pt-BR',
                              )}
                            </Badge>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <p className="text-sm whitespace-pre-wrap">{f.texto_feedback}</p>
                </CardContent>
              </Card>
            ))}
            {feedbacks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum feedback registrado.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Registrar Feedback de Supervisão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Paciente Relacionado (Opcional)</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Geral / Não se aplica</SelectItem>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPatient !== 'none' && (
              <div className="space-y-2">
                <Label>Evolução / Sessão Específica (Opcional)</Label>
                <Select value={selectedEvolucao} onValueChange={setSelectedEvolucao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a sessão..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Geral do paciente</SelectItem>
                    {evolucoes.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        Sessão de {new Date(e.session_date).toLocaleDateString('pt-BR')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Texto do Feedback</Label>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[150px]"
                placeholder="Insira as orientações e análises do caso..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFeedback} disabled={!feedbackText}>
              Salvar Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
