import React, { useMemo, useState } from 'react'
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
import {
  CpfInput,
  PhoneInput,
  CpfCnpjInput,
  AddressFormFields,
} from '@/components/ui/masked-inputs'

export const patientSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    cpf: z.string().optional(),
    birth_date: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').or(z.literal('')).optional(),
    cep: z.string().optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    pais: z.string().optional(),
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
    billing_cep: z.string().optional(),
    billing_logradouro: z.string().optional(),
    billing_numero: z.string().optional(),
    billing_bairro: z.string().optional(),
    billing_cidade: z.string().optional(),
    billing_estado: z.string().optional(),
    billing_pais: z.string().optional(),
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
  const [cpfValid, setCpfValid] = useState(true)
  const [guardianCpfValid, setGuardianCpfValid] = useState(true)
  const [billingIdValid, setBillingIdValid] = useState(true)

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      cpf: defaultValues?.cpf || '',
      birth_date: defaultValues?.birth_date ? defaultValues.birth_date.split(' ')[0] : '',
      phone: defaultValues?.phone || '',
      email: defaultValues?.email || '',
      cep: defaultValues?.cep || '',
      logradouro: defaultValues?.logradouro || '',
      numero: defaultValues?.numero || '',
      bairro: defaultValues?.bairro || '',
      cidade: defaultValues?.cidade || '',
      estado: defaultValues?.estado || '',
      pais: defaultValues?.pais || 'Brasil',
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
      billing_cep: defaultValues?.billing_cep || '',
      billing_logradouro: defaultValues?.billing_logradouro || '',
      billing_numero: defaultValues?.billing_numero || '',
      billing_bairro: defaultValues?.billing_bairro || '',
      billing_cidade: defaultValues?.billing_cidade || '',
      billing_estado: defaultValues?.billing_estado || '',
      billing_pais: defaultValues?.billing_pais || 'Brasil',
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
  const formIsValid = cpfValid && guardianCpfValid && billingIdValid

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
                  <CpfInput {...field} onValidityChange={setCpfValid} />
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
                  <PhoneInput {...field} />
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
        </div>

        <AddressFormFields form={form} prefix="" label="Endereço Residencial" />

        {isMinor && (
          <div className="mt-4 bg-sky-50 border border-sky-200 rounded-lg p-5 space-y-5 animate-fade-in">
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
                      <CpfInput
                        {...field}
                        className="bg-white"
                        onValidityChange={setGuardianCpfValid}
                      />
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
                      <PhoneInput {...field} className="bg-white" />
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
              <FormField
                control={form.control}
                name="guardian_consent_check"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 flex flex-row items-start space-x-3 space-y-0 p-4 border border-sky-200 rounded-md bg-white shadow-sm">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium leading-relaxed">
                        Declaro que sou responsável legal deste menor e autorizo o tratamento
                        psicológico.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <PhoneInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <AddressFormFields form={form} prefix="billing_" label="Faturamento e Cobrança" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="billing_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF/CNPJ (Faturamento)</FormLabel>
                <FormControl>
                  <CpfCnpjInput
                    {...field}
                    onValidityChange={setBillingIdValid}
                    onFetchData={(data: any) => {
                      if (data.nome) form.setValue('name', data.nome)
                      if (data.cep) form.setValue('billing_cep', data.cep)
                      if (data.logradouro) form.setValue('billing_logradouro', data.logradouro)
                      if (data.numero) form.setValue('billing_numero', data.numero)
                      if (data.bairro) form.setValue('billing_bairro', data.bairro)
                      if (data.cidade) form.setValue('billing_cidade', data.cidade)
                      if (data.estado) form.setValue('billing_estado', data.estado)
                      if (data.pais) form.setValue('billing_pais', data.pais)
                    }}
                  />
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
          <Button type="submit" disabled={loading || !formIsValid}>
            {loading ? 'Salvando...' : 'Salvar Dados'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
