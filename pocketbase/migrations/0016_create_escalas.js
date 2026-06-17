migrate(
  (app) => {
    const escalas = new Collection({
      name: 'escalas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'text' },
        { name: 'application_instructions', type: 'text' },
        { name: 'questions', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(escalas)

    const respostas = new Collection({
      name: 'respostas_escala',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || patient_id.email = @request.auth.email)",
      viewRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || patient_id.email = @request.auth.email)",
      createRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || patient_id.email = @request.auth.email)",
      updateRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || patient_id.email = @request.auth.email)",
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
          name: 'scale_id',
          type: 'relation',
          required: true,
          collectionId: escalas.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'response_date', type: 'date' },
        { name: 'responses_list', type: 'json' },
        { name: 'total_score', type: 'number' },
        { name: 'ai_interpretation', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pendente', 'respondido'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_respostas_escala_patient ON respostas_escala (patient_id)',
        'CREATE INDEX idx_respostas_escala_status ON respostas_escala (status)',
      ],
    })
    app.save(respostas)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('respostas_escala'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('escalas'))
    } catch (_) {}
  },
)
