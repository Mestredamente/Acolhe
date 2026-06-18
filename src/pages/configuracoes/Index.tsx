import { useEffect, useState, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Settings,
  Save,
  AlertCircle,
  Clock,
  DollarSign,
  UserCircle,
  Building2,
  Blocks,
  CalendarDays,
  Video,
  CheckCircle2,
  Unplug,
  Users,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { getConfig, saveConfig, ConfigClinica } from '@/services/config_clinica'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UsersTab } from './UsersTab'
import { useAuth } from '@/hooks/use-auth'
import { Shield } from 'lucide-react'
import { SecuritySettings } from '@/components/SecuritySettings'
import {
  PhoneInput,
  CurrencyInput,
  CpfCnpjInput,
  AddressFormFields,
} from '@/components/ui/masked-inputs'

const diasSemana = [
  { id: 'segunda', label: 'Segunda-feira' },
  { id: 'terca', label: 'Terça-feira' },
  { id: 'quarta', label: 'Quarta-feira' },
  { id: 'quinta', label: 'Quinta-feira' },
  { id: 'sexta', label: 'Sexta-feira' },
  { id: 'sabado', label: 'Sábado' },
  { id: 'domingo', label: 'Domingo' },
]

const schema = z.object({
  nome_clinica: z.string().optional(),
  crp_psicologo: z.string().optional(),
  documento_identificacao: z.string().optional(),
  endereco_completo: z.string().optional(),
  telefone_ddi: z.string().optional(),
  email_contato: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  pais: z.string().optional(),
  nome_profissional: z.string().optional(),
  abordagem_principal: z.string().optional(),
  tempo_formacao: z.string().optional(),
  texto_apresentacao: z.string().optional(),
  tempo_sessao_minutos: z.coerce.number().min(1).optional(),
  intervalo_consultas_minutos: z.coerce.number().min(0).optional(),
  horario_inicio: z.string().optional(),
  horario_fim: z.string().optional(),
  dias_atendimento: z.array(z.string()).optional(),
  valor_consulta_padrao: z.coerce.number().min(0).optional(),
  metodo_pagamento_preferencial: z.string().optional(),
  texto_recibo_padrao: z.string().optional(),
  google_calendar_active: z.boolean().optional(),
  google_calendar_email: z.string().optional(),
  google_calendar_sync_mode: z.enum(['to_google', 'from_google', 'bidirectional']).optional(),
  google_calendar_name: z.string().optional(),
  zoom_active: z.boolean().optional(),
  zoom_auto_link: z.boolean().optional(),
  whatsapp_phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function Configuracoes() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [openGoogle, setOpenGoogle] = useState(false)
  const [openZoom, setOpenZoom] = useState(false)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)

  const { user } = useAuth()
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dias_atendimento: [],
    },
  })

  useEffect(() => {
    const loadConfig = async () => {
      const userId = pb.authStore.record?.id
      if (userId) {
        const config = await getConfig(userId)
        if (config) {
          form.reset(config as unknown as FormData)
        }
      }
      setLoading(false)
    }
    loadConfig()
  }, [form])

  const onSubmit = async (data: FormData) => {
    try {
      const userId = pb.authStore.record?.id
      if (!userId) return

      const payload = new window.FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) payload.append(key, JSON.stringify(value))
          else payload.append(key, String(value))
        }
      })
      if (signatureFile) {
        payload.append('assinatura_padrao', signatureFile)
      }

      await saveConfig(userId, payload)
      toast({
        title: 'Configurações salvas',
        description: 'Suas preferências foram atualizadas com sucesso.',
      })
    } catch (e) {
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao atualizar as configurações.',
        variant: 'destructive',
      })
    }
  }

  const wHorarioInicio = form.watch('horario_inicio')
  const wHorarioFim = form.watch('horario_fim')
  const wTempoSessao = form.watch('tempo_sessao_minutos') || 50
  const wIntervalo = form.watch('intervalo_consultas_minutos') || 0

  const agendaBlocks = useMemo(() => {
    const blocks: string[] = []
    if (wHorarioInicio && wHorarioFim) {
      let currentMinutes =
        parseInt(wHorarioInicio.split(':')[0]) * 60 + parseInt(wHorarioInicio.split(':')[1])
      const endMinutes =
        parseInt(wHorarioFim.split(':')[0]) * 60 + parseInt(wHorarioFim.split(':')[1])

      while (currentMinutes + wTempoSessao <= endMinutes) {
        const h1 = Math.floor(currentMinutes / 60)
          .toString()
          .padStart(2, '0')
        const m1 = (currentMinutes % 60).toString().padStart(2, '0')
        currentMinutes += wTempoSessao
        const h2 = Math.floor(currentMinutes / 60)
          .toString()
          .padStart(2, '0')
        const m2 = (currentMinutes % 60).toString().padStart(2, '0')
        blocks.push(`${h1}:${m1} - ${h2}:${m2}`)
        currentMinutes += wIntervalo
        if (blocks.length > 50) break
      }
    }
    return blocks
  }, [wHorarioInicio, wHorarioFim, wTempoSessao, wIntervalo])

  if (loading) return null

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-8 h-8 text-cyan-700" />
          Configurações da Clínica
        </h1>
        <p className="text-slate-500 mt-2">
          Gerencie suas preferências profissionais, agenda e informações da clínica.
        </p>
      </div>

      <Alert className="bg-cyan-50/50 border-cyan-200">
        <AlertCircle className="h-4 w-4 text-cyan-700" />
        <AlertTitle className="text-cyan-900">Aviso Importante</AlertTitle>
        <AlertDescription className="text-cyan-800">
          Estas informações serão usadas para gerar documentos, recibos e comunicações com
          pacientes. Mantenha os dados atualizados para garantir o preenchimento automático correto
          em todo o sistema.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="clinica" className="w-full">
            <TabsList className="flex flex-wrap h-auto w-full border-b rounded-none bg-transparent gap-2 pb-2">
              <TabsTrigger
                value="clinica"
                className="py-2 px-4 data-[state=active]:bg-cyan-950 data-[state=active]:text-white rounded-md"
              >
                <Building2 className="w-4 h-4 mr-2" /> Clínica
              </TabsTrigger>
              <TabsTrigger
                value="profissionais"
                className="py-2 px-4 data-[state=active]:bg-cyan-950 data-[state=active]:text-white rounded-md"
              >
                <UserCircle className="w-4 h-4 mr-2" /> Profissional
              </TabsTrigger>
              <TabsTrigger
                value="agenda"
                className="py-2 px-4 data-[state=active]:bg-cyan-950 data-[state=active]:text-white rounded-md"
              >
                <Clock className="w-4 h-4 mr-2" /> Agenda
              </TabsTrigger>
              <TabsTrigger
                value="financeiro"
                className="py-2 px-4 data-[state=active]:bg-cyan-950 data-[state=active]:text-white rounded-md"
              >
                <DollarSign className="w-4 h-4 mr-2" /> Financeiro
              </TabsTrigger>
              <TabsTrigger
                value="integracoes"
                className="py-2 px-4 data-[state=active]:bg-cyan-950 data-[state=active]:text-white rounded-md"
              >
                <Blocks className="w-4 h-4 mr-2" /> Integrações
              </TabsTrigger>
              <TabsTrigger
                value="seguranca"
                className="py-2 px-4 data-[state=active]:bg-cyan-950 data-[state=active]:text-white rounded-md"
              >
                <Shield className="w-4 h-4 mr-2" /> Segurança
              </TabsTrigger>
              {user?.profile === 'admin' && (
                <TabsTrigger
                  value="usuarios"
                  className="py-2 px-4 data-[state=active]:bg-teal-700 data-[state=active]:text-white rounded-md border border-slate-200 ml-auto"
                >
                  <Users className="w-4 h-4 mr-2" /> Usuários e Permissões
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="clinica" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dados da Clínica</CardTitle>
                  <CardDescription>
                    Informações gerais que aparecem em documentos e rodapés.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome_clinica"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Clínica</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Clínica Mente Sã" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="documento_identificacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ / CPF</FormLabel>
                          <FormControl>
                            <CpfCnpjInput {...field} />
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
                            <Input placeholder="contato@clinica.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefone_ddi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone / WhatsApp</FormLabel>
                          <FormControl>
                            <PhoneInput {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <AddressFormFields form={form} prefix="" label="Endereço da Clínica" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profissionais" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Perfil Profissional</CardTitle>
                  <CardDescription>
                    Estes dados serão visíveis no Portal do Paciente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome_profissional"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seu Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Dra. Maria Silva" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="crp_psicologo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CRP</FormLabel>
                          <FormControl>
                            <Input placeholder="00/00000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="abordagem_principal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Abordagem Principal</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Terapia Cognitivo-Comportamental" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tempo_formacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tempo de Formação / Experiência</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 10 anos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="texto_apresentacao"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Apresentação (Bio)</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[100px]"
                              placeholder="Breve texto sobre você para os pacientes lerem..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="md:col-span-2">
                      <FormItem>
                        <FormLabel>Assinatura Manuscrita Padrão</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setSignatureFile(e.target.files[0])
                              } else {
                                setSignatureFile(null)
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Faça upload de uma imagem da sua assinatura. Ela será usada para preencher
                          a tela de assinatura digital.
                        </FormDescription>
                      </FormItem>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agenda" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências de Agenda</CardTitle>
                  <CardDescription>
                    Defina sua grade de horários para preenchimento automático das sessões.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="tempo_sessao_minutos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tempo Padrão da Sessão (minutos)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="intervalo_consultas_minutos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Intervalo entre Sessões (minutos)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="horario_inicio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Início do Expediente</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="horario_fim"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fim do Expediente</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="dias_atendimento"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel>Dias de Atendimento</FormLabel>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {diasSemana.map((dia) => (
                                <FormField
                                  key={dia.id}
                                  control={form.control}
                                  name="dias_atendimento"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={dia.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(dia.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...(field.value || []), dia.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== dia.id,
                                                    ),
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">{dia.label}</FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="whatsapp_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do WhatsApp da Clínica</FormLabel>
                            <FormControl>
                              <PhoneInput {...field} />
                            </FormControl>
                            <FormDescription>Usado nas automações de mensagens.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="google_calendar_active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                            <div className="space-y-0.5 pr-4">
                              <FormLabel className="text-base">
                                Integração Google Calendar
                              </FormLabel>
                              <FormDescription>
                                Sincronize agendamentos automaticamente.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border rounded-xl p-4 bg-slate-50/50">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-600" /> Prévia da Agenda (Um Dia)
                      </h4>
                      <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2">
                        {agendaBlocks.length > 0 ? (
                          agendaBlocks.map((block) => (
                            <div
                              key={block}
                              className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700 shadow-sm flex-1 text-center min-w-[100px]"
                            >
                              {block}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500 italic p-4 text-center w-full">
                            Preencha os horários de início e fim para visualizar os blocos.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financeiro" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financeiro Padrão</CardTitle>
                  <CardDescription>
                    Valores e textos predefinidos para facilitar a geração de lançamentos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="valor_consulta_padrao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Padrão da Sessão (R$)</FormLabel>
                          <FormControl>
                            <CurrencyInput {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="metodo_pagamento_preferencial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Método de Pagamento Principal</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pix">PIX</SelectItem>
                              <SelectItem value="dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="cartao de credito">Cartão de Crédito</SelectItem>
                              <SelectItem value="cartao de debito">Cartão de Débito</SelectItem>
                              <SelectItem value="transferencia">Transferência</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="texto_recibo_padrao"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Texto Padrão para Recibos</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[100px]"
                              placeholder="Ex: Referente a serviços prestados de atendimento psicológico..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Este texto aparecerá automaticamente na emissão de novos recibos.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integracoes" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-cyan-700" />
                    Google Calendar
                  </CardTitle>
                  <CardDescription>
                    Sincronize sua agenda de consultas com o Google Calendar e envie convites.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.watch('google_calendar_email') ? (
                    <>
                      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <div>
                            <p className="font-medium text-slate-900">Conectado como</p>
                            <p className="text-sm text-slate-500">
                              {form.watch('google_calendar_email')}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Último sync: {new Date().toLocaleDateString('pt-BR')} às{' '}
                              {new Date().toLocaleTimeString('pt-BR')} (15 eventos sincronizados)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: 'Sincronização concluída',
                                description: '15 eventos sincronizados.',
                              })
                            }}
                          >
                            Sincronizar agora
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              form.setValue('google_calendar_email', '')
                              form.setValue('google_calendar_active', false)
                            }}
                          >
                            Desconectar
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="google_calendar_sync_mode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Direção da Sincronização</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || 'bidirectional'}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="to_google">
                                    Apenas do Sistema para o Google
                                  </SelectItem>
                                  <SelectItem value="from_google">
                                    Apenas do Google para o Sistema
                                  </SelectItem>
                                  <SelectItem value="bidirectional">
                                    Sincronização Bidirecional
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="google_calendar_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Calendário</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Consultas Clínica" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <Unplug className="w-10 h-10 text-slate-400 mb-3" />
                      <p className="text-slate-600 mb-4">
                        Você ainda não conectou sua conta do Google.
                      </p>
                      <Dialog open={openGoogle} onOpenChange={setOpenGoogle}>
                        <DialogTrigger asChild>
                          <Button type="button" className="bg-cyan-700 hover:bg-cyan-800">
                            Conectar Google Calendar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Conectar ao Google</DialogTitle>
                            <DialogDescription>
                              Autorize o PsicoGestão a acessar seu calendário para sincronizar
                              consultas.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-6 flex flex-col items-center">
                            <img
                              src="https://img.usecurling.com/i?q=google&color=multicolor&shape=fill"
                              alt="Google Logo"
                              className="w-16 h-16 mb-4"
                            />
                            <p className="text-center text-sm text-slate-600">
                              Simulação de login OAuth do Google.
                            </p>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setOpenGoogle(false)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                form.setValue('google_calendar_email', 'psicologo@gmail.com')
                                form.setValue('google_calendar_active', true)
                                form.setValue('google_calendar_sync_mode', 'bidirectional')
                                form.setValue('google_calendar_name', 'Consultas Clínica')
                                setOpenGoogle(false)
                              }}
                            >
                              Confirmar Conexão
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    Zoom Meetings
                  </CardTitle>
                  <CardDescription>
                    Integre com o Zoom para gerar links de reuniões automaticamente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.watch('zoom_active') ? (
                    <>
                      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <div>
                            <p className="font-medium text-slate-900">Conta Zoom Conectada</p>
                            <p className="text-sm text-slate-500">
                              Pronta para gerar links automáticos
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            form.setValue('zoom_active', false)
                            form.setValue('zoom_auto_link', false)
                          }}
                        >
                          Desconectar
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name="zoom_auto_link"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5 pr-4">
                              <FormLabel className="text-base">
                                Gerar link automático para consultas online
                              </FormLabel>
                              <FormDescription>
                                Sempre que agendar uma consulta "Online", um link do Zoom será
                                gerado e salvo.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <Unplug className="w-10 h-10 text-slate-400 mb-3" />
                      <p className="text-slate-600 mb-4">
                        Você ainda não conectou sua conta do Zoom.
                      </p>
                      <Dialog open={openZoom} onOpenChange={setOpenZoom}>
                        <DialogTrigger asChild>
                          <Button type="button" className="bg-blue-600 hover:bg-blue-700">
                            Conectar Zoom
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Conectar ao Zoom</DialogTitle>
                            <DialogDescription>
                              Autorize o PsicoGestão a criar reuniões na sua conta Zoom.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-6 flex flex-col items-center">
                            <img
                              src="https://img.usecurling.com/i?q=zoom&color=blue&shape=fill"
                              alt="Zoom Logo"
                              className="w-16 h-16 mb-4"
                            />
                            <p className="text-center text-sm text-slate-600">
                              Simulação de login OAuth do Zoom.
                            </p>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setOpenZoom(false)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                form.setValue('zoom_active', true)
                                form.setValue('zoom_auto_link', true)
                                setOpenZoom(false)
                              }}
                            >
                              Confirmar Conexão
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seguranca" className="mt-4">
              <SecuritySettings />
            </TabsContent>

            {user?.profile === 'admin' && (
              <TabsContent value="usuarios" className="mt-4">
                <UsersTab />
              </TabsContent>
            )}
          </Tabs>

          <div className="flex justify-end pt-6 border-t border-slate-100">
            <Button type="submit" size="lg" className="bg-cyan-700 hover:bg-cyan-800">
              <Save className="w-4 h-4 mr-2" /> Salvar Configurações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
