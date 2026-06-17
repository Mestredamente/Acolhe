import { FileText } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RecibosTab } from '@/components/faturamento/RecibosTab'
import { NfeTab } from '@/components/faturamento/NfeTab'

export default function FaturamentoIndex() {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Emissão de Documentos Fiscais
        </h1>
      </div>

      <Tabs defaultValue="recibos" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none px-0 bg-transparent mb-6">
          <TabsTrigger
            value="recibos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Recibos
          </TabsTrigger>
          <TabsTrigger
            value="nfe"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            NF-e
          </TabsTrigger>
        </TabsList>
        <TabsContent value="recibos">
          <RecibosTab />
        </TabsContent>
        <TabsContent value="nfe">
          <NfeTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
