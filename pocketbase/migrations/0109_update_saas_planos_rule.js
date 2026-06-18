migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('saas_planos')
    collection.listRule = ''
    collection.viewRule = ''
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('saas_planos')
    collection.listRule = "@request.auth.id != ''"
    collection.viewRule = "@request.auth.id != ''"
    app.save(collection)
  },
)
