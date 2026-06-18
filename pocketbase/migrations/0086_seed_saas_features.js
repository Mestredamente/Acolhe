migrate(
  (app) => {
    const planos = app.findCollectionByNameOrId('saas_planos')

    const plansToSeed = [
      {
        nome: 'Starter',
        tipo: 'clinica',
        descricao: 'Para clínicas pequenas',
        valor_mensal: 199,
        limite_psicologos: 2,
        status: 'ativo',
        features: ['Agenda', 'Prontuário'],
      },
      {
        nome: 'Professional',
        tipo: 'clinica',
        descricao: 'Para clínicas em crescimento',
        valor_mensal: 399,
        limite_psicologos: 5,
        status: 'ativo',
        features: ['Agenda', 'Prontuário', 'Faturamento'],
      },
      {
        nome: 'Enterprise',
        tipo: 'clinica',
        descricao: 'Para grandes clínicas',
        valor_mensal: 799,
        limite_psicologos: 999,
        status: 'ativo',
        features: ['Tudo ilimitado'],
      },
      {
        nome: 'Free',
        tipo: 'autonomo',
        descricao: 'Gratuito para começar',
        valor_mensal: 0,
        limite_psicologos: 1,
        status: 'ativo',
        features: ['Agenda básica'],
      },
      {
        nome: 'Profissional',
        tipo: 'autonomo',
        descricao: 'Funcionalidades avançadas',
        valor_mensal: 99,
        limite_psicologos: 1,
        status: 'ativo',
        features: ['Prontuário IA', 'Faturamento'],
      },
    ]

    const planoIds = {}
    for (const p of plansToSeed) {
      let existing
      try {
        existing = app.findFirstRecordByData('saas_planos', 'nome', p.nome)
        planoIds[p.nome] = existing.id
      } catch (_) {
        const record = new Record(planos)
        record.set('nome', p.nome)
        record.set('tipo', p.tipo)
        record.set('descricao', p.descricao)
        record.set('valor_mensal', p.valor_mensal)
        record.set('limite_psicologos', p.limite_psicologos)
        record.set('status', p.status)
        record.set('features', p.features)
        app.save(record)
        planoIds[p.nome] = record.id
      }
    }

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let auto1, auto2
    try {
      auto1 = app.findAuthRecordByEmail('_pb_users_auth_', 'auto1@test.com')
    } catch (_) {
      auto1 = new Record(users)
      auto1.setEmail('auto1@test.com')
      auto1.setPassword('Skip@Pass')
      auto1.setVerified(true)
      auto1.set('name', 'Dr. Autônomo Silva')
      auto1.set('profile', 'psicologo')
      auto1.set('status', 'ativo')
      app.save(auto1)
    }

    try {
      auto2 = app.findAuthRecordByEmail('_pb_users_auth_', 'auto2@test.com')
    } catch (_) {
      auto2 = new Record(users)
      auto2.setEmail('auto2@test.com')
      auto2.setPassword('Skip@Pass')
      auto2.setVerified(true)
      auto2.set('name', 'Dra. Autônoma Souza')
      auto2.set('profile', 'psicologo')
      auto2.set('status', 'ativo')
      app.save(auto2)
    }

    const assinaturas = app.findCollectionByNameOrId('saas_assinaturas')
    try {
      app.findFirstRecordByData('saas_assinaturas', 'user_id', auto1.id)
    } catch (_) {
      const ass = new Record(assinaturas)
      ass.set('user_id', auto1.id)
      ass.set('plano', 'profissional')
      if (planoIds['Profissional']) ass.set('plano_id', planoIds['Profissional'])
      ass.set('status', 'ativo')
      ass.set('valor_mensal', 99)
      ass.set('data_inicio', new Date().toISOString())
      app.save(ass)
    }

    try {
      app.findFirstRecordByData('saas_assinaturas', 'user_id', auto2.id)
    } catch (_) {
      const ass = new Record(assinaturas)
      ass.set('user_id', auto2.id)
      ass.set('plano', 'free')
      if (planoIds['Free']) ass.set('plano_id', planoIds['Free'])
      ass.set('status', 'trial')
      ass.set('valor_mensal', 0)
      ass.set('data_inicio', new Date().toISOString())
      app.save(ass)
    }
  },
  (app) => {},
)
