migrate(
  (app) => {
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
    } catch (_) {
      return // user not found, skip
    }

    try {
      app.findFirstRecordByData('config_clinica', 'user_id', user.id)
      return // config already seeded
    } catch (_) {}

    const col = app.findCollectionByNameOrId('config_clinica')
    const record = new Record(col)

    record.set('user_id', user.id)
    record.set('nome_clinica', 'Mestre da Mente Clínica')
    record.set('crp_psicologo', '06/123456')
    record.set('tempo_sessao_minutos', 50)
    record.set('valor_consulta_padrao', 150.0)
    record.set('intervalo_consultas_minutos', 10)
    record.set('horario_inicio', '08:00')
    record.set('horario_fim', '18:00')
    record.set('dias_atendimento', ['segunda', 'terca', 'quarta', 'quinta', 'sexta'])
    record.set('nome_profissional', 'Dr. Mestre da Mente')
    record.set('abordagem_principal', 'TCC')
    record.set(
      'texto_apresentacao',
      'Olá! Sou especialista em TCC e estou aqui para te ajudar em sua jornada de autoconhecimento.',
    )

    app.save(record)
  },
  (app) => {
    // down migration omitted for seeds
  },
)
