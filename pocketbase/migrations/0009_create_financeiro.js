migrate(
  (app) => {
    const collection = new Collection({
      name: 'financeiro',
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
        {
          name: 'appointment_id',
          type: 'relation',
          required: false,
          collectionId: app.findCollectionByNameOrId('appointments').id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'description', type: 'text', required: true },
        { name: 'amount', type: 'number', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'payment_date', type: 'date' },
        {
          name: 'status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['pendente', 'pago', 'atrasado', 'cancelado', 'aguardando'],
        },
        {
          name: 'payment_method',
          type: 'select',
          maxSelect: 1,
          values: [
            'pix',
            'dinheiro',
            'cartao de credito',
            'cartao de debito',
            'boleto',
            'transferencia',
          ],
        },
        { name: 'installments', type: 'number', onlyInt: true },
        { name: 'observations', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_financeiro_patient ON financeiro (patient_id)',
        'CREATE INDEX idx_financeiro_status ON financeiro (status)',
        'CREATE INDEX idx_financeiro_due_date ON financeiro (due_date)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('financeiro')
    app.delete(col)
  },
)
