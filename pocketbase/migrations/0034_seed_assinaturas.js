migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('assinaturas')

    try {
      app.findFirstRecordByData('assinaturas', 'registro_id', 'seed_evolucao_1')
      return
    } catch (_) {}

    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
      const patients = app.findRecordsByFilter(
        'patients',
        `user_id = '${user.id}'`,
        '-created',
        1,
        0,
      )

      if (!patients || patients.length === 0) return
      const patient = patients[0]

      const record = new Record(col)
      record.set('registro_id', 'seed_evolucao_1')
      record.set('tipo_registro', 'evolucao')
      record.set('patient_id', patient.id)
      record.set('user_id', user.id)
      record.set('data_assinatura', new Date().toISOString().replace('T', ' '))
      record.set('status', 'assinado')
      record.set('identificador_signatario', '12345678900')
      record.set('signature_data', 'base64-seed-signature')
      app.save(record)

      const record2 = new Record(col)
      record2.set('registro_id', 'seed_doc_1')
      record2.set('tipo_registro', 'documento')
      record2.set('patient_id', patient.id)
      record2.set('user_id', user.id)
      record2.set('data_assinatura', new Date().toISOString().replace('T', ' '))
      record2.set('status', 'pendente')
      record2.set('identificador_signatario', '12345678900')
      app.save(record2)
    } catch (err) {
      console.log('Failed to seed assinaturas', err)
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('assinaturas', 'registro_id', 'seed_evolucao_1')
      app.delete(record)
    } catch (_) {}
    try {
      const record2 = app.findFirstRecordByData('assinaturas', 'registro_id', 'seed_doc_1')
      app.delete(record2)
    } catch (_) {}
  },
)
