import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export const patientSchema = z.object({
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
  billing_id: z.string().optional(),
  billing_address: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
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
      billing_id: defaultValues?.billing_id || '',
      billing_address: defaultValues?.billing_address || '',
      status: defaultValues?.status || 'active',
    },
  })

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
                <FormLabel>Data de Nascimento</FormLabel>
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
