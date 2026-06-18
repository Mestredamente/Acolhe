migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('users')
    const field = collection.fields.getByName('profile')
    if (field && field.values) {
      const newValues = new Set([...field.values, 'gestor_saas', 'owner_clinica'])
      field.values = Array.from(newValues)
      app.save(collection)
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('users')
    const field = collection.fields.getByName('profile')
    if (field && field.values) {
      field.values = field.values.filter((v) => v !== 'gestor_saas' && v !== 'owner_clinica')
      app.save(collection)
    }
  },
)
