migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('patients')
    col.fields.add(new TextField({ name: 'guardian_cpf' }))
    col.fields.add(
      new SelectField({
        name: 'guardian_relationship',
        values: ['pai', 'mãe', 'tutor', 'outro'],
        maxSelect: 1,
      }),
    )
    col.fields.add(
      new SelectField({
        name: 'guardian_consent_status',
        values: ['assinado', 'pendente'],
        maxSelect: 1,
      }),
    )
    col.fields.add(new TextField({ name: 'guardian_observations' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('patients')
    col.fields.removeByName('guardian_cpf')
    col.fields.removeByName('guardian_relationship')
    col.fields.removeByName('guardian_consent_status')
    col.fields.removeByName('guardian_observations')
    app.save(col)
  },
)
