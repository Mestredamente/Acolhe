migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('patients')
    col.fields.add(new TextField({ name: 'link_convite' }))
    col.fields.add(
      new SelectField({
        name: 'status_convite',
        values: ['pendente', 'enviado', 'aceito'],
        maxSelect: 1,
      }),
    )
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('patients')
    col.fields.removeByName('link_convite')
    col.fields.removeByName('status_convite')
    app.save(col)
  },
)
