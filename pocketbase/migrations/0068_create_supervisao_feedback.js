migrate(
  (app) => {
    const patients = app.findCollectionByNameOrId('patients')
    const evolucoes = app.findCollectionByNameOrId('evolucoes')

    const col = new Collection({
      name: 'supervisao_feedback',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (supervisor_id = @request.auth.id || supervisionado_id = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (supervisor_id = @request.auth.id || supervisionado_id = @request.auth.id)",
      createRule: "@request.auth.id != '' && supervisor_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && supervisor_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && supervisor_id = @request.auth.id",
      fields: [
        {
          name: 'supervisor_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'supervisionado_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'patient_id',
          type: 'relation',
          required: false,
          collectionId: patients.id,
          maxSelect: 1,
        },
        {
          name: 'evolucao_id',
          type: 'relation',
          required: false,
          collectionId: evolucoes.id,
          maxSelect: 1,
        },
        { name: 'texto_feedback', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(col)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('supervisao_feedback'))
    } catch (_) {}
  },
)
