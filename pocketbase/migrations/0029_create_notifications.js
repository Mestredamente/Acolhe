migrate(
  (app) => {
    const notificacoes = new Collection({
      name: 'notificacoes',
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
          required: false,
          collectionId: app.findCollectionByNameOrId('patients').id,
          maxSelect: 1,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: [
            'consulta_proxima',
            'consulta_confirmada',
            'pagamento_pendente',
            'pagamento_atrasado',
            'escala_pendente',
            'diario_novo',
            'mensagem_nova',
            'documento_pendente',
            'sistema',
          ],
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'message', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['lida', 'nao_lida'],
          maxSelect: 1,
        },
        { name: 'read_date', type: 'date' },
        { name: 'link', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notificacoes_user_status ON notificacoes (user_id, status)',
        'CREATE INDEX idx_notificacoes_created ON notificacoes (created)',
      ],
    })
    app.save(notificacoes)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('notificacoes'))
    } catch (_) {}
  },
)
