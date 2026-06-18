import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download, Calendar, DollarSign, Calculator } from 'lucide-react'

export default function Contabilidade() {
  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-[1000px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Contabilidade (DRE Simplificada)
          </h1>
          <p className="text-slate-500 mt-1">
            Resumo contábil e apuração de impostos da plataforma.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white border-slate-300">
            <Calendar className="w-4 h-4 mr-2" /> Outubro / 2023
          </Button>
          <Button className="bg-[#1E3A8A] hover:bg-blue-800 text-white">
            <Download className="w-4 h-4 mr-2" /> Exportar para Contador
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-emerald-600" /> Faturamento Bruto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ 23.400,00</div>
            <p className="text-xs text-slate-500 mt-1">Total de notas emitidas</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <Calculator className="w-4 h-4 mr-2 text-red-500" /> Impostos (Simples Nac. 6%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-R$ 1.404,00</div>
            <p className="text-xs text-slate-500 mt-1">Previsão de DAS</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-slate-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#1E3A8A] flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-[#1E3A8A]" /> Faturamento Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1E3A8A]">R$ 21.996,00</div>
            <p className="text-xs text-[#1E3A8A]/70 mt-1">Livre de impostos incidentes</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl shadow-sm border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle>DRE Mensal Detalhada</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">% s/ Bruto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="font-medium">
                <TableCell>1. RECEITA OPERACIONAL BRUTA</TableCell>
                <TableCell className="text-right text-emerald-600">R$ 23.400,00</TableCell>
                <TableCell className="text-right text-slate-500">100.0%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8 text-slate-600">Assinaturas - Clínicas</TableCell>
                <TableCell className="text-right text-slate-600">R$ 18.000,00</TableCell>
                <TableCell className="text-right text-slate-500">76.9%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8 text-slate-600">Assinaturas - Autônomos</TableCell>
                <TableCell className="text-right text-slate-600">R$ 5.400,00</TableCell>
                <TableCell className="text-right text-slate-500">23.1%</TableCell>
              </TableRow>

              <TableRow className="font-medium border-t border-slate-200 bg-slate-50/50">
                <TableCell>2. DEDUÇÕES DA RECEITA BRUTA</TableCell>
                <TableCell className="text-right text-red-600">-R$ 1.404,00</TableCell>
                <TableCell className="text-right text-slate-500">6.0%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8 text-slate-600">Simples Nacional (6%)</TableCell>
                <TableCell className="text-right text-slate-600">-R$ 1.404,00</TableCell>
                <TableCell className="text-right text-slate-500">6.0%</TableCell>
              </TableRow>

              <TableRow className="font-bold border-t-2 border-slate-200 bg-blue-50/30">
                <TableCell className="text-[#1E3A8A]">
                  3. RECEITA OPERACIONAL LÍQUIDA (1 - 2)
                </TableCell>
                <TableCell className="text-right text-[#1E3A8A]">R$ 21.996,00</TableCell>
                <TableCell className="text-right text-[#1E3A8A]">94.0%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
