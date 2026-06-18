import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Download } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { getEmpresaFiscal, saveEmpresaFiscal, EmpresaFiscal } from '@/services/empresa_fiscal'
import { getAuditLogs, createAuditLog, AuditLog } from '@/services/audit_logs'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { AddressFormFields } from '@/components/ui/masked-inputs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

const schema = z.object({
  id: z.string().optional(),
  logo_aplicativo: z.any().optional(),
  nome_aplicativo: z.string().min(1, 'Obrigatório'),
  cor_primaria: z.string().min(1, 'Obrigatória'),
  frase_boas_vindas: z.string().optional(),
  cnpj: z.string().min(1, 'Obrigatório'),
  razao_social: z.string().min(1, 'Obrigatória'),
  nome_fantasia: z.string().optional(),
  inscricao_estadual: z.string().optional(),
  inscricao_municipal: z.string().optional(),
  regime_tributario: z.string().optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  telefone: z.string().optional(),
  email_contato: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  website: z.string().url('URL inválida').or(z.literal('')).optional(),
  timezone: z.string().optional(),
  moeda: z.string().optional(),
  idioma: z.string().optional(),
  dominio_personalizado: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function PerfilEmpresaTab() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome_aplicativo: '',
      cor_primaria: '#1E3A5F',
      frase_boas_vindas: '',
      cnpj: '',
      razao_social: '',
      nome_fantasia: '',
      inscricao_estadual: '',
      inscricao_municipal: '',
      regime_tributario: '',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      telefone: '',
      email_contato: '',
      website: '',
      timezone: '',
      moeda: '',
      idioma: '',
      dominio_personalizado: '',
    },
  })

  useEffect(() => {
    getEmpresaFiscal().then((data) => {
      if (data) {
        const safeData = { ...data }
        Object.keys(safeData).forEach((key) => {
          if (
            safeData[key as keyof typeof safeData] === null ||
            safeData[key as keyof typeof safeData] === undefined
          ) {
            safeData[key as keyof typeof safeData] = ''
          }
        })
        form.reset(safeData as any)
      }
    })
    loadLogs()
  }, [form])

  const loadLogs = async () => setLogs(await getAuditLogs("tabela_afetada = 'empresa_fiscal'"))

  const onSubmit = async (data: FormData) => {
    try {
      const oldData = data.id ? await getEmpresaFiscal() : null
      const payload = new window.FormData()

      Object.entries(data).forEach(([k, v]) => {
        if (v != null && k !== 'logo_aplicativo') payload.append(k, String(v))
      })
      if (logoFile) payload.append('logo_aplicativo', logoFile)

      const saved = await saveEmpresaFiscal(data.id || null, payload)
      form.setValue('id', saved.id)

      if (oldData) {
        const changes = Object.keys(data)
          .filter(
            (k) =>
              k !== 'logo_aplicativo' &&
              data[k as keyof FormData] !== oldData[k as keyof EmpresaFiscal],
          )
          .map((k) => ({
            field: k,
            old: String(oldData[k as keyof EmpresaFiscal] || ''),
            new: String(data[k as keyof FormData] || ''),
          }))

        if (changes.length > 0) {
          await createAuditLog({
            usuario_id: pb.authStore.record?.id,
            acao: 'atualizacao',
            tabela_afetada: 'empresa_fiscal',
            registro_id: saved.id,
            descricao: JSON.stringify(changes),
          })
          loadLogs()
        }
      }
      toast({ title: 'Configurações da empresa salvas com sucesso' })
    } catch (e) {
      toast({ title: 'Erro ao salvar configurações', variant: 'destructive' })
    }
  }

  const exportLogs = () => {
    const rows = ['Data,Usuário,Ação/Campo,Valor Anterior,Novo Valor']
    logs.forEach((log) => {
      let parsed: any[] = []
      try {
        parsed = JSON.parse(log.descricao)
      } catch {
        /* intentionally ignored */
      }
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].field) {
        parsed.forEach((c) =>
          rows.push(
            `${format(new Date(log.created), 'dd/MM/yyyy HH:mm')},${log.expand?.usuario_id?.name || 'Sistema'},${c.field},"${c.old}","${c.new}"`,
          ),
        )
      } else {
        rows.push(
          `${format(new Date(log.created), 'dd/MM/yyyy HH:mm')},${log.expand?.usuario_id?.name || 'Sistema'},${log.acao},,"${log.descricao}"`,
        )
      }
    })
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'auditoria-empresa.csv'
    a.click()
  }

  const SField = ({ name, label, options }: any) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || undefined}>
            <FormControl>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o: any) => (
                <SelectItem key={o.v} value={o.v}>
                  {o.l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  const IField = ({ name, label, placeholder = 'Não configurado', disabled }: any) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              disabled={disabled}
              {...(disabled ? { value: placeholder } : { ...field, value: field.value ?? '' })}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identidade Visual</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 flex items-center gap-4 bg-slate-50 p-4 rounded-lg border">
                {logoFile ? (
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Logo"
                    className="w-16 h-16 object-contain rounded bg-white shadow-sm"
                  />
                ) : form.watch('logo_aplicativo') &&
                  typeof form.watch('logo_aplicativo') === 'string' ? (
                  <img
                    src={pb.files.getUrl(
                      { collectionId: 'empresa_fiscal', id: form.getValues('id') as string },
                      form.watch('logo_aplicativo') as string,
                    )}
                    alt="Logo"
                    className="w-16 h-16 object-contain rounded bg-white shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white border shadow-sm rounded flex items-center justify-center text-xs text-slate-300">
                    Logo
                  </div>
                )}
                <FormItem className="flex-1">
                  <FormLabel>Logo do Aplicativo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                  </FormControl>
                </FormItem>
              </div>
              <IField name="nome_aplicativo" label="Nome do Aplicativo (Público)" />
              <FormField
                control={form.control}
                name="cor_primaria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Primária</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-12 h-10 p-1 cursor-pointer"
                          {...field}
                          value={field.value ?? '#1E3A5F'}
                        />
                        <Input
                          type="text"
                          placeholder="#1E3A5F"
                          className="flex-1"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <IField name="frase_boas_vindas" label="Mensagem de Boas-vindas do Dashboard" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados Fiscais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <IField name="cnpj" label="CNPJ" />
              <IField name="razao_social" label="Razão Social" />
              <IField name="nome_fantasia" label="Nome Fantasia" />
              <IField name="inscricao_estadual" label="Inscrição Estadual" />
              <IField name="inscricao_municipal" label="Inscrição Municipal" />
              <SField
                name="regime_tributario"
                label="Regime Tributário"
                options={[
                  { v: 'Simples Nacional', l: 'Simples Nacional' },
                  { v: 'Lucro Presumido', l: 'Lucro Presumido' },
                  { v: 'Lucro Real', l: 'Lucro Real' },
                ]}
              />
              <div className="md:col-span-2">
                <AddressFormFields form={form} prefix="" label="" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <IField name="telefone" label="Telefone" />
              <IField name="email_contato" label="E-mail de Contato" />
              <IField name="website" label="Website" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personalização do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SField
                name="timezone"
                label="Fuso Horário (Timezone)"
                options={[
                  { v: 'America/Sao_Paulo', l: 'Horário de Brasília (BRT)' },
                  { v: 'America/Manaus', l: 'Horário do Amazonas (AMT)' },
                  { v: 'America/Belem', l: 'Horário do Pará (BRT)' },
                  { v: 'America/Fortaleza', l: 'Horário do Nordeste (BRT)' },
                  { v: 'America/Rio_Branco', l: 'Horário do Acre (ACT)' },
                  { v: 'America/Boa_Vista', l: 'Horário de Roraima (AMT)' },
                  { v: 'America/Cuiaba', l: 'Horário do Mato Grosso (AMT)' },
                ]}
              />
              <IField
                name="dominio_personalizado"
                label="Domínio Personalizado"
                placeholder="ex: app.minhaempresa.com.br"
              />
              <IField
                name="moeda"
                label="Moeda Padrão"
                disabled
                placeholder="R$ (Real Brasileiro)"
              />
              <IField
                name="idioma"
                label="Idioma Padrão"
                disabled
                placeholder="Português (Brasil)"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Form>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Auditoria de Alterações</CardTitle>
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="w-4 h-4 mr-2" /> Exportar Logs
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Campo / Ação</TableHead>
                <TableHead>Valor Anterior</TableHead>
                <TableHead>Novo Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-4">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  let parsed: any[] = []
                  try {
                    parsed = JSON.parse(log.descricao)
                  } catch {
                    /* intentionally ignored */
                  }
                  if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].field) {
                    return parsed.map((c, i) => (
                      <TableRow key={`${log.id}-${i}`}>
                        <TableCell>{format(new Date(log.created), 'dd/MM/yyyy HH:mm')}</TableCell>
                        <TableCell>{log.expand?.usuario_id?.name || 'Sistema'}</TableCell>
                        <TableCell>{c.field}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-slate-500">
                          {c.old}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-emerald-600">
                          {c.new}
                        </TableCell>
                      </TableRow>
                    ))
                  }
                  return (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.created), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell>{log.expand?.usuario_id?.name || 'Sistema'}</TableCell>
                      <TableCell>{log.acao}</TableCell>
                      <TableCell colSpan={2} className="text-slate-500 truncate max-w-[300px]">
                        {log.descricao}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
