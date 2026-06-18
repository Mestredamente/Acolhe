migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('documentos')
    if (!col.fields.getByName('is_ai_generated')) {
      col.fields.add(new BoolField({ name: 'is_ai_generated' }))
    }
    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('documentos')
      if (col.fields.getByName('is_ai_generated')) {
        col.fields.removeByName('is_ai_generated')
        app.save(col)
      }
    } catch (_) {}
  },
)
