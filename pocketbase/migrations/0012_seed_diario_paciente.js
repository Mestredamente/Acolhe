migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let patientAuthUser
    try {
      patientAuthUser = app.findAuthRecordByEmail('_pb_users_auth_', 'ana.silva@email.com')
    } catch (_) {
      patientAuthUser = new Record(users)
      patientAuthUser.setEmail('ana.silva@email.com')
      patientAuthUser.setPassword('Skip@Pass')
      patientAuthUser.setVerified(true)
      patientAuthUser.set('name', 'Ana Silva')
      app.save(patientAuthUser)
    }

    let patientRecord
    try {
      patientRecord = app.findFirstRecordByData('patients', 'email', 'ana.silva@email.com')
    } catch (_) {
      return // Patient doesn't exist to seed
    }

    const diarioCol = app.findCollectionByNameOrId('diario_paciente')

    try {
      app.findFirstRecordByData('diario_paciente', 'sentiment', 'feliz')
    } catch (_) {
      const entry1 = new Record(diarioCol)
      entry1.set('user_id', patientAuthUser.id)
      entry1.set('patient_id', patientRecord.id)
      entry1.set('entry_date', new Date().toISOString().replace('T', ' '))
      entry1.set(
        'content',
        'Hoje me senti muito bem após a sessão, consegui aplicar as técnicas de respiração.',
      )
      entry1.set('sentiment', 'feliz')
      app.save(entry1)
    }

    try {
      app.findFirstRecordByData('diario_paciente', 'sentiment', 'ansioso')
    } catch (_) {
      const entry2 = new Record(diarioCol)
      entry2.set('user_id', patientAuthUser.id)
      entry2.set('patient_id', patientRecord.id)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      entry2.set('entry_date', yesterday.toISOString().replace('T', ' '))
      entry2.set(
        'content',
        'Senti um pouco de ansiedade no trabalho hoje, mas tentei me lembrar do que conversamos.',
      )
      entry2.set('sentiment', 'ansioso')
      app.save(entry2)
    }
  },
  (app) => {},
)
