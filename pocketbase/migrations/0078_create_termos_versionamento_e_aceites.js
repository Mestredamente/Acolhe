migrate(
  (app) => {
    const termos = new Collection({
      name: 'termos_versionamento',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.profile = 'admin'",
      updateRule: "@request.auth.profile = 'admin'",
      deleteRule: "@request.auth.profile = 'admin'",
      fields: [
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['termos_de_servico', 'politica_privacidade'],
          maxSelect: 1,
        },
        { name: 'titulo', type: 'text', required: true },
        { name: 'conteudo', type: 'text', required: true },
        { name: 'versao', type: 'number', required: true },
        { name: 'data_publicacao', type: 'date', required: false },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['rascunho', 'ativo', 'arquivado'],
          maxSelect: 1,
        },
        { name: 'obrigatorio', type: 'bool', required: false },
        { name: 'deleted_at', type: 'date', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(termos)

    const aceites = new Collection({
      name: 'aceites_termos',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (usuario_id = @request.auth.id || @request.auth.profile = 'admin')",
      viewRule:
        "@request.auth.id != '' && (usuario_id = @request.auth.id || @request.auth.profile = 'admin')",
      createRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'termo_id',
          type: 'relation',
          required: true,
          collectionId: termos.id,
          maxSelect: 1,
        },
        { name: 'data_aceite', type: 'date', required: true },
        { name: 'ip_aceite', type: 'text', required: false },
        { name: 'deleted_at', type: 'date', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(aceites)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('aceites_termos'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('termos_versionamento'))
    } catch (_) {}
  },
)
