routerAdd(
  'POST',
  '/backend/v1/demo/generate',
  (e) => {
    const auth = e.auth
    if (!auth || auth.getString('profile') !== 'admin') {
      return e.forbiddenError('Apenas administradores podem gerar demos.')
    }

    const body = e.requestInfo().body || {}
    const tipo = body.tipo || 'clinica'
    const nome = body.nome || 'Demo Tenant'
    const plano = body.plano || 'Profissional'

    const rnd = $security.randomString(6).toLowerCase()

    let clinicaId = ''
    if (tipo === 'clinica') {
      const c = new Record($app.findCollectionByNameOrId('clinicas'))
      c.set('nome', nome + ' (Clínica Demo)')
      c.set('status', 'ativa')
      c.set('is_demo', true)
      $app.save(c)
      clinicaId = c.id
    }

    // Create the owner
    const u = new Record($app.findCollectionByNameOrId('users'))
    u.setEmail(`demo_${rnd}@psicogestao.com`)
    u.setPassword('Skip@Pass')
    u.set('name', 'Proprietário Demo ' + rnd)
    u.set('profile', 'psicologo')
    u.set('is_teste', true)
    if (clinicaId) u.set('id_clinica', clinicaId)
    $app.save(u)

    // Create the tenant record
    const t = new Record($app.findCollectionByNameOrId('tenants_demo'))
    t.set('nome', nome)
    t.set('tipo', tipo)
    t.set('plano', plano)
    t.set('status', 'ativo')
    t.set('owner_id', u.id)
    if (clinicaId) t.set('id_clinica', clinicaId)
    $app.save(t)

    // Seed 3 fake patients and some appointments/evolutions
    for (let i = 1; i <= 3; i++) {
      const p = new Record($app.findCollectionByNameOrId('patients'))
      p.set('user_id', u.id)
      p.set('name', `Paciente Teste ${i} (${rnd})`)
      p.set('email', `paciente_${rnd}_${i}@test.com`)
      p.set('status', 'active')
      p.set('is_teste', true)
      if (clinicaId) p.set('id_clinica', clinicaId)
      $app.save(p)

      // Create 2 appointments
      for (let j = 1; j <= 2; j++) {
        const a = new Record($app.findCollectionByNameOrId('appointments'))
        a.set('user_id', u.id)
        a.set('patient_id', p.id)
        a.set('status', 'agendada')
        a.set('type', 'Online')
        a.set('is_teste', true)
        const date = new Date()
        date.setDate(date.getDate() + j)
        a.set('appointment_date', date.toISOString().split('T')[0])
        a.set('start_time', '10:00')
        a.set('end_time', '10:50')
        $app.save(a)
      }
    }

    return e.json(200, { success: true, tenant_id: t.id })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/demo/impersonate/{id}',
  (e) => {
    const auth = e.auth
    if (!auth || auth.getString('profile') !== 'admin') {
      return e.forbiddenError('Apenas administradores podem acessar demos.')
    }

    const tenantId = e.request.pathValue('id')
    const t = $app.findRecordById('tenants_demo', tenantId)
    const ownerId = t.getString('owner_id')
    const owner = $app.findRecordById('users', ownerId)

    // Generates a proper auth response for the demo owner so the frontend can swap tokens
    return $apis.recordAuthResponse(e, owner)
  },
  $apis.requireAuth(),
)
