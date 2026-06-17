migrate(
  (app) => {
    const records = app.findRecordsByFilter('config_clinica', '1=1', '', 100, 0)
    for (const record of records) {
      record.set('google_calendar_active', true)
      record.set('google_calendar_email', 'psicologo@gmail.com')
      record.set('google_calendar_sync_mode', 'bidirectional')
      record.set('google_calendar_name', 'Consultas Clínica')
      record.set('zoom_active', false)
      record.set('zoom_auto_link', false)
      app.save(record)
    }
  },
  (app) => {},
)
