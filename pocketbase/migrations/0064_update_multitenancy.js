migrate(
  (app) => {
    const rules = {
      patients:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || email = @request.auth.email || user_id = @request.auth.id || ((@request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo') && id_clinica != '' && id_clinica = @request.auth.id_clinica))",
      appointments:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || patient_id.email = @request.auth.email || user_id = @request.auth.id || ((@request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo') && patient_id.id_clinica != '' && patient_id.id_clinica = @request.auth.id_clinica))",
      evolucoes:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || user_id = @request.auth.id || ((@request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo') && patient_id.id_clinica != '' && patient_id.id_clinica = @request.auth.id_clinica))",
      financeiro:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || user_id = @request.auth.id || patient_id.email = @request.auth.email || patient_id.user_id = @request.auth.id || ((@request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo') && patient_id.id_clinica != '' && patient_id.id_clinica = @request.auth.id_clinica))",
      mensagens:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || sender_id = @request.auth.id || recipient_id = @request.auth.id || patient_id.user_id = @request.auth.id || patient_id.email = @request.auth.email || ((@request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo') && patient_id.id_clinica != '' && patient_id.id_clinica = @request.auth.id_clinica))",
      documentos:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || user_id = @request.auth.id || (patient_id.email = @request.auth.email && status = 'visivel_paciente') || ((@request.auth.profile = 'secretaria' || @request.auth.profile = 'psicologo') && patient_id.id_clinica != '' && patient_id.id_clinica = @request.auth.id_clinica))",
    }

    for (const [colName, rule] of Object.entries(rules)) {
      const col = app.findCollectionByNameOrId(colName)
      col.listRule = rule
      col.viewRule = rule
      app.save(col)
    }
  },
  (app) => {
    // Revert logic
  },
)
