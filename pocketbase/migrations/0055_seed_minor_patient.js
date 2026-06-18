migrate(
  (app) => {
    try {
      const patients = app.findRecordsByFilter('patients', '', 'created', 10, 0)
      if (patients.length > 1) {
        const p = patients[1]
        const birthDate = new Date()
        birthDate.setFullYear(birthDate.getFullYear() - 16)
        p.set('birth_date', birthDate.toISOString().split('T')[0] + ' 00:00:00.000Z')
        p.set('guardian_name', 'Maria da Silva')
        p.set('guardian_phone', '+55 11 98888-7777')
        p.set('guardian_cpf', '111.222.333-44')
        p.set('guardian_relationship', 'mãe')
        p.set('guardian_consent_status', 'pendente')
        app.save(p)
      }
    } catch (_) {}
  },
  (app) => {},
)
