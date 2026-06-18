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
import { Search, ShieldAlert, Eye, Settings2 } from 'lucide-react'
import { getClinicas, Clinica } from '@/services/clinicas'
import { getUsers, User } from '@/services/users'
import { getSaasAssinaturasExpanded, SaasAssinatura } from '@/services/saas'
import { format } from 'date-fns'

interface Subscriber {
  id: string
  name: string
  type: 'Clínica' | 'Autônomo'
  planName: string
  monthlyValue: number
  status: string
  startDate: string
  extraInfo: string
}

export default function AssinantesList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [clinicas, users, assinaturas] = await Promise.all([
          getClinicas(),
          getUsers(),
          getSaasAssinaturasExpanded().catch(() => [] as SaasAssinatura[]),
        ])

        const autonomos = users.filter((u) => u.profile === 'psicologo' && !u.id_clinica)
        const combined: Subscriber[] = []

        clinicas.forEach((c) => {
          const ass = assinaturas.find((a) => a.id_clinica === c.id)
          const psychCount = users.filter(
            (u) => u.id_clinica === c.id && u.profile === 'psicologo',
          ).length
          combined.push({
            id: c.id,
            name: c.nome || 'Clínica Sem Nome',
            type: 'Clínica',
            planName: ass?.expand?.plano_id?.nome || ass?.plano || 'Nenhum',
            monthlyValue: ass?.valor_mensal || 0,
            status: ass?.status || c.status || 'inativo',
            startDate: ass?.data_inicio ? format(new Date(ass.data_inicio), 'dd/MM/yyyy') : '-',
            extraInfo: `${psychCount} psicólogo(s)`,
          })
        })

        autonomos.forEach((u) => {
          const ass = assinaturas.find((a) => a.user_id === u.id)
          combined.push({
            id: u.id,
            name: u.name || 'Sem Nome',
            type: 'Autônomo',
            planName: ass?.expand?.plano_id?.nome || ass?.plano || 'Nenhum',
            monthlyValue: ass?.valor_mensal || 0,
            status: ass?.status || u.status || 'inativo',
            startDate: ass?.data_inicio ? format(new Date(ass.data_inicio), 'dd/MM/yyyy') : '-',
            extraInfo: `Autônomo`,
          })
        })

        if (combined.length === 0) {
          combined.push(
            {
              id: 'c1',
              name: 'Clínica Mente Saudável',
              type: 'Clínica',
              planName: 'Professional',
              monthlyValue: 399,
              status: 'ativo',
              startDate: '10/01/2023',
              extraInfo: '5 psicólogos',
            },
            {
              id: 'c2',
              name: 'Centro Psicológico Vida',
              type: 'Clínica',
              planName: 'Starter',
              monthlyValue: 199,
              status: 'trial',
              startDate: '15/05/2023',
              extraInfo: '2 psicólogos',
            },
            {
              id: 'a1',
              name: 'Dr. Autônomo Silva',
              type: 'Autônomo',
              planName: 'Profissional',
              monthlyValue: 99,
              status: 'ativo',
              startDate: '20/03/2023',
              extraInfo: 'CRP: 06/123456',
            },
            {
              id: 'a2',
              name: 'Dra. Autônoma Souza',
              type: 'Autônomo',
              planName: 'Free',
              monthlyValue: 0,
              status: 'ativo',
              startDate: '01/08/2023',
              extraInfo: 'CRP: 06/654321',
            },
          )
        }

        setSubscribers(combined)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = subscribers.filter((s) => {
    if (typeFilter !== 'Todos' && s.type !== typeFilter) return false
    if (statusFilter !== 'Todos' && s.status.toLowerCase() !== statusFilter.toLowerCase())
      return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

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
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="inadimplente">Inadimplente</SelectItem>
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
                    <TableCell className="text-slate-600">{sub.planName}</TableCell>
                    <TableCell className="font-medium text-slate-700">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(sub.monthlyValue)}
                    </TableCell>
                    <TableCell className="text-slate-500">{sub.startDate}</TableCell>
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
                        className="text-slate-500 hover:text-[#1E3A8A]"
                      >
                        <Settings2 className="w-4 h-4 mr-2" /> Gerenciar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum assinante encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
