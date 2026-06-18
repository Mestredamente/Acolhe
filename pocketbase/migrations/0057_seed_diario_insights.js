migrate(
  (app) => {
    try {
      const patientRecord = app.findFirstRecordByData('patients', 'email', 'ana.silva@email.com')
      const diarioCol = app.findCollectionByNameOrId('diario_paciente')

      // Seed 7 entries to trigger Positive Stability and Inactivity Alert
      // Base date is 14 days ago so the last entry lands 8 days ago (triggering inactivity > 7 days)
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() - 14)

      for (let i = 0; i < 7; i++) {
        const entryDate = new Date(baseDate)
        entryDate.setDate(entryDate.getDate() + i)

        const entry = new Record(diarioCol)
        entry.set('user_id', patientRecord.get('user_id'))
        entry.set('patient_id', patientRecord.id)
        entry.set('entry_date', entryDate.toISOString().replace('T', ' '))
        entry.set('content', `Registro diário ${i + 1} de reflexão. Hoje me sinto bem e produtivo.`)
        entry.set('sentiment', i % 2 === 0 ? 'muito feliz' : 'feliz')
        app.save(entry)
      }
    } catch (_) {}
  },
  (app) => {},
)
