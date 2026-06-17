migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.add(new BoolField({ name: 'dois_fa_ativo' }))
    users.fields.add(new TextField({ name: 'codigo_verificacao' }))
    app.save(users)

    try {
      const admin = app.findAuthRecordByEmail('users', 'mestredamente1@gmail.com')
      admin.set('dois_fa_ativo', true)
      app.save(admin)
    } catch (_) {}
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('dois_fa_ativo')
    users.fields.removeByName('codigo_verificacao')
    app.save(users)
  },
)
