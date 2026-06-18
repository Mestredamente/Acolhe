import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { getEmpresaFiscal, saveEmpresaFiscal } from '@/services/empresa_fiscal'
import pb from '@/lib/pocketbase/client'
import { AddressFormFields, PhoneInput, CpfCnpjInput } from '@/components/ui/masked-inputs'

const schema = z.object({
  id: z.string().optional(),
  nome_aplicativo: z.string().min(1, 'Nome do aplicativo é obrigatório'),
  frase_boas_vindas: z.string().optional(),
  cor_primaria: z.string().optional(),
  cnpj: z.string().min(1, 'CNPJ é obrigatório'),
  razao_social: z.string().min(1, 'Razão Social é obrigatória'),
  nome_fantasia: z.string().optional(),
  inscricao_estadual: z.string().optional(),
  inscricao_municipal: z.string().optional(),
  regime_tributario: z.string().optional(),
  telefone: z.string().optional(),
  email_contato: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  website: z.string().url('URL inválida').or(z.literal('')).optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function PerfilEmpresaTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [currentLogo, setCurrentLogo] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cor_primaria: '#1E3A8A',
    },
  })

  useEffect(() => {
    getEmpresaFiscal().then((data) => {
      if (data) {
        form.reset(data as unknown as FormData)
        if (data.logo_aplicativo) {
          setCurrentLogo(pb.files.getUrl(data, data.logo_aplicativo))
        }
      }
      setLoading(false)
    })
  }, [form])

  const onSubmit = async (data: FormData) => {
    try {
      const payload = new window.FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          payload.append(key, String(value))
        }
      })
      if (logoFile) {
        payload.append('logo_aplicativo', logoFile)
      }

      await saveEmpresaFiscal(data.id || null, payload)

      toast({
        title: 'Perfil salvo',
        description:
          'As configurações da empresa foram atualizadas. Recarregue a página para aplicar o tema em tempo real.',
      })
    } catch (e) {
      toast({
        title: 'Erro ao salvar',
        description: 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      })
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500 text-sm">Carregando...</div>

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle>Identidade Visual (White-Label)</CardTitle>
            <CardDescription>
              Personalize a marca da plataforma para todos os usuários.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border">
              {logoFile ? (
                <img
                  src={URL.createObjectURL(logoFile)}
                  alt="Preview"
                  className="w-16 h-16 object-contain rounded bg-white shadow-sm"
                />
              ) : currentLogo ? (
                <img
                  src={currentLogo}
                  alt="Logo"
                  className="w-16 h-16 object-contain rounded bg-white shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 bg-white border shadow-sm rounded flex items-center justify-center text-slate-300 text-xs">
                  Logo
                </div>
              )}
              <FormItem className="flex-1">
                <FormLabel>Logo da Aplicação (PNG/JPG/SVG)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setLogoFile(e.target.files[0])
                      else setLogoFile(null)
                    }}
                  />
                </FormControl>
                <FormDescription>Recomendado: SVG ou PNG transparente (max 2MB).</FormDescription>
              </FormItem>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome_aplicativo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Plataforma</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: PsicoGestão" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cor_primaria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Primária (Hexadecimal)</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="color"
                          className="w-14 p-1 h-10 cursor-pointer rounded border border-slate-200"
                          {...field}
                          value={field.value || '#1E3A8A'}
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          className="flex-1 font-mono uppercase"
                          placeholder="#1E3A8A"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frase_boas_vindas"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Frase de Boas-vindas (Dashboard)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bem-vindo ao painel de gestão"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados Comerciais e Fiscais</CardTitle>
            <CardDescription>Informações legais da empresa que gerencia o SaaS.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <CpfCnpjInput {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nome_fantasia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Fantasia</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
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
              <FormField
                control={form.control}
                name="inscricao_estadual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscrição Estadual</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inscricao_municipal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscrição Municipal</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <PhoneInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email_contato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail de Contato</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <AddressFormFields form={form} prefix="" label="Endereço da Empresa" />
          </CardContent>
        </Card>

        <div className="flex justify-end border-t border-slate-100 pt-6">
          <Button
            type="submit"
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Form>
  )
}
