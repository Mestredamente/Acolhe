migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    users.fields.add(
      new SelectField({
        name: 'profile',
        values: ['admin', 'psicologo', 'secretaria', 'paciente'],
        maxSelect: 1,
      }),
    )

    users.fields.add(
      new SelectField({
        name: 'status',
        values: ['ativo', 'inativo'],
        maxSelect: 1,
      }),
    )

    users.listRule = "id = @request.auth.id || @request.auth.profile = 'admin'"
    users.viewRule = "id = @request.auth.id || @request.auth.profile = 'admin'"
    users.updateRule = "id = @request.auth.id || @request.auth.profile = 'admin'"
    users.deleteRule = "id = @request.auth.id || @request.auth.profile = 'admin'"
    app.save(users)

    const patients = app.findCollectionByNameOrId('patients')
    patients.listRule =
      "@request.auth.id != '' && (@request.auth.profile = 'admin' || @request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo' || email = @request.auth.email || user_id = @request.auth.id)"
    patients.viewRule =
      "@request.auth.id != '' && (@request.auth.profile = 'admin' || @request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo' || email = @request.auth.email || user_id = @request.auth.id)"
    patients.updateRule =
      "@request.auth.id != '' && (@request.auth.profile = 'admin' || @request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo' || user_id = @request.auth.id)"
    app.save(patients)

    const apts = app.findCollectionByNameOrId('appointments')
    apts.listRule =
      "@request.auth.id != '' && (@request.auth.profile = 'admin' || @request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo' || patient_id.email = @request.auth.email || user_id = @request.auth.id)"
    apts.viewRule =
      "@request.auth.id != '' && (@request.auth.profile = 'admin' || @request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo' || patient_id.email = @request.auth.email || user_id = @request.auth.id)"
    apts.updateRule =
      "@request.auth.id != '' && (@request.auth.profile = 'admin' || @request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo' || user_id = @request.auth.id)"
    app.save(apts)

    try {
      const admin = app.findAuthRecordByEmail('users', 'mestredamente1@gmail.com')
      admin.set('profile', 'admin')
      admin.set('status', 'ativo')
      app.save(admin)
    } catch (_) {}

    const seedUsers = [
      { email: 'psicologo1@exemplo.com', profile: 'psicologo', name: 'Psicólogo Teste' },
      { email: 'secretaria1@exemplo.com', profile: 'secretaria', name: 'Secretária Teste' },
      { email: 'paciente1@exemplo.com', profile: 'paciente', name: 'Paciente Teste' },
    ]

    for (const u of seedUsers) {
      try {
        app.findAuthRecordByEmail('users', u.email)
      } catch (_) {
        const record = new Record(users)
        record.setEmail(u.email)
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('name', u.name)
        record.set('profile', u.profile)
        record.set('status', 'ativo')
        app.save(record)
      }
    }

    try {
      const p1 = app.findFirstRecordByData('patients', 'email', 'ana.silva@email.com')
      p1.set('email', 'paciente1@exemplo.com')
      p1.set('name', 'Paciente Teste')
      app.save(p1)
    } catch (_) {}
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('profile')
    users.fields.removeByName('status')
    app.save(users)
  },
)
