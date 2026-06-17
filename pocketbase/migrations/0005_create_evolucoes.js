migrate(
  (app) => {
    const evolucoes = new Collection({
      name: 'evolucoes',
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
          name: 'appointment_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('appointments').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'session_date', type: 'date', required: true },
        { name: 'content', type: 'text' },
        { name: 'ai_summary', type: 'text' },
        { name: 'is_signed', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_evolucoes_patient_date ON evolucoes (patient_id, session_date DESC)',
      ],
    })
    app.save(evolucoes)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('evolucoes')
    app.delete(col)
  },
)
