migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const pacientes = app.findCollectionByNameOrId('patients')
    const mensagens = app.findCollectionByNameOrId('mensagens')

    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
    } catch (_) {
      return
    }

    let patient
    try {
      patient = app.findFirstRecordByData('patients', 'email', 'ana.silva@email.com')
    } catch (_) {
      return
    }

    try {
      app.findFirstRecordByData('mensagens', 'patient_id', patient.id)
      return // Already seeded
    } catch (_) {}

    let patientUser
    try {
      patientUser = app.findAuthRecordByEmail('_pb_users_auth_', patient.getString('email'))
    } catch (_) {
      patientUser = new Record(users)
      patientUser.setEmail(patient.getString('email'))
      patientUser.setPassword('Skip@Pass')
      patientUser.setVerified(true)
      patientUser.set('name', patient.getString('name'))
      app.save(patientUser)
    }

    const m1 = new Record(mensagens)
    m1.set('sender_id', patientUser.id)
    m1.set('recipient_id', user.id)
    m1.set('patient_id', patient.id)
    m1.set('content', 'Olá, gostaria de confirmar o horário de amanhã.')
    m1.set('read_status', 'lida')
    m1.set('sender_type', 'paciente')
    app.save(m1)

    const m2 = new Record(mensagens)
    m2.set('sender_id', user.id)
    m2.set('recipient_id', patientUser.id)
    m2.set('patient_id', patient.id)
    m2.set('content', 'Olá! Está confirmado para as 14h. Até lá!')
    m2.set('read_status', 'nao_lida')
    m2.set('sender_type', 'psicologo')
    app.save(m2)
  },
  (app) => {
    // down migration omitted for seeds
  },
)
