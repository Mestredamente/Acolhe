migrate(
  (app) => {
    const clinicas = app.findCollectionByNameOrId('clinicas')
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
    } catch (_) {
      return
    }

    let c1, c2
    try {
      c1 = app.findFirstRecordByData('clinicas', 'cnpj', '12.345.678/0001-90')
    } catch (_) {
      c1 = new Record(clinicas)
      c1.set('nome', 'Clínica A (Matriz)')
      c1.set('cnpj', '12.345.678/0001-90')
      c1.set('telefone', '+55 11 99999-1111')
      c1.set('email', 'contato@clinicaa.com')
      c1.set('cep', '01001-000')
      c1.set('logradouro', 'Praça da Sé')
      c1.set('numero', '1')
      c1.set('bairro', 'Sé')
      c1.set('cidade', 'São Paulo')
      c1.set('estado', 'SP')
      c1.set('pais', 'Brasil')
      c1.set('status', 'ativa')
      c1.set('admin_id', admin.id)
      app.save(c1)
    }

    try {
      c2 = app.findFirstRecordByData('clinicas', 'cnpj', '98.765.432/0001-10')
    } catch (_) {
      c2 = new Record(clinicas)
      c2.set('nome', 'Clínica B (Filial)')
      c2.set('cnpj', '98.765.432/0001-10')
      c2.set('telefone', '+55 11 98888-2222')
      c2.set('email', 'contato@clinicab.com')
      c2.set('cep', '02002-000')
      c2.set('logradouro', 'Rua Direita')
      c2.set('numero', '20')
      c2.set('bairro', 'Centro')
      c2.set('cidade', 'São Paulo')
      c2.set('estado', 'SP')
      c2.set('pais', 'Brasil')
      c2.set('status', 'inativa')
      c2.set('admin_id', admin.id)
      app.save(c2)
    }

    let psi1, psi2, sec1, psi3
    try {
      psi1 = app.findAuthRecordByEmail('_pb_users_auth_', 'psi1@clinica.com')
    } catch (_) {
      psi1 = new Record(users)
      psi1.setEmail('psi1@clinica.com')
      psi1.setPassword('Skip@Pass')
      psi1.setVerified(true)
      psi1.set('name', 'Psicólogo A1')
      psi1.set('profile', 'psicologo')
      psi1.set('id_clinica', c1.id)
      app.save(psi1)
    }

    try {
      psi2 = app.findAuthRecordByEmail('_pb_users_auth_', 'psi2@clinica.com')
    } catch (_) {
      psi2 = new Record(users)
      psi2.setEmail('psi2@clinica.com')
      psi2.setPassword('Skip@Pass')
      psi2.setVerified(true)
      psi2.set('name', 'Psicólogo A2')
      psi2.set('profile', 'psicologo')
      psi2.set('id_clinica', c1.id)
      app.save(psi2)
    }

    try {
      sec1 = app.findAuthRecordByEmail('_pb_users_auth_', 'sec1@clinica.com')
    } catch (_) {
      sec1 = new Record(users)
      sec1.setEmail('sec1@clinica.com')
      sec1.setPassword('Skip@Pass')
      sec1.setVerified(true)
      sec1.set('name', 'Secretária A1')
      sec1.set('profile', 'secretaria')
      sec1.set('id_clinica', c1.id)
      app.save(sec1)
    }

    try {
      psi3 = app.findAuthRecordByEmail('_pb_users_auth_', 'psi3@clinica.com')
    } catch (_) {
      psi3 = new Record(users)
      psi3.setEmail('psi3@clinica.com')
      psi3.setPassword('Skip@Pass')
      psi3.setVerified(true)
      psi3.set('name', 'Psicólogo B1')
      psi3.set('profile', 'psicologo')
      psi3.set('id_clinica', c2.id)
      app.save(psi3)
    }

    const existingPatients = app.findRecordsByFilter('patients', '1=1', '', 20, 0)
    for (const pat of existingPatients) {
      if (!pat.get('id_clinica')) {
        pat.set('id_clinica', c1.id)
        app.save(pat)
      }
    }
  },
  (app) => {},
)
