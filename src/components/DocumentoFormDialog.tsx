import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createDocumento, updateDocumento, Documento } from '@/services/documentos'
import pb from '@/lib/pocketbase/client'
import { getConfig, ConfigClinica } from '@/services/config_clinica'
import { useState } from 'react'

const schema = z.object({
  file_name: z.string().min(1, 'Nome do arquivo é obrigatório'),
  doc_type: z.string().min(1, 'Tipo é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['privado', 'visivel_paciente', 'pendente_assinatura']),
})

type FormData = z.infer<typeof schema>

export function DocumentoFormDialog({
  open,
  onOpenChange,
  documento,
  patientId,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  documento: Documento | null
  patientId: string
  onSaved: () => void
}) {
  const { toast } = useToast()
  const [config, setConfig] = useState<ConfigClinica | null>(null)

  const docType = form.watch('doc_type')

  useEffect(() => {
    if (docType === 'termo_consentimento_lgpd' && !form.getValues('description') && config) {
      const template = `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (LGPD)

Clínica: ${config.nome_clinica || '________________'}
Psicólogo(a): ${config.nome_profissional || '________________'} - CRP: ${config.crp_psicologo || '_________'}

Autorizo a coleta e armazenamento de meus dados sensíveis em prontuário, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), para os fins exclusivos de atendimento psicológico.

Declaro estar ciente de que o sigilo profissional será rigorosamente mantido, salvo nas exceções previstas pelo Código de Ética Profissional do Psicólogo.`
      form.setValue('description', template)
    }
  }, [docType, config, form])

  useEffect(() => {
    if (open) {
      getConfig(pb.authStore.record?.id || '')
        .then(setConfig)
        .catch(console.error)
    }
  }, [open])

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      file_name: '',
      doc_type: '',
      description: '',
      status: 'privado',
    },
  })

  useEffect(() => {
    if (open) {
      if (documento) {
        form.reset({
          file_name: documento.file_name,
          doc_type: documento.doc_type,
          description: documento.description || '',
          status: documento.status,
        })
      } else {
        form.reset({
          file_name: '',
          doc_type: '',
          description: '',
          status: 'privado',
        })
      }
    }
  }, [open, documento, form])

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        patient_id: patientId,
        user_id: pb.authStore.record?.id,
      }

      if (documento) {
        await updateDocumento(documento.id, payload)
        toast({ title: 'Sucesso', description: 'Documento atualizado.' })
      } else {
        await createDocumento(payload)
        toast({ title: 'Sucesso', description: 'Documento cadastrado.' })
      }
      onSaved()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar o documento.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{documento ? 'Editar Documento' : 'Novo Documento'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Arquivo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Laudo Psicológico - 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doc_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="laudo">Laudo</SelectItem>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="atestado">Atestado</SelectItem>
                      <SelectItem value="contrato">Contrato</SelectItem>
                      <SelectItem value="termo_consentimento_lgpd">
                        Termo de Consentimento LGPD
                      </SelectItem>
                      <SelectItem value="anamnese">Anamnese</SelectItem>
                      <SelectItem value="evolucao">Evolução</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status de Acesso</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o acesso" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="privado">Privado (Apenas você)</SelectItem>
                      <SelectItem value="visivel_paciente">Visível para o Paciente</SelectItem>
                      <SelectItem value="pendente_assinatura">Pendente de Assinatura</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo / Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes ou conteúdo do documento"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
