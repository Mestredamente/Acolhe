routerAdd(
  'POST',
  '/backend/v1/demo-tenant/generate',
  (e) => {
    const body = e.requestInfo().body
    const users = $app.findCollectionByNameOrId('users')

    const user = new Record(users)
    user.set('name', body.nome || 'Demo User')
    user.setEmail(body.email || `demo_${$security.randomString(6)}@example.com`)
    user.setPassword('Demo@123456')
    user.setVerified(true)
    user.set('profile', body.tipo === 'clinica' ? 'admin' : 'psicologo')
    user.set('is_teste', true)
    $app.save(user)

    let clinicaId = null
    if (body.tipo === 'clinica') {
      const clinicas = $app.findCollectionByNameOrId('clinicas')
      const clinica = new Record(clinicas)
      clinica.set('nome', body.nome || 'Clínica Demo')
      clinica.set('admin_id', user.id)
      clinica.set('is_demo', true)
      $app.save(clinica)
      clinicaId = clinica.id

      user.set('id_clinica', clinica.id)
      $app.save(user)
    }

    const tenants = $app.findCollectionByNameOrId('tenants_demo')
    const tenant = new Record(tenants)
    tenant.set('nome', body.nome || 'Demo Tenant')
    tenant.set('tipo', body.tipo || 'autonomo')
    tenant.set('status', 'ativo')
    tenant.set('demo_user_id', user.id)
    if (clinicaId) {
      tenant.set('demo_clinica_id', clinicaId)
    }
    $app.save(tenant)

    return e.json(200, { tenant: tenant.id, user: user.id })
  },
  $apis.requireAuth(),
)
