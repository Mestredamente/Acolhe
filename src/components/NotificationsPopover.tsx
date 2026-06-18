import { useState, useEffect } from 'react'
import {
  Bell,
  Check,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  Info,
  ShieldAlert,
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
  agenda: Calendar,
  prontuario: FileText,
  financeiro: DollarSign,
  mensagem: MessageSquare,
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
            'relative rounded-full transition-colors hover:bg-slate-100',
            isPortal
              ? 'text-emerald-600 hover:text-emerald-800'
              : 'text-slate-600 hover:text-blue-900',
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold border-2 border-white',
                isPortal ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white',
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-lg border-slate-200" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white rounded-t-md">
          <h4 className="font-semibold text-sm text-slate-900">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              onClick={async () => {
                await markAllAsRead()
                load()
              }}
            >
              <Check className="mr-1 h-3 w-3" /> Marcar lidas
            </Button>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto bg-slate-50">
          {recent.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
              <Bell className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">Nenhuma notificação no momento</p>
            </div>
          ) : (
            recent.map((n) => {
              const Icon = iconMap[n.type] || Info
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    'flex items-start gap-3 p-4 cursor-pointer hover:bg-white transition-colors border-b border-slate-100 last:border-0 relative',
                    n.status === 'nao_lida' ? 'bg-white' : '',
                  )}
                >
                  {n.status === 'nao_lida' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                  )}
                  <div
                    className={cn(
                      'mt-0.5 rounded-full p-2',
                      n.status === 'nao_lida'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p
                      className={cn(
                        'text-sm font-medium leading-tight',
                        n.status === 'nao_lida' ? 'text-slate-900' : 'text-slate-600',
                      )}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-snug">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      {formatDistanceToNow(new Date(n.created), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  {n.status === 'nao_lida' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-blue-600 hover:bg-blue-100 shrink-0"
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

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col gap-2 rounded-b-md">
          <div className="flex items-start gap-2 bg-blue-50/50 p-2 rounded text-[10px] text-slate-500 leading-tight">
            <ShieldAlert className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
            <p>
              Notificações são entregues conforme seu perfil e acesso. Dados de outros usuários e
              clínicas não aparecem por questões de segurança e sigilo. Conforme LGPD e CFP.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full text-xs h-8 border-slate-200 hover:bg-slate-100"
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
