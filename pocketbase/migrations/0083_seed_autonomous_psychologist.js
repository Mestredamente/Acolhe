migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const patients = app.findCollectionByNameOrId('patients')
    const financeiro = app.findCollectionByNameOrId('financeiro')
    const clinicas = app.findCollectionByNameOrId('clinicas')
    const saas = app.findCollectionByNameOrId('saas_assinaturas')

    let user
    try {
      user = app.findAuthRecordByEmail('users', 'autonomo@psicogestao.com')
    } catch (_) {
      user = new Record(users)
      user.setEmail('autonomo@psicogestao.com')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Dr. Autônomo')
      user.set('profile', 'psicologo')
      user.set('status', 'ativo')
      user.set('onboarding_completo', true)
      app.save(user)
    }

    let clinica
    try {
      clinica = app.findFirstRecordByData('clinicas', 'admin_id', user.id)
    } catch (_) {
      clinica = new Record(clinicas)
      clinica.set('nome', 'Consultório Dr. Autônomo')
      clinica.set('admin_id', user.id)
      clinica.set('status', 'ativa')
      app.save(clinica)
    }

    try {
      app.findFirstRecordByData('saas_assinaturas', 'id_clinica', clinica.id)
    } catch (_) {
      const assinatura = new Record(saas)
      assinatura.set('id_clinica', clinica.id)
      assinatura.set('plano', 'profissional')
      assinatura.set('status', 'ativo')
      assinatura.set('valor_mensal', 97)
      assinatura.set('limite_psicologos', 1)
      assinatura.set('data_inicio', new Date().toISOString())

      const renovacao = new Date()
      renovacao.setMonth(renovacao.getMonth() + 1)
      assinatura.set('data_renovacao', renovacao.toISOString())

      app.save(assinatura)
    }

    let patient
    try {
      patient = app.findFirstRecordByData('patients', 'email', 'plataforma@psicogestao.com')
    } catch (_) {
      patient = new Record(patients)
      patient.set('user_id', user.id)
      patient.set('name', 'Plataforma PsicoGestão')
      patient.set('email', 'plataforma@psicogestao.com')
      patient.set('status', 'active')
      app.save(patient)
    }

    const records = app.findRecordsByFilter(
      'financeiro',
      `user_id = '${user.id}' && description = 'Assinatura Plano Profissional'`,
      '',
      1,
      0,
    )
    if (records.length === 0) {
      const fin = new Record(financeiro)
      fin.set('user_id', user.id)
      fin.set('patient_id', patient.id)
      fin.set('description', 'Assinatura Plano Profissional')
      fin.set('amount', 97)
      fin.set('due_date', new Date().toISOString())
      fin.set('status', 'pendente')
      app.save(fin)
    }
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('users', 'autonomo@psicogestao.com')
      app.delete(user)
    } catch (_) {}
  },
)
