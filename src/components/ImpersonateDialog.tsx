import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { User } from '@/services/users'
import { Patient } from '@/services/patients'
import { useToast } from '@/hooks/use-toast'

export function ImpersonateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { realUser: user, startImpersonation } = useAuth()
  const { toast } = useToast()

  const [targetType, setTargetType] = useState<'user' | 'patient'>('user')
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [availablePatients, setAvailablePatients] = useState<Patient[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const isSaaSAdmin = user?.profile === 'admin'

  useEffect(() => {
    if (!open) return

    setLoading(true)
    const loadTargets = async () => {
      try {
        if (targetType === 'user') {
          let filter = `profile != 'paciente' && id != '${user?.id}'`
          if (!isSaaSAdmin) {
            filter += ` && id_clinica = '${user?.id_clinica}'`
          }
          const users = await pb.collection('users').getFullList<User>({ filter })
          setAvailableUsers(users)
        } else {
          if (isSaaSAdmin) {
            setAvailablePatients([])
          } else {
            const filter =
              user?.profile === 'psicologo'
                ? `user_id = '${user.id}'`
                : `id_clinica = '${user?.id_clinica}'`
            const patients = await pb.collection('patients').getFullList<Patient>({ filter })
            setAvailablePatients(patients)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadTargets()
  }, [open, targetType, user, isSaaSAdmin])

  const handleImpersonate = async () => {
    if (!selectedId) return
    setLoading(true)

    let target = null
    if (targetType === 'user') {
      target = availableUsers.find((u) => u.id === selectedId)
    } else {
      target = availablePatients.find((p) => p.id === selectedId)
    }

    if (!target) {
      setLoading(false)
      return
    }

    await startImpersonation(targetType, target)
    setLoading(false)
    onOpenChange(false)

    toast({
      title: 'Modo de Visualização Ativado',
      description: `Você está visualizando o sistema como ${target.name || target.nome}.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Visualizar como...</DialogTitle>
          <DialogDescription>
            Acesse o sistema com a visão de outro usuário. Suas ações serão registradas no log de
            auditoria.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Perfil</label>
            <Select
              value={targetType}
              onValueChange={(val: any) => {
                setTargetType(val)
                setSelectedId('')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Membro da Equipe</SelectItem>
                {!isSaaSAdmin && <SelectItem value="patient">Paciente (Portal)</SelectItem>}
              </SelectContent>
            </Select>
            {isSaaSAdmin && targetType === 'patient' && (
              <p className="text-xs text-red-500 mt-1">
                Gestor SaaS não pode visualizar como Paciente real (LGPD).
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Usuário Alvo</label>
            <Select
              value={selectedId}
              onValueChange={setSelectedId}
              disabled={loading || (isSaaSAdmin && targetType === 'patient')}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? 'Carregando...' : 'Selecione o usuário...'} />
              </SelectTrigger>
              <SelectContent>
                {targetType === 'user'
                  ? availableUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.profile})
                      </SelectItem>
                    ))
                  : availablePatients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleImpersonate}
            disabled={!selectedId || loading || (isSaaSAdmin && targetType === 'patient')}
            className="bg-primary text-white"
          >
            {loading ? 'Aguarde...' : 'Iniciar Visualização'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
