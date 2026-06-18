import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Building } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { getEmpresaFiscal, saveEmpresaFiscal } from '@/services/admin'

const formSchema = z.object({
  cnpj: z.string().min(14, 'CNPJ inválido'),
  razao_social: z.string().min(5, 'Razão social muito curta'),
  endereco: z.string().optional(),
  regime_tributario: z.string().optional(),
})

export default function DadosEmpresa() {
  const [recordId, setRecordId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cnpj: '',
      razao_social: '',
      endereco: '',
      regime_tributario: 'Simples Nacional',
    },
  })

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEmpresaFiscal()
        if (data) {
          setRecordId(data.id)
          form.reset({
            cnpj: data.cnpj || '',
            razao_social: data.razao_social || '',
            endereco: data.endereco || '',
            regime_tributario: data.regime_tributario || 'Simples Nacional',
          })
        }
      } catch (error) {
        console.error('Error loading empresa data', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await saveEmpresaFiscal(values, recordId)
      setRecordId(res.id)
      toast({ title: 'Sucesso', description: 'Dados da empresa salvos com sucesso.' })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar os dados da empresa.',
        variant: 'destructive',
      })
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando...</div>

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-[800px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dados da Empresa</h1>
        <p className="text-slate-500 mt-1">Configurações fiscais e legais da plataforma SaaS.</p>
      </div>

      <Card className="rounded-xl shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2 text-[#1E3A8A]" />
            Informações Legais e Fiscais
          </CardTitle>
          <CardDescription>
            Estes dados serão utilizados para a emissão automática de Notas Fiscais aos seus
            assinantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0000-00" className="bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="razao_social"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sua Empresa Tecnologia LTDA"
                          className="bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço Completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
                        className="bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="regime_tributario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regime Tributário</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Selecione o regime..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                        <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                        <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
                <Button
                  type="submit"
                  className="bg-[#1E3A8A] hover:bg-blue-800 text-white min-w-[150px]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Dados
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
