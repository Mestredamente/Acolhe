migrate(
  (app) => {
    const collection = new Collection({
      name: 'assinaturas',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || patient_id.user_id = @request.auth.id || patient_id.email = @request.auth.email)",
      viewRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || patient_id.user_id = @request.auth.id || patient_id.email = @request.auth.email)",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        { name: 'registro_id', type: 'text', required: true },
        {
          name: 'tipo_registro',
          type: 'select',
          required: true,
          selectValues: ['evolucao', 'documento', 'recibo'],
        },
        {
          name: 'patient_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('patients').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'data_assinatura', type: 'date', required: true },
        { name: 'status', type: 'select', required: true, selectValues: ['assinado', 'pendente'] },
        { name: 'identificador_signatario', type: 'text', required: true },
        { name: 'signature_data', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_assinaturas_registro ON assinaturas (registro_id, tipo_registro)',
        'CREATE INDEX idx_assinaturas_patient ON assinaturas (patient_id)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('assinaturas')
      app.delete(collection)
    } catch (_) {}
  },
)
