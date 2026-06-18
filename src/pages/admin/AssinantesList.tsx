import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Search, ShieldAlert, Settings2 } from 'lucide-react'
import { format, isValid } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

interface Subscriber {
  id: string
  assId: string
  name: string
  type: 'Clínica' | 'Autônomo'
  planName: string
  monthlyValue: number
  status: string
  startDate: string
  expiryDate: string
  extraInfo: string
  email?: string
  phone?: string
  document?: string
}

function safelyFormatDate(dateStr: string | undefined | null) {
  if (!dateStr) return '-'
  const d = new Date(dateStr.replace(' ', 'T'))
  if (isValid(d)) {
    return format(d, 'dd/MM/yyyy')
  }
  return '-'
}

export default function AssinantesList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  const load = async () => {
    try {
      const assinaturas = await pb.collection('saas_assinaturas').getFullList({
        expand: 'id_clinica,user_id,plano_id',
        sort: '-created',
      })
      const mapped: Subscriber[] = assinaturas.map((ass) => {
        const isClinica = ass.expand?.plano_id?.tipo === 'clinica' || ass.plano === 'clinica'
        const type = isClinica ? 'Clínica' : 'Autônomo'
        return {
          id: ass.id,
          assId: ass.id,
          name: ass.expand?.user_id?.name || 'Sem Nome',
          type,
          planName: ass.expand?.plano_id?.nome || ass.plano,
          monthlyValue: ass.valor_mensal || 0,
          status: ass.status,
          startDate: safelyFormatDate(ass.data_inicio || ass.created),
          expiryDate: safelyFormatDate(ass.data_renovacao),
          extraInfo: isClinica ? 'Gestão de Clínica' : 'Profissional Independente',
          email: ass.expand?.user_id?.email,
          document: ass.expand?.id_clinica?.cnpj,
          phone: ass.expand?.id_clinica?.telefone,
        }
      })
      setSubscribers(mapped)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useRealtime('saas_assinaturas', () => {
    load()
  })

  const filtered = subscribers.filter((s) => {
    if (typeFilter !== 'Todos' && s.type !== typeFilter) return false
    if (statusFilter !== 'Todos' && s.status.toLowerCase() !== statusFilter.toLowerCase())
      return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleStatusChange = async (newStatus: 'ativo' | 'suspenso') => {
    if (!selectedSubscriber || !selectedSubscriber.assId) return

    try {
      setUpdating(true)
      await pb
        .collection('saas_assinaturas')
        .update(selectedSubscriber.assId, { status: newStatus })

      setSelectedSubscriber({ ...selectedSubscriber, status: newStatus })

      toast({
        title: 'Sucesso',
        description: `Assinatura ${newStatus === 'ativo' ? 'reativada' : 'suspensa'} com sucesso.`,
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status da assinatura.',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-[1200px] mx-auto">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800 font-medium leading-relaxed">
          Este painel mostra apenas dados administrativos dos assinantes. Dados de pacientes e
          prontuários são sigilosos e inacessíveis ao gestor da plataforma, conforme LGPD e CFP.
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Assinantes</h1>
          <p className="text-slate-500 mt-1">
            Gerencie Clínicas e Profissionais Autônomos da plataforma.
          </p>
        </div>
      </div>

      <Card className="rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos os Tipos</SelectItem>
                  <SelectItem value="Clínica">Clínica</SelectItem>
                  <SelectItem value="Autônomo">Autônomo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos os Status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Assinante</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Plano Atual</TableHead>
                  <TableHead>Mensalidade</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Info Extra</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-semibold text-slate-900">{sub.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          sub.type === 'Clínica'
                            ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        }
                      >
                        {sub.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 capitalize">{sub.planName}</TableCell>
                    <TableCell className="font-medium text-slate-700">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(sub.monthlyValue)}
                    </TableCell>
                    <TableCell className="text-slate-500">{sub.startDate}</TableCell>
                    <TableCell className="text-slate-500">{sub.expiryDate}</TableCell>
                    <TableCell className="text-sm text-slate-500">{sub.extraInfo}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          sub.status.toLowerCase() === 'ativo'
                            ? 'bg-green-600'
                            : sub.status.toLowerCase() === 'trial'
                              ? 'bg-blue-500'
                              : 'bg-slate-400'
                        }
                      >
                        {sub.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50 transition-colors"
                        onClick={() => setSelectedSubscriber(sub)}
                      >
                        <Settings2 className="w-4 h-4 mr-2" /> Gerenciar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum assinante encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={!!selectedSubscriber}
        onOpenChange={(open) => !open && setSelectedSubscriber(null)}
      >
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Gerenciar Assinante</SheetTitle>
            <SheetDescription>Detalhes e ações administrativas para a conta</SheetDescription>
          </SheetHeader>

          {selectedSubscriber && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Informações Gerais
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-500">Nome</Label>
                    <p className="font-medium text-sm mt-1">{selectedSubscriber.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Tipo</Label>
                    <p className="font-medium text-sm mt-1">{selectedSubscriber.type}</p>
                  </div>
                  {selectedSubscriber.document && (
                    <div>
                      <Label className="text-xs text-slate-500">Documento</Label>
                      <p className="font-medium text-sm mt-1">{selectedSubscriber.document}</p>
                    </div>
                  )}
                  {selectedSubscriber.email && (
                    <div className="col-span-2">
                      <Label className="text-xs text-slate-500">E-mail</Label>
                      <p className="font-medium text-sm mt-1">{selectedSubscriber.email}</p>
                    </div>
                  )}
                  {selectedSubscriber.phone && (
                    <div>
                      <Label className="text-xs text-slate-500">Telefone</Label>
                      <p className="font-medium text-sm mt-1">{selectedSubscriber.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Assinatura SaaS
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-500">Plano Atual</Label>
                    <p className="font-medium text-sm mt-1 capitalize">
                      {selectedSubscriber.planName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Status</Label>
                    <p className="font-medium text-sm mt-1 capitalize">
                      {selectedSubscriber.status}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Início</Label>
                    <p className="font-medium text-sm mt-1">{selectedSubscriber.startDate}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Vencimento</Label>
                    <p className="font-medium text-sm mt-1">{selectedSubscriber.expiryDate}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Mensalidade</Label>
                    <p className="font-medium text-sm mt-1">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(selectedSubscriber.monthlyValue)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                {selectedSubscriber.status === 'ativo' ? (
                  <Button
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    variant="ghost"
                    onClick={() => handleStatusChange('suspenso')}
                    disabled={updating}
                  >
                    {updating ? 'Aguarde...' : 'Suspender Assinatura'}
                  </Button>
                ) : (
                  <Button
                    className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                    variant="ghost"
                    onClick={() => handleStatusChange('ativo')}
                    disabled={updating}
                  >
                    {updating ? 'Aguarde...' : 'Reativar Assinatura'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
