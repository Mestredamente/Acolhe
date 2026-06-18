import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { GrupoTerapeutico, createGrupo, updateGrupo } from '@/services/grupos'
import { toast } from '@/components/ui/use-toast'
import { useState, useEffect } from 'react'
import { getConfig } from '@/services/config_clinica'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  tema: z.string().optional(),
  descricao: z.string().optional(),
  limite_participantes: z.coerce.number().min(1).max(15, 'Máximo 15 participantes'),
  data_inicio: z.string().optional(),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
})

export function GrupoFormDialog({
  trigger,
  grupo,
  onSaved,
}: {
  trigger?: React.ReactNode
  grupo?: GrupoTerapeutico
  onSaved?: () => void
}) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: grupo?.nome || '',
      tema: grupo?.tema || '',
      descricao: grupo?.descricao || '',
      limite_participantes: grupo?.limite_participantes || 15,
      data_inicio: grupo?.data_inicio ? grupo.data_inicio.substring(0, 10) : '',
      status: grupo?.status || 'ativo',
    },
  })

  useEffect(() => {
    if (open && !grupo) {
      getConfig(pb.authStore.record?.id || '').then((cfg) => {
        if (cfg?.limite_maximo_participantes_grupo) {
          form.setValue('limite_participantes', cfg.limite_maximo_participantes_grupo)
        }
      })
    }
  }, [open, form, grupo])

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      if (grupo) {
        await updateGrupo(grupo.id, data)
        toast({ title: 'Grupo atualizado' })
      } else {
        await createGrupo({
          ...data,
          id_clinica: user?.id_clinica,
          participantes: [],
        })
        toast({ title: 'Grupo criado' })
      }
      setOpen(false)
      onSaved?.()
    } catch (e) {
      toast({ title: 'Erro ao salvar grupo', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{grupo ? 'Editar Grupo' : 'Novo Grupo'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tema"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="limite_participantes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Participantes</FormLabel>
                    <FormControl>
                      <Input type="number" max="15" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
