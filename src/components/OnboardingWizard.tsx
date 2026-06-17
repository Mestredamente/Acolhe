import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Shield } from 'lucide-react'

export function OnboardingWizard({ open, onComplete }: { open: boolean; onComplete: () => void }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [step, setStep] = useState(1)

  const [enable2FA, setEnable2FA] = useState(false)
  const [show2FAConfirm, setShow2FAConfirm] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [inputCode, setInputCode] = useState('')

  const handleNext = () => {
    if (step < 5) setStep(step + 1)
    else handleComplete()
  }

  const handleComplete = async () => {
    await pb.collection('users').update(user.id, { onboarding_completo: true })
    onComplete()
  }

  const handleToggle2FA = async (checked: boolean) => {
    setEnable2FA(checked)
    if (checked) {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      await pb.collection('users').update(user.id, { codigo_verificacao: code })
      setGeneratedCode(code)
      setInputCode('')
      setShow2FAConfirm(true)
    } else {
      await pb.collection('users').update(user.id, { dois_fa_ativo: false })
      setShow2FAConfirm(false)
    }
  }

  const handleConfirm2FA = async () => {
    const u = await pb.collection('users').getOne(user.id)
    if (u.codigo_verificacao === inputCode) {
      await pb.collection('users').update(user.id, { dois_fa_ativo: true, codigo_verificacao: '' })
      setShow2FAConfirm(false)
      toast({ title: '2FA Ativado com sucesso!' })
    } else {
      toast({ title: 'Código incorreto', variant: 'destructive' })
    }
  }

  if (show2FAConfirm) {
    return (
      <Dialog open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar 2FA</DialogTitle>
            <DialogDescription>Código de verificação enviado para seu email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-100 rounded-lg text-center">
              <p className="text-sm text-slate-500 mb-2">Simulated Display (Código Gerado):</p>
              <p className="text-3xl font-mono tracking-widest font-bold text-slate-800">
                {generatedCode}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Digite o código de 6 dígitos</Label>
              <Input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShow2FAConfirm(false)
                setEnable2FA(false)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirm2FA}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bem-vindo ao PsicoGestão</DialogTitle>
          <DialogDescription>Passo {step} de 5</DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {step < 5 ? (
            <div className="text-center text-slate-500 py-8">
              Configure sua clínica... (Passo {step})
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Shield className="w-12 h-12 text-cyan-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Segurança da Conta</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Proteja seus dados clínicos ativando a Autenticação de Dois Fatores (2FA).
                </p>
              </div>

              <div className="p-4 border rounded-xl bg-slate-50 flex items-center justify-between gap-4">
                <div>
                  <Label className="text-base font-semibold text-slate-900">Ativar 2FA</Label>
                  <p className="text-sm text-slate-500 mt-1">
                    Recomendado para proteger sua conta. Ative agora ou depois nas configurações.
                  </p>
                </div>
                <Switch checked={enable2FA} onCheckedChange={handleToggle2FA} />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step < 5 ? (
            <Button onClick={handleNext} className="w-full sm:w-auto bg-cyan-700 hover:bg-cyan-800">
              Próximo Passo
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="w-full sm:w-auto bg-cyan-700 hover:bg-cyan-800"
            >
              Finalizar e Acessar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
