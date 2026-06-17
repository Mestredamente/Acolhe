migrate(
  (app) => {
    const configCol = app.findCollectionByNameOrId('config_clinica')
    configCol.fields.add(new TextField({ name: 'whatsapp_phone' }))
    configCol.fields.add(new BoolField({ name: 'whatsapp_connected' }))
    app.save(configCol)

    const automacoes = new Collection({
      name: 'automacoes',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['confirmacao', 'lembrete', 'pos_sessao'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativo', 'inativo'],
          maxSelect: 1,
        },
        { name: 'horario_envio', type: 'text' },
        { name: 'mensagem_padrao', type: 'text' },
        { name: 'dias_antecedencia', type: 'number' },
        { name: 'horas_pos_sessao', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_automacoes_user_tipo ON automacoes (user_id, tipo)'],
    })
    app.save(automacoes)

    const historico = new Collection({
      name: 'automacoes_historico',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'patient_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('patients').id,
          maxSelect: 1,
        },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['confirmacao', 'lembrete', 'pos_sessao'],
          maxSelect: 1,
        },
        { name: 'data_envio', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['enviado', 'falha'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(historico)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('automacoes_historico'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('automacoes'))
    } catch (_) {}

    const configCol = app.findCollectionByNameOrId('config_clinica')
    configCol.fields.removeByName('whatsapp_phone')
    configCol.fields.removeByName('whatsapp_connected')
    app.save(configCol)
  },
)
