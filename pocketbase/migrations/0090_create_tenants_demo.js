migrate(
  (app) => {
    const tenants = new Collection({
      name: 'tenants_demo',
      type: 'base',
      listRule: "@request.auth.profile = 'admin'",
      viewRule: "@request.auth.profile = 'admin'",
      createRule: "@request.auth.profile = 'admin'",
      updateRule: "@request.auth.profile = 'admin'",
      deleteRule: "@request.auth.profile = 'admin'",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'tipo', type: 'select', required: true, values: ['clinica', 'autonomo'] },
        { name: 'plano', type: 'text' },
        { name: 'status', type: 'select', required: true, values: ['ativo', 'inativo'] },
        { name: 'data_expiracao', type: 'date' },
        { name: 'demo_user_id', type: 'relation', collectionId: '_pb_users_auth_' },
        {
          name: 'demo_clinica_id',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('clinicas').id,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(tenants)

    const users = app.findCollectionByNameOrId('users')
    users.fields.add(new BoolField({ name: 'is_teste' }))
    app.save(users)

    const patients = app.findCollectionByNameOrId('patients')
    patients.fields.add(new BoolField({ name: 'is_teste' }))
    app.save(patients)

    const appointments = app.findCollectionByNameOrId('appointments')
    appointments.fields.add(new BoolField({ name: 'is_teste' }))
    app.save(appointments)

    const evolucoes = app.findCollectionByNameOrId('evolucoes')
    evolucoes.fields.add(new BoolField({ name: 'is_teste' }))
    app.save(evolucoes)

    const clinicas = app.findCollectionByNameOrId('clinicas')
    clinicas.fields.add(new BoolField({ name: 'is_demo' }))
    app.save(clinicas)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('tenants_demo'))
    } catch (_) {}

    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('is_teste')
    app.save(users)

    const patients = app.findCollectionByNameOrId('patients')
    patients.fields.removeByName('is_teste')
    app.save(patients)

    const appointments = app.findCollectionByNameOrId('appointments')
    appointments.fields.removeByName('is_teste')
    app.save(appointments)

    const evolucoes = app.findCollectionByNameOrId('evolucoes')
    evolucoes.fields.removeByName('is_teste')
    app.save(evolucoes)

    const clinicas = app.findCollectionByNameOrId('clinicas')
    clinicas.fields.removeByName('is_demo')
    app.save(clinicas)
  },
)
