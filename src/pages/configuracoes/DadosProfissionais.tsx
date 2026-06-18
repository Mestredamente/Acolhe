import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

export default function DadosProfissionais() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [configId, setConfigId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    crp_psicologo: '',
    abordagem_principal: '',
    especialidade: '',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true)
      try {
        const records = await pb.collection('config_clinica').getFullList({
          filter: `user_id = '${user.id}'`,
        })
        if (records.length > 0) {
          const conf = records[0]
          setConfigId(conf.id)
          setFormData({
            crp_psicologo: conf.crp_psicologo || '',
            abordagem_principal: conf.abordagem_principal || '',
            especialidade: conf.texto_apresentacao || '',
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [user.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const dataToSave = {
        crp_psicologo: formData.crp_psicologo,
        abordagem_principal: formData.abordagem_principal,
        texto_apresentacao: formData.especialidade,
      }
      if (configId) {
        await pb.collection('config_clinica').update(configId, dataToSave)
      } else {
        const res = await pb.collection('config_clinica').create({
          user_id: user.id,
          ...dataToSave,
        })
        setConfigId(res.id)
      }
      toast({ title: 'Sucesso', description: 'Dados profissionais salvos.' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Falha ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dados Profissionais</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informações de Atendimento</CardTitle>
          <CardDescription>
            Estes dados serão utilizados em recibos, assinaturas e documentos gerados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>CRP</Label>
                <Input
                  value={formData.crp_psicologo}
                  onChange={(e) => setFormData({ ...formData, crp_psicologo: e.target.value })}
                  placeholder="Ex: 00/00000"
                />
              </div>
              <div className="space-y-2">
                <Label>Abordagem Principal</Label>
                <Input
                  value={formData.abordagem_principal}
                  onChange={(e) =>
                    setFormData({ ...formData, abordagem_principal: e.target.value })
                  }
                  placeholder="Ex: Terapia Cognitivo Comportamental"
                />
              </div>
              <div className="space-y-2">
                <Label>Especialidade / Apresentação</Label>
                <Input
                  value={formData.especialidade}
                  onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                  placeholder="Ex: Especialista em Ansiedade e Depressão"
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Salvar Alterações
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
