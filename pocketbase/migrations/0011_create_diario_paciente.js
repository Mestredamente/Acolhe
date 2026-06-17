migrate(
  (app) => {
    const diarioCol = new Collection({
      name: 'diario_paciente',
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
          maxSelect: 1,
        },
        {
          name: 'patient_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('patients').id,
          maxSelect: 1,
        },
        { name: 'entry_date', type: 'date', required: true },
        { name: 'content', type: 'text', required: true },
        {
          name: 'sentiment',
          type: 'select',
          values: ['feliz', 'neutro', 'triste', 'ansioso', 'irritado', 'esperançoso'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(diarioCol)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('diario_paciente')
    app.delete(col)
  },
)
