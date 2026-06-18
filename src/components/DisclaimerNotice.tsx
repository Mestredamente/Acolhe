import { Info } from 'lucide-react'

export function DisclaimerNotice() {
  return (
    <div className="bg-warning/10 border-l-4 border-warning p-3 mb-6 rounded-r-[8px] flex items-start gap-3 animate-slide-in-left shadow-sm">
      <Info className="w-5 h-5 text-warning shrink-0 mt-0.5" />
      <p className="text-sm text-slate-700">
        <strong className="font-semibold text-slate-900">Aviso do Sistema:</strong> Layout e design
        padronizado conforme diretrizes de interface. Ajustes finos de estilo podem ser refinados
        com o Selecionar Elementos.
      </p>
    </div>
  )
}
