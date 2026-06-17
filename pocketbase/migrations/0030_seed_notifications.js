migrate(
  (app) => {
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
      const patients = app.findRecordsByFilter(
        'patients',
        `user_id = '${admin.id}'`,
        '-created',
        1,
        0,
      )
      const ptId = patients.length > 0 ? patients[0].id : null

      const notificacoes = app.findCollectionByNameOrId('notificacoes')

      const types = [
        'consulta_proxima',
        'pagamento_atrasado',
        'documento_pendente',
        'mensagem_nova',
        'sistema',
      ]
      const links = ['/agenda', '/financeiro', '/pacientes', '/mensagens', '/']
      for (let i = 0; i < 5; i++) {
        const r = new Record(notificacoes)
        r.set('user_id', admin.id)
        if (ptId) r.set('patient_id', ptId)
        r.set('type', types[i])
        r.set('title', 'Alerta do Sistema: ' + types[i].replace('_', ' '))
        r.set('message', 'Exemplo de notificação gerada para testes da plataforma.')
        r.set('status', i < 2 ? 'nao_lida' : 'lida')
        r.set('link', links[i])
        app.save(r)
      }

      const ptUsers = app.findRecordsByFilter(
        '_pb_users_auth_',
        `profile = 'paciente'`,
        '-created',
        1,
        0,
      )
      if (ptUsers.length > 0) {
        const ptUser = ptUsers[0]
        const ptTypes = ['consulta_confirmada', 'escala_pendente', 'mensagem_nova']
        const ptLinks = ['/portal', '/portal/tarefas', '/portal/mensagens']
        for (let i = 0; i < 3; i++) {
          const r = new Record(notificacoes)
          r.set('user_id', ptUser.id)
          if (ptId) r.set('patient_id', ptId)
          r.set('type', ptTypes[i])
          r.set('title', 'Aviso do Portal ' + (i + 1))
          r.set('message', 'Notificação de exemplo para o paciente no portal.')
          r.set('status', 'nao_lida')
          r.set('link', ptLinks[i])
          app.save(r)
        }
      }
    } catch (e) {}
  },
  (app) => {
    try {
      app.db().newQuery('DELETE FROM notificacoes').execute()
    } catch (_) {}
  },
)
