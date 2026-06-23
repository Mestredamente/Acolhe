import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Users, Plus, Calendar, Activity, CheckSquare } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

export default function GruposTerapeuticos() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [grupos, setGrupos] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [limite, setLimite] = useState('10')
  const [dias, setDias] = useState('')
  const [horario, setHorario] = useState('')

  useEffect(() => {
    if (!user) return

    Promise.all([
      pb
        .collection('grupos_terapeuticos')
        .getFullList({ expand: 'participantes', sort: '-created' }),
      pb.collection('appointments').getFullList({
        filter: `tipo_sessao='grupo'`,
        sort: 'appointment_date,start_time',
        expand: 'grupo_id',
      }),
    ]).then(([grps, appts]) => {
      setGrupos(grps)
      setAppointments(appts)
    })
  }, [user])

  const handleCreateGroup = async () => {
    if (!nome) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' })
      return
    }
    try {
      const g = await pb.collection('grupos_terapeuticos').create({
        user_id: user?.id,
        id_clinica: user?.id_clinica || undefined,
        nome,
        descricao,
        limite_participantes: parseInt(limite),
        status: 'ativo',
        data_inicio: new Date().toISOString(),
      })
      setGrupos([g, ...grupos])
      toast({ title: 'Grupo criado com sucesso' })
      setNome('')
      setDescricao('')
      setLimite('10')
      setDias('')
      setHorario('')
    } catch (err: any) {
      toast({ title: 'Erro ao criar', description: err.message, variant: 'destructive' })
    }
  }

  const now = new Date()
  const upcoming = appointments.filter((a) => new Date(a.appointment_date) >= now)

  return (
    <div className="flex-1 space-y-6 p-8 bg-slate-50 min-h-full font-sans">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-[#1E3A8A]">Grupo Terapêutico</h2>
        <p className="text-slate-500">
          Gerencie seus grupos terapêuticos, participantes e sessões em grupo.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="bg-[#1E3A8A] text-white rounded-t-xl border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white" />
                Meus Grupos
              </CardTitle>
              <CardDescription className="text-blue-100">
                Seus grupos terapêuticos ativos
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {grupos.length === 0 ? (
                <div className="text-center py-6 text-slate-500">Nenhum grupo encontrado</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {grupos.map((g) => {
                    const parts = Array.isArray(g.expand?.participantes)
                      ? g.expand.participantes
                      : []
                    const nextSess = appointments.find(
                      (a) => a.grupo_id === g.id && new Date(a.appointment_date) >= now,
                    )

                    return (
                      <div
                        key={g.id}
                        className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-[#1E3A8A]/30 transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-[#1E3A8A] text-lg leading-tight">
                            {g.nome}
                          </h3>
                          <span className="text-xs bg-[#1E3A8A]/10 text-[#1E3A8A] px-2 py-1 rounded-full font-bold border border-[#1E3A8A]/20">
                            {parts.length}/{g.limite_participantes || 10}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-5 line-clamp-2 min-h-[40px] leading-relaxed">
                          {g.descricao || 'Sem descrição'}
                        </p>
                        {nextSess ? (
                          <div className="flex items-center text-xs font-medium text-[#1E3A8A] bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                            <Calendar className="w-4 h-4 mr-2" />
                            {format(new Date(nextSess.appointment_date), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}{' '}
                            às {nextSess.start_time}
                          </div>
                        ) : (
                          <div className="flex items-center text-xs text-slate-400 bg-slate-50 p-2.5 rounded-lg">
                            <Calendar className="w-4 h-4 mr-2" />
                            Nenhuma sessão agendada
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-100 border-b border-slate-200 rounded-t-xl">
              <CardTitle className="text-[#1E3A8A] flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Participantes por Grupo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {grupos.map((g) => {
                const parts = Array.isArray(g.expand?.participantes) ? g.expand.participantes : []
                if (parts.length === 0) return null
                return (
                  <div key={g.id} className="space-y-3">
                    <h4 className="font-semibold text-[#1E3A8A] border-b border-slate-100 pb-2">
                      {g.nome}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {parts.map((p: any) => (
                        <div
                          key={p.id}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 flex items-center gap-2 font-medium"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {p.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {grupos.every(
                (g) => !g.expand?.participantes || g.expand.participantes.length === 0,
              ) && (
                <div className="text-center py-4 text-slate-500">
                  Nenhum participante adicionado aos grupos.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-100 border-b border-slate-200 rounded-t-xl">
              <CardTitle className="text-[#1E3A8A] flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Criar Novo Grupo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Nome do Grupo</Label>
                <Input
                  placeholder="Ex: Grupo de Ansiedade"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Objetivos e temas..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Limite de Participantes</Label>
                <Input type="number" value={limite} onChange={(e) => setLimite(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dia(s) da Semana</Label>
                  <Input
                    placeholder="Ex: Terças"
                    value={dias}
                    onChange={(e) => setDias(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} />
                </div>
              </div>
              <Button
                onClick={handleCreateGroup}
                className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white mt-2 shadow-sm"
              >
                Criar Grupo
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-100 border-b border-slate-200 rounded-t-xl">
              <CardTitle className="text-[#1E3A8A] flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Sessões Agendadas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {upcoming.length === 0 ? (
                <div className="text-center py-6 text-slate-500">Nenhuma sessão agendada</div>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm hover:border-[#1E3A8A]/30 transition-colors"
                    >
                      <p className="font-bold text-[#1E3A8A] text-sm">
                        {app.expand?.grupo_id?.nome || app.patient_name_text || 'Grupo'}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-slate-600 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(app.appointment_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        <span className="text-xs font-bold bg-[#1E3A8A]/10 text-[#1E3A8A] px-2.5 py-1 rounded-md border border-[#1E3A8A]/20">
                          {app.start_time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
