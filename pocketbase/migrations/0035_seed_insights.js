migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let admin
    try {
      admin = app.findFirstRecordByData('_pb_users_auth_', 'email', 'mestredamente1@gmail.com')
    } catch (_) {
      const allUsers = app.findRecordsByFilter(
        '_pb_users_auth_',
        "profile='admin' || profile='psicologo'",
        '',
        1,
        0,
      )
      if (allUsers.length) admin = allUsers[0]
      else return
    }

    const patientsCol = app.findCollectionByNameOrId('patients')
    const diariosCol = app.findCollectionByNameOrId('diario_paciente')
    const apptCol = app.findCollectionByNameOrId('appointments')
    const escalasCol = app.findCollectionByNameOrId('escalas')
    const respEscalasCol = app.findCollectionByNameOrId('respostas_escala')

    let escala
    try {
      escala = app.findFirstRecordByData('escalas', 'name', 'PHQ-9 (Mock Insights)')
    } catch (_) {
      escala = new Record(escalasCol)
      escala.set('name', 'PHQ-9 (Mock Insights)')
      escala.set('category', 'Humor')
      app.save(escala)
    }

    const mockPatients = [
      { name: 'Ana Silva (Alerta)', email: 'ana.alerta@example.com', risk: 'alerta' },
      { name: 'Bruno Costa (Atenção)', email: 'bruno.atencao@example.com', risk: 'atencao' },
      { name: 'Carlos Santos (Estável)', email: 'carlos.estavel@example.com', risk: 'estavel' },
      { name: 'Diana Lima (Atenção)', email: 'diana.atencao@example.com', risk: 'atencao2' },
      { name: 'Eduardo Alves (Estável)', email: 'eduardo.estavel@example.com', risk: 'estavel2' },
    ]

    const today = new Date()
    const formatDate = (date) => date.toISOString().replace('T', ' ')

    for (const mp of mockPatients) {
      let patient
      try {
        patient = app.findFirstRecordByData('patients', 'email', mp.email)
      } catch (_) {
        patient = new Record(patientsCol)
        patient.set('user_id', admin.id)
        patient.set('name', mp.name)
        patient.set('email', mp.email)
        patient.set('status', 'active')
        app.save(patient)
      }

      try {
        app
          .db()
          .newQuery('DELETE FROM appointments WHERE patient_id = {:id}')
          .bind({ id: patient.id })
          .execute()
      } catch (e) {}
      try {
        app
          .db()
          .newQuery('DELETE FROM diario_paciente WHERE patient_id = {:id}')
          .bind({ id: patient.id })
          .execute()
      } catch (e) {}
      try {
        app
          .db()
          .newQuery('DELETE FROM respostas_escala WHERE patient_id = {:id}')
          .bind({ id: patient.id })
          .execute()
      } catch (e) {}

      if (mp.risk === 'alerta') {
        for (let i = 1; i <= 3; i++) {
          const d = new Record(diariosCol)
          d.set('user_id', admin.id)
          d.set('patient_id', patient.id)
          d.set('entry_date', formatDate(new Date(today.getTime() - i * 86400000)))
          d.set('content', 'Me sinto muito mal hoje...')
          d.set('sentiment', 'triste')
          app.save(d)
        }
      } else if (mp.risk === 'atencao') {
        const d = new Record(diariosCol)
        d.set('user_id', admin.id)
        d.set('patient_id', patient.id)
        d.set('entry_date', formatDate(new Date(today.getTime() - 86400000)))
        d.set('content', 'Um pouco ansioso.')
        d.set('sentiment', 'ansioso')
        app.save(d)

        const resp = new Record(respEscalasCol)
        resp.set('user_id', admin.id)
        resp.set('patient_id', patient.id)
        resp.set('scale_id', escala.id)
        resp.set('status', 'respondido')
        resp.set('response_date', formatDate(new Date()))
        resp.set('total_score', 20)
        resp.set('ai_interpretation', 'Grave')
        app.save(resp)

        const a = new Record(apptCol)
        a.set('user_id', admin.id)
        a.set('patient_id', patient.id)
        a.set('appointment_date', formatDate(new Date(today.getTime() + 86400000)))
        a.set('status', 'agendada')
        a.set('start_time', '10:00')
        app.save(a)
      } else if (mp.risk === 'atencao2') {
        const d = new Record(diariosCol)
        d.set('user_id', admin.id)
        d.set('patient_id', patient.id)
        d.set('entry_date', formatDate(new Date(today.getTime() - 86400000)))
        d.set('content', 'Tudo certo.')
        d.set('sentiment', 'neutro')
        app.save(d)
      } else {
        const d = new Record(diariosCol)
        d.set('user_id', admin.id)
        d.set('patient_id', patient.id)
        d.set('entry_date', formatDate(new Date(today.getTime() - 86400000)))
        d.set('content', 'Hoje foi um bom dia.')
        d.set('sentiment', 'feliz')
        app.save(d)

        const a = new Record(apptCol)
        a.set('user_id', admin.id)
        a.set('patient_id', patient.id)
        a.set('appointment_date', formatDate(new Date(today.getTime() + 86400000)))
        a.set('status', 'agendada')
        a.set('start_time', '14:00')
        app.save(a)
      }
    }
  },
  (app) => {},
)
