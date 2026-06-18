migrate(
  (app) => {
    const configCol = app.findCollectionByNameOrId('config_clinica')
    if (!configCol.fields.getByName('limite_maximo_participantes_grupo')) {
      configCol.fields.add(new NumberField({ name: 'limite_maximo_participantes_grupo' }))
      app.save(configCol)
    }

    const patientsColId = app.findCollectionByNameOrId('patients').id
    const clinicasColId = app.findCollectionByNameOrId('clinicas').id

    const grupos = new Collection({
      name: 'grupos_terapeuticos',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || user_id = @request.auth.id || participantes.user_id ?= @request.auth.id || @request.auth.profile = 'secretaria')",
      viewRule:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || user_id = @request.auth.id || participantes.user_id ?= @request.auth.id || @request.auth.profile = 'secretaria')",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'tema', type: 'text' },
        { name: 'descricao', type: 'text' },
        {
          name: 'id_clinica',
          type: 'relation',
          required: true,
          collectionId: clinicasColId,
          maxSelect: 1,
        },
        { name: 'limite_participantes', type: 'number' },
        { name: 'data_inicio', type: 'date' },
        { name: 'status', type: 'select', values: ['ativo', 'inativo'] },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'participantes', type: 'relation', collectionId: patientsColId, maxSelect: null },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(grupos)

    const apptCol = app.findCollectionByNameOrId('appointments')
    if (!apptCol.fields.getByName('tipo_sessao')) {
      apptCol.fields.add(new SelectField({ name: 'tipo_sessao', values: ['individual', 'grupo'] }))
    }
    if (!apptCol.fields.getByName('grupo_id')) {
      apptCol.fields.add(
        new RelationField({ name: 'grupo_id', collectionId: grupos.id, maxSelect: 1 }),
      )
    }

    const patientIdField = apptCol.fields.getByName('patient_id')
    if (patientIdField && patientIdField.maxSelect === 1) {
      patientIdField.maxSelect = null
    }
    app.save(apptCol)

    try {
      app
        .db()
        .newQuery(
          "UPDATE appointments SET patient_id = json_array(patient_id) WHERE patient_id IS NOT NULL AND patient_id != '' AND json_valid(patient_id) = 0",
        )
        .execute()
    } catch (e) {
      console.log('Data migration for patient_id failed:', e.message)
    }
  },
  (app) => {
    const grupos = app.findCollectionByNameOrId('grupos_terapeuticos')
    app.delete(grupos)
  },
)
