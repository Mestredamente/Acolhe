migrate(
  (app) => {
    try {
      const check = app.findFirstRecordByData('patients', 'name', 'Ana Clara (Telepsi)')
      if (check) return // already seeded
    } catch (_) {}

    let admin
    try {
      admin = app.findAuthRecordByEmail('users', 'mestredamente1@gmail.com')
    } catch (_) {
      return
    }

    let clinicaId = null
    try {
      const clinicas = app.findRecordsByFilter('clinicas', `admin_id = '${admin.id}'`, '', 1, 0)
      if (clinicas.length > 0) {
        clinicaId = clinicas[0].id
      }
    } catch (_) {}

    const patientsCol = app.findCollectionByNameOrId('patients')
    const pIds = []
    const names = [
      'Ana Clara (Telepsi)',
      'Roberto Costa (Telepsi)',
      'Mariana Alves (Telepsi)',
      'Fernanda Lima (Grupo)',
      'João Pedro (Grupo)',
      'Beatriz Santos (Grupo)',
      'Thiago Silva (Grupo)',
      'Camila Rocha (Grupo)',
      'Lucas Oliveira (Grupo)',
      'Julia Mendes (Grupo)',
      'Marcos Costa (Grupo)',
    ]

    for (let i = 0; i < names.length; i++) {
      const p = new Record(patientsCol)
      p.set('user_id', admin.id)
      p.set('name', names[i])
      p.set('status', 'active')
      if (clinicaId) p.set('id_clinica', clinicaId)
      app.save(p)
      pIds.push(p.id)
    }

    const gruposCol = app.findCollectionByNameOrId('grupos_terapeuticos')

    const g1 = new Record(gruposCol)
    g1.set('nome', 'Grupo de Ansiedade')
    g1.set('tema', 'Manejo da Ansiedade')
    g1.set('descricao', 'Técnicas de respiração e TCC.')
    g1.set('limite_participantes', 6)
    g1.set('data_inicio', new Date().toISOString())
    g1.set('status', 'ativo')
    g1.set('user_id', admin.id)
    if (clinicaId) g1.set('id_clinica', clinicaId)
    g1.set('participantes', pIds.slice(3, 9))
    app.save(g1)

    const g2 = new Record(gruposCol)
    g2.set('nome', 'Grupo de Mindfulness')
    g2.set('tema', 'Atenção Plena')
    g2.set('descricao', 'Práticas meditativas semanais.')
    g2.set('limite_participantes', 4)
    g2.set('data_inicio', new Date().toISOString())
    g2.set('status', 'ativo')
    g2.set('user_id', admin.id)
    if (clinicaId) g2.set('id_clinica', clinicaId)
    g2.set('participantes', pIds.slice(7, 11))
    app.save(g2)

    const apptCol = app.findCollectionByNameOrId('appointments')

    // Allow group appointments to not have a patient_id
    const pField = apptCol.fields.getByName('patient_id')
    if (pField && pField.required) {
      pField.required = false
      app.save(apptCol)
    }

    const today = new Date()

    // Group Appointments
    const a1 = new Record(apptCol)
    a1.set('user_id', admin.id)
    a1.set('tipo_sessao', 'grupo')
    a1.set('grupo_id', g1.id)
    const d1 = new Date(today)
    d1.setDate(today.getDate() + 2)
    a1.set('appointment_date', d1.toISOString())
    a1.set('start_time', '18:00')
    a1.set('end_time', '19:30')
    a1.set('type', 'Online')
    a1.set('status', 'agendada')
    a1.set('patient_name_text', 'Grupo de Ansiedade')
    app.save(a1)

    const a2 = new Record(apptCol)
    a2.set('user_id', admin.id)
    a2.set('tipo_sessao', 'grupo')
    a2.set('grupo_id', g2.id)
    const d2 = new Date(today)
    d2.setDate(today.getDate() + 4)
    a2.set('appointment_date', d2.toISOString())
    a2.set('start_time', '19:00')
    a2.set('end_time', '20:00')
    a2.set('type', 'Presencial')
    a2.set('status', 'agendada')
    a2.set('patient_name_text', 'Grupo de Mindfulness')
    app.save(a2)

    // Telepsicologia Appointments (Scheduled)
    for (let i = 0; i < 3; i++) {
      const at = new Record(apptCol)
      at.set('user_id', admin.id)
      at.set('patient_id', [pIds[i]])
      at.set('type', 'Online')
      at.set('tipo_sessao', 'individual')
      at.set('status', 'agendada')
      at.set('link_sessao', 'https://zoom.us/j/123456789' + i)
      const dt = new Date(today)
      dt.setDate(today.getDate() + i + 1)
      at.set('appointment_date', dt.toISOString())
      at.set('start_time', '10:00')
      at.set('end_time', '10:50')
      app.save(at)
    }

    // Telepsicologia Appointments (History)
    for (let i = 0; i < 3; i++) {
      const ah = new Record(apptCol)
      ah.set('user_id', admin.id)
      ah.set('patient_id', [pIds[i]])
      ah.set('type', 'Online')
      ah.set('tipo_sessao', 'individual')
      ah.set('status', 'concluida')
      const dh = new Date(today)
      dh.setDate(today.getDate() - (i + 1))
      ah.set('appointment_date', dh.toISOString())
      ah.set('start_time', '14:00')
      ah.set('end_time', '14:50')
      app.save(ah)
    }
  },
  (app) => {
    try {
      app
        .db()
        .newQuery("DELETE FROM patients WHERE name LIKE '%(Telepsi)' OR name LIKE '%(Grupo)'")
        .execute()
      app
        .db()
        .newQuery(
          "DELETE FROM grupos_terapeuticos WHERE nome IN ('Grupo de Ansiedade', 'Grupo de Mindfulness')",
        )
        .execute()
    } catch (_) {}
  },
)
