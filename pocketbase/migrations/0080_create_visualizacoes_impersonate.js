migrate(
  (app) => {
    const collection = new Collection({
      name: 'visualizacoes_impersonate',
      type: 'base',
      listRule: "@request.auth.profile = 'admin' || usuario_admin_id = @request.auth.id",
      viewRule: "@request.auth.profile = 'admin' || usuario_admin_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && usuario_admin_id = @request.auth.id",
      deleteRule: null,
      fields: [
        {
          name: 'usuario_admin_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'perfil_visualizado',
          type: 'select',
          required: true,
          values: ['admin', 'clinica_owner', 'psicologo', 'secretaria', 'paciente'],
          maxSelect: 1,
        },
        {
          name: 'clinica_id',
          type: 'relation',
          required: false,
          collectionId: 'clinicas',
          maxSelect: 1,
        },
        {
          name: 'patient_id',
          type: 'relation',
          required: false,
          collectionId: 'patients',
          maxSelect: 1,
        },
        { name: 'dados_ficticios', type: 'bool', required: false },
        { name: 'data_inicio', type: 'date', required: true },
        { name: 'data_fim', type: 'date', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('visualizacoes_impersonate')
    app.delete(collection)
  },
)
