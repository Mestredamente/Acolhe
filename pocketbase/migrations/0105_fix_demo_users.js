migrate(
  (app) => {
    // Neutralize previous raw SQL seeds by deleting them and recreating properly via API
    const emails = [
      'demo@clinica.com',
      'demo@psicologo.com',
      'demo@paciente.com',
      'demo@secretaria.com',
    ]

    for (const email of emails) {
      try {
        const existing = app.findAuthRecordByEmail('users', email)
        app.delete(existing)
      } catch (_) {}
    }

    // Delete existing demo tenants
    try {
      const tenants = app.findRecordsByFilter('tenants_demo', '1=1', '', 100, 0)
      for (const t of tenants) app.delete(t)
    } catch (_) {}

    const usersCol = app.findCollectionByNameOrId('users')

    const createDemoUser = (name, email, profile) => {
      const record = new Record(usersCol)
      record.set('name', name)
      record.setEmail(email)
      record.setPassword('Demo@123456')
      record.setVerified(true)
      record.set('profile', profile)
      record.set('is_teste', true)
      app.save(record)
      return record
    }

    const clinicaAdmin = createDemoUser('Admin Clínica Demo', 'demo@clinica.com', 'admin')
    const psiDemo = createDemoUser('Psicólogo Demo', 'demo@psicologo.com', 'psicologo')
    createDemoUser('Secretária Demo', 'demo@secretaria.com', 'secretaria')
    createDemoUser('Paciente Demo', 'demo@paciente.com', 'paciente')

    // Create demo clinic
    let clinicaId = null
    try {
      const clinicas = app.findCollectionByNameOrId('clinicas')
      const clinica = new Record(clinicas)
      clinica.set('nome', 'Clínica Demo S/A')
      clinica.set('admin_id', clinicaAdmin.id)
      clinica.set('is_demo', true)
      app.save(clinica)
      clinicaId = clinica.id

      clinicaAdmin.set('id_clinica', clinica.id)
      app.save(clinicaAdmin)

      psiDemo.set('id_clinica', clinica.id)
      app.save(psiDemo)
    } catch (err) {
      console.log('Could not create demo clinica', err.message)
    }

    // Create demo tenant
    try {
      const tenantsCol = app.findCollectionByNameOrId('tenants_demo')
      const tenant = new Record(tenantsCol)
      tenant.set('nome', 'Tenant Demo Principal')
      tenant.set('tipo', 'clinica')
      tenant.set('status', 'ativo')
      tenant.set('demo_user_id', clinicaAdmin.id)
      if (clinicaId) tenant.set('demo_clinica_id', clinicaId)
      app.save(tenant)
    } catch (_) {}
  },
  (app) => {
    // Down migration
  },
)
