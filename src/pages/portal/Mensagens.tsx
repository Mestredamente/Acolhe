import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { usePatientContext } from '@/components/portal/PortalProtectedRoute'
import { Mensagem, sendMessage, markAsRead } from '@/services/mensagens'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'

export function PortalMensagens() {
  const { user } = useAuth()
  const patient = usePatientContext()
  const [messages, setMessages] = useState<Mensagem[]>([])
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (patient) {
      pb.collection('mensagens')
        .getFullList<Mensagem>({
          filter: `patient_id = "${patient.id}"`,
          sort: 'created',
        })
        .then(setMessages)
    }
  }, [patient])

  useRealtime<Mensagem>('mensagens', (e) => {
    if (e.action === 'create') {
      setMessages((prev) => {
        if (prev.some((m) => m.id === e.record.id)) return prev
        return [...prev, e.record]
      })
    } else if (e.action === 'update') {
      setMessages((prev) => prev.map((m) => (m.id === e.record.id ? e.record : m)))
    }
  })

  useEffect(() => {
    const unread = messages.filter(
      (m) => m.recipient_id === user.id && m.read_status === 'nao_lida',
    )
    if (unread.length > 0) {
      markAsRead(unread.map((m) => m.id)).catch(() => {})
    }
  }, [messages, user.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !patient) return
    const content = text
    setText('')
    try {
      await sendMessage({
        patient_id: patient.id,
        content,
        sender_type: 'paciente',
      })
    } catch (err) {
      console.error(err)
      toast.error('Erro ao enviar mensagem')
      setText(content)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      <div className="bg-emerald-50 border-b border-emerald-100 p-3 px-5 flex items-start gap-2 text-emerald-800 text-sm">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          <strong>Importante:</strong> Este canal é para acompanhamento clínico. Em caso de
          emergência ou crise, por favor, busque atendimento imediato ou contate seu contato de
          emergência.
        </p>
      </div>

      <ScrollArea className="flex-1 p-4 md:p-6 bg-slate-50/50" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto flex flex-col">
          {messages.map((msg) => {
            const isMe = msg.sender_type === 'paciente'
            return (
              <div
                key={msg.id}
                className={cn('flex max-w-[85%] md:max-w-[75%]', isMe ? 'self-end' : 'self-start')}
              >
                <div
                  className={cn(
                    'p-3.5 rounded-2xl shadow-sm',
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm',
                  )}
                >
                  <p className="text-[15px] leading-relaxed">{msg.content}</p>
                  <span
                    className={cn(
                      'text-[11px] block mt-1.5 font-medium',
                      isMe ? 'text-emerald-100' : 'text-slate-400',
                    )}
                  >
                    {format(new Date(msg.created), 'HH:mm')}
                  </span>
                </div>
              </div>
            )
          })}
          {messages.length === 0 && (
            <div className="text-center text-slate-400 my-10">
              Nenhuma mensagem ainda. Envie um "Olá" para começar!
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 bg-white border-t border-emerald-50">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva sua mensagem..."
            className="flex-1 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
          />
          <Button
            type="submit"
            disabled={!text.trim()}
            className="rounded-full w-10 h-10 p-0 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
