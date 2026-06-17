import { useState, useEffect } from 'react'
import { getNotificacoes, markAsRead, markAllAsRead, Notificacao } from '@/services/notificacoes'
import { useRealtime } from '@/hooks/use-realtime'
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
  Check,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  AlertCircle,
  BookHeart,
  Info,
  ExternalLink,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'

const iconMap: Record<string, any> = {
  consulta_proxima: Calendar,
  consulta_confirmada: Calendar,
  pagamento_pendente: DollarSign,
  pagamento_atrasado: AlertCircle,
  escala_pendente: FileText,
  diario_novo: BookHeart,
  mensagem_nova: MessageSquare,
  documento_pendente: FileText,
  sistema: Info,
}

const typeLabels: Record<string, string> = {
  consulta_proxima: 'Consulta Próxima',
  consulta_confirmada: 'Consulta Confirmada',
  pagamento_pendente: 'Pagamento Pendente',
  pagamento_atrasado: 'Pagamento Atrasado',
  escala_pendente: 'Escala Pendente',
  diario_novo: 'Novo Diário',
  mensagem_nova: 'Nova Mensagem',
  documento_pendente: 'Documento Pendente',
  sistema: 'Sistema',
}

export default function NotificacoesList({ isPortal = false }: { isPortal?: boolean }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const load = async () => {
    try {
      const data = await getNotificacoes()
      setNotificacoes(data)
    } catch {
      /* intentionally ignored */
    }
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('notificacoes', load)

  const filtered = notificacoes.filter((n) => {
    if (filterType !== 'all' && n.type !== filterType) return false
    if (filterStatus !== 'all' && n.status !== filterStatus) return false
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Notificações</h1>
          <p className="text-muted-foreground">Gerencie todos os seus alertas e avisos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {Object.entries(typeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="nao_lida">Não lida</SelectItem>
              <SelectItem value="lida">Lida</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={async () => {
              await markAllAsRead()
              load()
            }}
            variant="secondary"
          >
            <Check className="mr-2 h-4 w-4" /> Marcar todas lidas
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Notificação</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((n) => {
                const Icon = iconMap[n.type] || Info
                return (
                  <TableRow
                    key={n.id}
                    className={n.status === 'nao_lida' ? 'bg-muted/30 font-medium' : ''}
                  >
                    <TableCell>
                      <div className="p-2 bg-primary/10 rounded-full w-fit text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{n.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {n.message}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{typeLabels[n.type] || n.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(n.created), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={n.status === 'lida' ? 'secondary' : 'default'}
                        className={n.status === 'nao_lida' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                      >
                        {n.status === 'lida' ? 'Lida' : 'Não Lida'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {n.link && (
                          <Button variant="ghost" size="icon" asChild title="Abrir link">
                            <Link to={n.link}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {n.status === 'nao_lida' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Marcar como lida"
                            onClick={async () => {
                              await markAsRead(n.id)
                              load()
                            }}
                          >
                            <Check className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma notificação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
