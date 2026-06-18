migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const vinculos = app.findCollectionByNameOrId('supervisao_vinculos')
    const feedbacks = app.findCollectionByNameOrId('supervisao_feedback')
    const patients = app.findCollectionByNameOrId('patients')
    const evolucoes = app.findCollectionByNameOrId('evolucoes')
    const appointments = app.findCollectionByNameOrId('appointments')

    let supervisor
    try {
      supervisor = app.findAuthRecordByEmail('users', 'supervisor@example.com')
    } catch (_) {
      supervisor = new Record(users)
      supervisor.setEmail('supervisor@example.com')
      supervisor.setPassword('Skip@Pass')
      supervisor.setVerified(true)
      supervisor.set('name', 'Dr. Supervisor Silva')
      supervisor.set('profile', 'psicologo')
      supervisor.set('is_supervisor', true)
      app.save(supervisor)
    }

    let super1
    try {
      super1 = app.findAuthRecordByEmail('users', 'supervisionado1@example.com')
    } catch (_) {
      super1 = new Record(users)
      super1.setEmail('supervisionado1@example.com')
      super1.setPassword('Skip@Pass')
      super1.setVerified(true)
      super1.set('name', 'Psi. Marina Costa')
      super1.set('profile', 'psicologo')
      super1.set('supervisor_id', supervisor.id)
      app.save(super1)

      const v1 = new Record(vinculos)
      v1.set('supervisor_id', supervisor.id)
      v1.set('supervisionado_id', super1.id)
      v1.set('status', 'ativo')
      v1.set('data_inicio', new Date().toISOString())
      app.save(v1)

      const p1 = new Record(patients)
      p1.set('user_id', super1.id)
      p1.set('name', 'Carlos Alberto')
      p1.set('status', 'active')
      p1.set('email', 'carlos.supervisionado@example.com')
      app.save(p1)

      const a1 = new Record(appointments)
      a1.set('user_id', super1.id)
      a1.set('patient_id', p1.id)
      a1.set('appointment_date', new Date().toISOString())
      a1.set('start_time', '14:00')
      a1.set('end_time', '15:00')
      a1.set('status', 'concluida')
      a1.set('type', 'Presencial')
      app.save(a1)

      const e1 = new Record(evolucoes)
      e1.set('user_id', super1.id)
      e1.set('patient_id', p1.id)
      e1.set('appointment_id', a1.id)
      e1.set('session_date', new Date().toISOString())
      e1.set('content', 'Paciente relatou muita ansiedade ao longo da semana.')
      app.save(e1)

      const f1 = new Record(feedbacks)
      f1.set('supervisor_id', supervisor.id)
      f1.set('supervisionado_id', super1.id)
      f1.set('patient_id', p1.id)
      f1.set('evolucao_id', e1.id)
      f1.set(
        'texto_feedback',
        'Revisão inicial do caso. Abordagem adequada, sugiro aplicar escala de ansiedade.',
      )
      app.save(f1)
    }

    let super2
    try {
      super2 = app.findAuthRecordByEmail('users', 'supervisionado2@example.com')
    } catch (_) {
      super2 = new Record(users)
      super2.setEmail('supervisionado2@example.com')
      super2.setPassword('Skip@Pass')
      super2.setVerified(true)
      super2.set('name', 'Psi. João Souza')
      super2.set('profile', 'psicologo')
      super2.set('supervisor_id', supervisor.id)
      app.save(super2)

      const v2 = new Record(vinculos)
      v2.set('supervisor_id', supervisor.id)
      v2.set('supervisionado_id', super2.id)
      v2.set('status', 'ativo')
      v2.set('data_inicio', new Date().toISOString())
      app.save(v2)

      const p2 = new Record(patients)
      p2.set('user_id', super2.id)
      p2.set('name', 'Ana Clara')
      p2.set('status', 'active')
      p2.set('email', 'ana.supervisionada@example.com')
      app.save(p2)
    }
  },
  (app) => {},
)
