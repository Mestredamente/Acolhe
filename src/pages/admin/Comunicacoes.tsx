import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Send, Clock, Users } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function Comunicacoes() {
  const [segment, setSegment] = useState('todos')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (!subject || !message) {
      toast({
        title: 'Atenção',
        description: 'Preencha o assunto e a mensagem.',
        variant: 'destructive',
      })
      return
    }
    toast({
      title: 'Comunicação enviada',
      description: 'A mensagem foi enviada para o segmento selecionado.',
    })
    setSubject('')
    setMessage('')
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-[800px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nova Comunicação</h1>
        <p className="text-slate-500 mt-1">
          Envie avisos, novidades e comunicados para seus assinantes.
        </p>
      </div>

      <Card className="rounded-xl shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl">Formulário de Envio</CardTitle>
          <CardDescription>
            Escolha o público alvo e escreva a mensagem. Os e-mails serão disparados imediatamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Segmento / Público Alvo</Label>
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger className="w-full bg-white border-slate-200">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Assinantes</SelectItem>
                <SelectItem value="clinicas">Apenas Clínicas</SelectItem>
                <SelectItem value="autonomos">Apenas Psicólogos Autônomos</SelectItem>
                <SelectItem value="plano_starter">Plano Starter</SelectItem>
                <SelectItem value="plano_pro">Plano Professional</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 flex items-center mt-1">
              <Users className="w-3 h-3 mr-1" /> Cerca de{' '}
              {segment === 'todos' ? '18' : segment === 'clinicas' ? '10' : '8'} usuários receberão
              esta mensagem.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Assunto do E-mail</Label>
            <Input
              placeholder="Ex: Nova funcionalidade de prontuário IA liberada!"
              className="bg-white border-slate-200"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Mensagem (Suporta texto e links)</Label>
            <Textarea
              placeholder="Olá! Estamos felizes em anunciar..."
              className="bg-white border-slate-200 min-h-[200px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <Button variant="outline" className="text-slate-600 border-slate-300 bg-white">
              <Clock className="w-4 h-4 mr-2" /> Agendar Envio
            </Button>
            <Button className="bg-[#1E3A8A] hover:bg-blue-800 text-white" onClick={handleSend}>
              <Send className="w-4 h-4 mr-2" /> Disparar Agora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
