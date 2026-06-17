import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Copy,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  Calendar,
  Pencil,
  Trash2,
  Plus,
  ChevronRight,
  Wand2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { useToast } from '@/hooks/use-toast'
import { getPatient, updatePatient, deletePatient, Patient } from '@/services/patients'
import { Appointment } from '@/services/appointments'
import { Evolucao, getEvolucoes, deleteEvolucao } from '@/services/evolucoes'
import { PatientForm } from '@/components/PatientForm'
import { EvolutionFormDialog } from '@/components/EvolutionFormDialog'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'

export default function PatientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([])

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  const [evoFormOpen, setEvoFormOpen] = useState(false)
  const [editingEvo, setEditingEvo] = useState<Evolucao | null>(null)
  const [viewingEvo, setViewingEvo] = useState<Evolucao | null>(null)

  const loadData = async () => {
    if (!id) return
    try {
      setPatient(await getPatient(id))
      setAppointments(
        await pb
          .collection<Appointment>('appointments')
          .getFullList({
            filter: `patient_id = '${id}'`,
            sort: '-appointment_date,-start_time,-time',
          }),
      )
      setEvolucoes(await getEvolucoes(id))
    } catch (e) {
      toast({ title: 'Erro', description: 'Paciente não encontrado.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  useRealtime('patients', (e) => {
    if (e.record.id === id) loadData()
  })

  useRealtime('evolucoes', (e) => {
    if (e.record.patient_id === id) loadData()
  })

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Carregando paciente...</div>
  if (!patient) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Paciente não encontrado</h2>
        <Button asChild className="mt-4">
          <Link to="/pacientes">Voltar</Link>
        </Button>
      </div>
    )
  }

  const handleCopyBilling = () => {
    const textToCopy = `Nome: ${patient.name}\nDocumento: ${patient.billing_id || '-'}\nEndereço: ${patient.billing_address || '-'}`
    navigator.clipboard.writeText(textToCopy)
    toast({
      title: 'Dados copiados!',
      description: 'Os dados de faturamento foram copiados para a área de transferência.',
    })
  }

  const handleUpdate = async (data: any) => {
    try {
      const dbData = {
        ...data,
        birth_date: data.birth_date ? new Date(data.birth_date).toISOString() : '',
      }
      await updatePatient(patient.id, dbData)
      toast({ title: 'Sucesso', description: 'Paciente atualizado.' })
      setIsEditing(false)
      loadData()
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Erro ao atualizar',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deletePatient(patient.id)
      toast({ title: 'Excluído', description: 'Paciente removido com sucesso.' })
      navigate('/pacientes')
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o paciente.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteEvo = async (evoId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta evolução?')) return
    try {
      await deleteEvolucao(evoId)
      toast({ title: 'Excluído', description: 'Evolução removida com sucesso.' })
      loadData()
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a evolução.',
        variant: 'destructive',
      })
    }
  }

  const avatarUrl = patient.avatar ? pb.files.getURL(patient, patient.avatar) : ''
  const age = patient.birth_date
    ? Math.floor((new Date().getTime() - new Date(patient.birth_date).getTime()) / 3.15576e10)
    : '-'

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/pacientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-primary">Ficha do Paciente</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4 mr-2" /> Editar
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir paciente?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação é permanente e removerá todos os dados do paciente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="shadow-sm border-t-4 border-t-primary">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
              <AvatarImage src={avatarUrl} alt={patient.name} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {patient.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold tracking-tight">{patient.name}</h2>
                <Badge
                  variant={patient.status === 'active' ? 'default' : 'secondary'}
                  className={patient.status === 'active' ? 'bg-teal-600' : ''}
                >
                  {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" /> {age !== '-' ? `${age} anos • ` : ''} Nasc:{' '}
                {patient.birth_date
                  ? new Date(patient.birth_date).toLocaleDateString('pt-BR')
                  : 'Não informado'}
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button className="flex-1 md:flex-none">
                <Calendar className="h-4 w-4 mr-2" /> Agendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="cadastrais" className="w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap bg-background border-b rounded-none px-0 gap-6">
          <TabsTrigger
            value="cadastrais"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Dados Cadastrais
          </TabsTrigger>
          <TabsTrigger
            value="prontuario"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Prontuário
          </TabsTrigger>
          <TabsTrigger
            value="evolucoes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Evoluções
          </TabsTrigger>
          <TabsTrigger
            value="anamnese"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Anamnese
          </TabsTrigger>
          <TabsTrigger
            value="documentos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Documentos
          </TabsTrigger>
          <TabsTrigger
            value="financeiro"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Financeiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cadastrais" className="mt-6 space-y-6">
          {isEditing ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Editar Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <PatientForm
                  defaultValues={patient}
                  onSubmit={handleUpdate}
                  onCancel={() => setIsEditing(false)}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                      <p className="text-sm">{patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">CPF</p>
                      <p className="text-sm">{patient.cpf || '-'}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Telefone
                      </p>
                      <p className="text-sm">{patient.phone || '-'}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email
                      </p>
                      <p className="text-sm">{patient.email || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Endereço
                      </p>
                      <p className="text-sm">{patient.address || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" /> Contato de Emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nome do Contato</p>
                      <p className="text-sm">{patient.emergency_contact_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                      <p className="text-sm">{patient.emergency_contact_phone || '-'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-primary/60">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" /> Faturamento
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyBilling}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copiar
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">CPF / CNPJ</p>
                      <p className="text-sm font-mono">{patient.billing_id || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Endereço de Cobrança
                      </p>
                      <p className="text-sm">{patient.billing_address || '-'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="prontuario" className="mt-6 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
            <div className="text-sm text-yellow-800">
              <strong>Aviso Importante:</strong> Este prontuário é de responsabilidade exclusiva do
              profissional. A IA auxilia na estruturação, mas não substitui o julgamento clínico.
              Conformidade CFP.
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Resumo de Evoluções</h3>
            <Button
              onClick={() => {
                setEditingEvo(null)
                setEvoFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Nova Evolução
            </Button>
          </div>

          <Card className="shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data da Sessão</TableHead>
                  <TableHead>Resumo IA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evolucoes.map((evo) => (
                  <TableRow
                    key={evo.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setViewingEvo(evo)}
                  >
                    <TableCell className="font-medium whitespace-nowrap">
                      {new Date(evo.session_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="max-w-[150px] md:max-w-[300px] truncate text-muted-foreground">
                      {evo.ai_summary || 'Sem resumo'}
                    </TableCell>
                    <TableCell>
                      {evo.is_signed ? (
                        <Badge variant="default" className="bg-teal-600">
                          Assinado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
                {evolucoes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhuma evolução registrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="evolucoes" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Histórico Completo</h3>
            <Button
              onClick={() => {
                setEditingEvo(null)
                setEvoFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Nova Evolução
            </Button>
          </div>

          <div className="space-y-4">
            {evolucoes.map((evo) => (
              <Card key={evo.id} className="shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        Sessão em {new Date(evo.session_date).toLocaleDateString('pt-BR')}
                        {evo.is_signed ? (
                          <Badge
                            variant="outline"
                            className="text-teal-600 border-teal-600 ml-2 hidden sm:inline-flex"
                          >
                            Assinada
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
                            Pendente
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingEvo(evo)
                          setEvoFormOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteEvo(evo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                      Notas da Sessão
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{evo.content}</p>
                  </div>
                  {evo.ai_summary && (
                    <div className="bg-muted/30 p-3 rounded-md border border-muted">
                      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                        <Wand2 className="h-3 w-3" /> Resumo Estruturado (IA)
                      </h4>
                      <p className="text-sm italic text-muted-foreground">{evo.ai_summary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {evolucoes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma evolução registrada para este paciente.
              </div>
            )}
          </div>
        </TabsContent>

        {['anamnese', 'documentos', 'financeiro'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="capitalize">{tab}</CardTitle>
                <CardDescription>Gestão de {tab} do paciente.</CardDescription>
              </CardHeader>
              <CardContent className="h-32 flex items-center justify-center border-t border-dashed bg-muted/20">
                <p className="text-muted-foreground text-sm">Área em desenvolvimento para {tab}.</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <EvolutionFormDialog
        patientId={patient.id}
        appointments={appointments}
        evolution={editingEvo}
        open={evoFormOpen}
        onOpenChange={setEvoFormOpen}
        onSaved={loadData}
      />

      <Sheet open={!!viewingEvo} onOpenChange={(open) => !open && setViewingEvo(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Detalhes da Evolução
            </SheetTitle>
            <SheetDescription>
              {viewingEvo &&
                `Sessão em ${new Date(viewingEvo.session_date).toLocaleDateString('pt-BR')}`}
            </SheetDescription>
          </SheetHeader>
          {viewingEvo && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Badge
                    variant={viewingEvo.is_signed ? 'default' : 'secondary'}
                    className={viewingEvo.is_signed ? 'bg-teal-600' : ''}
                  >
                    {viewingEvo.is_signed ? 'Assinado Digitalmente' : 'Pendente de Assinatura'}
                  </Badge>
                </h4>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Notas da Sessão</h4>
                <div className="bg-muted/20 p-4 rounded-md text-sm whitespace-pre-wrap border">
                  {viewingEvo.content}
                </div>
              </div>
              {viewingEvo.ai_summary && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <Wand2 className="h-4 w-4 text-primary" /> Resumo Estruturado (IA)
                  </h4>
                  <div className="bg-muted/50 p-4 rounded-md text-sm italic border text-muted-foreground">
                    {viewingEvo.ai_summary}
                  </div>
                </div>
              )}
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingEvo(viewingEvo)
                    setViewingEvo(null)
                    setEvoFormOpen(true)
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Editar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
