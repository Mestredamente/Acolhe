migrate(
  (app) => {
    const planosCol = app.findCollectionByNameOrId('saas_planos')

    // Seed Starter and Profissional if they do not exist
    const defaultPlanos = [
      {
        nome: 'Starter',
        tipo: 'clinica',
        valor_mensal: 199,
        limite_psicologos: 3,
        limite_pacientes: 100,
        status: 'ativo',
      },
      {
        nome: 'Profissional',
        tipo: 'autonomo',
        valor_mensal: 97,
        limite_psicologos: 1,
        limite_pacientes: 50,
        status: 'ativo',
      },
    ]

    for (const p of defaultPlanos) {
      try {
        app.findFirstRecordByData('saas_planos', 'nome', p.nome)
      } catch (_) {
        const record = new Record(planosCol)
        record.set('nome', p.nome)
        record.set('tipo', p.tipo)
        record.set('valor_mensal', p.valor_mensal)
        record.set('limite_psicologos', p.limite_psicologos)
        record.set('limite_pacientes', p.limite_pacientes)
        record.set('status', p.status)
        app.save(record)
      }
    }
  },
  (app) => {
    // no-op
  },
)
