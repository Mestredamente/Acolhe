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
  Lock,
  ShieldAlert,
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
import { Evolucao, getEvolucoes, deleteEvolucao, updateEvolucao } from '@/services/evolucoes'
import { Transaction, getTransactionsByPatient } from '@/services/financeiro'
import { PatientForm } from '@/components/PatientForm'
import { EvolutionFormDialog } from '@/components/EvolutionFormDialog'
import { FinanceiroFormDialog } from '@/components/FinanceiroFormDialog'
import { ReceiptDialog } from '@/components/faturamento/ReceiptDialog'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { AnamneseTab } from '@/components/AnamneseTab'
import { EscalasTab } from '@/components/EscalasTab'
import { DocumentoFormDialog } from '@/components/DocumentoFormDialog'
import {
  getDocumentosByPatient,
  Documento,
  deleteDocumento,
  createDocumento,
} from '@/services/documentos'
import { Assinatura, getAssinaturasByPatient, createAssinatura } from '@/services/assinaturas'
import { SignatureDialog } from '@/components/SignatureDialog'
import { BadgeCheck, AlertTriangle } from 'lucide-react'
import { getConfig, ConfigClinica } from '@/services/config_clinica'

export default function PatientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [documentos, setDocumentos] = useState<Documento[]>([])

  const [isEditing, setIsEditing] = useState(false)
  const [finFormOpen, setFinFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)

  const [evoFormOpen, setEvoFormOpen] = useState(false)
  const [editingEvo, setEditingEvo] = useState<Evolucao | null>(null)
  const [viewingEvo, setViewingEvo] = useState<Evolucao | null>(null)

  const [docFormOpen, setDocFormOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Documento | null>(null)

  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([])
  const [config, setConfig] = useState<ConfigClinica | null>(null)
  const [signModalOpen, setSignModalOpen] = useState(false)
  const [signTarget, setSignTarget] = useState<{
    type: 'evolucao' | 'documento'
    id: string
  } | null>(null)

  const loadData = async () => {
    if (!id) return
    try {
      setPatient(await getPatient(id))
      const userId = pb.authStore.record?.id
      if (userId) {
        setConfig(await getConfig(userId))
      }
      setAssinaturas(await getAssinaturasByPatient(id))
      setAppointments(
        await pb.collection<Appointment>('appointments').getFullList({
          filter: `patient_id = '${id}'`,
          sort: '-appointment_date,-start_time,-time',
        }),
      )
      setEvolucoes(await getEvolucoes(id))
      setTransactions(await getTransactionsByPatient(id))
      setDocumentos(await getDocumentosByPatient(id))
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

  useRealtime('financeiro', (e) => {
    if (e.record.patient_id === id) loadData()
  })

  useRealtime('documentos', (e) => {
    if (e.record.patient_id === id) loadData()
  })

  useRealtime('assinaturas', (e) => {
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

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return
    try {
      await deleteDocumento(docId)
      toast({ title: 'Excluído', description: 'Documento removido com sucesso.' })
      loadData()
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o documento.',
        variant: 'destructive',
      })
    }
  }

  const handleSignRequest = (type: 'evolucao' | 'documento', recordId: string) => {
    setSignTarget({ type, id: recordId })
    setSignModalOpen(true)
  }

  const handleSignatureConfirm = async (signatureData: string) => {
    if (!signTarget || !patient) return
    try {
      await createAssinatura({
        registro_id: signTarget.id,
        tipo_registro: signTarget.type,
        patient_id: patient.id,
        identificador_signatario: pb.authStore.record?.name || 'Psicólogo',
        signature_data: signatureData,
      })
      if (signTarget.type === 'evolucao') {
        await updateEvolucao(signTarget.id, { is_signed: true })
      }
      toast({ title: 'Sucesso', description: 'Assinatura registrada com sucesso.' })
      setSignModalOpen(false)
      loadData()
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a assinatura.',
        variant: 'destructive',
      })
    }
  }

  const handleGenerateLgpd = async () => {
    try {
      await createDocumento({
        user_id: pb.authStore.record?.id,
        patient_id: patient.id,
        file_name: `Termo de Consentimento LGPD - ${patient.name}`,
        doc_type: 'termo_consentimento_lgpd',
        description: `Identificação do Paciente: ${patient.name}\nFinalidade: Tratamento de dados para fins clínicos e terapêuticos.\nDireitos do Titular: Acesso, correção e exclusão de dados.\nPrazo de Armazenamento: Conforme legislação vigente/CFP.\nContato: ${pb.authStore.record?.email || ''}`,
        status: 'pendente_assinatura',
      })
      toast({ title: 'Sucesso', description: 'Termo LGPD gerado com sucesso.' })
      loadData()
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o termo.',
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
          <TabsTrigger
            value="escalas"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Escalas e Questionários
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
                        <Badge
                          variant="default"
                          className="bg-teal-600 flex w-fit items-center gap-1"
                        >
                          <BadgeCheck className="w-3 h-3" /> Assinado
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="flex w-fit items-center gap-1 text-slate-500"
                        >
                          <AlertTriangle className="w-3 h-3" /> Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {!evo.is_signed ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-teal-700 border-teal-200 hover:bg-teal-50"
                          onClick={() => handleSignRequest('evolucao', evo.id)}
                        >
                          Assinar
                        </Button>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                      )}
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
                            className="text-teal-600 border-teal-600 ml-2 hidden sm:inline-flex items-center gap-1"
                          >
                            <BadgeCheck className="w-3 h-3" /> Assinada
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="ml-2 hidden sm:inline-flex items-center gap-1 text-slate-500"
                          >
                            <AlertTriangle className="w-3 h-3" /> Pendente
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2 shrink-0 items-center">
                      {!evo.is_signed && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-teal-700 border-teal-200 hover:bg-teal-50"
                          onClick={() => handleSignRequest('evolucao', evo.id)}
                        >
                          Assinar
                        </Button>
                      )}
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

        <TabsContent value="anamnese" className="mt-6">
          <AnamneseTab patientId={patient.id} />
        </TabsContent>

        <TabsContent value="documentos" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Documentos Clínicos</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleGenerateLgpd}
                className="border-teal-600 text-teal-700 hover:bg-teal-50"
              >
                <ShieldAlert className="h-4 w-4 mr-2" /> Gerar Termo LGPD
              </Button>
              <Button
                onClick={() => {
                  setEditingDoc(null)
                  setDocFormOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Novo Documento
              </Button>
            </div>
          </div>

          <Card className="shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentos.map((doc) => {
                  const isSignable =
                    doc.doc_type === 'termo_consentimento_lgpd' || doc.doc_type === 'contrato'
                  const hasSignature = assinaturas.some(
                    (a) => a.tipo_registro === 'documento' && a.registro_id === doc.id,
                  )
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.file_name}
                        {doc.status === 'privado' && (
                          <Lock className="h-3 w-3 text-muted-foreground ml-1" />
                        )}
                      </TableCell>
                      <TableCell className="capitalize">
                        {doc.doc_type.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell>{new Date(doc.created).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        {hasSignature ? (
                          <Badge
                            variant="default"
                            className="bg-teal-600 flex w-fit items-center gap-1"
                          >
                            <BadgeCheck className="w-3 h-3" /> Assinado
                          </Badge>
                        ) : (
                          <Badge
                            variant={
                              doc.status === 'visivel_paciente'
                                ? 'default'
                                : doc.status === 'pendente_assinatura'
                                  ? 'outline'
                                  : 'secondary'
                            }
                            className={
                              doc.status === 'visivel_paciente'
                                ? 'bg-teal-600'
                                : doc.status === 'pendente_assinatura'
                                  ? 'text-amber-600 border-amber-600'
                                  : ''
                            }
                          >
                            {doc.status.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          {isSignable && !hasSignature && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-teal-700 border-teal-200 hover:bg-teal-50"
                              onClick={() => handleSignRequest('documento', doc.id)}
                            >
                              Assinar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingDoc(doc)
                              setDocFormOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteDoc(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {documentos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum documento registrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="p-4 bg-muted/10 border-t flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              Documentos sensíveis devem ser armazenados com criptografia e acesso restrito.
              Conformidade LGPD.
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="escalas" className="mt-6">
          <EscalasTab patientId={patient.id} />
        </TabsContent>

        <TabsContent value="financeiro" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Histórico Financeiro</h3>
            <Button
              onClick={() => {
                setEditingTransaction(null)
                setFinFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Novo Lançamento
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-sm border-l-4 border-l-teal-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    transactions
                      .filter((t) => t.status === 'pago')
                      .reduce((acc, t) => acc + t.amount, 0),
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pendente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    transactions
                      .filter((t) => ['pendente', 'atrasado', 'aguardando'].includes(t.status))
                      .reduce((acc, t) => acc + t.amount, 0),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {t.due_date
                        ? new Date(t.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                        : '-'}
                    </TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(t.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.status === 'pago'
                            ? 'default'
                            : t.status === 'atrasado'
                              ? 'destructive'
                              : t.status === 'cancelado'
                                ? 'secondary'
                                : 'outline'
                        }
                        className={
                          t.status === 'pago'
                            ? 'bg-teal-600'
                            : t.status === 'pendente'
                              ? 'text-amber-600 border-amber-600'
                              : ''
                        }
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        {!t.receipt_number && ['pendente', 'pago'].includes(t.status) && (
                          <Button variant="outline" size="sm" onClick={() => setReceiptTx(t)}>
                            Recibo
                          </Button>
                        )}
                        {t.receipt_number && (
                          <Button variant="outline" size="sm" onClick={() => setReceiptTx(t)}>
                            Ver Recibo
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTransaction(t)
                            setFinFormOpen(true)
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum lançamento financeiro.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
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

      <FinanceiroFormDialog
        open={finFormOpen}
        onOpenChange={setFinFormOpen}
        transaction={editingTransaction}
        defaultPatientId={patient.id}
      />

      <ReceiptDialog
        open={!!receiptTx}
        onOpenChange={(open) => !open && setReceiptTx(null)}
        transaction={receiptTx}
        onSaved={loadData}
      />

      <DocumentoFormDialog
        open={docFormOpen}
        onOpenChange={setDocFormOpen}
        documento={editingDoc}
        patientId={patient.id}
        onSaved={loadData}
      />

      <SignatureDialog
        open={signModalOpen}
        onOpenChange={setSignModalOpen}
        onConfirm={handleSignatureConfirm}
        defaultSignature={
          config?.assinatura_padrao ? pb.files.getURL(config, config.assinatura_padrao) : undefined
        }
      />
    </div>
  )
}
