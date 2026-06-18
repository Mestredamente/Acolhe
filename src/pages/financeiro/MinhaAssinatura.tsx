import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Check, Rocket } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export default function MinhaAssinatura() {
  const { toast } = useToast()
  const [assinatura, setAssinatura] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      const res = await pb.send('/backend/v1/minha-assinatura', { method: 'GET' })
      setAssinatura(res)
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Erro ao carregar assinatura',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdate = async (plano: string) => {
    setSaving(true)
    try {
      const res = await pb.send('/backend/v1/minha-assinatura', {
        method: 'POST',
        body: JSON.stringify({ plano }),
        headers: { 'Content-Type': 'application/json' },
      })
      setAssinatura(res)
      setModalOpen(false)
      toast({ title: 'Sucesso', description: 'Plano atualizado com sucesso.' })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Falha ao atualizar plano',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>

  const isFree = !assinatura || assinatura.plano === 'free'

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Minha Assinatura</h1>
      </div>

      <Card className="border-primary/20 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-primary flex items-center gap-2">
                Plano {!isFree ? 'Profissional' : 'Free'}
                {assinatura?.status === 'ativo' && (
                  <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                Gerencie seu plano atual e limites da plataforma.
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                R$ {assinatura?.valor_mensal || 0},00{' '}
                <span className="text-sm font-normal text-muted-foreground">/mês</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Detalhes do Plano</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" /> 1 Psicólogo
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" /> Pacientes ilimitados
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" /> Lembretes automáticos
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Faturamento</h3>
            <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Próxima renovação:</span>
                <span className="font-medium">
                  {assinatura?.data_renovacao
                    ? new Date(assinatura.data_renovacao).toLocaleDateString('pt-BR')
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Forma de pagamento:</span>
                <span className="font-medium">Cartão final 4242</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 pt-6">
          <Button onClick={() => setModalOpen(true)}>Alterar Plano</Button>
        </CardFooter>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Escolha o plano ideal para você</DialogTitle>
            <DialogDescription>
              Faça o upgrade ou downgrade do seu plano a qualquer momento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4 py-4">
            <Card className={`relative ${isFree ? 'border-primary ring-2 ring-primary/20' : ''}`}>
              {isFree && <Badge className="absolute -top-3 right-4">Atual</Badge>}
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Para iniciar sua jornada</CardDescription>
                <div className="mt-4 text-3xl font-bold">
                  R$ 0<span className="text-sm font-normal text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-primary" /> 1 Psicólogo
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-primary" /> Funcionalidades limitadas
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={isFree ? 'outline' : 'default'}
                  className="w-full"
                  disabled={isFree || saving}
                  onClick={() => handleUpdate('free')}
                >
                  {isFree ? 'Plano Atual' : 'Mudar para Free'}
                </Button>
              </CardFooter>
            </Card>

            <Card className={`relative ${!isFree ? 'border-primary ring-2 ring-primary/20' : ''}`}>
              {!isFree && <Badge className="absolute -top-3 right-4">Atual</Badge>}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-primary" /> Profissional
                </CardTitle>
                <CardDescription>Para consultórios em crescimento</CardDescription>
                <div className="mt-4 text-3xl font-bold">
                  R$ 97<span className="text-sm font-normal text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-primary" /> 1 Psicólogo
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-primary" /> Pacientes ilimitados
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-primary" /> Recursos avançados com IA
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={!isFree ? 'outline' : 'default'}
                  className="w-full"
                  disabled={!isFree || saving}
                  onClick={() => handleUpdate('profissional')}
                >
                  {!isFree ? 'Plano Atual' : 'Mudar para Profissional'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
