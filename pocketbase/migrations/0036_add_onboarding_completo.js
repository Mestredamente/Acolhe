migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!col.fields.getByName('onboarding_completo')) {
      col.fields.add(new BoolField({ name: 'onboarding_completo' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    if (col.fields.getByName('onboarding_completo')) {
      col.fields.removeByName('onboarding_completo')
      app.save(col)
    }
  },
)
