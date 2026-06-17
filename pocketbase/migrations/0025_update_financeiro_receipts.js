migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('financeiro')
    col.fields.add(new TextField({ name: 'receipt_number' }))
    col.fields.add(new DateField({ name: 'receipt_issued_date' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('financeiro')
    col.fields.removeByName('receipt_number')
    col.fields.removeByName('receipt_issued_date')
    app.save(col)
  },
)
