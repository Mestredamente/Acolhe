migrate(
  (app) => {
    const collection = new Collection({
      name: 'saas_assinaturas',
      type: 'base',
      listRule: "@request.auth.profile = 'admin'",
      viewRule: "@request.auth.profile = 'admin'",
      createRule: "@request.auth.profile = 'admin'",
      updateRule: "@request.auth.profile = 'admin'",
      deleteRule: "@request.auth.profile = 'admin'",
      fields: [
        {
          name: 'id_clinica',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('clinicas').id,
          maxSelect: 1,
        },
        {
          name: 'plano',
          type: 'select',
          required: true,
          values: ['free', 'profissional', 'clinica', 'corporativo'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativo', 'trial', 'suspenso', 'cancelado'],
          maxSelect: 1,
        },
        { name: 'data_inicio', type: 'date', required: false },
        { name: 'data_renovacao', type: 'date', required: false },
        { name: 'valor_mensal', type: 'number', required: false },
        { name: 'limite_psicologos', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('saas_assinaturas')
    app.delete(collection)
  },
)
