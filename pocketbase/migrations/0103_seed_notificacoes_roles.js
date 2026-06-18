migrate(
  (app) => {
    try {
      const notifCol = app.findCollectionByNameOrId('notificacoes')

      // Admin (gestor_saas)
      try {
        const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
        const adminSeeds = [
          {
            t: 'sistema',
            title: 'Novo Assinante',
            msg: 'A Clínica Saúde Mental contratou o plano Profissional.',
          },
          {
            t: 'financeiro',
            title: 'Pagamento de Assinatura',
            msg: 'Pagamento do plano Profissional recebido com sucesso.',
          },
          {
            t: 'sistema',
            title: 'Novo Ticket de Suporte',
            msg: 'O usuário João abriu um novo ticket de suporte técnico.',
          },
        ]
        for (const s of adminSeeds) {
          const r = new Record(notifCol)
          r.set('user_id', admin.id)
          r.set('perfil_destino', 'gestor_saas')
          r.set('type', s.t)
          r.set('title', s.title)
          r.set('message', s.msg)
          r.set('status', 'nao_lida')
          r.set('is_active', true)
          app.save(r)
        }
      } catch (_) {}

      // Psicologo
      try {
        const psico = app.findFirstRecordByData('_pb_users_auth_', 'profile', 'psicologo')
        const psicoSeeds = [
          {
            t: 'agenda',
            title: 'Consulta Amanhã',
            msg: 'Você tem uma consulta agendada com Maria Silva às 14:00.',
          },
          {
            t: 'mensagem',
            title: 'Nova Mensagem',
            msg: 'Paciente Maria enviou uma nova mensagem no portal.',
          },
          {
            t: 'prontuario',
            title: 'Escala Respondida',
            msg: 'O paciente João respondeu a Escala de Ansiedade de Beck.',
          },
        ]
        for (const s of psicoSeeds) {
          const r = new Record(notifCol)
          r.set('user_id', psico.id)
          r.set('perfil_destino', 'psicologo')
          r.set('type', s.t)
          r.set('title', s.title)
          r.set('message', s.msg)
          r.set('status', 'nao_lida')
          r.set('is_active', true)
          app.save(r)
        }
      } catch (_) {}

      // Paciente
      try {
        const ptUser = app.findFirstRecordByData('_pb_users_auth_', 'profile', 'paciente')
        const ptSeeds = [
          {
            t: 'agenda',
            title: 'Consulta Confirmada',
            msg: 'Sua consulta de amanhã às 14:00 está confirmada.',
          },
          {
            t: 'agenda',
            title: 'Link de Telepsicologia',
            msg: 'Acesse o link da sua sessão online que acontecerá em breve.',
          },
          {
            t: 'mensagem',
            title: 'Nova Mensagem',
            msg: 'Seu psicólogo enviou uma nova orientação.',
          },
        ]
        for (const s of ptSeeds) {
          const r = new Record(notifCol)
          r.set('user_id', ptUser.id)
          r.set('perfil_destino', 'paciente')
          r.set('type', s.t)
          r.set('title', s.title)
          r.set('message', s.msg)
          r.set('status', 'nao_lida')
          r.set('is_active', true)
          app.save(r)
        }
      } catch (_) {}
    } catch (_) {}
  },
  (app) => {},
)
