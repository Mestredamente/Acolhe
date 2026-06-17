migrate(
  (app) => {
    const appointmentsCol = app.findCollectionByNameOrId('appointments')
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
    } catch (_) {
      return
    }

    const patients = app.findRecordsByFilter('patients', `user_id = '${user.id}'`, '', 5, 0)
    if (patients.length === 0) return

    app.db().newQuery('DELETE FROM appointments').execute()

    const p1 = patients[0]
    const p2 = patients.length > 1 ? patients[1] : patients[0]
    const p3 = patients.length > 2 ? patients[2] : patients[0]

    const today = new Date()
    today.setUTCHours(12, 0, 0, 0)

    const addApt = (patient, daysOffset, start, end, type, status) => {
      const aptDate = new Date(today)
      aptDate.setDate(aptDate.getDate() + daysOffset)
      const rec = new Record(appointmentsCol)
      rec.set('user_id', user.id)
      rec.set('patient_id', patient.id)
      rec.set('patient_name_text', patient.getString('name'))
      rec.set('appointment_date', aptDate.toISOString().replace('T', ' '))
      rec.set('start_time', start)
      rec.set('end_time', end)
      rec.set('type', type)
      rec.set('status', status)
      rec.set('link_or_room', type === 'Online' ? 'meet.google.com/abc' : 'Sala 1')
      rec.set('observations', 'Primeira consulta de acompanhamento.')
      app.save(rec)
    }

    addApt(p1, 0, '09:00', '10:00', 'Presencial', 'confirmada')
    addApt(p2, 0, '14:00', '15:00', 'Online', 'agendada')
    addApt(p3, 1, '10:00', '11:00', 'Presencial', 'agendada')
    addApt(p1, 2, '16:00', '17:00', 'Online', 'cancelada')
    addApt(p2, 3, '11:00', '12:00', 'Presencial', 'concluida')
  },
  (app) => {
    app.db().newQuery('DELETE FROM appointments').execute()
  },
)
