import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Eye, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPortalDocumentos, Documento } from '@/services/documentos'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export function PortalDocumentos() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingDoc, setViewingDoc] = useState<Documento | null>(null)

  const loadData = async () => {
    try {
      setDocumentos(await getPortalDocumentos())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('documentos', () => {
    loadData()
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-emerald-900 tracking-tight">Documentos</h2>

      <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
        <div className="text-sm text-teal-800">
          <strong>Aviso de Privacidade LGPD:</strong> Seus documentos clínicos são armazenados com
          segurança. Você só tem acesso aos documentos compartilhados explicitamente pelo seu
          profissional de saúde.
        </div>
      </div>

      <Card className="border-emerald-100 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-sky-50/50 border-b border-sky-100">
          <CardTitle className="text-emerald-800 text-xl">Arquivos Compartilhados</CardTitle>
          <CardDescription className="text-base mt-1">
            Recibos, atestados e materiais de apoio clínico liberados pelo profissional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : documentos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum documento compartilhado com você no momento.
            </p>
          ) : (
            documentos.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 hover:border-sky-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-sky-100 p-3 rounded-xl text-sky-600 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-base">{doc.file_name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Enviado em {new Date(doc.created).toLocaleDateString('pt-BR')} •{' '}
                      {doc.doc_type.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sky-700 border-sky-200 hover:bg-sky-50 rounded-full px-4"
                  onClick={() => setViewingDoc(doc)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewingDoc} onOpenChange={(open) => !open && setViewingDoc(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {viewingDoc?.file_name}
            </DialogTitle>
            <DialogDescription>
              Enviado em{' '}
              {viewingDoc ? new Date(viewingDoc.created).toLocaleDateString('pt-BR') : ''}
            </DialogDescription>
          </DialogHeader>
          {viewingDoc && (
            <div className="space-y-4 mt-2">
              <div>
                <h4 className="text-sm font-semibold mb-1">Tipo de Documento</h4>
                <Badge variant="outline" className="capitalize">
                  {viewingDoc.doc_type.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Conteúdo</h4>
                <div className="bg-muted/20 p-4 rounded-md text-sm whitespace-pre-wrap border min-h-[100px]">
                  {viewingDoc.description || 'Sem conteúdo adicional.'}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
