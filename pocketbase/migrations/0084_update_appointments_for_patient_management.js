migrate(
  (app) => {
    const aptsCol = app.findCollectionByNameOrId('appointments')

    const statusField = aptsCol.fields.getByName('status')
    statusField.values = [
      'agendada',
      'confirmada',
      'cancelada',
      'concluida',
      'cancelada_pelo_paciente',
      'reagendada',
    ]

    if (!aptsCol.fields.getByName('cancel_reason')) {
      aptsCol.fields.add(new TextField({ name: 'cancel_reason' }))
    }
    if (!aptsCol.fields.getByName('canceled_at')) {
      aptsCol.fields.add(new DateField({ name: 'canceled_at' }))
    }

    aptsCol.updateRule =
      "@request.auth.id != '' && (@request.auth.profile = 'admin' || @request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo' || user_id = @request.auth.id || patient_id.user_id = @request.auth.id || patient_id.email = @request.auth.email)"

    app.save(aptsCol)

    try {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      let patientAuth = null
      try {
        patientAuth = app.findAuthRecordByEmail('_pb_users_auth_', 'paciente_demo@example.com')
      } catch (_) {
        patientAuth = new Record(users)
        patientAuth.setEmail('paciente_demo@example.com')
        patientAuth.setPassword('Skip@Pass')
        patientAuth.setVerified(true)
        patientAuth.set('name', 'Paciente Demo')
        patientAuth.set('profile', 'paciente')
        app.save(patientAuth)
      }

      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')

      let patient = null
      try {
        patient = app.findFirstRecordByData('patients', 'email', 'paciente_demo@example.com')
      } catch (_) {
        const pCol = app.findCollectionByNameOrId('patients')
        patient = new Record(pCol)
        patient.set('user_id', admin.id)
        patient.set('name', 'Paciente Demo')
        patient.set('email', 'paciente_demo@example.com')
        patient.set('status', 'active')
        app.save(patient)
      }

      const now = new Date()

      const halfDay = new Date(now.getTime() + 12 * 60 * 60 * 1000)
      const d1 = halfDay.toISOString().split('T')[0] + ' 12:00:00.000Z'
      const apt1 = new Record(aptsCol)
      apt1.set('user_id', admin.id)
      apt1.set('patient_id', patient.id)
      apt1.set('appointment_date', d1)
      apt1.set('start_time', '12:00')
      apt1.set('end_time', '13:00')
      apt1.set('status', 'confirmada')
      apt1.set('type', 'Online')
      app.save(apt1)

      const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      const d2 = threeDays.toISOString().split('T')[0] + ' 14:00:00.000Z'
      const apt2 = new Record(aptsCol)
      apt2.set('user_id', admin.id)
      apt2.set('patient_id', patient.id)
      apt2.set('appointment_date', d2)
      apt2.set('start_time', '14:00')
      apt2.set('end_time', '15:00')
      apt2.set('status', 'agendada')
      apt2.set('type', 'Presencial')
      app.save(apt2)

      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      const d3 = threeDaysAgo.toISOString().split('T')[0] + ' 10:00:00.000Z'
      const apt3 = new Record(aptsCol)
      apt3.set('user_id', admin.id)
      apt3.set('patient_id', patient.id)
      apt3.set('appointment_date', d3)
      apt3.set('start_time', '10:00')
      apt3.set('end_time', '11:00')
      apt3.set('status', 'concluida')
      apt3.set('type', 'Online')
      app.save(apt3)
    } catch (e) {
      console.log(e)
    }
  },
  (app) => {
    const aptsCol = app.findCollectionByNameOrId('appointments')
    aptsCol.fields.removeByName('cancel_reason')
    aptsCol.fields.removeByName('canceled_at')
    const statusField = aptsCol.fields.getByName('status')
    statusField.values = ['agendada', 'confirmada', 'cancelada', 'concluida']
    aptsCol.updateRule =
      "@request.auth.id != '' && (@request.auth.profile = 'admin' || @request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo' || user_id = @request.auth.id)"
    app.save(aptsCol)
  },
)
