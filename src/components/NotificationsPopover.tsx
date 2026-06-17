import { useState, useEffect } from 'react'
import {
  Bell,
  Check,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  AlertCircle,
  BookHeart,
  Info,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { getNotificacoes, markAsRead, markAllAsRead, Notificacao } from '@/services/notificacoes'
import { useRealtime } from '@/hooks/use-realtime'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

export function NotificationsPopover({ isPortal = false }: { isPortal?: boolean }) {
  const [notifications, setNotifications] = useState<Notificacao[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const load = async () => {
    try {
      const data = await getNotificacoes()
      setNotifications(data)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('notificacoes', load)

  const unreadCount = notifications.filter((n) => n.status === 'nao_lida').length
  const recent = notifications.slice(0, 5)

  const handleRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await markAsRead(id)
    load()
  }

  const handleClick = async (n: Notificacao) => {
    if (n.status === 'nao_lida') {
      await markAsRead(n.id)
    }
    setIsOpen(false)
    if (n.link) {
      navigate(n.link)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative rounded-full transition-colors',
            isPortal
              ? 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800'
              : 'text-foreground/70 hover:text-foreground',
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold',
                isPortal ? 'bg-red-500 text-white' : 'bg-destructive text-destructive-foreground',
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-semibold text-sm">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={async () => {
                await markAllAsRead()
                load()
              }}
            >
              <Check className="mr-1 h-3 w-3" /> Marcar lidas
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {recent.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação.
            </div>
          ) : (
            recent.map((n) => {
              const Icon = iconMap[n.type] || Info
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    'flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0',
                    n.status === 'nao_lida' ? 'bg-primary/5' : '',
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 rounded-full p-1.5',
                      n.status === 'nao_lida'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p
                      className={cn(
                        'text-sm font-medium leading-none',
                        n.status === 'nao_lida' ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  {n.status === 'nao_lida' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-primary hover:bg-primary/20 hover:text-primary"
                      onClick={(e) => handleRead(e, n.id)}
                      title="Marcar como lida"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </div>
        <div className="p-2 border-t border-border">
          <Button
            variant="outline"
            className="w-full text-xs h-8"
            asChild
            onClick={() => setIsOpen(false)}
          >
            <Link to={isPortal ? '/portal/notificacoes' : '/notificacoes'}>
              Ver todas as notificações
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
