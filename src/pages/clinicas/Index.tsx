import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Building2, Search, Plus, ShieldAlert } from 'lucide-react'
import { getClinicas, Clinica } from '@/services/clinicas'
import { getUsers, User } from '@/services/users'
import { getPatients, Patient } from '@/services/patients'
import { ClinicaFormDialog } from '@/components/ClinicaFormDialog'
import { useAuth } from '@/hooks/use-auth'

export default function ClinicasList() {
  const { user } = useAuth()
  if (user?.profile !== 'admin') return <Navigate to="/" />

  const [clinicas, setClinicas] = useState<Clinica[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todas')
  const [cidadeFilter, setCidadeFilter] = useState('todas')
  const [formOpen, setFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [cRes, uRes, pRes] = await Promise.all([getClinicas(), getUsers(), getPatients()])
      setClinicas(cRes)
      setUsers(uRes)
      setPatients(pRes)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const cidades = Array.from(new Set(clinicas.map((c) => c.cidade).filter(Boolean)))

  const filtered = clinicas.filter((c) => {
    if (statusFilter !== 'todas' && c.status !== statusFilter) return false
    if (cidadeFilter !== 'todas' && c.cidade !== cidadeFilter) return false
    if (search && !c.nome.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800">
          <strong>Aviso de Segurança:</strong> Gestão de clínicas disponível apenas para
          administradores. Profissionais vinculados visualizam apenas dados da sua clínica.
          Conformidade LGPD — isolamento de dados por tenant.
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E40AF] flex items-center gap-2">
            <Building2 className="h-6 w-6" /> Gestão de Clínicas
          </h1>
          <p className="text-muted-foreground mt-1">
            Cadastre e gerencie as clínicas e profissionais vinculados.
          </p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-[#1E40AF] hover:bg-blue-800 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Nova Clínica
        </Button>
      </div>

      <Card className="shadow-sm border-none shadow-elevation">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clínica por nome..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={cidadeFilter} onValueChange={setCidadeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as cidades</SelectItem>
                  {cidades.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos</SelectItem>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="inativa">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clínica</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead className="text-center">Profissionais</TableHead>
                  <TableHead className="text-center">Pacientes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((clinica) => {
                  const profCount = users.filter(
                    (u) =>
                      u.id_clinica === clinica.id &&
                      ['psicologo', 'secretaria'].includes(u.profile),
                  ).length
                  const patCount = patients.filter((p) => p.id_clinica === clinica.id).length
                  return (
                    <TableRow key={clinica.id}>
                      <TableCell className="font-medium text-[#1E40AF]">{clinica.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{clinica.cnpj || '-'}</TableCell>
                      <TableCell>
                        {clinica.cidade ? `${clinica.cidade}/${clinica.estado}` : '-'}
                      </TableCell>
                      <TableCell className="text-center font-medium">{profCount}</TableCell>
                      <TableCell className="text-center font-medium">{patCount}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            clinica.status === 'ativa'
                              ? 'bg-teal-600 hover:bg-teal-700'
                              : 'bg-slate-400 hover:bg-slate-500'
                          }
                        >
                          {clinica.status === 'ativa' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-[#1E40AF] hover:text-blue-800"
                        >
                          <Link to={`/clinicas/${clinica.id}`}>Gerenciar</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma clínica encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ClinicaFormDialog open={formOpen} onOpenChange={setFormOpen} onSaved={loadData} />
    </div>
  )
}
