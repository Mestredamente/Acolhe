migrate(
  (app) => {
    const patientsCol = app.findCollectionByNameOrId('patients')
    patientsCol.listRule =
      "@request.auth.id != '' && (user_id = @request.auth.id || email = @request.auth.email)"
    patientsCol.viewRule =
      "@request.auth.id != '' && (user_id = @request.auth.id || email = @request.auth.email)"
    app.save(patientsCol)

    const aptsCol = app.findCollectionByNameOrId('appointments')
    aptsCol.listRule =
      "@request.auth.id != '' && (user_id = @request.auth.id || patient_id.email = @request.auth.email)"
    aptsCol.viewRule =
      "@request.auth.id != '' && (user_id = @request.auth.id || patient_id.email = @request.auth.email)"
    app.save(aptsCol)
  },
  (app) => {
    const patientsCol = app.findCollectionByNameOrId('patients')
    patientsCol.listRule = "@request.auth.id != '' && user_id = @request.auth.id"
    patientsCol.viewRule = "@request.auth.id != '' && user_id = @request.auth.id"
    app.save(patientsCol)

    const aptsCol = app.findCollectionByNameOrId('appointments')
    aptsCol.listRule = "@request.auth.id != '' && user_id = @request.auth.id"
    aptsCol.viewRule = "@request.auth.id != '' && user_id = @request.auth.id"
    app.save(aptsCol)
  },
)
