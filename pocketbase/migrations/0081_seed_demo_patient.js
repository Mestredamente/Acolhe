migrate(
  (app) => {
    const patientsCol = app.findCollectionByNameOrId('patients')

    try {
      app.findFirstRecordByData('patients', 'id', 'dummypatient123')
      return
    } catch (_) {}

    let adminUserId = ''
    try {
      const admin = app.findFirstRecordByData('users', 'email', 'mestredamente1@gmail.com')
      adminUserId = admin.id
    } catch (_) {
      const allUsers = app.findRecordsByFilter('users', "profile='admin'", '-created', 1, 0)
      if (allUsers && allUsers.length > 0) {
        adminUserId = allUsers[0].id
      }
    }

    if (!adminUserId) return

    const patient = new Record(patientsCol)
    patient.set('id', 'dummypatient123')
    patient.set('name', 'Paciente Demonstração')
    patient.set('cpf', '000.000.000-00')
    patient.set('birth_date', '1990-01-01 12:00:00.000Z')
    patient.set('phone', '11999999999')
    patient.set('email', 'demo@paciente.com')
    patient.set('status', 'active')
    patient.set('user_id', adminUserId)
    app.save(patient)

    const evolucoesCol = app.findCollectionByNameOrId('evolucoes')
    const evol = new Record(evolucoesCol)
    evol.set('id', 'dummyevol123456')
    evol.set('patient_id', patient.id)
    evol.set('user_id', adminUserId)
    evol.set('session_date', new Date().toISOString().replace('T', ' '))
    evol.set('content', 'Paciente relatou melhora na ansiedade. Discutimos técnicas de respiração.')
    evol.set('is_signed', false)
    app.save(evol)

    const diarioCol = app.findCollectionByNameOrId('diario_paciente')
    const diario = new Record(diarioCol)
    diario.set('id', 'dummydiary12345')
    diario.set('patient_id', patient.id)
    diario.set('user_id', adminUserId)
    diario.set('entry_date', new Date().toISOString().replace('T', ' '))
    diario.set('content', 'Hoje foi um dia tranquilo, consegui aplicar o que conversamos.')
    diario.set('sentiment', 'feliz')
    app.save(diario)
  },
  (app) => {
    try {
      const p = app.findFirstRecordByData('patients', 'id', 'dummypatient123')
      app.delete(p)
    } catch (_) {}
    try {
      const e = app.findFirstRecordByData('evolucoes', 'id', 'dummyevol123456')
      app.delete(e)
    } catch (_) {}
    try {
      const d = app.findFirstRecordByData('diario_paciente', 'id', 'dummydiary12345')
      app.delete(d)
    } catch (_) {}
  },
)
