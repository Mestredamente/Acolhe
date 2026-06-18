migrate(
  (app) => {
    const patients = app.findRecordsByFilter('patients', "deleted_at = ''", '', 2, 0)
    if (patients.length > 0) {
      const col = app.findCollectionByNameOrId('consentimentos')

      // Patient 1
      const types = ['lgpd', 'uso_ia', 'telepsicologia', 'termos_plataforma']
      for (const t of types) {
        const rec = new Record(col)
        rec.set('paciente_id', patients[0].id)
        rec.set('tipo', t)
        rec.set('aceito', true)
        rec.set('data_aceite', new Date().toISOString())
        rec.set('versao_termo', '1.0')
        app.save(rec)
      }

      if (patients.length > 1) {
        // Patient 2
        for (const t of types) {
          const rec = new Record(col)
          rec.set('paciente_id', patients[1].id)
          rec.set('tipo', t)
          rec.set('aceito', t !== 'uso_ia')
          if (t !== 'uso_ia') {
            rec.set('data_aceite', new Date().toISOString())
            rec.set('versao_termo', '1.0')
          }
          app.save(rec)
        }
      }
    }
  },
  (app) => {
    const records = app.findRecordsByFilter('consentimentos', '1=1', '', 100, 0)
    for (const r of records) {
      app.delete(r)
    }
  },
)
