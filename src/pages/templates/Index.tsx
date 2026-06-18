import { useState, useEffect } from 'react'
import { Plus, Edit, Power, PowerOff, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  TemplateEvolucao,
} from '@/services/templates'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import pb from '@/lib/pocketbase/client'

export default function TemplatesList() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<TemplateEvolucao[]>([])
  const [loading, setLoading] = useState(true)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TemplateEvolucao | null>(null)
  const [formData, setFormData] = useState<Partial<TemplateEvolucao>>({
    titulo: '',
    abordagem: 'TCC',
    conteudo: '',
    status: 'ativo',
  })

  const loadTemplates = async () => {
    try {
      const data = await getTemplates()
      setTemplates(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const handleOpenDialog = (t?: TemplateEvolucao) => {
    if (t) {
      setEditingTemplate(t)
      setFormData({
        titulo: t.titulo,
        abordagem: t.abordagem,
        conteudo: t.conteudo,
        status: t.status,
      })
    } else {
      setEditingTemplate(null)
      setFormData({
        titulo: '',
        abordagem: 'TCC',
        conteudo: '',
        status: 'ativo',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.titulo || !formData.conteudo) {
      toast({ title: 'Erro', description: 'Preencha título e conteúdo.', variant: 'destructive' })
      return
    }
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData)
        toast({ title: 'Sucesso', description: 'Template atualizado.' })
      } else {
        await createTemplate(formData)
        toast({ title: 'Sucesso', description: 'Template criado.' })
      }
      setIsDialogOpen(false)
      loadTemplates()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Erro ao salvar.', variant: 'destructive' })
    }
  }

  const handleToggleStatus = async (t: TemplateEvolucao) => {
    try {
      const newStatus = t.status === 'ativo' ? 'inativo' : 'ativo'
      await updateTemplate(t.id, { status: newStatus })
      toast({
        title: 'Sucesso',
        description: `Template ${newStatus === 'ativo' ? 'ativado' : 'desativado'}.`,
      })
      loadTemplates()
    } catch (e: any) {
      toast({ title: 'Erro', description: 'Erro ao alterar status.', variant: 'destructive' })
    }
  }

  const myTemplates = templates.filter(
    (t) => t.psicologo_id === pb.authStore.record?.id && !t.is_padrao,
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-cyan-700" />
            Meus Templates
          </h1>
          <p className="text-slate-500 mt-2">
            Gerencie seus templates personalizados para evoluções clínicas.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-cyan-700 hover:bg-cyan-800">
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Templates ({myTemplates.length})</CardTitle>
          <CardDescription>
            Estes templates estarão disponíveis na tela de Nova Evolução.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500">
              Carregando...
            </div>
          ) : myTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <FileText className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-slate-600 mb-4">
                Você ainda não tem nenhum template personalizado.
              </p>
              <Button onClick={() => handleOpenDialog()} variant="outline">
                Criar o primeiro
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Abordagem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTemplates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.titulo}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        {t.abordagem}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {t.status === 'ativo' ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Ativo
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-none">
                          <AlertCircle className="w-3 h-3 mr-1" /> Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(t)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(t)}
                        title={t.status === 'ativo' ? 'Desativar' : 'Ativar'}
                      >
                        {t.status === 'ativo' ? (
                          <PowerOff className="w-4 h-4 text-red-600" />
                        ) : (
                          <Power className="w-4 h-4 text-emerald-600" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Editar Template' : 'Novo Template'}</DialogTitle>
            <DialogDescription>
              Crie um modelo padrão para preenchimento rápido de evoluções.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: TCC - Avaliação Inicial"
                />
              </div>
              <div className="space-y-2">
                <Label>Abordagem</Label>
                <Select
                  value={formData.abordagem}
                  onValueChange={(val: any) => setFormData({ ...formData, abordagem: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TCC">TCC</SelectItem>
                    <SelectItem value="Psicanálise">Psicanálise</SelectItem>
                    <SelectItem value="Gestalt">Gestalt</SelectItem>
                    <SelectItem value="Humanista">Humanista</SelectItem>
                    <SelectItem value="Comportamental">Comportamental</SelectItem>
                    <SelectItem value="EMDR">EMDR</SelectItem>
                    <SelectItem value="Integrativa">Integrativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Conteúdo do Template</Label>
              <Textarea
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                className="min-h-[300px] font-mono text-sm"
                placeholder="Paciente: [Nome do Paciente]&#10;Data: [Data da Sessão]&#10;&#10;Evolução: ..."
              />
              <p className="text-xs text-slate-500 mt-1">
                Dica: Use marcadores como [Nome do Paciente] ou [Observações] para guiar o
                preenchimento na hora da sessão.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-cyan-700 hover:bg-cyan-800">
              Salvar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
