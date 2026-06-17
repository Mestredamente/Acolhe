migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('config_clinica')
    if (!col.fields.getByName('assinatura_padrao')) {
      col.fields.add(
        new FileField({
          name: 'assinatura_padrao',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('config_clinica')
      if (col.fields.getByName('assinatura_padrao')) {
        col.fields.removeByName('assinatura_padrao')
        app.save(col)
      }
    } catch (_) {}
  },
)
