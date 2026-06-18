migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
    } catch (_) {
      return
    }

    let patient
    try {
      patient = app.findFirstRecordByFilter('patients', `user_id = '${admin.id}'`)
    } catch (_) {
      return
    }

    const docCol = app.findCollectionByNameOrId('documentos')
    try {
      app.findFirstRecordByData('documentos', 'file_name', 'Relatório de Evolução (IA)')
    } catch (_) {
      const r1 = new Record(docCol)
      r1.set('user_id', admin.id)
      r1.set('patient_id', patient.id)
      r1.set('file_name', 'Relatório de Evolução (IA)')
      r1.set('doc_type', 'evolucao')
      r1.set(
        'description',
        `RELATÓRIO DE EVOLUÇÃO PSICOLÓGICA\n\nIdentificação do Paciente: ${patient.getString('name')}\n\nResumo: O paciente tem demonstrado avanços significativos na regulação emocional e autoconhecimento desde as sessões iniciais.\n\nProgresso Observado:\n- Redução de episódios de ansiedade aguda.\n- Maior engajamento nas tarefas terapêuticas propostas.\n\nPlano de Continuidade:\nManter a frequência quinzenal com foco em consolidação das estratégias de enfrentamento desenvolvidas.`,
      )
      r1.set('status', 'privado')
      r1.set('is_ai_generated', true)
      app.save(r1)
    }
  },
  (app) => {
    try {
      const doc = app.findFirstRecordByData('documentos', 'file_name', 'Relatório de Evolução (IA)')
      app.delete(doc)
    } catch (_) {}
  },
)
