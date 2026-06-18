migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('audit_logs')
    const field = collection.fields.getByName('acao')
    field.values = ['leitura', 'escrita', 'exclusao_logica', 'login', 'logout', 'atualizacao']
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('audit_logs')
    const field = collection.fields.getByName('acao')
    field.values = ['leitura', 'escrita', 'exclusao_logica', 'login', 'logout']
    app.save(collection)
  },
)
