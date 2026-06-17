migrate(
  (app) => {
    const usersId = '_pb_users_auth_'
    const patientsId = app.findCollectionByNameOrId('patients').id

    const col = new Collection({
      name: 'mensagens',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (sender_id = @request.auth.id || recipient_id = @request.auth.id || patient_id.user_id = @request.auth.id || patient_id.email = @request.auth.email)",
      viewRule:
        "@request.auth.id != '' && (sender_id = @request.auth.id || recipient_id = @request.auth.id || patient_id.user_id = @request.auth.id || patient_id.email = @request.auth.email)",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && recipient_id = @request.auth.id",
      deleteRule: null,
      fields: [
        {
          name: 'sender_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'recipient_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'patient_id',
          type: 'relation',
          required: true,
          collectionId: patientsId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'content', type: 'text', required: true },
        {
          name: 'read_status',
          type: 'select',
          values: ['lida', 'nao_lida'],
          required: true,
          maxSelect: 1,
        },
        {
          name: 'sender_type',
          type: 'select',
          values: ['psicologo', 'paciente'],
          required: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_mensagens_patient ON mensagens (patient_id)',
        'CREATE INDEX idx_mensagens_created ON mensagens (created)',
      ],
    })
    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('mensagens')
      app.delete(col)
    } catch (_) {}
  },
)
