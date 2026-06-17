import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { PatientForm, PatientFormData } from './PatientForm'
import { createPatient } from '@/services/patients'
import { useToast } from '@/hooks/use-toast'

export function PatientFormDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (data: PatientFormData) => {
    setLoading(true)
    try {
      const dbData = {
        ...data,
        birth_date: data.birth_date ? new Date(data.birth_date).toISOString() : '',
      }
      await createPatient(dbData)
      toast({ title: 'Sucesso', description: 'Paciente cadastrado com sucesso!' })
      setOpen(false)
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao cadastrar.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Novo Paciente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary">Cadastrar Novo Paciente</DialogTitle>
        </DialogHeader>
        <PatientForm onSubmit={handleSubmit} loading={loading} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
