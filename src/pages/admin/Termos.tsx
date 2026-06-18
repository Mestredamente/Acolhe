import { useState, useEffect } from 'react'
import { TermoVersionamento, getTermos, createTermo } from '@/services/termos'
import { Button } from '@/components/ui/button'
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Save, Loader2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export default function TermosPrivacidade() {
  const { toast } = useToast()
  const [termos, setTermos] = useState<TermoVersionamento[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<Partial<TermoVersionamento>>({
    tipo: 'termos_de_servico',
    status: 'ativo',
    obrigatorio: true,
    versao: 1.0,
    titulo: '',
    conteudo: '',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getTermos()
      setTermos(data)
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os termos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    if (!formData.titulo || !formData.conteudo) {
      toast({ title: 'Aviso', description: 'Preencha título e conteúdo', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      if (formData.status === 'ativo') {
        const actives = await pb.collection('termos_versionamento').getFullList({
          filter: `tipo = '${formData.tipo}' && status = 'ativo'`,
        })
        for (const act of actives) {
          await pb.collection('termos_versionamento').update(act.id, { status: 'arquivado' })
        }
      }
      await createTermo({
        ...formData,
        data_publicacao: formData.status === 'ativo' ? new Date().toISOString() : '',
      })
      toast({ title: 'Sucesso', description: 'Termo salvo com sucesso.' })
      setOpen(false)
      loadData()
    } catch (e) {
      toast({ title: 'Erro', description: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Termos e Privacidade</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os termos de serviço e políticas de privacidade da plataforma.
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData({
              tipo: 'termos_de_servico',
              status: 'ativo',
              obrigatorio: true,
              versao:
                (termos
                  .filter((t) => t.tipo === 'termos_de_servico')
                  .reduce((max, t) => Math.max(max, t.versao), 0) || 0) + 0.1,
              titulo: '',
              conteudo: '',
            })
            setOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Versão
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Versão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Publicação</TableHead>
              <TableHead>Obrigatório</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {termos.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{t.titulo}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t.tipo.replace(/_/g, ' ')}</span>
                </TableCell>
                <TableCell>v{t.versao.toFixed(1)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      t.status === 'ativo'
                        ? 'default'
                        : t.status === 'rascunho'
                          ? 'secondary'
                          : 'outline'
                    }
                    className={t.status === 'ativo' ? 'bg-teal-600' : ''}
                  >
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {t.data_publicacao
                    ? new Date(t.data_publicacao).toLocaleDateString('pt-BR')
                    : '-'}
                </TableCell>
                <TableCell>{t.obrigatorio ? 'Sim' : 'Não'}</TableCell>
              </TableRow>
            ))}
            {!loading && termos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum termo cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Versão de Termo</DialogTitle>
            <DialogDescription>
              Crie uma nova versão para os termos de serviço ou política de privacidade.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md flex items-start gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Atenção:</strong> Alterações publicadas afetam todos os usuários. Reaceite
              obrigatório será solicitado no próximo acesso. Conforme LGPD.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <Select
                value={formData.tipo}
                onValueChange={(v: any) => setFormData((f) => ({ ...f, tipo: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="termos_de_servico">Termos de Serviço</SelectItem>
                  <SelectItem value="politica_privacidade">Política de Privacidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v: any) => setFormData((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="ativo">Ativo (Público)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label>Título</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="Ex: Termos de Uso"
              />
            </div>
            <div className="space-y-2">
              <Label>Versão</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.versao}
                onChange={(e) => setFormData((f) => ({ ...f, versao: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Conteúdo do Termo</Label>
              <Textarea
                value={formData.conteudo}
                onChange={(e) => setFormData((f) => ({ ...f, conteudo: e.target.value }))}
                placeholder="Insira o texto completo do documento aqui..."
                className="min-h-[300px] font-mono text-sm"
              />
            </div>
            <div className="flex items-center space-x-2 col-span-2 mt-2">
              <Checkbox
                id="obrigatorio"
                checked={formData.obrigatorio}
                onCheckedChange={(c) => setFormData((f) => ({ ...f, obrigatorio: !!c }))}
              />
              <Label htmlFor="obrigatorio" className="cursor-pointer">
                Aceite Obrigatório (Bloqueia o acesso até aceite)
              </Label>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
