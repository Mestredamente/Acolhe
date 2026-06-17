import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CheckCircle2, XCircle, Smartphone } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ConfigClinica, saveConfig } from '@/services/config_clinica'

interface Props {
  config: ConfigClinica | null
  onUpdate: () => void
}

export function ConnectionCard({ config, onUpdate }: Props) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const handleConnect = async () => {
    if (!config) return
    await saveConfig(config.user_id, { whatsapp_connected: true })
    toast({ title: 'WhatsApp Conectado', description: 'O número foi conectado com sucesso.' })
    setOpen(false)
    onUpdate()
  }

  const handleDisconnect = async () => {
    if (!config) return
    await saveConfig(config.user_id, { whatsapp_connected: false })
    toast({ title: 'WhatsApp Desconectado', description: 'O serviço de automação foi pausado.' })
    onUpdate()
  }

  return (
    <Card className="border-l-4 border-l-cyan-700 shadow-sm">
      <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-full ${config?.whatsapp_connected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
          >
            <Smartphone className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-900">Status da Conexão</h3>
            <div className="flex items-center gap-2 mt-1">
              {config?.whatsapp_connected ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Conectado
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                  <XCircle className="w-3 h-3 mr-1" /> Desconectado
                </Badge>
              )}
              <span className="text-sm text-slate-500 font-mono">
                {config?.whatsapp_phone || 'Nenhum número configurado'}
              </span>
            </div>
          </div>
        </div>

        <div>
          {config?.whatsapp_connected ? (
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleDisconnect}
            >
              Desconectar
            </Button>
          ) : (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-700 hover:bg-cyan-800 text-white">
                  Conectar WhatsApp
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Conectar ao WhatsApp</DialogTitle>
                  <DialogDescription>
                    Para habilitar as automações, precisamos conectar seu número. Leia o QR Code
                    usando o seu aplicativo WhatsApp.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-6">
                  <img
                    src="https://img.usecurling.com/p/200/200?q=qrcode&color=black"
                    alt="QR Code simulado"
                    className="border p-2 rounded-lg"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleConnect} className="bg-cyan-700 hover:bg-cyan-800">
                    Confirmar Conexão
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
