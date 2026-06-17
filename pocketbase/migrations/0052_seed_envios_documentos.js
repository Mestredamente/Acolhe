migrate(
  (app) => {
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
      const patients = app.findRecordsByFilter(
        'patients',
        `user_id = '${admin.id}'`,
        'created',
        2,
        0,
      )
      if (!patients || patients.length === 0) return

      const p1 = patients[0]

      const receipts = app.findRecordsByFilter(
        'financeiro',
        `user_id = '${admin.id}' && patient_id = '${p1.id}' && receipt_number != ''`,
        'created',
        1,
        0,
      )
      if (receipts && receipts.length > 0) {
        const col = app.findCollectionByNameOrId('envios_documentos')
        const rec = new Record(col)
        rec.set('user_id', admin.id)
        rec.set('patient_id', p1.id)
        rec.set('tipo_documento', 'recibo')
        rec.set('documento_id', receipts[0].id)
        rec.set('destinatario', p1.getString('email') || 'paciente1@exemplo.com')
        rec.set('data_envio', new Date().toISOString().replace('T', ' '))
        rec.set('status', 'enviado')
        rec.set('visualizado', false)
        app.save(rec)
      }
    } catch (e) {
      console.log('Seed envios error:', e)
    }
  },
  (app) => {
    app.db().newQuery('DELETE FROM envios_documentos').execute()
  },
)
