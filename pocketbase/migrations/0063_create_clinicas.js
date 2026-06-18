migrate(
  (app) => {
    const clinicas = new Collection({
      name: 'clinicas',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || id = @request.auth.id_clinica)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || id = @request.auth.id_clinica)",
      createRule: "@request.auth.profile = 'admin'",
      updateRule: "@request.auth.profile = 'admin'",
      deleteRule: "@request.auth.profile = 'admin'",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'cnpj', type: 'text' },
        { name: 'telefone', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'cep', type: 'text' },
        { name: 'logradouro', type: 'text' },
        { name: 'numero', type: 'text' },
        { name: 'bairro', type: 'text' },
        { name: 'cidade', type: 'text' },
        { name: 'estado', type: 'text' },
        { name: 'pais', type: 'text' },
        { name: 'status', type: 'select', values: ['ativa', 'inativa'], maxSelect: 1 },
        { name: 'admin_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(clinicas)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.add(
      new RelationField({
        name: 'id_clinica',
        collectionId: clinicas.id,
        maxSelect: 1,
      }),
    )
    app.save(users)

    const patients = app.findCollectionByNameOrId('patients')
    patients.fields.add(
      new RelationField({
        name: 'id_clinica',
        collectionId: clinicas.id,
        maxSelect: 1,
      }),
    )
    app.save(patients)
  },
  (app) => {
    const patients = app.findCollectionByNameOrId('patients')
    patients.fields.removeByName('id_clinica')
    app.save(patients)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('id_clinica')
    app.save(users)

    const clinicas = app.findCollectionByNameOrId('clinicas')
    app.delete(clinicas)
  },
)
