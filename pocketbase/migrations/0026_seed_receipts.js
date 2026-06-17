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

    const col = app.findCollectionByNameOrId('financeiro')
    const now = new Date().toISOString().replace('T', ' ')

    const t1 = new Record(col)
    t1.set('user_id', admin.id)
    t1.set('patient_id', patient.id)
    t1.set('amount', 150)
    t1.set('status', 'pago')
    t1.set('due_date', now)
    t1.set('payment_date', now)
    t1.set('payment_method', 'pix')
    t1.set('description', 'Sessão de Psicoterapia - Recibo 1')
    t1.set('receipt_number', 'REC-001')
    t1.set('receipt_issued_date', now)
    app.save(t1)

    const t2 = new Record(col)
    t2.set('user_id', admin.id)
    t2.set('patient_id', patient.id)
    t2.set('amount', 180)
    t2.set('status', 'pago')
    t2.set('due_date', now)
    t2.set('payment_date', now)
    t2.set('payment_method', 'pix')
    t2.set('description', 'Sessão de Psicoterapia - Recibo 2')
    t2.set('receipt_number', 'REC-002')
    t2.set('receipt_issued_date', now)
    app.save(t2)

    const t3 = new Record(col)
    t3.set('user_id', admin.id)
    t3.set('patient_id', patient.id)
    t3.set('amount', 200)
    t3.set('status', 'pendente')
    t3.set('due_date', now)
    t3.set('description', 'Sessão de Psicoterapia - Para Emitir')
    app.save(t3)
  },
  (app) => {},
)
