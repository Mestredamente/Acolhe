migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('is_supervisor')) {
      users.fields.add(new BoolField({ name: 'is_supervisor' }))
    }
    if (!users.fields.getByName('supervisor_id')) {
      users.fields.add(
        new RelationField({ name: 'supervisor_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )
    }

    users.listRule =
      "id = @request.auth.id || @request.auth.profile = 'admin' || supervisor_id = @request.auth.id || (@request.auth.is_supervisor = true && profile = 'psicologo')"
    users.viewRule = users.listRule
    users.updateRule =
      "id = @request.auth.id || @request.auth.profile = 'admin' || (@request.auth.is_supervisor = true && (supervisor_id = '' || supervisor_id = @request.auth.id))"

    app.save(users)

    const patients = app.findCollectionByNameOrId('patients')
    patients.listRule =
      "@request.auth.id != '' && (@request.auth.profile = 'admin' || email = @request.auth.email || user_id = @request.auth.id || user_id.supervisor_id = @request.auth.id || ((@request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo') && id_clinica != '' && id_clinica = @request.auth.id_clinica))"
    patients.viewRule = patients.listRule
    app.save(patients)

    const appointments = app.findCollectionByNameOrId('appointments')
    appointments.listRule =
      "@request.auth.id != '' && (@request.auth.profile = 'admin' || patient_id.email = @request.auth.email || user_id = @request.auth.id || user_id.supervisor_id = @request.auth.id || ((@request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo') && patient_id.id_clinica != '' && patient_id.id_clinica = @request.auth.id_clinica))"
    appointments.viewRule = appointments.listRule
    app.save(appointments)

    const evolucoes = app.findCollectionByNameOrId('evolucoes')
    evolucoes.listRule =
      "@request.auth.id != '' && (@request.auth.profile = 'admin' || user_id = @request.auth.id || user_id.supervisor_id = @request.auth.id || ((@request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo') && patient_id.id_clinica != '' && patient_id.id_clinica = @request.auth.id_clinica))"
    evolucoes.viewRule = evolucoes.listRule
    app.save(evolucoes)

    const anamneses = app.findCollectionByNameOrId('anamneses')
    anamneses.listRule =
      "@request.auth.id != '' && (user_id = @request.auth.id || user_id.supervisor_id = @request.auth.id)"
    anamneses.viewRule = anamneses.listRule
    app.save(anamneses)

    const documentos = app.findCollectionByNameOrId('documentos')
    documentos.listRule =
      "@request.auth.id != '' && (@request.auth.profile = 'admin' || user_id = @request.auth.id || user_id.supervisor_id = @request.auth.id || (patient_id.email = @request.auth.email && status = 'visivel_paciente') || ((@request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo') && patient_id.id_clinica != '' && patient_id.id_clinica = @request.auth.id_clinica))"
    documentos.viewRule = documentos.listRule
    app.save(documentos)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (users.fields.getByName('is_supervisor')) users.fields.removeByName('is_supervisor')
    if (users.fields.getByName('supervisor_id')) users.fields.removeByName('supervisor_id')
    app.save(users)
  },
)
