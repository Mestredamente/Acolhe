import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  Users,
  MessageSquare,
  AlertTriangle,
  Plus,
  ChevronRight,
  Activity,
} from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { SupervisaoVinculo } from '@/services/supervisao'

export default function SupervisaoList() {
  const { toast } = useToast()
  const [vinculos, setVinculos] = useState<SupervisaoVinculo[]>([])
  const [patientsCount, setPatientsCount] = useState(0)
  const [feedbacksCount, setFeedbacksCount] = useState(0)
  const [missingFeedback, setMissingFeedback] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [usersDisponiveis, setUsersDisponiveis] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const v = await pb.collection('supervisao_vinculos').getFullList({
        expand: 'supervisionado_id',
        sort: '-created',
      })
      setVinculos(v as SupervisaoVinculo[])

      const p = await pb.collection('patients').getList(1, 1, {
        filter: `user_id.supervisor_id = '${pb.authStore.record?.id}'`,
      })
      setPatientsCount(p.totalItems)

      const d = new Date()
      d.setDate(1)
      const f = await pb.collection('supervisao_feedback').getList(1, 1, {
        filter: `created >= '${d.toISOString()}'`,
      })
      setFeedbacksCount(f.totalItems)

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const f30 = await pb.collection('supervisao_feedback').getFullList({
        filter: `created >= '${thirtyDaysAgo.toISOString()}'`,
      })
      const svWithFb = new Set(f30.map((x) => x.supervisionado_id))
      const hasMissing = v.some(
        (vin: any) => vin.status === 'ativo' && !svWithFb.has(vin.supervisionado_id),
      )
      setMissingFeedback(hasMissing)

      const u = await pb.collection('users').getFullList({
        filter: `profile = 'psicologo' && supervisor_id = '' && id != '${pb.authStore.record?.id}'`,
      })
      setUsersDisponiveis(u)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleVincular = async () => {
    if (!selectedUser) return
    try {
      await pb.collection('supervisao_vinculos').create({
        supervisor_id: pb.authStore.record?.id,
        supervisionado_id: selectedUser,
        status: 'ativo',
        data_inicio: new Date().toISOString(),
      })
      await pb.collection('users').update(selectedUser, {
        supervisor_id: pb.authStore.record?.id,
      })
      toast({ title: 'Sucesso', description: 'Psicólogo vinculado com sucesso.' })
      setModalOpen(false)
      setSelectedUser('')
      loadData()
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Falha ao vincular.',
        variant: 'destructive',
      })
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-md flex items-start gap-3">
        <GraduationCap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div className="text-sm text-slate-800">
          <strong>Área de Supervisão Clínica.</strong> O acesso a prontuários de terceiros é
          permitido exclusivamente para fins de supervisão clínica e formação. Toda ação é
          registrada para auditoria. Conforme LGPD e CFP.
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Meus Supervisionados</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Vincular Psicólogo
        </Button>
      </div>

      {missingFeedback && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="text-sm text-amber-800">
            <strong>Atenção:</strong> Há supervisionados ativos sem feedback registrado nos últimos
            30 dias.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" /> Supervisionados Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vinculos.filter((v) => v.status === 'ativo').length}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-teal-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" /> Pacientes Supervisionados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientsCount}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Feedbacks no Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbacksCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Psicólogo(a)</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Data de Início</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vinculos.map((v) => (
              <TableRow key={v.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">
                  {v.expand?.supervisionado_id?.name || 'Desconhecido'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {v.expand?.supervisionado_id?.email}
                </TableCell>
                <TableCell>{new Date(v.data_inicio).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <Badge
                    variant={v.status === 'ativo' ? 'default' : 'secondary'}
                    className={v.status === 'ativo' ? 'bg-teal-600' : ''}
                  >
                    {v.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/supervisao/${v.supervisionado_id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {vinculos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum supervisionado vinculado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Psicólogo</DialogTitle>
            <DialogDescription>
              Selecione um psicólogo disponível para iniciar a supervisão clínica.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Psicólogo(a)</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent>
                  {usersDisponiveis.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                  {usersDisponiveis.length === 0 && (
                    <SelectItem value="none" disabled>
                      Nenhum psicólogo disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleVincular} disabled={!selectedUser}>
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
