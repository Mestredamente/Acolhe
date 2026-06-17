migrate(
  (app) => {
    try {
      const patients = app.findRecordsByFilter('patients', '', '-created', 10, 0)
      if (patients.length > 0) {
        patients[0].set('status_convite', 'enviado')
        patients[0].set('link_convite', 'convite123')
        app.save(patients[0])
      }
      if (patients.length > 1) {
        patients[1].set('status_convite', 'aceito')
        app.save(patients[1])
      }
    } catch (_) {}
  },
  (app) => {},
)
