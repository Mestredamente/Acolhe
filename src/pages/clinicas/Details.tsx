import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Building2,
  Pencil,
  Users,
  Activity,
  DollarSign,
  Calendar,
  Unlink,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getClinica, Clinica } from '@/services/clinicas'
import { getUsers, updateUser, User } from '@/services/users'
import { getPatients, Patient } from '@/services/patients'
import { getAppointments, Appointment } from '@/services/appointments'
import { getTransactions, Transaction } from '@/services/financeiro'
import { useAuth } from '@/hooks/use-auth'
import { ClinicaFormDialog } from '@/components/ClinicaFormDialog'
import { useToast } from '@/hooks/use-toast'
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

export default function ClinicaDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [clinica, setClinica] = useState<Clinica | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedUserToLink, setSelectedUserToLink] = useState('')

  const loadData = async () => {
    if (!id) return
    try {
      const [cRes, uRes, pRes, aRes, tRes] = await Promise.all([
        getClinica(id),
        getUsers(),
        getPatients(),
        getAppointments(),
        getTransactions(),
      ])
      setClinica(cRes)
      setUsers(uRes)
      setPatients(pRes)
      setAppointments(aRes)
      setTransactions(tRes)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleLinkUser = async () => {
    if (!selectedUserToLink || !clinica) return
    try {
      await updateUser(selectedUserToLink, { id_clinica: clinica.id })
      toast({ title: 'Sucesso', description: 'Profissional vinculado à clínica.' })
      setSelectedUserToLink('')
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao vincular.',
        variant: 'destructive',
      })
    }
  }

  const handleUnlinkUser = async (userId: string) => {
    try {
      await updateUser(userId, { id_clinica: null })
      toast({ title: 'Sucesso', description: 'Profissional desvinculado.' })
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao desvincular.',
        variant: 'destructive',
      })
    }
  }

  if (user?.profile !== 'admin') return <Navigate to="/" />

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Carregando clínica...</div>
  if (!clinica) return <div className="p-8 text-center">Clínica não encontrada.</div>

  const clinicUsers = users.filter(
    (u) => u.id_clinica === clinica.id && ['psicologo', 'secretaria'].includes(u.profile),
  )
  const unlinkedUsers = users.filter(
    (u) => !u.id_clinica && ['psicologo', 'secretaria'].includes(u.profile),
  )

  const clinicPatients = patients.filter((p) => p.id_clinica === clinica.id)

  const todayDate = new Date()
  const currentMonth = todayDate.getMonth()
  const clinicApps = appointments.filter((a) => {
    const pId = typeof a.patient_id === 'object' ? a.patient_id?.id : a.patient_id
    const p = clinicPatients.find((pat) => pat.id === pId)
    if (!p) return false
    return new Date(a.appointment_date).getMonth() === currentMonth
  })

  const clinicTrans = transactions.filter((t) => {
    const pId = typeof t.patient_id === 'object' ? t.patient_id?.id : t.patient_id
    const p = clinicPatients.find((pat) => pat.id === pId)
    if (!p) return false
    return t.status === 'pago' && new Date(t.payment_date).getMonth() === currentMonth
  })

  const revenueMonth = clinicTrans.reduce((acc, t) => acc + (t.amount || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/clinicas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-[#1E40AF] flex items-center gap-2">
            <Building2 className="h-6 w-6" /> {clinica.nome}
          </h1>
        </div>
        <Button variant="outline" onClick={() => setFormOpen(true)}>
          <Pencil className="w-4 h-4 mr-2" /> Editar Clínica
        </Button>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="bg-background border-b rounded-none w-full justify-start h-auto px-0 gap-6">
          <TabsTrigger
            value="geral"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1E40AF] data-[state=active]:bg-transparent px-2 py-3 font-medium"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="profissionais"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1E40AF] data-[state=active]:bg-transparent px-2 py-3 font-medium"
          >
            Profissionais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm border-none shadow-elevation rounded-[8px]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Psicólogos
                </CardTitle>
                <div className="bg-[#1E40AF]/10 p-2 rounded-full">
                  <Users className="h-4 w-4 text-[#1E40AF]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clinicUsers.filter((u) => u.profile === 'psicologo').length}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-none shadow-elevation rounded-[8px]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pacientes
                </CardTitle>
                <div className="bg-emerald-100 p-2 rounded-full">
                  <Activity className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clinicPatients.length}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-none shadow-elevation rounded-[8px]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Consultas (Mês)
                </CardTitle>
                <div className="bg-amber-100 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clinicApps.length}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-none shadow-elevation rounded-[8px]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receita (Mês)
                </CardTitle>
                <div className="bg-teal-100 p-2 rounded-full">
                  <DollarSign className="h-4 w-4 text-teal-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    revenueMonth,
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-none shadow-elevation rounded-[8px]">
            <CardHeader>
              <CardTitle>Dados Cadastrais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                <p>{clinica.cnpj || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={clinica.status === 'ativa' ? 'bg-teal-600' : 'bg-slate-400'}>
                  {clinica.status === 'ativa' ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{clinica.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                <p>{clinica.telefone || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Endereço Completo</p>
                <p>
                  {clinica.logradouro
                    ? `${clinica.logradouro}, ${clinica.numero} - ${clinica.bairro}, ${clinica.cidade}/${clinica.estado} - CEP: ${clinica.cep}`
                    : '-'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profissionais" className="mt-6 space-y-6">
          <Card className="shadow-sm border-none shadow-elevation rounded-[8px]">
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center pb-4">
              <CardTitle>Profissionais Vinculados</CardTitle>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <Select value={selectedUserToLink} onValueChange={setSelectedUserToLink}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Vincular profissional..." />
                  </SelectTrigger>
                  <SelectContent>
                    {unlinkedUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.profile})
                      </SelectItem>
                    ))}
                    {unlinkedUsers.length === 0 && (
                      <SelectItem value="none" disabled>
                        Nenhum disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleLinkUser}
                  disabled={!selectedUserToLink || selectedUserToLink === 'none'}
                  className="bg-[#1E40AF] hover:bg-blue-800 text-white"
                >
                  Vincular
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinicUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="capitalize">{u.profile}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Unlink className="w-4 h-4 mr-2" /> Desvincular
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Desvincular profissional?</AlertDialogTitle>
                              <AlertDialogDescription>
                                O profissional {u.name} não terá mais acesso aos dados desta
                                clínica.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleUnlinkUser(u.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Desvincular
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {clinicUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        Nenhum profissional vinculado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ClinicaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        clinica={clinica}
        onSaved={loadData}
      />
    </div>
  )
}
