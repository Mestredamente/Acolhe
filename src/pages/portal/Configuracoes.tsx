import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export function PortalConfiguracoes() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.dois_fa_ativo || false)
  const [showModal, setShowModal] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [inputCode, setInputCode] = useState('')

  const handleDeactivate = async () => {
    await pb.collection('users').update(user.id, { dois_fa_ativo: false })
    setIs2FAEnabled(false)
    toast({ title: '2FA Desativado' })
  }

  const handleActivateClick = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    await pb.collection('users').update(user.id, { codigo_verificacao: code })
    setGeneratedCode(code)
    setInputCode('')
    setShowModal(true)
  }

  const handleConfirm2FA = async () => {
    const u = await pb.collection('users').getOne(user.id)
    if (u.codigo_verificacao === inputCode) {
      await pb.collection('users').update(user.id, { dois_fa_ativo: true, codigo_verificacao: '' })
      setIs2FAEnabled(true)
      setShowModal(false)
      toast({ title: '2FA Ativado com sucesso!' })
    } else {
      toast({ title: 'Código incorreto', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold text-emerald-900 tracking-tight flex items-center gap-2">
          <Shield className="w-8 h-8 text-emerald-600" />
          Configurações de Segurança
        </h2>
        <p className="text-emerald-700 mt-2">Gerencie a segurança da sua conta no portal.</p>
      </div>

      <Card className="border-emerald-100 shadow-sm bg-white overflow-hidden rounded-2xl">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 py-4">
          <CardTitle className="text-emerald-800">Autenticação de Dois Fatores (2FA)</CardTitle>
          <CardDescription>
            Recomendamos ativar para proteger seus dados e os dados dos pacientes. Conformidade
            LGPD.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-emerald-100 rounded-xl bg-slate-50/50">
            <div>
              <h4 className="font-medium text-slate-900 flex items-center gap-2 mb-1">
                Status Atual
                {is2FAEnabled ? (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600">Ativo</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                    Inativo
                  </Badge>
                )}
              </h4>
              <p className="text-sm text-slate-500">
                Adicione uma camada extra de segurança ao seu login.
              </p>
            </div>
            {is2FAEnabled ? (
              <Button
                variant="outline"
                className="border-rose-200 text-rose-600 hover:bg-rose-50 w-full sm:w-auto"
                onClick={handleDeactivate}
              >
                Desativar 2FA
              </Button>
            ) : (
              <Button
                onClick={handleActivateClick}
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
              >
                Ativar 2FA
              </Button>
            )}
          </div>

          <Alert className="bg-emerald-50/50 border-emerald-200">
            <AlertCircle className="w-4 h-4 text-emerald-600" />
            <AlertTitle className="text-emerald-800">Aviso</AlertTitle>
            <AlertDescription className="text-emerald-700 leading-relaxed">
              A autenticação de dois fatores adiciona uma camada extra de proteção. Guarde seus
              códigos com segurança. Em produção, o envio será por email ou aplicativo autenticador.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ativar 2FA</DialogTitle>
            <DialogDescription>Código de verificação enviado para seu email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <p className="text-xs text-emerald-600 font-semibold mb-2 uppercase tracking-wider">
                Simulated Display (Código Gerado)
              </p>
              <p className="text-4xl font-mono tracking-widest font-bold text-emerald-900">
                {generatedCode}
              </p>
            </div>
            <div className="space-y-3">
              <Label className="text-emerald-900 font-medium">Digite o código de 6 dígitos</Label>
              <Input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="text-center text-2xl tracking-widest h-14 border-emerald-200 focus-visible:ring-emerald-500 rounded-xl bg-slate-50/50"
                placeholder="000000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowModal(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirm2FA} className="bg-emerald-600 hover:bg-emerald-700">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
