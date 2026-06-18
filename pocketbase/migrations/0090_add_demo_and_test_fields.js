migrate(
  (app) => {
    // Add is_teste to users
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('is_teste')) {
      users.fields.add(new BoolField({ name: 'is_teste' }))
      app.save(users)
    }

    // Add is_teste to patients
    const patients = app.findCollectionByNameOrId('patients')
    if (!patients.fields.getByName('is_teste')) {
      patients.fields.add(new BoolField({ name: 'is_teste' }))
      app.save(patients)
    }

    // Add is_teste to appointments
    const appointments = app.findCollectionByNameOrId('appointments')
    if (!appointments.fields.getByName('is_teste')) {
      appointments.fields.add(new BoolField({ name: 'is_teste' }))
      app.save(appointments)
    }

    // Add is_teste to evolucoes
    const evolucoes = app.findCollectionByNameOrId('evolucoes')
    if (!evolucoes.fields.getByName('is_teste')) {
      evolucoes.fields.add(new BoolField({ name: 'is_teste' }))
      app.save(evolucoes)
    }

    // Add is_demo to clinicas
    const clinicas = app.findCollectionByNameOrId('clinicas')
    if (!clinicas.fields.getByName('is_demo')) {
      clinicas.fields.add(new BoolField({ name: 'is_demo' }))
      app.save(clinicas)
    }

    // Create tenants_demo collection
    try {
      app.findCollectionByNameOrId('tenants_demo')
    } catch (_) {
      const tenantsDemo = new Collection({
        name: 'tenants_demo',
        type: 'base',
        listRule: "@request.auth.profile = 'admin'",
        viewRule: "@request.auth.profile = 'admin'",
        createRule: "@request.auth.profile = 'admin'",
        updateRule: "@request.auth.profile = 'admin'",
        deleteRule: "@request.auth.profile = 'admin'",
        fields: [
          { name: 'nome', type: 'text', required: true },
          {
            name: 'tipo',
            type: 'select',
            required: true,
            values: ['clinica', 'autonomo'],
            maxSelect: 1,
          },
          { name: 'plano', type: 'text' },
          { name: 'status', type: 'select', values: ['ativo', 'inativo'], maxSelect: 1 },
          { name: 'data_criacao', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'data_expiracao', type: 'date' },
          { name: 'id_clinica', type: 'relation', collectionId: clinicas.id, maxSelect: 1 },
          {
            name: 'owner_id',
            type: 'relation',
            collectionId: users.id,
            maxSelect: 1,
            required: true,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(tenantsDemo)
    }
  },
  (app) => {
    try {
      const tenantsDemo = app.findCollectionByNameOrId('tenants_demo')
      app.delete(tenantsDemo)
    } catch (_) {}
  },
)
