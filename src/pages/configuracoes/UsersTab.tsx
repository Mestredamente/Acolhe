import { useEffect, useState } from 'react'
import { Plus, Edit2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getUsers, createUser, updateUser, User } from '@/services/users'
import { useToast } from '@/hooks/use-toast'

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profile: 'psicologo',
    status: 'ativo',
  })

  useEffect(() => {
    load()
  }, [])

  const load = () => getUsers().then(setUsers)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        const data: any = {
          name: formData.name,
          profile: formData.profile,
          status: formData.status,
        }
        if (formData.password) {
          data.password = formData.password
          data.passwordConfirm = formData.password
        }
        await updateUser(editing.id, data)
      } else {
        await createUser({ ...formData, passwordConfirm: formData.password })
      }
      toast({ title: 'Sucesso', description: 'Usuário salvo com sucesso.' })
      setOpen(false)
      load()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o usuário.',
        variant: 'destructive',
      })
    }
  }

  const openEdit = (u: User) => {
    setEditing(u)
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      profile: u.profile || 'psicologo',
      status: u.status || 'ativo',
    })
    setOpen(true)
  }

  const openNew = () => {
    setEditing(null)
    setFormData({ name: '', email: '', password: '', profile: 'psicologo', status: 'ativo' })
    setOpen(true)
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-teal-600" /> Controle de Acesso
          </h3>
          <p className="text-sm text-slate-500">Gerencie a equipe e os níveis de permissão.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-teal-700 hover:bg-teal-800">
              <Plus className="w-4 h-4 mr-2" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!editing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Senha {editing && '(Deixe em branco para manter)'}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editing}
                  minLength={8}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Perfil</label>
                  <Select
                    value={formData.profile}
                    onValueChange={(v) => setFormData({ ...formData, profile: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="psicologo">Psicólogo</SelectItem>
                      <SelectItem value="secretaria">Secretária</SelectItem>
                      <SelectItem value="paciente">Paciente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-teal-700 hover:bg-teal-800 mt-4">
                Salvar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name || '-'}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="capitalize bg-slate-50 text-slate-700 border-slate-200"
                  >
                    {u.profile || 'Sem perfil'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={u.status === 'ativo' ? 'default' : 'secondary'}
                    className={
                      u.status === 'ativo'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }
                  >
                    {u.status || 'Ativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
