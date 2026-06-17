migrate(
  (app) => {
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
      const evolucoes = app.findRecordsByFilter(
        'evolucoes',
        `user_id = '${admin.id}'`,
        '-created',
        1,
        0,
      )

      if (evolucoes.length > 0) {
        const evo = evolucoes[0]
        const assinaturas = app.findCollectionByNameOrId('assinaturas')

        try {
          app.findFirstRecordByData('assinaturas', 'registro_id', evo.id)
          return // already seeded
        } catch (_) {}

        const r = new Record(assinaturas)
        r.set('registro_id', evo.id)
        r.set('tipo_registro', 'evolucao')
        r.set('patient_id', evo.getString('patient_id'))
        r.set('user_id', admin.id)
        r.set('data_assinatura', new Date().toISOString())
        r.set('status', 'assinado')
        r.set('identificador_signatario', 'Psicólogo - Admin')
        app.save(r)

        evo.set('is_signed', true)
        app.save(evo)
      }
    } catch (e) {}
  },
  (app) => {
    try {
      app
        .db()
        .newQuery("DELETE FROM assinaturas WHERE identificador_signatario = 'Psicólogo - Admin'")
        .execute()
    } catch (_) {}
  },
)
