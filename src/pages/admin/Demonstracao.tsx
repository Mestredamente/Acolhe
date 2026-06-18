import { useState, useEffect } from 'react'
import { Plus, Trash2, PlayCircle, Layers } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getTenantsDemo,
  createDemoTenant,
  deleteTenantDemo,
  TenantDemo,
} from '@/services/tenants_demo'
import pb from '@/lib/pocketbase/client'

export interface TenantDemoWithCount extends TenantDemo {
  fake_patient_count?: number
}

export function Demonstracao() {
  const [tenants, setTenants] = useState<TenantDemoWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('clinica')
  const [plano, setPlano] = useState('profissional')
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const loadTenants = async () => {
    try {
      const data = await getTenantsDemo()
      const withCounts = await Promise.all(
        data.map(async (t) => {
          let filter = `is_teste = true`
          if (t.tipo === 'clinica' && t.demo_clinica_id)
            filter += ` && id_clinica = "${t.demo_clinica_id}"`
          else if (t.demo_user_id) filter += ` && user_id = "${t.demo_user_id}"`

          const countRes = await pb.collection('patients').getList(1, 1, { filter })
          return { ...t, fake_patient_count: countRes.totalItems }
        }),
      )
      setTenants(withCounts)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTenants()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      await createDemoTenant({ nome, tipo, plano })
      toast({ title: 'Tenant criado com sucesso', description: 'Ambiente de demonstração pronto.' })
      setOpen(false)
      loadTenants()
    } catch (err) {
      toast({ title: 'Erro ao criar', variant: 'destructive' })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este ambiente?')) return
    try {
      await deleteTenantDemo(id)
      toast({ title: 'Tenant excluído' })
      loadTenants()
    } catch (err) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  const handleEnterDemo = async (tenant: TenantDemoWithCount) => {
    const email = tenant.expand?.demo_user_id?.email
    if (!email) {
      toast({
        title: 'Erro',
        description: 'Email do admin demo não encontrado',
        variant: 'destructive',
      })
      return
    }

    sessionStorage.setItem(
      'admin_auth',
      JSON.stringify({
        token: pb.authStore.token,
        record: pb.authStore.record,
      }),
    )
    sessionStorage.setItem('demo_mode', 'true')

    try {
      await pb.collection('users').authWithPassword(email, 'Demo@123456')
      window.location.href = '/'
    } catch (err) {
      toast({ title: 'Erro ao entrar na demonstração', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-8 h-8 text-[#1E3A8A]" />
            Ambientes de Demonstração
          </h1>
          <p className="text-slate-500 mt-2">
            Gerencie sandboxes isolados para demonstração do sistema.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
              <Plus className="w-4 h-4 mr-2" /> Novo Demo Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Ambiente de Demonstração</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome do Ambiente</Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Ex: Clínica Beta Demo"
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={setTipo} disabled={isCreating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinica">Clínica</SelectItem>
                    <SelectItem value="autonomo">Autônomo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plano</Label>
                <Select value={plano} onValueChange={setPlano} disabled={isCreating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="clinica">Clínica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Gerando dados...' : 'Gerar Ambiente e Dados Falsos'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenants de Demonstração</CardTitle>
          <CardDescription>
            Estes ambientes contêm dados fictícios (is_teste=true) e são isolados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Qtd. Pacientes</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.nome}</TableCell>
                  <TableCell className="capitalize">{t.tipo}</TableCell>
                  <TableCell className="capitalize">{t.plano}</TableCell>
                  <TableCell>{t.fake_patient_count || 0}</TableCell>
                  <TableCell>{new Date(t.created).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEnterDemo(t)}>
                      <PlayCircle className="w-4 h-4 mr-2" /> Entrar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Nenhum ambiente de demonstração encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
