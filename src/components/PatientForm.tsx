import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export const patientSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    cpf: z.string().optional(),
    birth_date: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').or(z.literal('')).optional(),
    address: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    guardian_name: z.string().optional(),
    guardian_phone: z.string().optional(),
    guardian_cpf: z.string().optional(),
    guardian_relationship: z.enum(['pai', 'mãe', 'tutor', 'outro', '']).optional(),
    guardian_observations: z.string().optional(),
    guardian_consent_status: z.enum(['assinado', 'pendente']).default('pendente'),
    guardian_consent_check: z.boolean().optional(),
    billing_id: z.string().optional(),
    billing_address: z.string().optional(),
    status: z.enum(['active', 'inactive']).default('active'),
  })
  .superRefine((data, ctx) => {
    if (data.birth_date) {
      const bd = new Date(data.birth_date)
      if (!isNaN(bd.getTime())) {
        const age = Math.floor((new Date().getTime() - bd.getTime()) / 3.15576e10)
        if (age < 18) {
          if (!data.guardian_name)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Obrigatório para menores',
              path: ['guardian_name'],
            })
          if (!data.guardian_cpf)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Obrigatório para menores',
              path: ['guardian_cpf'],
            })
          if (!data.guardian_phone)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Obrigatório para menores',
              path: ['guardian_phone'],
            })
          if (!data.guardian_relationship)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Obrigatório',
              path: ['guardian_relationship'],
            })
          if (!data.guardian_consent_check)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Confirmação obrigatória',
              path: ['guardian_consent_check'],
            })
        }
      }
    }
  })

export type PatientFormData = z.infer<typeof patientSchema>

interface PatientFormProps {
  defaultValues?: Partial<PatientFormData>
  onSubmit: (data: PatientFormData) => void
  loading?: boolean
  onCancel?: () => void
}

export function PatientForm({ defaultValues, onSubmit, loading, onCancel }: PatientFormProps) {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      cpf: defaultValues?.cpf || '',
      birth_date: defaultValues?.birth_date ? defaultValues.birth_date.split(' ')[0] : '',
      phone: defaultValues?.phone || '',
      email: defaultValues?.email || '',
      address: defaultValues?.address || '',
      emergency_contact_name: defaultValues?.emergency_contact_name || '',
      emergency_contact_phone: defaultValues?.emergency_contact_phone || '',
      guardian_name: defaultValues?.guardian_name || '',
      guardian_phone: defaultValues?.guardian_phone || '',
      guardian_cpf: defaultValues?.guardian_cpf || '',
      guardian_relationship: defaultValues?.guardian_relationship || '',
      guardian_observations: defaultValues?.guardian_observations || '',
      guardian_consent_status: defaultValues?.guardian_consent_status || 'pendente',
      guardian_consent_check: defaultValues?.guardian_consent_status === 'assinado' || false,
      billing_id: defaultValues?.billing_id || '',
      billing_address: defaultValues?.billing_address || '',
      status: defaultValues?.status || 'active',
    },
  })

  const birthDateValue = form.watch('birth_date')
  const age = useMemo(() => {
    if (!birthDateValue) return null
    const bd = new Date(birthDateValue)
    if (isNaN(bd.getTime())) return null
    return Math.floor((new Date().getTime() - bd.getTime()) / 3.15576e10)
  }, [birthDateValue])

  const isMinor = age !== null && age < 18

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birth_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Data de Nascimento{' '}
                  {age !== null && <span className="text-primary font-semibold">({age} anos)</span>}
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="+55 11 90000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isMinor && (
            <div className="md:col-span-2 mt-2 bg-sky-50 border border-sky-200 rounded-lg p-5 space-y-5 animate-fade-in">
              <h3 className="font-semibold text-sky-900 border-b border-sky-200 pb-2">
                Menor de Idade — Dados do Responsável Legal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guardian_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Responsável *</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guardian_cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF do Responsável *</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guardian_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (DDI) *</FormLabel>
                      <FormControl>
                        <Input placeholder="+55 11 90000-0000" {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guardian_relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grau de Parentesco *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pai">Pai</SelectItem>
                          <SelectItem value="mãe">Mãe</SelectItem>
                          <SelectItem value="tutor">Tutor Legal</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="guardian_observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações sobre o Responsável</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="guardian_consent_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status do Consentimento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente de Assinatura</SelectItem>
                            <SelectItem value="assinado">Já Assinado / Coletado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="guardian_consent_check"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-sky-200 rounded-md bg-white shadow-sm">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium leading-relaxed">
                            Declaro que sou responsável legal deste menor e autorizo o tratamento
                            psicológico. Li e aceito os termos de privacidade e o código de ética do
                            CFP. *
                          </FormLabel>
                          <FormMessage />
                          <div className="pt-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-xs text-sky-600 hover:text-sky-800"
                                >
                                  Visualizar termo completo
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="text-lg">
                                    Termo de Consentimento e Privacidade
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="text-sm text-slate-700 space-y-4 max-h-[60vh] overflow-y-auto pr-2 leading-relaxed">
                                  <p>
                                    Este documento visa registrar o consentimento livre, informado e
                                    esclarecido do responsável legal para o tratamento psicológico
                                    do menor, em conformidade com o Estatuto da Criança e do
                                    Adolescente (ECA) e a Lei Geral de Proteção de Dados Pessoais
                                    (LGPD).
                                  </p>
                                  <p>
                                    1. <strong>Do Sigilo e Confidencialidade:</strong> O atendimento
                                    psicológico do menor é resguardado pelo sigilo profissional,
                                    conforme o Código de Ética do Conselho Federal de Psicologia
                                    (CFP). Informações essenciais serão compartilhadas com os
                                    responsáveis apenas quando necessário para a proteção e
                                    continuidade do tratamento do menor.
                                  </p>
                                  <p>
                                    2. <strong>Do Tratamento de Dados:</strong> Os dados pessoais e
                                    sensíveis serão tratados exclusivamente para fins clínicos,
                                    mantidos em segurança e não serão compartilhados com terceiros
                                    sem autorização expressa, exceto em casos previstos em lei.
                                  </p>
                                  <p>
                                    3. <strong>Da Participação Familiar:</strong> Entendo que minha
                                    colaboração e participação ativa, quando solicitada, são
                                    fundamentais para o desenvolvimento do processo terapêutico.
                                  </p>
                                  <p>
                                    Ao marcar a caixa de seleção, declaro ter lido e concordado com
                                    as condições descritas acima.
                                  </p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="md:col-span-2 mt-4">
            <h3 className="font-semibold text-primary border-b pb-2">Contato de Emergência</h3>
          </div>
          <FormField
            control={form.control}
            name="emergency_contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome (Emergência)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emergency_contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone (Emergência)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2 mt-4">
            <h3 className="font-semibold text-primary border-b pb-2">Faturamento</h3>
          </div>
          <FormField
            control={form.control}
            name="billing_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF/CNPJ (Faturamento)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billing_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço de Faturamento</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Dados'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
