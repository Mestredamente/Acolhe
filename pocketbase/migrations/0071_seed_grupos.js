migrate(
  (app) => {
    const gruposCol = app.findCollectionByNameOrId('grupos_terapeuticos')
    const apptCol = app.findCollectionByNameOrId('appointments')

    try {
      app.findFirstRecordByData('grupos_terapeuticos', 'nome', 'Grupo de Ansiedade')
      return // already seeded
    } catch (_) {}

    const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
    const clinica = app.findFirstRecordByData('clinicas', 'cnpj', '12.345.678/0001-90')

    const patients = app.findRecordsByFilter('patients', '1=1', '', 8, 0)
    const patientIds = patients.map((p) => p.id)

    const g1 = new Record(gruposCol)
    g1.set('nome', 'Grupo de Ansiedade')
    g1.set('tema', 'TCC')
    g1.set('descricao', 'Grupo focado em técnicas de TCC para manejo da ansiedade.')
    g1.set('limite_participantes', 12)
    g1.set('data_inicio', new Date().toISOString())
    g1.set('status', 'ativo')
    g1.set('user_id', admin.id)
    g1.set('id_clinica', clinica.id)
    g1.set('participantes', patientIds)
    app.save(g1)

    for (let i = 1; i <= 3; i++) {
      const a = new Record(apptCol)
      a.set('user_id', admin.id)
      a.set('patient_id', patientIds)
      a.set('tipo_sessao', 'grupo')
      a.set('grupo_id', g1.id)
      a.set('appointment_date', new Date(Date.now() + i * 86400000).toISOString())
      a.set('start_time', '18:00')
      a.set('end_time', '19:30')
      a.set('type', 'Online')
      a.set('status', 'agendada')
      a.set('patient_name_text', 'Grupo: Grupo de Ansiedade')
      app.save(a)
    }
  },
  (app) => {
    try {
      const g1 = app.findFirstRecordByData('grupos_terapeuticos', 'nome', 'Grupo de Ansiedade')
      app.delete(g1)
    } catch (_) {}
  },
)
