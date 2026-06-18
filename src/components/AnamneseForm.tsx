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
import { Save, X, AlertCircle } from 'lucide-react'
import { Anamnese } from '@/services/anamneses'
import { isRecordLocked } from '@/lib/compliance'

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
  const isLocked = isRecordLocked(initialData.created)

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-6 animate-fade-in">
      {isLocked && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md flex items-start gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Prontuário fechado.</strong> Edição bloqueada após 24 horas do registro.
            Conforme CFP.
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Abordagem Clínica</Label>
        <Select
          value={watchApproach}
          onValueChange={(val) => form.setValue('approach', val)}
          disabled={isLocked}
        >
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
          <Textarea {...form.register('complaint')} disabled={isLocked} />
        </div>
        <div className="space-y-2">
          <Label>Motivo da Consulta</Label>
          <Textarea {...form.register('consultation_reason')} disabled={isLocked} />
        </div>
        <div className="space-y-2">
          <Label>Expectativas do Tratamento</Label>
          <Textarea {...form.register('treatment_expectations')} disabled={isLocked} />
        </div>
        <div className="space-y-2">
          <Label>Histórico Familiar</Label>
          <Textarea {...form.register('family_history')} disabled={isLocked} />
        </div>
        <div className="space-y-2">
          <Label>Histórico Médico</Label>
          <Textarea {...form.register('medical_history')} disabled={isLocked} />
        </div>
        <div className="space-y-2">
          <Label>Antecedentes Psiquiátricos Familiares</Label>
          <Textarea {...form.register('family_psych_history')} disabled={isLocked} />
        </div>
        <div className="space-y-2">
          <Label>Medicamentos</Label>
          <Textarea {...form.register('medications')} disabled={isLocked} />
        </div>
        <div className="space-y-2">
          <Label>Uso de Substâncias</Label>
          <Textarea {...form.register('substance_use')} disabled={isLocked} />
        </div>
        <div className="space-y-2">
          <Label>Internações</Label>
          <Textarea {...form.register('hospitalizations')} disabled={isLocked} />
        </div>
        <div className="space-y-2">
          <Label>Ideação Suicida Passada</Label>
          <Textarea {...form.register('suicidal_ideation_past')} disabled={isLocked} />
        </div>
        <div className="space-y-2">
          <Label>Tentativas de Suicídio</Label>
          <Textarea {...form.register('suicide_attempts')} disabled={isLocked} />
        </div>
      </div>

      {watchApproach === 'TCC' && (
        <div className="space-y-4 p-4 border rounded-md bg-muted/20">
          <h3 className="font-semibold">Campos TCC</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pensamentos Automáticos</Label>
              <Textarea {...form.register('tcc_automatic_thoughts')} disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>Crenças Nucleares</Label>
              <Textarea {...form.register('tcc_core_beliefs')} disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>Comorbidades</Label>
              <Textarea {...form.register('tcc_comorbidities')} disabled={isLocked} />
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
              <Textarea {...form.register('psycho_family_dynamics')} disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>Relatos de Sonhos</Label>
              <Textarea {...form.register('psycho_dream_reports')} disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>História de Desenvolvimento</Label>
              <Textarea {...form.register('psycho_dev_history')} disabled={isLocked} />
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
              <Textarea {...form.register('humanist_self_concept')} disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>Recursos Pessoais</Label>
              <Textarea {...form.register('humanist_personal_resources')} disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>Rede de Apoio</Label>
              <Textarea {...form.register('humanist_support_network')} disabled={isLocked} />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Observações Gerais</Label>
        <Textarea {...form.register('general_observations')} disabled={isLocked} />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" /> {isLocked ? 'Voltar' : 'Cancelar'}
        </Button>
        {!isLocked && (
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" /> Salvar Anamnese
          </Button>
        )}
      </div>
    </form>
  )
}
