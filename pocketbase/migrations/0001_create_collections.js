migrate(
  (app) => {
    const patientsCol = new Collection({
      name: 'patients',
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
        { name: 'name', type: 'text', required: true },
        { name: 'cpf', type: 'text' },
        { name: 'birth_date', type: 'date' },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'address', type: 'text' },
        { name: 'emergency_contact_name', type: 'text' },
        { name: 'emergency_contact_phone', type: 'text' },
        { name: 'guardian_name', type: 'text' },
        { name: 'guardian_phone', type: 'text' },
        { name: 'billing_id', type: 'text' },
        { name: 'billing_address', type: 'text' },
        { name: 'status', type: 'select', values: ['active', 'inactive'], maxSelect: 1 },
        {
          name: 'avatar',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'last_consultation', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(patientsCol)

    const appointmentsCol = new Collection({
      name: 'appointments',
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
          collectionId: patientsCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'time', type: 'date', required: true },
        { name: 'type', type: 'select', values: ['Presencial', 'Online'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(appointmentsCol)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('appointments'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('patients'))
    } catch (_) {}
  },
)
