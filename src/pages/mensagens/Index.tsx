import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Patient, getPatients } from '@/services/patients'
import { Mensagem, sendMessage, markAsRead } from '@/services/mensagens'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Send, User as UserIcon, AlertCircle, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function MensagensList() {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [messages, setMessages] = useState<Mensagem[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getPatients().then(setPatients)
    pb.collection('mensagens').getFullList<Mensagem>({ sort: 'created' }).then(setMessages)
  }, [])

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

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)
  const currentMessages = messages.filter((m) => m.patient_id === selectedPatientId)

  useEffect(() => {
    if (selectedPatientId) {
      const unread = currentMessages.filter(
        (m) => m.recipient_id === user.id && m.read_status === 'nao_lida',
      )
      if (unread.length > 0) {
        markAsRead(unread.map((m) => m.id)).catch(() => {})
      }
    }
  }, [selectedPatientId, currentMessages, user.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [currentMessages.length, selectedPatientId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !selectedPatientId) return
    const content = text
    setText('')
    try {
      await sendMessage({
        patient_id: selectedPatientId,
        content,
        sender_type: 'psicologo',
      })
    } catch (err: any) {
      console.error(err)
      toast.error(
        err?.response?.error || 'Erro ao enviar mensagem. O paciente possui email cadastrado?',
      )
      setText(content)
    }
  }

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex h-[calc(100vh-120px)] border rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="w-1/3 border-r flex flex-col bg-slate-50/50">
        <div className="p-4 border-b bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filteredPatients.map((patient) => {
            const patientMsgs = messages.filter((m) => m.patient_id === patient.id)
            const lastMsg = patientMsgs[patientMsgs.length - 1]
            const unreadCount = patientMsgs.filter(
              (m) => m.recipient_id === user.id && m.read_status === 'nao_lida',
            ).length

            return (
              <button
                key={patient.id}
                onClick={() => setSelectedPatientId(patient.id)}
                className={cn(
                  'w-full text-left p-4 border-b transition-colors hover:bg-slate-100 flex flex-col gap-1',
                  selectedPatientId === patient.id ? 'bg-slate-100' : 'bg-white',
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium truncate pr-2 text-slate-800">{patient.name}</span>
                  {lastMsg && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(lastMsg.created), 'HH:mm')}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between w-full">
                  <p className="text-sm text-muted-foreground truncate pr-2 flex-1">
                    {lastMsg ? lastMsg.content : 'Nenhuma mensagem'}
                  </p>
                  {unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
          {filteredPatients.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhum paciente encontrado.
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col bg-[#F8FAFC]">
        {selectedPatient ? (
          <>
            <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold text-slate-800">{selectedPatient.name}</span>
              </div>
            </div>

            <div className="bg-amber-50 border-b border-amber-100 p-2.5 px-4 flex items-center gap-2 text-amber-800 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>
                Este chat não substitui atendimento de emergência. Em crise, oriente o paciente ao
                contato de emergência cadastrado. Conforme CFP.
              </p>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4 max-w-3xl mx-auto flex flex-col">
                {currentMessages.map((msg) => {
                  const isMe = msg.sender_type === 'psicologo'
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex max-w-[75%]', isMe ? 'self-end' : 'self-start')}
                    >
                      <div
                        className={cn(
                          'p-3 rounded-2xl',
                          isMe
                            ? 'bg-[#004751] text-white rounded-br-sm'
                            : 'bg-white border text-slate-800 rounded-bl-sm shadow-sm',
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <span
                          className={cn(
                            'text-[10px] block mt-1',
                            isMe ? 'text-teal-100' : 'text-muted-foreground',
                          )}
                        >
                          {format(new Date(msg.created), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            <div className="p-4 bg-white border-t">
              <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-slate-50"
                />
                <Button
                  type="submit"
                  disabled={!text.trim()}
                  className="bg-[#004751] hover:bg-[#003840]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-4 text-slate-300" />
            <p>Selecione um paciente para iniciar a conversa</p>
          </div>
        )}
      </div>
    </div>
  )
}
