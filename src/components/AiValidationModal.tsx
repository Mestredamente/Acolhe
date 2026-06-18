import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Check, X } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  content: string
  onApprove: () => void
  onReject: () => void
}

export function AiValidationModal({ open, onOpenChange, content, onApprove, onReject }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-amber-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Validação de Conteúdo IA
          </DialogTitle>
          <DialogDescription>
            Revise o texto gerado pela Inteligência Artificial antes de utilizá-lo no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-100 border border-amber-300 text-amber-900 text-sm p-3 rounded-md flex items-start gap-2 shadow-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <strong>Atenção:</strong> Conteúdo gerado por IA. Revise cuidadosamente antes de salvar.
            Conforme CFP. Não substitui julgamento clínico.
          </div>
        </div>

        <div className="mt-4 bg-slate-50 border border-slate-200 p-4 rounded-md max-h-[300px] overflow-y-auto text-sm text-slate-700 whitespace-pre-wrap shadow-inner">
          {content}
        </div>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onReject()
              onOpenChange(false)
            }}
            className="w-full sm:w-auto text-slate-600"
          >
            <X className="w-4 h-4 mr-2" />
            Rejeitar e Editar Manualmente
          </Button>
          <Button
            onClick={() => {
              onApprove()
              onOpenChange(false)
            }}
            className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white shadow-sm"
          >
            <Check className="w-4 h-4 mr-2" />
            Aprovar e Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
