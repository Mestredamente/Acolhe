migrate(
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('visualizacoes_impersonate')
      app.delete(collection)
    } catch (_) {}
  },
  (app) => {
    // Collection removal cannot be easily reverted, so nothing is done in the down migration.
  },
)
