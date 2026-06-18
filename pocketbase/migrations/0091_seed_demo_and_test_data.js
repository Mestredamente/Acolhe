migrate(
  (app) => {
    try {
      app.findFirstRecordByData('tenants_demo', 'nome', 'Demo Clínica Alpha')
      return // already seeded
    } catch (_) {}

    const usersCol = app.findCollectionByNameOrId('users')
    const clinicasCol = app.findCollectionByNameOrId('clinicas')
    const tenantsCol = app.findCollectionByNameOrId('tenants_demo')
    const patientsCol = app.findCollectionByNameOrId('patients')

    // 1. Create Demo Clinica
    const c = new Record(clinicasCol)
    c.set('nome', 'Clínica Demo Alpha')
    c.set('status', 'ativa')
    c.set('is_demo', true)
    app.save(c)

    const u1 = new Record(usersCol)
    u1.setEmail('admin_demo_alpha@psicogestao.com')
    u1.setPassword('Skip@Pass')
    u1.set('name', 'Dr. Demo Alpha')
    u1.set('profile', 'psicologo')
    u1.set('id_clinica', c.id)
    u1.set('is_teste', true)
    app.save(u1)

    const t1 = new Record(tenantsCol)
    t1.set('nome', 'Demo Clínica Alpha')
    t1.set('tipo', 'clinica')
    t1.set('plano', 'Corporativo')
    t1.set('status', 'ativo')
    t1.set('id_clinica', c.id)
    t1.set('owner_id', u1.id)
    app.save(t1)

    // Demo Patient for Clinic
    const p1 = new Record(patientsCol)
    p1.set('user_id', u1.id)
    p1.set('id_clinica', c.id)
    p1.set('name', 'Paciente Fictício Alpha')
    p1.set('status', 'active')
    p1.set('is_teste', true)
    app.save(p1)

    // 2. Create Demo Auto
    const u2 = new Record(usersCol)
    u2.setEmail('demo_auto_beta@psicogestao.com')
    u2.setPassword('Skip@Pass')
    u2.set('name', 'Dra. Demo Beta')
    u2.set('profile', 'psicologo')
    u2.set('is_teste', true)
    app.save(u2)

    const t2 = new Record(tenantsCol)
    t2.set('nome', 'Demo Auto Beta')
    t2.set('tipo', 'autonomo')
    t2.set('plano', 'Profissional')
    t2.set('status', 'ativo')
    t2.set('owner_id', u2.id)
    app.save(t2)

    // Demo Patient for Auto
    const p2 = new Record(patientsCol)
    p2.set('user_id', u2.id)
    p2.set('name', 'Paciente Fictício Beta')
    p2.set('status', 'active')
    p2.set('is_teste', true)
    app.save(p2)
  },
  (app) => {
    // Irreversible easily since multiple records are inserted,
    // relying on DB wipe or selective deletes normally.
  },
)
