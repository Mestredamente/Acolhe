import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Save, X } from 'lucide-react'
import { Anamnese } from '@/services/anamneses'

interface Props {
  initialData: Partial<Anamnese>
  onSave: (data: Partial<Anamnese>) => void
  onCancel: () => void
}

export function AnamneseForm({ initialData, onSave, onCancel }: Props) {
  const form = useForm<Partial<Anamnese>>({
    defaultValues: { approach: 'Geral', ...initialData },
  })
  const watchApproach = form.watch('approach')

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label>Abordagem Clínica</Label>
        <Select value={watchApproach} onValueChange={(val) => form.setValue('approach', val)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a abordagem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Psicanálise">Psicanálise</SelectItem>
            <SelectItem value="TCC">TCC</SelectItem>
            <SelectItem value="Humanista">Humanista</SelectItem>
            <SelectItem value="Gestalt">Gestalt</SelectItem>
            <SelectItem value="Comportamental">Comportamental</SelectItem>
            <SelectItem value="Geral">Geral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Queixa Principal</Label>
          <Textarea {...form.register('complaint')} />
        </div>
        <div className="space-y-2">
          <Label>Motivo da Consulta</Label>
          <Textarea {...form.register('consultation_reason')} />
        </div>
        <div className="space-y-2">
          <Label>Expectativas do Tratamento</Label>
          <Textarea {...form.register('treatment_expectations')} />
        </div>
        <div className="space-y-2">
          <Label>Histórico Familiar</Label>
          <Textarea {...form.register('family_history')} />
        </div>
        <div className="space-y-2">
          <Label>Histórico Médico</Label>
          <Textarea {...form.register('medical_history')} />
        </div>
        <div className="space-y-2">
          <Label>Antecedentes Psiquiátricos Familiares</Label>
          <Textarea {...form.register('family_psych_history')} />
        </div>
        <div className="space-y-2">
          <Label>Medicamentos</Label>
          <Textarea {...form.register('medications')} />
        </div>
        <div className="space-y-2">
          <Label>Uso de Substâncias</Label>
          <Textarea {...form.register('substance_use')} />
        </div>
        <div className="space-y-2">
          <Label>Internações</Label>
          <Textarea {...form.register('hospitalizations')} />
        </div>
        <div className="space-y-2">
          <Label>Ideação Suicida Passada</Label>
          <Textarea {...form.register('suicidal_ideation_past')} />
        </div>
        <div className="space-y-2">
          <Label>Tentativas de Suicídio</Label>
          <Textarea {...form.register('suicide_attempts')} />
        </div>
      </div>

      {watchApproach === 'TCC' && (
        <div className="space-y-4 p-4 border rounded-md bg-muted/20">
          <h3 className="font-semibold">Campos TCC</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pensamentos Automáticos</Label>
              <Textarea {...form.register('tcc_automatic_thoughts')} />
            </div>
            <div className="space-y-2">
              <Label>Crenças Nucleares</Label>
              <Textarea {...form.register('tcc_core_beliefs')} />
            </div>
            <div className="space-y-2">
              <Label>Comorbidades</Label>
              <Textarea {...form.register('tcc_comorbidities')} />
            </div>
          </div>
        </div>
      )}

      {watchApproach === 'Psicanálise' && (
        <div className="space-y-4 p-4 border rounded-md bg-muted/20">
          <h3 className="font-semibold">Campos Psicanálise</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dinâmica Familiar</Label>
              <Textarea {...form.register('psycho_family_dynamics')} />
            </div>
            <div className="space-y-2">
              <Label>Relatos de Sonhos</Label>
              <Textarea {...form.register('psycho_dream_reports')} />
            </div>
            <div className="space-y-2">
              <Label>História de Desenvolvimento</Label>
              <Textarea {...form.register('psycho_dev_history')} />
            </div>
          </div>
        </div>
      )}

      {watchApproach === 'Humanista' && (
        <div className="space-y-4 p-4 border rounded-md bg-muted/20">
          <h3 className="font-semibold">Campos Humanista</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Autoconceito</Label>
              <Textarea {...form.register('humanist_self_concept')} />
            </div>
            <div className="space-y-2">
              <Label>Recursos Pessoais</Label>
              <Textarea {...form.register('humanist_personal_resources')} />
            </div>
            <div className="space-y-2">
              <Label>Rede de Apoio</Label>
              <Textarea {...form.register('humanist_support_network')} />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Observações Gerais</Label>
        <Textarea {...form.register('general_observations')} />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" /> Cancelar
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" /> Salvar Anamnese
        </Button>
      </div>
    </form>
  )
}
