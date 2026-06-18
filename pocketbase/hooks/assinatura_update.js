routerAdd(
  'POST',
  '/backend/v1/minha-assinatura',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')

    const body = e.requestInfo().body || {}
    const novoPlano = body.plano

    let clinicaId = e.auth?.getString('id_clinica')
    if (!clinicaId) {
      try {
        const clinica = $app.findFirstRecordByData('clinicas', 'admin_id', userId)
        clinicaId = clinica.id
      } catch (_) {
        const clinicasCol = $app.findCollectionByNameOrId('clinicas')
        const newClinica = new Record(clinicasCol)
        newClinica.set('nome', 'Consultório ' + e.auth?.getString('name'))
        newClinica.set('admin_id', userId)
        newClinica.set('status', 'ativa')
        $app.save(newClinica)
        clinicaId = newClinica.id
      }
    }

    let assinatura
    try {
      assinatura = $app.findFirstRecordByData('saas_assinaturas', 'id_clinica', clinicaId)
    } catch (_) {
      const assCol = $app.findCollectionByNameOrId('saas_assinaturas')
      assinatura = new Record(assCol)
      assinatura.set('id_clinica', clinicaId)
      assinatura.set('data_inicio', new Date().toISOString())
    }

    assinatura.set('plano', novoPlano)
    assinatura.set('status', 'ativo')
    if (novoPlano === 'profissional') {
      assinatura.set('valor_mensal', 97)
      assinatura.set('limite_psicologos', 1)
    } else {
      assinatura.set('valor_mensal', 0)
      assinatura.set('limite_psicologos', 1)
    }

    const renovacao = new Date()
    renovacao.setMonth(renovacao.getMonth() + 1)
    assinatura.set('data_renovacao', renovacao.toISOString())

    $app.save(assinatura)

    return e.json(200, assinatura)
  },
  $apis.requireAuth(),
)
