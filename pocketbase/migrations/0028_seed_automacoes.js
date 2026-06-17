migrate(
  (app) => {
    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
    } catch (_) {
      return
    }

    let config
    try {
      const configs = app.findRecordsByFilter('config_clinica', `user_id = '${admin.id}'`, '', 1, 0)
      if (configs && configs.length > 0) {
        config = configs[0]
        config.set('whatsapp_phone', '+55 11 99999-9999')
        config.set('whatsapp_connected', true)
        app.save(config)
      }
    } catch (_) {}

    const automacoesCol = app.findCollectionByNameOrId('automacoes')

    try {
      app.findFirstRecordByData('automacoes', 'tipo', 'confirmacao')
    } catch (_) {
      const a1 = new Record(automacoesCol)
      a1.set('user_id', admin.id)
      a1.set('tipo', 'confirmacao')
      a1.set('status', 'ativo')
      a1.set(
        'mensagem_padrao',
        'Olá [Nome do Paciente], sua consulta foi agendada para o dia [Data] às [Hora]. Tipo: [Tipo de Consulta].',
      )
      app.save(a1)
    }

    try {
      app.findFirstRecordByData('automacoes', 'tipo', 'lembrete')
    } catch (_) {
      const a2 = new Record(automacoesCol)
      a2.set('user_id', admin.id)
      a2.set('tipo', 'lembrete')
      a2.set('status', 'ativo')
      a2.set('dias_antecedencia', 1)
      a2.set('horario_envio', '18:00')
      a2.set(
        'mensagem_padrao',
        'Lembrete: Você tem uma consulta amanhã, [Data] às [Hora]. Link: [Link].',
      )
      app.save(a2)
    }

    try {
      app.findFirstRecordByData('automacoes', 'tipo', 'pos_sessao')
    } catch (_) {
      const a3 = new Record(automacoesCol)
      a3.set('user_id', admin.id)
      a3.set('tipo', 'pos_sessao')
      a3.set('status', 'inativo')
      a3.set('horas_pos_sessao', 2)
      a3.set(
        'mensagem_padrao',
        'Sua sessão foi concluída! Avalie de 1 a 5: como se sentiu na consulta de hoje?',
      )
      app.save(a3)
    }

    const patients = app.findRecordsByFilter('patients', `user_id = '${admin.id}'`, 'created', 1, 0)
    if (!patients || patients.length === 0) return
    const patient = patients[0]

    const histCol = app.findCollectionByNameOrId('automacoes_historico')
    const now = new Date().toISOString().replace('T', ' ')

    try {
      app.findFirstRecordByData('automacoes_historico', 'tipo', 'confirmacao')
    } catch (_) {
      const h1 = new Record(histCol)
      h1.set('user_id', admin.id)
      h1.set('patient_id', patient.id)
      h1.set('tipo', 'confirmacao')
      h1.set('data_envio', now)
      h1.set('status', 'enviado')
      app.save(h1)
    }

    try {
      app.findFirstRecordByData('automacoes_historico', 'tipo', 'lembrete')
    } catch (_) {
      const h2 = new Record(histCol)
      h2.set('user_id', admin.id)
      h2.set('patient_id', patient.id)
      h2.set('tipo', 'lembrete')
      h2.set('data_envio', now)
      h2.set('status', 'falha')
      app.save(h2)
    }

    try {
      app.findFirstRecordByData('automacoes_historico', 'tipo', 'pos_sessao')
    } catch (_) {
      const h3 = new Record(histCol)
      h3.set('user_id', admin.id)
      h3.set('patient_id', patient.id)
      h3.set('tipo', 'pos_sessao')
      h3.set('data_envio', now)
      h3.set('status', 'enviado')
      app.save(h3)
    }
  },
  (app) => {},
)
