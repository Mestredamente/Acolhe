migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const patients = app.findCollectionByNameOrId('patients')
    const appointments = app.findCollectionByNameOrId('appointments')
    const evolucoes = app.findCollectionByNameOrId('evolucoes')

    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
    } catch (_) {
      return
    }

    const userPatients = app.findRecordsByFilter(
      'patients',
      `user_id = '${admin.id}'`,
      '-created',
      10,
      0,
    )

    userPatients.forEach((p) => {
      for (let i = 1; i <= 2; i++) {
        const apt = new Record(appointments)
        apt.set('user_id', admin.id)
        apt.set('patient_id', p.id)

        const date = new Date()
        date.setDate(date.getDate() - i * 7)

        apt.set('time', date.toISOString().replace('T', ' '))
        apt.set('appointment_date', date.toISOString().replace('T', ' '))
        apt.set('start_time', '10:00')
        apt.set('end_time', '11:00')
        apt.set('type', 'Online')
        apt.set('status', 'concluida')
        app.save(apt)

        const evo = new Record(evolucoes)
        evo.set('user_id', admin.id)
        evo.set('patient_id', p.id)
        evo.set('appointment_id', apt.id)
        evo.set('session_date', apt.get('time'))
        evo.set(
          'content',
          `Sessão ${i} com o paciente. Exploramos como a ansiedade se manifestou durante a semana. Paciente relatou melhora geral, porém ainda apresenta dificuldade para dormir. Discutimos estratégias de higiene do sono e controle de gatilhos noturnos.`,
        )
        evo.set(
          'ai_summary',
          `Paciente com melhora parcial da ansiedade. Queixa principal no momento: insônia. Intervenção: orientação sobre higiene do sono e controle de gatilhos noturnos.`,
        )
        evo.set('is_signed', i === 1)
        app.save(evo)
      }
    })
  },
  (app) => {},
)
