migrate(
  (app) => {
    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
    } catch (_) {
      return
    }

    const patients = app.findRecordsByFilter('patients', `user_id = '${admin.id}'`, 'created', 1, 0)
    if (!patients || patients.length === 0) return
    const patient = patients[0]

    const anamneses = app.findCollectionByNameOrId('anamneses')
    try {
      app.findFirstRecordByData('anamneses', 'patient_id', patient.id)
      return
    } catch (_) {}

    const anamnese = new Record(anamneses)
    anamnese.set('user_id', admin.id)
    anamnese.set('patient_id', patient.id)
    anamnese.set('approach', 'TCC')
    anamnese.set('completion_date', new Date().toISOString().replace('T', ' '))
    anamnese.set(
      'complaint',
      'Ansiedade constante e dificuldade para dormir, prejudicando o trabalho.',
    )
    anamnese.set('family_history', 'Pai com histórico de depressão. Mãe saudável.')
    anamnese.set('medical_history', 'Nenhuma doença crônica relatada.')
    anamnese.set('medications', 'Nenhum medicamento em uso no momento.')
    anamnese.set(
      'substance_use',
      'Consumo social de álcool aos finais de semana. Nega tabagismo ou drogas ilícitas.',
    )
    anamnese.set('hospitalizations', 'Nenhuma internação prévia.')
    anamnese.set('suicidal_ideation_past', 'Nega ideação suicida.')
    anamnese.set('suicide_attempts', 'Nega tentativas.')
    anamnese.set('family_psych_history', 'Pai em tratamento para depressão há 5 anos.')
    anamnese.set(
      'consultation_reason',
      'Busca ajuda para lidar com ansiedade e melhorar qualidade de sono.',
    )
    anamnese.set(
      'treatment_expectations',
      'Espera aprender técnicas para controlar a ansiedade e voltar a dormir bem.',
    )
    anamnese.set('general_observations', 'Paciente colaborativo e engajado, boa aderência inicial.')
    anamnese.set(
      'tcc_automatic_thoughts',
      '"Se eu não dormir bem, vou fracassar no trabalho amanhã"\n"Eu não deveria estar me sentindo assim"',
    )
    anamnese.set('tcc_core_beliefs', 'Crença central de desamparo e incompetência.')
    anamnese.set('tcc_comorbidities', 'Possível quadro de insônia primária.')

    app.save(anamnese)
  },
  (app) => {
    // Usually handled by cascade delete, but we could remove it here if needed
  },
)
