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
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export function SecuritySettings() {
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
    <Card>
      <CardHeader>
        <CardTitle>Segurança da Conta</CardTitle>
        <CardDescription>
          Gerencie a autenticação de dois fatores (2FA) para proteger seus dados e dos pacientes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
          <div>
            <h4 className="font-medium text-slate-900 flex items-center gap-2">
              Autenticação de Dois Fatores (2FA)
              {is2FAEnabled ? (
                <Badge className="bg-emerald-500 hover:bg-emerald-600">Ativo</Badge>
              ) : (
                <Badge variant="secondary">Inativo</Badge>
              )}
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              Recomendamos ativar para proteger seus dados e os dados dos pacientes. Conformidade
              LGPD.
            </p>
          </div>
          {is2FAEnabled ? (
            <Button type="button" variant="destructive" onClick={handleDeactivate}>
              Desativar 2FA
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleActivateClick}
              className="bg-cyan-700 hover:bg-cyan-800"
            >
              Ativar 2FA
            </Button>
          )}
        </div>
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Atenção</AlertTitle>
          <AlertDescription className="text-amber-700">
            A autenticação de dois fatores adiciona uma camada extra de proteção. Guarde seus
            códigos com segurança. Em produção, o envio será por email ou aplicativo autenticador.
          </AlertDescription>
        </Alert>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ativar 2FA</DialogTitle>
              <DialogDescription>Código de verificação enviado para seu email.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-slate-100 rounded-lg text-center border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wider">
                  Simulated Display (Código Gerado)
                </p>
                <p className="text-4xl font-mono tracking-widest font-bold text-slate-800">
                  {generatedCode}
                </p>
              </div>
              <div className="space-y-3">
                <Label>Digite o código de 6 dígitos</Label>
                <Input
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest h-14"
                  placeholder="000000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm2FA} className="bg-cyan-700 hover:bg-cyan-800">
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
