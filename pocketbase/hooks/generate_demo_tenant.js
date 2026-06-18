routerAdd(
  'POST',
  '/backend/v1/demo-tenants',
  (e) => {
    if (e.auth?.getString('profile') !== 'admin') {
      return e.forbiddenError('Apenas admins podem criar tenants de demonstração')
    }

    const body = e.requestInfo().body || {}
    const nome = body.nome || 'Novo Demo'
    const tipo = body.tipo || 'clinica'
    const plano = body.plano || 'profissional'

    let clinicaId = ''
    if (tipo === 'clinica') {
      const clinica = new Record($app.findCollectionByNameOrId('clinicas'))
      clinica.set('nome', nome)
      clinica.set('status', 'ativa')
      clinica.set('is_demo', true)
      $app.save(clinica)
      clinicaId = clinica.id
    }

    const adminUser = new Record($app.findCollectionByNameOrId('users'))
    const email = `demo_${$security.randomString(6)}@demo.com`
    adminUser.setEmail(email)
    adminUser.setPassword('Demo@123456')
    adminUser.setVerified(true)
    adminUser.set('name', `Admin ${nome}`)
    adminUser.set('profile', 'psicologo')
    adminUser.set('status', 'ativo')
    adminUser.set('is_teste', true)
    if (clinicaId) adminUser.set('id_clinica', clinicaId)
    $app.save(adminUser)

    const patientIds = []
    for (let i = 0; i < 3; i++) {
      const pt = new Record($app.findCollectionByNameOrId('patients'))
      pt.set('name', `Paciente Teste ${i + 1}`)
      pt.set('user_id', adminUser.id)
      pt.set('status', 'active')
      pt.set('is_teste', true)
      if (clinicaId) pt.set('id_clinica', clinicaId)
      $app.save(pt)
      patientIds.push(pt.id)
    }

    const apptCol = $app.findCollectionByNameOrId('appointments')
    const evCol = $app.findCollectionByNameOrId('evolucoes')

    patientIds.forEach((pid) => {
      for (let j = 0; j < 2; j++) {
        const apt = new Record(apptCol)
        apt.set('user_id', adminUser.id)
        apt.set('patient_id', pid)
        const d = new Date()
        d.setDate(d.getDate() - j * 7)
        apt.set('appointment_date', d.toISOString().split('T')[0])
        apt.set('start_time', '10:00')
        apt.set('end_time', '11:00')
        apt.set('status', 'concluida')
        apt.set('type', 'Online')
        apt.set('is_teste', true)
        $app.save(apt)

        const ev = new Record(evCol)
        ev.set('user_id', adminUser.id)
        ev.set('patient_id', pid)
        ev.set('appointment_id', apt.id)
        ev.set('session_date', apt.get('appointment_date'))
        ev.set('content', 'Sessão de teste gerada automaticamente para demonstração.')
        ev.set('is_teste', true)
        $app.save(ev)
      }
    })

    const tenant = new Record($app.findCollectionByNameOrId('tenants_demo'))
    tenant.set('nome', nome)
    tenant.set('tipo', tipo)
    tenant.set('plano', plano)
    tenant.set('status', 'ativo')
    tenant.set('demo_user_id', adminUser.id)
    if (clinicaId) tenant.set('demo_clinica_id', clinicaId)
    $app.save(tenant)

    return e.json(200, {
      id: tenant.id,
      email: email,
      password: 'Demo@123456',
    })
  },
  $apis.requireAuth(),
)
