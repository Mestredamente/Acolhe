import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { AlertTriangle, LogOut } from 'lucide-react'

export function ImpersonationBar() {
  const { isDemonstrationMode, impersonatedPatient, impersonatedUser, stopImpersonation } =
    useAuth()

  if (!impersonatedUser && !impersonatedPatient) return null

  const isPatientView = !!impersonatedPatient

  if (isDemonstrationMode) {
    return (
      <div className="w-full bg-red-600 text-white px-4 py-2 flex items-center justify-between text-sm font-medium z-50 shrink-0">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>
            Modo de demonstração — dados de paciente são fictícios. Acesso a dados reais bloqueado.
            Conforme LGPD e sigilo profissional.
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-red-100 hover:bg-red-700 h-8"
          onClick={stopImpersonation}
        >
          <LogOut className="w-4 h-4 mr-2" /> Sair da Visualização
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full bg-yellow-500 text-yellow-950 px-4 py-2 flex items-center justify-between text-sm font-medium z-50 shrink-0">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        <span>
          {isPatientView
            ? 'Modo de visualização como paciente. Acesso registrado para auditoria. Nenhuma alteração será salva.'
            : 'Modo de visualização como equipe. Acesso registrado para auditoria. Nenhuma alteração será salva.'}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-yellow-950 hover:text-yellow-900 hover:bg-yellow-600 h-8"
        onClick={stopImpersonation}
      >
        <LogOut className="w-4 h-4 mr-2" /> Sair da Visualização
      </Button>
    </div>
  )
}
