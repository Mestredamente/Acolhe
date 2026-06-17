migrate(
  (app) => {
    const anamneses = new Collection({
      name: 'anamneses',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'patient_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('patients').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'approach',
          type: 'select',
          maxSelect: 1,
          values: ['Psicanálise', 'TCC', 'Humanista', 'Gestalt', 'Comportamental', 'Geral'],
        },
        { name: 'completion_date', type: 'date' },
        { name: 'complaint', type: 'text' },
        { name: 'family_history', type: 'text' },
        { name: 'medical_history', type: 'text' },
        { name: 'medications', type: 'text' },
        { name: 'substance_use', type: 'text' },
        { name: 'hospitalizations', type: 'text' },
        { name: 'suicidal_ideation_past', type: 'text' },
        { name: 'suicide_attempts', type: 'text' },
        { name: 'family_psych_history', type: 'text' },
        { name: 'consultation_reason', type: 'text' },
        { name: 'treatment_expectations', type: 'text' },
        { name: 'general_observations', type: 'text' },
        { name: 'tcc_automatic_thoughts', type: 'text' },
        { name: 'tcc_core_beliefs', type: 'text' },
        { name: 'tcc_comorbidities', type: 'text' },
        { name: 'psycho_family_dynamics', type: 'text' },
        { name: 'psycho_dream_reports', type: 'text' },
        { name: 'psycho_dev_history', type: 'text' },
        { name: 'humanist_self_concept', type: 'text' },
        { name: 'humanist_personal_resources', type: 'text' },
        { name: 'humanist_support_network', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_anamneses_patient ON anamneses (patient_id)'],
    })
    app.save(anamneses)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('anamneses')
    app.delete(col)
  },
)
