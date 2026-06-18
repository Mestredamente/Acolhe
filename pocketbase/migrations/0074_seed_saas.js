migrate(
  (app) => {
    const assinaturas = app.findCollectionByNameOrId('saas_assinaturas')
    const metricas = app.findCollectionByNameOrId('metricas_saas')

    const clinicasList = app.findRecordsByFilter('clinicas', '1=1', '', 4, 0)

    const planos = [
      { plano: 'free', status: 'ativo', valor_mensal: 0, limite_psicologos: 1 },
      { plano: 'profissional', status: 'ativo', valor_mensal: 97, limite_psicologos: 1 },
      { plano: 'clinica', status: 'ativo', valor_mensal: 297, limite_psicologos: 5 },
      { plano: 'corporativo', status: 'trial', valor_mensal: 997, limite_psicologos: 20 },
    ]

    for (let i = 0; i < clinicasList.length && i < 4; i++) {
      const c = clinicasList[i]
      const p = planos[i]

      try {
        app.findFirstRecordByData('saas_assinaturas', 'id_clinica', c.id)
      } catch (_) {
        const record = new Record(assinaturas)
        record.set('id_clinica', c.id)
        record.set('plano', p.plano)
        record.set('status', p.status)
        record.set('valor_mensal', p.valor_mensal)
        record.set('limite_psicologos', p.limite_psicologos)
        record.set('data_inicio', new Date().toISOString().replace('T', ' ').replace('Z', ''))

        const renovacao = new Date()
        if (p.status === 'trial') {
          renovacao.setDate(renovacao.getDate() + 5)
        } else {
          renovacao.setMonth(renovacao.getMonth() + 1)
        }
        record.set('data_renovacao', renovacao.toISOString().replace('T', ' ').replace('Z', ''))

        app.save(record)
      }
    }

    const met = [
      { m: 3, c: 10, p: 15, pac: 100, rec: 5000 },
      { m: 2, c: 12, p: 20, pac: 150, rec: 6500 },
      { m: 1, c: 15, p: 25, pac: 200, rec: 8200 },
      { m: 0, c: 18, p: 30, pac: 250, rec: 9800 },
    ]

    for (const item of met) {
      const d = new Date()
      d.setMonth(d.getMonth() - item.m)
      const dateStr = d.toISOString().split('T')[0] + ' 12:00:00.000Z'

      try {
        app.findFirstRecordByData('metricas_saas', 'data', dateStr)
      } catch (_) {
        const r = new Record(metricas)
        r.set('data', dateStr)
        r.set('total_clinicas_ativas', item.c)
        r.set('total_psicologos_ativos', item.p)
        r.set('total_pacientes_cadastrados', item.pac)
        r.set('total_receita_plataforma', item.rec)
        app.save(r)
      }
    }
  },
  (app) => {
    const metricas = app.findCollectionByNameOrId('metricas_saas')
    app.truncateCollection(metricas)

    const assinaturas = app.findCollectionByNameOrId('saas_assinaturas')
    app.truncateCollection(assinaturas)
  },
)
