migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('financeiro')
    col.listRule =
      "@request.auth.id != '' && (user_id = @request.auth.id || patient_id.email = @request.auth.email || patient_id.user_id = @request.auth.id)"
    col.viewRule =
      "@request.auth.id != '' && (user_id = @request.auth.id || patient_id.email = @request.auth.email || patient_id.user_id = @request.auth.id)"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('financeiro')
    col.listRule = "@request.auth.id != '' && user_id = @request.auth.id"
    col.viewRule = "@request.auth.id != '' && user_id = @request.auth.id"
    app.save(col)
  },
)
