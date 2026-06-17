migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.fields.add(new BoolField({ name: 'onboarding_completo' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.fields.removeByName('onboarding_completo')
    app.save(col)
  },
)
