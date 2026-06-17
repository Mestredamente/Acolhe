migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
    } catch (_) {
      user = new Record(users)
      user.setEmail('mestredamente1@gmail.com')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Admin Psico')
      app.save(user)
    }

    const patientsCol = app.findCollectionByNameOrId('patients')
    try {
      app.findFirstRecordByData('patients', 'email', 'ana.silva@email.com')
    } catch (_) {
      const p1 = new Record(patientsCol)
      p1.set('user_id', user.id)
      p1.set('name', 'Ana Silva')
      p1.set('cpf', '123.456.789-00')
      p1.set('birth_date', '1995-05-15 12:00:00.000Z')
      p1.set('phone', '+55 11 98765-4321')
      p1.set('email', 'ana.silva@email.com')
      p1.set('address', 'Rua das Flores, 123, São Paulo, SP')
      p1.set('emergency_contact_name', 'João Silva')
      p1.set('emergency_contact_phone', '+55 11 91234-5678')
      p1.set('billing_id', '123.456.789-00')
      p1.set('billing_address', 'Rua das Flores, 123, São Paulo, SP')
      p1.set('status', 'active')
      p1.set('last_consultation', '2023-10-25 10:00:00.000Z')
      app.save(p1)

      const p2 = new Record(patientsCol)
      p2.set('user_id', user.id)
      p2.set('name', 'Carlos Souza')
      p2.set('email', 'carlos.souza@email.com')
      p2.set('phone', '+55 21 97654-3210')
      p2.set('status', 'active')
      app.save(p2)

      const p3 = new Record(patientsCol)
      p3.set('user_id', user.id)
      p3.set('name', 'Beatriz Lima')
      p3.set('email', 'beatriz.lima@email.com')
      p3.set('status', 'inactive')
      app.save(p3)

      const aptsCol = app.findCollectionByNameOrId('appointments')
      const a1 = new Record(aptsCol)
      a1.set('user_id', user.id)
      a1.set('patient_id', p1.id)
      const today = new Date()
      a1.set('time', today.toISOString().replace('T', ' '))
      a1.set('type', 'Presencial')
      app.save(a1)

      const a2 = new Record(aptsCol)
      a2.set('user_id', user.id)
      a2.set('patient_id', p2.id)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      a2.set('time', tomorrow.toISOString().replace('T', ' '))
      a2.set('type', 'Online')
      app.save(a2)
    }
  },
  (app) => {
    // Downgrade not strictly needed for seeds
  },
)
