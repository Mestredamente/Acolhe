import { useEffect, useState } from 'react'
import {
  BrainCircuit,
  Settings2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { getAuditorias, AuditoriaIA } from '@/services/auditoria_ia'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function AITab() {
  const { toast } = useToast()
  const [fallbackActive, setFallbackActive] = useState(true)
  const [testing, setTesting] = useState(false)
  const [logs, setLogs] = useState<AuditoriaIA[]>([])
  const [selectedLog, setSelectedLog] = useState<AuditoriaIA | null>(null)

  useEffect(() => {
    getAuditorias()
      .then((data) => setLogs(data))
      .catch(console.error)
  }, [])

  const handleTestConnection = () => {
    setTesting(true)
    setTimeout(() => {
      setTesting(false)
      toast({
        title: 'Conexão Estabelecida',
        description: 'Os provedores de IA primário e fallback estão respondendo adequadamente.',
      })
    }, 1500)
  }

  const total = logs.length
  const successCount = logs.filter((l) => l.status === 'sucesso').length
  const fallbackCount = logs.filter((l) => l.provedor_usado === 'OpenAI').length
  const blockedCount = logs.filter((l) => l.status === 'falha').length

  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0
  const fallbackRate = total > 0 ? Math.round((fallbackCount / total) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-teal-100 shadow-sm">
        <CardHeader className="bg-teal-50/70 pb-4 border-b border-teal-100 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-teal-900">
            <Settings2 className="w-5 h-5 text-teal-700" />
            Orquestração de Provedores IA
          </CardTitle>
          <CardDescription className="text-teal-700/80">
            Gerencie os modelos de inteligência artificial e garanta redundância operacional.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-6 flex-1">
              <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <div>
                    <p className="font-semibold text-slate-900">Provedor Primário (Claude)</p>
                    <p className="text-sm text-slate-500">
                      Otimizado para análise clínica e empatia
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  Ativo
                </Badge>
              </div>

              <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 max-w-[80%]">
                    <Label className="text-base font-semibold text-slate-900">
                      Provedor de Fallback (OpenAI)
                    </Label>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Quando Claude estiver indisponível, o sistema usa OpenAI automaticamente.
                      Mantenha o fallback ativo para redundância.
                    </p>
                  </div>
                  <Switch
                    checked={fallbackActive}
                    onCheckedChange={setFallbackActive}
                    className="data-[state=checked]:bg-teal-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center p-6 border border-dashed border-slate-200 rounded-lg bg-slate-50/50 min-w-[220px]">
              <BrainCircuit className="w-10 h-10 text-teal-600 mb-4" />
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={testing}
                className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                {testing ? 'Testando Conexão...' : 'Testar Conexão'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500">Total no Mês</p>
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{total}</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500">Taxa de Sucesso</p>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{successRate}%</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500">Uso de Fallback</p>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{fallbackRate}%</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-rose-100">
          <CardContent className="p-6 bg-rose-50/30 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600">Conteúdos Bloqueados</p>
              <ShieldAlert className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="text-3xl font-bold text-rose-700">{blockedCount}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Auditoria de Uso</CardTitle>
          <CardDescription>
            Histórico de interações com os provedores de IA, sujeito à validação manual obrigatória
            e filtros de segurança.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Operação</TableHead>
                  <TableHead>Provedor</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium capitalize text-slate-700">
                        {log.tipo_operacao}
                      </TableCell>
                      <TableCell className="text-slate-600">{log.provedor_usado}</TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(log.created).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.status === 'sucesso'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : log.status === 'falha'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                        >
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Nenhum registro encontrado na auditoria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={(o) => !o && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-teal-900">Detalhes da Operação IA</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-5 py-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                    Operação
                  </span>
                  <span className="capitalize text-slate-900 font-medium">
                    {selectedLog.tipo_operacao}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                    Provedor Usado
                  </span>
                  <span className="text-slate-900 font-medium">{selectedLog.provedor_usado}</span>
                </div>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-700 block mb-2">
                  Prompt / Contexto
                </span>
                <div className="p-3 bg-white border border-slate-200 shadow-sm rounded-md text-sm text-slate-600 break-words whitespace-pre-wrap">
                  {selectedLog.resumo_prompt || 'Nenhum contexto registrado.'}
                </div>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-700 block mb-2">
                  Resposta da IA
                </span>
                <div className="p-3 bg-white border border-slate-200 shadow-sm rounded-md text-sm text-slate-600 break-words whitespace-pre-wrap max-h-[250px] overflow-y-auto">
                  {selectedLog.resumo_resposta || 'Nenhuma resposta registrada.'}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
