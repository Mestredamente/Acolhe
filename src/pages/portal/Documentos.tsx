import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PortalDocumentos() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-emerald-900 tracking-tight">Documentos</h2>
      <Card className="border-emerald-100 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-sky-50/50 border-b border-sky-100">
          <CardTitle className="text-emerald-800 text-xl">Arquivos Compartilhados</CardTitle>
          <CardDescription className="text-base mt-1">
            Recibos, atestados e materiais de apoio clínico.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 hover:border-sky-200 hover:shadow-sm transition-all group">
            <div className="flex items-center gap-4">
              <div className="bg-sky-100 p-3 rounded-xl text-sky-600 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-base">Recibo_Agosto_2023.pdf</p>
                <p className="text-sm text-slate-500 mt-0.5">Enviado em 05/09/2023 • 124 KB</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-sky-700 border-sky-200 hover:bg-sky-50 rounded-full px-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          </div>
          <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 hover:border-sky-200 hover:shadow-sm transition-all group">
            <div className="flex items-center gap-4">
              <div className="bg-sky-100 p-3 rounded-xl text-sky-600 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-base">
                  Cartilha_Higiene_do_Sono.pdf
                </p>
                <p className="text-sm text-slate-500 mt-0.5">Enviado em 20/08/2023 • 1.2 MB</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-sky-700 border-sky-200 hover:bg-sky-50 rounded-full px-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
