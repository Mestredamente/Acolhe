migrate(
  (app) => {
    const assinaturas = app.findCollectionByNameOrId('saas_assinaturas')

    const idClinicaField = assinaturas.fields.getByName('id_clinica')
    if (idClinicaField) {
      idClinicaField.required = false
    }

    if (!assinaturas.fields.getByName('user_id')) {
      assinaturas.fields.add(
        new RelationField({
          name: 'user_id',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
    }
    app.save(assinaturas)

    let planos
    try {
      planos = app.findCollectionByNameOrId('saas_planos')
    } catch (_) {
      planos = new Collection({
        name: 'saas_planos',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.profile = 'admin'",
        updateRule: "@request.auth.profile = 'admin'",
        deleteRule: "@request.auth.profile = 'admin'",
        fields: [
          { name: 'nome', type: 'text', required: true },
          { name: 'descricao', type: 'text', required: false },
          {
            name: 'tipo',
            type: 'select',
            required: true,
            values: ['clinica', 'autonomo'],
            maxSelect: 1,
          },
          { name: 'valor_mensal', type: 'number', required: false },
          { name: 'limite_psicologos', type: 'number', required: false },
          { name: 'limite_pacientes', type: 'number', required: false },
          { name: 'features', type: 'json', required: false },
          {
            name: 'status',
            type: 'select',
            required: true,
            values: ['ativo', 'inativo'],
            maxSelect: 1,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(planos)
    }

    if (!assinaturas.fields.getByName('plano_id')) {
      assinaturas.fields.add(
        new RelationField({
          name: 'plano_id',
          collectionId: planos.id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
      app.save(assinaturas)
    }
  },
  (app) => {
    try {
      const planos = app.findCollectionByNameOrId('saas_planos')
      app.delete(planos)
    } catch (_) {}
  },
)
