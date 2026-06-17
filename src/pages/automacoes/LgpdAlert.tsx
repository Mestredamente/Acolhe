import { Link } from 'react-router-dom'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ShieldCheck } from 'lucide-react'

export function LgpdAlert() {
  return (
    <Alert className="bg-slate-50 border-slate-200 mt-8 shadow-sm">
      <ShieldCheck className="h-5 w-5 text-cyan-800" />
      <AlertTitle className="text-cyan-900 font-semibold ml-2">Conformidade LGPD</AlertTitle>
      <AlertDescription className="text-slate-600 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2 ml-2">
        <span>
          O envio automático de mensagens respeita o horário comercial configurado. Certifique-se de
          que o paciente concorda com o uso de WhatsApp para comunicação no termo de consentimento.
        </span>
        <Button
          variant="outline"
          className="text-cyan-800 border-cyan-200 bg-white whitespace-nowrap"
          asChild
        >
          <Link to="/pacientes">Visualizar Termo de Consentimento</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
