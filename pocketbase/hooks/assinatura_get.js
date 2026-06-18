routerAdd(
  'GET',
  '/backend/v1/minha-assinatura',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')

    let clinicaId = e.auth?.getString('id_clinica')
    if (!clinicaId) {
      try {
        const clinica = $app.findFirstRecordByData('clinicas', 'admin_id', userId)
        clinicaId = clinica.id
      } catch (_) {
        return e.json(200, {
          plano: 'free',
          status: 'ativo',
          valor_mensal: 0,
          limite_psicologos: 1,
        })
      }
    }

    try {
      const assinatura = $app.findFirstRecordByData('saas_assinaturas', 'id_clinica', clinicaId)
      return e.json(200, assinatura)
    } catch (_) {
      return e.json(200, { plano: 'free', status: 'ativo', valor_mensal: 0, limite_psicologos: 1 })
    }
  },
  $apis.requireAuth(),
)
