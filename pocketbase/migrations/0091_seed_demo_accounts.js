migrate(
  (app) => {
    const createDemo = (nome, tipo) => {
      let clinicaId = ''
      if (tipo === 'clinica') {
        const clinica = new Record(app.findCollectionByNameOrId('clinicas'))
        clinica.set('nome', nome)
        clinica.set('status', 'ativa')
        clinica.set('is_demo', true)
        app.save(clinica)
        clinicaId = clinica.id
      }

      const adminUser = new Record(app.findCollectionByNameOrId('users'))
      adminUser.setEmail(`demo_${tipo}_${$security.randomString(4)}@demo.com`)
      adminUser.setPassword('Demo@123456')
      adminUser.setVerified(true)
      adminUser.set('name', `Admin ${nome}`)
      adminUser.set('profile', 'psicologo')
      adminUser.set('status', 'ativo')
      adminUser.set('is_teste', true)
      if (clinicaId) adminUser.set('id_clinica', clinicaId)
      app.save(adminUser)

      const pt = new Record(app.findCollectionByNameOrId('patients'))
      pt.set('name', `Paciente Teste ${nome}`)
      pt.set('user_id', adminUser.id)
      pt.set('status', 'active')
      pt.set('is_teste', true)
      if (clinicaId) pt.set('id_clinica', clinicaId)
      app.save(pt)

      const tenant = new Record(app.findCollectionByNameOrId('tenants_demo'))
      tenant.set('nome', nome)
      tenant.set('tipo', tipo)
      tenant.set('plano', 'profissional')
      tenant.set('status', 'ativo')
      tenant.set('demo_user_id', adminUser.id)
      if (clinicaId) tenant.set('demo_clinica_id', clinicaId)
      app.save(tenant)
    }

    createDemo('Demo Clínica Alpha', 'clinica')
    createDemo('Demo Autônomo Beta', 'autonomo')

    try {
      const owner = app.findFirstRecordByData('users', 'email', 'mestredamente1@gmail.com')
      if (owner) {
        const pt = new Record(app.findCollectionByNameOrId('patients'))
        pt.set('name', 'Paciente de Teste (Admin)')
        pt.set('user_id', owner.id)
        pt.set('status', 'active')
        pt.set('is_teste', true)
        if (owner.getString('id_clinica')) pt.set('id_clinica', owner.getString('id_clinica'))
        app.save(pt)
      }
    } catch (_) {}
  },
  (app) => {},
)
