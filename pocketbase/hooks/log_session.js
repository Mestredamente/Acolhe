routerAdd(
  'POST',
  '/backend/v1/log-session',
  (e) => {
    const body = e.requestInfo().body || {}
    const auth = e.auth
    if (!auth) return e.unauthorizedError('Auth required')

    const { consulta_id, acao } = body
    if (!consulta_id || !acao) return e.badRequestError('Missing fields')

    const ip = e.request.remoteAddr

    try {
      const logsCol = $app.findCollectionByNameOrId('log_acessos_sala')
      const record = new Record(logsCol)
      record.set('consulta_id', consulta_id)
      record.set('usuario_id', auth.id)
      record.set('perfil', auth.getString('profile') === 'paciente' ? 'paciente' : 'psicologo')
      record.set('ip_origem', ip)
      record.set('acao', acao)

      $app.save(record)
      return e.json(200, { success: true })
    } catch (err) {
      return e.internalServerError(err.message)
    }
  },
  $apis.requireAuth(),
)
