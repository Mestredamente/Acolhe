migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    let admin
    try {
      admin = app.findFirstRecordByData('users', 'email', 'mestredamente1@gmail.com')
    } catch (_) {
      return // No admin, skip
    }

    const patients = app.findCollectionByNameOrId('patients')
    const appointments = app.findCollectionByNameOrId('appointments')
    const financeiro = app.findCollectionByNameOrId('financeiro')

    let p1
    try {
      p1 = app.findFirstRecordByData('patients', 'email', 'paciente1@example.com')
    } catch (_) {
      p1 = new Record(patients)
      p1.set('user_id', admin.id)
      p1.set('name', 'Paciente 1 Silva')
      p1.set('email', 'paciente1@example.com')
      app.save(p1)
    }

    let p2
    try {
      p2 = app.findFirstRecordByData('patients', 'email', 'paciente2@example.com')
    } catch (_) {
      p2 = new Record(patients)
      p2.set('user_id', admin.id)
      p2.set('name', 'Paciente 2 Santos')
      p2.set('email', 'paciente2@example.com')
      app.save(p2)
    }

    const apt1 = new Record(appointments)
    apt1.set('user_id', admin.id)
    apt1.set('patient_id', p1.id)
    apt1.set('patient_name_text', p1.getString('name'))
    apt1.set('appointment_date', '2023-01-01 12:00:00.000Z')
    apt1.set('start_time', '10:00')
    apt1.set('end_time', '11:00')
    apt1.set('type', 'Online')
    apt1.set('status', 'concluida')
    app.save(apt1)

    const fin1 = new Record(financeiro)
    fin1.set('user_id', admin.id)
    fin1.set('patient_id', p1.id)
    fin1.set('appointment_id', apt1.id)
    fin1.set('description', 'Sessão de 01/01/2023 — ' + p1.getString('name'))
    fin1.set('amount', 150)
    fin1.set('due_date', '2023-01-01 12:00:00.000Z')
    fin1.set('status', 'pendente')
    app.save(fin1)

    const apt2 = new Record(appointments)
    apt2.set('user_id', admin.id)
    apt2.set('patient_id', p2.id)
    apt2.set('patient_name_text', p2.getString('name'))
    const in36h = new Date(Date.now() + 36 * 60 * 60 * 1000)
    apt2.set('appointment_date', in36h.toISOString().substring(0, 10) + ' 12:00:00.000Z')
    apt2.set('start_time', '14:00')
    apt2.set('end_time', '15:00')
    apt2.set('type', 'Presencial')
    apt2.set('status', 'agendada')
    app.save(apt2)
  },
  (app) => {
    // empty down
  },
)
