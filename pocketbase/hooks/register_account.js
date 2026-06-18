routerAdd('POST', '/backend/v1/register', (e) => {
  const body = e.requestInfo().body || {}
  const { tipo, plano_id, clinic_data, user_data } = body

  if (!tipo || !plano_id || !clinic_data || !user_data) {
    return e.badRequestError('Dados incompletos')
  }

  let userId = null

  $app.runInTransaction((txApp) => {
    // 1. Create User
    const usersCol = txApp.findCollectionByNameOrId('users')
    const user = new Record(usersCol)
    user.set('name', user_data.name)
    user.setEmail(user_data.email)
    user.setPassword(user_data.password)
    user.setVerified(true)
    user.set('profile', tipo === 'clinica' ? 'owner_clinica' : 'psicologo')
    user.set('status', 'ativo')
    txApp.save(user)
    userId = user.id

    // 2. Create Clinica if type is clinica
    let clinicaId = null
    if (tipo === 'clinica') {
      const clinicaCol = txApp.findCollectionByNameOrId('clinicas')
      const clinica = new Record(clinicaCol)
      clinica.set('nome', clinic_data.nome)
      clinica.set('cnpj', clinic_data.cnpj_cpf)
      clinica.set('telefone', clinic_data.telefone)
      clinica.set('cep', clinic_data.cep || '')
      clinica.set('logradouro', clinic_data.logradouro || '')
      clinica.set('cidade', clinic_data.cidade || '')
      clinica.set('estado', clinic_data.estado || '')
      clinica.set('email', clinic_data.email)
      clinica.set('admin_id', user.id)
      clinica.set('status', 'ativa')
      txApp.save(clinica)
      clinicaId = clinica.id

      user.set('id_clinica', clinicaId)
      txApp.save(user)
    }

    // 3. Create Subscription
    const assinaturasCol = txApp.findCollectionByNameOrId('saas_assinaturas')
    const assinatura = new Record(assinaturasCol)
    assinatura.set('status', 'ativo')
    assinatura.set('user_id', user.id)
    if (clinicaId) {
      assinatura.set('id_clinica', clinicaId)
    }
    assinatura.set('plano_id', plano_id)
    assinatura.set('data_inicio', new Date().toISOString())

    try {
      const plano = txApp.findRecordById('saas_planos', plano_id)
      assinatura.set('valor_mensal', plano.get('valor_mensal'))
      assinatura.set('plano', plano.get('tipo') === 'clinica' ? 'clinica' : 'profissional')
    } catch (_) {
      assinatura.set('plano', tipo === 'clinica' ? 'clinica' : 'profissional')
    }
    txApp.save(assinatura)

    // 4. Create config_clinica
    const configCol = txApp.findCollectionByNameOrId('config_clinica')
    const config = new Record(configCol)
    config.set('user_id', user.id)
    config.set('nome_clinica', clinic_data.nome)
    config.set('email_contato', clinic_data.email)
    txApp.save(config)
  })

  return e.json(200, { success: true, user_id: userId })
})
