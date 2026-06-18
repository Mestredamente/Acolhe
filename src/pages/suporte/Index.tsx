import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { getTickets, createTicket, updateTicket, SuporteTicket } from '@/services/suporte'
import { LifeBuoy, PlusCircle, Search, MessageSquare, Clock, CheckCircle } from 'lucide-react'

export default function SuportePage() {
  const { user } = useAuth()
  const isAdmin = user?.profile === 'admin'
  const { toast } = useToast()

  const [tickets, setTickets] = useState<SuporteTicket[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SuporteTicket | null>(null)

  const [newTicket, setNewTicket] = useState<Partial<SuporteTicket>>({
    categoria: 'tecnico',
    prioridade: 'baixa',
    titulo: '',
    descricao: '',
    status: 'aberto',
  })

  const [adminResponse, setAdminResponse] = useState('')
  const [adminStatus, setAdminStatus] = useState<any>('')

  const loadData = async () => {
    try {
      const data = await getTickets()
      setTickets(data)
    } catch (e) {
      toast({ title: 'Erro ao carregar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (!isAdmin && t.usuario_id !== user?.id) return false
      if (statusFilter !== 'todos' && t.status !== statusFilter) return false
      if (
        search &&
        !t.titulo.toLowerCase().includes(search.toLowerCase()) &&
        !t.expand?.usuario_id?.name?.toLowerCase().includes(search.toLowerCase())
      )
        return false
      return true
    })
  }, [tickets, isAdmin, user?.id, statusFilter, search])

  const handleCreate = async () => {
    if (!newTicket.titulo || !newTicket.descricao) {
      toast({ title: 'Preencha título e descrição', variant: 'destructive' })
      return
    }
    try {
      await createTicket({ ...newTicket, usuario_id: user.id, status: 'aberto' })
      toast({ title: 'Ticket criado com sucesso' })
      setIsNewModalOpen(false)
      setNewTicket({
        categoria: 'tecnico',
        prioridade: 'baixa',
        titulo: '',
        descricao: '',
        status: 'aberto',
      })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao criar', variant: 'destructive' })
    }
  }

  const handleAdminUpdate = async () => {
    if (!selectedTicket) return
    try {
      await updateTicket(selectedTicket.id, {
        status: adminStatus,
        resposta: adminResponse,
        data_resposta: new Date().toISOString(),
      })
      toast({ title: 'Ticket atualizado com sucesso' })
      setSelectedTicket(null)
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  const statusColors: Record<string, string> = {
    aberto: 'bg-blue-100 text-blue-800',
    em_atendimento: 'bg-yellow-100 text-yellow-800',
    resolvido: 'bg-green-100 text-green-800',
    fechado: 'bg-slate-100 text-slate-800',
  }

  const statusLabels: Record<string, string> = {
    aberto: 'Aberto',
    em_atendimento: 'Em Atendimento',
    resolvido: 'Resolvido',
    fechado: 'Fechado',
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E40AF] flex items-center gap-2">
            <LifeBuoy className="h-8 w-8 text-blue-600" /> Suporte
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? 'Gerenciamento global de tickets de suporte.'
              : 'Acompanhe seus chamados e abra novas solicitações.'}
          </p>
        </div>
        {!isAdmin && (
          <Button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-[#1E40AF] hover:bg-blue-800"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Abrir Ticket
          </Button>
        )}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Tickets de Suporte</CardTitle>
          <CardDescription>Visualize o status das suas solicitações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="aberto">Aberto</SelectItem>
                <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                <SelectItem value="resolvido">Resolvido</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {loading && <p className="text-center text-muted-foreground">Carregando...</p>}
            {!loading && filteredTickets.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum ticket encontrado.</p>
            )}
            {filteredTickets.map((t) => (
              <div
                key={t.id}
                className={`p-4 border rounded-lg flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-slate-50 transition-colors ${t.prioridade === 'urgente' ? 'border-red-200 bg-red-50/30' : ''}`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{t.titulo}</h3>
                    {t.prioridade === 'urgente' && <Badge variant="destructive">Urgente</Badge>}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-1">{t.descricao}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    {isAdmin && (
                      <span>
                        <strong className="font-medium">Usuário:</strong>{' '}
                        {t.expand?.usuario_id?.name || 'Desconhecido'}
                      </span>
                    )}
                    <span className="capitalize">
                      <strong className="font-medium">Categoria:</strong>{' '}
                      {t.categoria === 'privade' ? 'privacidade' : t.categoria}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{' '}
                      {new Date(t.created).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <Badge className={statusColors[t.status] || 'bg-slate-100'} variant="outline">
                    {statusLabels[t.status]}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTicket(t)
                      setAdminResponse(t.resposta || '')
                      setAdminStatus(t.status)
                    }}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Ticket Modal */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Ticket de Suporte</DialogTitle>
            <DialogDescription>Descreva o problema ou sugestão em detalhes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={newTicket.categoria}
                  onValueChange={(v: any) => setNewTicket({ ...newTicket, categoria: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="privade">Privacidade</SelectItem>
                    <SelectItem value="sugestao">Sugestão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={newTicket.prioridade}
                  onValueChange={(v: any) => setNewTicket({ ...newTicket, prioridade: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Resumo do assunto"
                value={newTicket.titulo}
                onChange={(e) => setNewTicket({ ...newTicket, titulo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Explique o que aconteceu..."
                value={newTicket.descricao}
                onChange={(e) => setNewTicket({ ...newTicket, descricao: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} className="bg-[#1E40AF] hover:bg-blue-800">
              Enviar Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">Ticket: {selectedTicket?.titulo}</DialogTitle>
              {selectedTicket?.prioridade === 'urgente' && (
                <Badge variant="destructive">Urgente</Badge>
              )}
            </div>
            <DialogDescription>
              Aberto em{' '}
              {selectedTicket ? new Date(selectedTicket.created).toLocaleString('pt-BR') : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2 bg-slate-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Mensagem Original
              </h4>
              <p className="text-sm whitespace-pre-wrap">{selectedTicket?.descricao}</p>
            </div>

            {(selectedTicket?.resposta || !isAdmin) && (
              <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-sm text-blue-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Resposta da Equipe
                </h4>
                <p className="text-sm whitespace-pre-wrap text-blue-900">
                  {selectedTicket?.resposta || (
                    <span className="italic text-blue-600/70">Ainda sem resposta.</span>
                  )}
                </p>
              </div>
            )}

            {isAdmin && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Atualizar Status</Label>
                  <Select value={adminStatus} onValueChange={setAdminStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberto">Aberto</SelectItem>
                      <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                      <SelectItem value="resolvido">Resolvido</SelectItem>
                      <SelectItem value="fechado">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Resposta (visível ao usuário)</Label>
                  <Textarea
                    placeholder="Escreva a solução..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              Fechar
            </Button>
            {isAdmin && (
              <Button onClick={handleAdminUpdate} className="bg-[#1E40AF] hover:bg-blue-800">
                Salvar Atualização
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
