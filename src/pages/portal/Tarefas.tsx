import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

export function PortalTarefas() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-emerald-900 tracking-tight">Tarefas e Escalas</h2>
      <Card className="border-emerald-100 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
          <CardTitle className="text-emerald-800 text-xl">Atividades Pendentes</CardTitle>
          <CardDescription className="text-base mt-1">
            Conclua as tarefas indicadas pelo seu terapeuta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-start space-x-4 p-5 bg-white rounded-xl border border-emerald-200 shadow-sm hover:border-emerald-300 transition-colors">
            <Checkbox
              id="t1"
              className="mt-1 w-5 h-5 border-emerald-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            />
            <div>
              <label
                htmlFor="t1"
                className="font-semibold text-emerald-900 cursor-pointer text-base"
              >
                Questionário de Ansiedade (BAI)
              </label>
              <p className="text-sm text-emerald-700/80 mt-1 leading-relaxed">
                Preencher a escala baseada nos últimos 7 dias. Responda de acordo com a intensidade
                dos sintomas.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-5 bg-white rounded-xl border border-emerald-200 shadow-sm hover:border-emerald-300 transition-colors">
            <Checkbox
              id="t2"
              className="mt-1 w-5 h-5 border-emerald-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            />
            <div>
              <label
                htmlFor="t2"
                className="font-semibold text-emerald-900 cursor-pointer text-base"
              >
                Exercício de Respiração Diafragmática
              </label>
              <p className="text-sm text-emerald-700/80 mt-1 leading-relaxed">
                Praticar por 5 minutos antes de dormir, utilizando a técnica guiada (4-7-8).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
