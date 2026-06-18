migrate(
  (app) => {
    const collection = new Collection({
      name: 'metricas_saas',
      type: 'base',
      listRule: "@request.auth.profile = 'admin'",
      viewRule: "@request.auth.profile = 'admin'",
      createRule: "@request.auth.profile = 'admin'",
      updateRule: "@request.auth.profile = 'admin'",
      deleteRule: "@request.auth.profile = 'admin'",
      fields: [
        { name: 'data', type: 'date', required: true },
        { name: 'total_clinicas_ativas', type: 'number', required: false },
        { name: 'total_psicologos_ativos', type: 'number', required: false },
        { name: 'total_pacientes_cadastrados', type: 'number', required: false },
        { name: 'total_consultas_mes', type: 'number', required: false },
        { name: 'total_nfe_emitidas', type: 'number', required: false },
        { name: 'total_receita_plataforma', type: 'number', required: false },
        { name: 'ticket_medio_clinica', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('metricas_saas')
    app.delete(collection)
  },
)
