migrate(
  (app) => {
    const collection = new Collection({
      name: 'empresa_fiscal',
      type: 'base',
      listRule: "@request.auth.profile = 'admin'",
      viewRule: "@request.auth.profile = 'admin'",
      createRule: "@request.auth.profile = 'admin'",
      updateRule: "@request.auth.profile = 'admin'",
      deleteRule: null,
      fields: [
        { name: 'cnpj', type: 'text', required: true },
        { name: 'razao_social', type: 'text', required: true },
        { name: 'endereco', type: 'text', required: false },
        {
          name: 'regime_tributario',
          type: 'select',
          values: ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'],
          required: false,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('empresa_fiscal')
    app.delete(collection)
  },
)
