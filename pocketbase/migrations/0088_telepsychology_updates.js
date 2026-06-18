migrate(
  (app) => {
    const apts = app.findCollectionByNameOrId('appointments')
    apts.fields.add(new TextField({ name: 'link_sessao', required: false }))
    apts.fields.add(
      new SelectField({ name: 'tipo_link', values: ['proprio', 'externo'], required: false }),
    )
    apts.fields.add(new DateField({ name: 'data_geracao_link', required: false }))
    app.save(apts)

    const logs = new Collection({
      name: 'log_acessos_sala',
      type: 'base',
      listRule: "@request.auth.profile = 'admin'",
      viewRule: "@request.auth.profile = 'admin'",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'consulta_id',
          type: 'relation',
          required: true,
          collectionId: apts.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'perfil', type: 'select', required: true, values: ['psicologo', 'paciente'] },
        { name: 'ip_origem', type: 'text', required: false },
        { name: 'acao', type: 'select', required: true, values: ['entrada', 'saida'] },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(logs)

    try {
      const patients = app.findRecordsByFilter('patients', "status = 'active'", '', 2, 0)
      const admin = app.findFirstRecordByData('users', 'email', 'mestredamente1@gmail.com')
      if (patients.length > 0 && admin) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const dayAfter = new Date()
        dayAfter.setDate(dayAfter.getDate() + 2)

        const d1 = tomorrow.toISOString().split('T')[0]
        const d2 = dayAfter.toISOString().split('T')[0]

        const apt1 = new Record(apts)
        apt1.set('user_id', admin.id)
        apt1.set('patient_id', patients[0].id)
        apt1.set('type', 'Online')
        apt1.set('status', 'agendada')
        apt1.set('appointment_date', d1 + ' 12:00:00.000Z')
        apt1.set('start_time', '10:00')
        apt1.set('end_time', '10:50')
        apt1.set('tipo_sessao', 'individual')
        apt1.set('link_sessao', '/sessao/mock123')
        apt1.set('tipo_link', 'proprio')
        apt1.set('data_geracao_link', new Date().toISOString())
        app.save(apt1)

        const apt2 = new Record(apts)
        apt2.set('user_id', admin.id)
        apt2.set('patient_id', patients[1] ? patients[1].id : patients[0].id)
        apt2.set('type', 'Online')
        apt2.set('status', 'agendada')
        apt2.set('appointment_date', d2 + ' 12:00:00.000Z')
        apt2.set('start_time', '14:00')
        apt2.set('end_time', '14:50')
        apt2.set('tipo_sessao', 'individual')
        app.save(apt2)

        const consentsCol = app.findCollectionByNameOrId('consentimentos')
        try {
          app.findFirstRecordByFilter(
            'consentimentos',
            `paciente_id='${patients[0].id}' && tipo='telepsicologia'`,
          )
        } catch (_) {
          const c = new Record(consentsCol)
          c.set('paciente_id', patients[0].id)
          c.set('tipo', 'telepsicologia')
          c.set('aceito', true)
          c.set('data_aceite', new Date().toISOString())
          app.save(c)
        }
      }
    } catch (e) {}
  },
  (app) => {
    const logs = app.findCollectionByNameOrId('log_acessos_sala')
    app.delete(logs)
    const apts = app.findCollectionByNameOrId('appointments')
    apts.fields.removeByName('link_sessao')
    apts.fields.removeByName('tipo_link')
    apts.fields.removeByName('data_geracao_link')
    app.save(apts)
  },
)
