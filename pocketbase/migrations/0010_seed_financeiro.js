migrate(
  (app) => {
    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
    } catch (_) {
      return
    }

    const patients = app.findRecordsByFilter('patients', `user_id = '${admin.id}'`, 'created', 1, 0)
    if (!patients || patients.length === 0) return
    const patient = patients[0]

    const appts = app.findRecordsByFilter(
      'appointments',
      `patient_id = '${patient.id}'`,
      '-appointment_date',
      2,
      0,
    )
    const col = app.findCollectionByNameOrId('financeiro')

    try {
      app.findFirstRecordByData('financeiro', 'patient_id', patient.id)
      return
    } catch (_) {}

    const now = new Date().toISOString().replace('T', ' ')
    const futureDate = new Date(Date.now() + 86400000 * 5).toISOString().replace('T', ' ') // +5 days
    const pastDate = new Date(Date.now() - 86400000 * 5).toISOString().replace('T', ' ') // -5 days

    // Record 1: Pago
    const t1 = new Record(col)
    t1.set('user_id', admin.id)
    t1.set('patient_id', patient.id)
    t1.set('amount', 150)
    t1.set('status', 'pago')
    t1.set('due_date', now)
    t1.set('payment_date', now)
    t1.set('payment_method', 'pix')
    t1.set('description', 'Sessão Psicoterapia (Paga)')
    t1.set('installments', 1)
    if (appts && appts.length > 0) t1.set('appointment_id', appts[0].id)
    app.save(t1)

    // Record 2: Pendente
    const t2 = new Record(col)
    t2.set('user_id', admin.id)
    t2.set('patient_id', patient.id)
    t2.set('amount', 200)
    t2.set('status', 'pendente')
    t2.set('due_date', futureDate)
    t2.set('description', 'Avaliação Neuropsicológica (Sinal)')
    t2.set('installments', 1)
    if (appts && appts.length > 1) t2.set('appointment_id', appts[1].id)
    app.save(t2)

    // Record 3: Atrasado
    const t3 = new Record(col)
    t3.set('user_id', admin.id)
    t3.set('patient_id', patient.id)
    t3.set('amount', 150)
    t3.set('status', 'atrasado')
    t3.set('due_date', pastDate)
    t3.set('description', 'Sessão Psicoterapia (Atrasada)')
    t3.set('installments', 1)
    app.save(t3)

    // Record 4: Cancelado
    const t4 = new Record(col)
    t4.set('user_id', admin.id)
    t4.set('patient_id', patient.id)
    t4.set('amount', 150)
    t4.set('status', 'cancelado')
    t4.set('due_date', now)
    t4.set('description', 'Sessão Psicoterapia (Falta)')
    t4.set('installments', 1)
    app.save(t4)
  },
  (app) => {
    // Cascade delete via FK usually handles cleanup,
    // but explicit down migrations for seeds aren't strictly required
    // unless you want to cleanly revert the state.
  },
)
