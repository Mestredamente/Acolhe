migrate(
  (app) => {
    const collection = new Collection({
      name: 'envios_documentos',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || patient_id.email = @request.auth.email || destinatario = @request.auth.email || patient_id.user_id = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || patient_id.email = @request.auth.email || destinatario = @request.auth.email || patient_id.user_id = @request.auth.id)",
      createRule: "@request.auth.id != '' && user_id = @request.auth.id",
      updateRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || patient_id.email = @request.auth.email || patient_id.user_id = @request.auth.id)",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'patient_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('patients').id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'tipo_documento',
          type: 'select',
          required: true,
          values: ['recibo', 'nfe'],
          maxSelect: 1,
        },
        { name: 'documento_id', type: 'text', required: true },
        { name: 'destinatario', type: 'email', required: true },
        { name: 'data_envio', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['enviado', 'falha'],
          maxSelect: 1,
        },
        { name: 'mensagem_erro', type: 'text' },
        { name: 'visualizado', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_envios_doc_id ON envios_documentos (documento_id)',
        'CREATE INDEX idx_envios_patient ON envios_documentos (patient_id)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('envios_documentos')
    app.delete(collection)
  },
)
