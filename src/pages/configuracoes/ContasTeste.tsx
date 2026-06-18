import { useState, useEffect } from 'react'
import { Plus, Trash2, FlaskConical, User as UserIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Patient, createPatient, deletePatient } from '@/services/patients'

export function ContasTeste() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const isClinicaOwner = user?.profile === 'psicologo' && user?.id_clinica && !user?.supervisor_id

  const loadData = async () => {
    try {
      const pts = await pb
        .collection<Patient>('patients')
        .getFullList({ filter: 'is_teste = true && deleted_at = ""' })
      setPatients(pts)

      if (isClinicaOwner) {
        const usrs = await pb
          .collection('users')
          .getFullList({ filter: `is_teste = true && id_clinica = "${user.id_clinica}"` })
        setUsers(usrs)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreatePatient = async () => {
    try {
      await createPatient({
        name: `Paciente Teste ${Math.floor(Math.random() * 1000)}`,
        email: `teste_${Math.floor(Math.random() * 1000)}@teste.com`,
        status: 'active',
        is_teste: true,
        id_clinica: user?.id_clinica || undefined,
      })
      toast({ title: 'Paciente de teste criado' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao criar', variant: 'destructive' })
    }
  }

  const handleDeletePatient = async (id: string) => {
    try {
      await deletePatient(id)
      toast({ title: 'Paciente excluído' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  const handleCreateUser = async (profile: string) => {
    try {
      const email = `${profile}_teste_${Math.floor(Math.random() * 1000)}@teste.com`
      await pb.collection('users').create({
        name: `${profile === 'psicologo' ? 'Psicólogo' : 'Secretária'} Teste`,
        email,
        password: 'Password@123',
        passwordConfirm: 'Password@123',
        profile,
        status: 'ativo',
        is_teste: true,
        id_clinica: user?.id_clinica,
      })
      toast({
        title: 'Usuário de teste criado',
        description: `Email: ${email} | Senha: Password@123`,
      })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao criar', variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <FlaskConical className="w-8 h-8 text-orange-600" />
          Contas de Teste
        </h1>
        <p className="text-slate-500 mt-2">
          Crie contas fictícias para treinar equipe e testar fluxos sem misturar com dados reais.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pacientes de Teste</CardTitle>
            <CardDescription>
              Pacientes fictícios para testes de agendamento e evolução.
            </CardDescription>
          </div>
          <Button
            onClick={handleCreatePatient}
            variant="outline"
            className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:text-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Paciente
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-400" /> {p.name}
                  </TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      Teste
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDeletePatient(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {patients.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                    Nenhum paciente de teste.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isClinicaOwner && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Equipe de Teste</CardTitle>
              <CardDescription>Usuários fictícios na sua clínica.</CardDescription>
            </div>
            <div className="space-x-2">
              <Button onClick={() => handleCreateUser('psicologo')} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" /> Psicólogo
              </Button>
              <Button onClick={() => handleCreateUser('secretaria')} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" /> Secretária
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-slate-400" /> {u.name}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="capitalize">
                      {u.profile}{' '}
                      <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                        Teste
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={async () => {
                          await pb.collection('users').delete(u.id)
                          loadData()
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                      Nenhuma conta de equipe de teste.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
