import { Anamnese } from '@/services/anamneses'

export function AnamneseView({ anamnese }: { anamnese: Anamnese }) {
  const Field = ({ label, value }: { label: string; value?: string }) => (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm bg-muted/20 p-3 rounded-md border min-h-[44px] whitespace-pre-wrap">
        {value || '-'}
      </p>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Abordagem</p>
          <p className="text-sm font-medium">{anamnese.approach || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Preenchido em</p>
          <p className="text-sm">
            {anamnese.completion_date
              ? new Date(anamnese.completion_date).toLocaleDateString('pt-BR')
              : '-'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Queixa Principal" value={anamnese.complaint} />
          <Field label="Motivo da Consulta" value={anamnese.consultation_reason} />
          <Field label="Expectativas do Tratamento" value={anamnese.treatment_expectations} />
          <Field label="Histórico Familiar" value={anamnese.family_history} />
          <Field label="Histórico Médico" value={anamnese.medical_history} />
          <Field
            label="Antecedentes Psiquiátricos Familiares"
            value={anamnese.family_psych_history}
          />
          <Field label="Medicamentos" value={anamnese.medications} />
          <Field label="Uso de Substâncias" value={anamnese.substance_use} />
          <Field label="Internações" value={anamnese.hospitalizations} />
          <Field label="Ideação Suicida Passada" value={anamnese.suicidal_ideation_past} />
          <Field label="Tentativas de Suicídio" value={anamnese.suicide_attempts} />
        </div>

        {anamnese.approach === 'TCC' && (
          <div className="space-y-4 p-5 border rounded-md bg-cyan-50/50 dark:bg-cyan-950/20">
            <h3 className="font-semibold text-cyan-800 dark:text-cyan-400">Campos TCC</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Pensamentos Automáticos" value={anamnese.tcc_automatic_thoughts} />
              <Field label="Crenças Nucleares" value={anamnese.tcc_core_beliefs} />
              <Field label="Comorbidades" value={anamnese.tcc_comorbidities} />
            </div>
          </div>
        )}

        {anamnese.approach === 'Psicanálise' && (
          <div className="space-y-4 p-5 border rounded-md bg-cyan-50/50 dark:bg-cyan-950/20">
            <h3 className="font-semibold text-cyan-800 dark:text-cyan-400">Campos Psicanálise</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Dinâmica Familiar" value={anamnese.psycho_family_dynamics} />
              <Field label="Relatos de Sonhos" value={anamnese.psycho_dream_reports} />
              <Field label="História de Desenvolvimento" value={anamnese.psycho_dev_history} />
            </div>
          </div>
        )}

        {anamnese.approach === 'Humanista' && (
          <div className="space-y-4 p-5 border rounded-md bg-cyan-50/50 dark:bg-cyan-950/20">
            <h3 className="font-semibold text-cyan-800 dark:text-cyan-400">Campos Humanista</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Autoconceito" value={anamnese.humanist_self_concept} />
              <Field label="Recursos Pessoais" value={anamnese.humanist_personal_resources} />
              <Field label="Rede de Apoio" value={anamnese.humanist_support_network} />
            </div>
          </div>
        )}

        <Field label="Observações Gerais" value={anamnese.general_observations} />
      </div>
    </div>
  )
}
