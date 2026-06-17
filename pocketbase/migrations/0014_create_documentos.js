migrate(
  (app) => {
    const collection = new Collection({
      name: 'documentos',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || (patient_id.email = @request.auth.email && status = 'visivel_paciente'))",
      viewRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || (patient_id.email = @request.auth.email && status = 'visivel_paciente'))",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'patient_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('patients').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'file_name', type: 'text', required: true },
        {
          name: 'doc_type',
          type: 'select',
          required: true,
          values: [
            'laudo',
            'receita',
            'atestado',
            'contrato',
            'termo_consentimento_lgpd',
            'anamnese',
            'evolucao',
            'outro',
          ],
          maxSelect: 1,
        },
        { name: 'description', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['privado', 'visivel_paciente', 'pendente_assinatura'],
          maxSelect: 1,
        },
        { name: 'file', type: 'file', maxSelect: 1, maxSize: 52428800 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_documentos_patient ON documentos (patient_id)',
        'CREATE INDEX idx_documentos_status ON documentos (status)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('documentos')
      app.delete(collection)
    } catch (_) {}
  },
)
