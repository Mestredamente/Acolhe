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
      app.findFirstRecordByData('documentos', 'file_name', 'Termo de Consentimento LGPD - Inicial')
    } catch (_) {
      const r1 = new Record(docCol)
      r1.set('user_id', admin.id)
      r1.set('patient_id', patient.id)
      r1.set('file_name', 'Termo de Consentimento LGPD - Inicial')
      r1.set('doc_type', 'termo_consentimento_lgpd')
      r1.set(
        'description',
        `Identificação do Paciente: ${patient.getString('name')}\nFinalidade: Tratamento de dados para fins clínicos e terapêuticos.\nDireitos do Titular: Acesso, correção e exclusão de dados.\nPrazo de Armazenamento: Conforme legislação vigente/CFP.\nContato: ${admin.getString('email')}`,
      )
      r1.set('status', 'pendente_assinatura')
      app.save(r1)
    }

    try {
      app.findFirstRecordByData('documentos', 'file_name', 'Laudo Psicológico 2026')
    } catch (_) {
      const r2 = new Record(docCol)
      r2.set('user_id', admin.id)
      r2.set('patient_id', patient.id)
      r2.set('file_name', 'Laudo Psicológico 2026')
      r2.set('doc_type', 'laudo')
      r2.set(
        'description',
        'Laudo para fins de afastamento médico e comprovação de acompanhamento contínuo.',
      )
      r2.set('status', 'privado')
      app.save(r2)
    }

    try {
      app.findFirstRecordByData('documentos', 'file_name', 'Contrato de Prestação de Serviços')
    } catch (_) {
      const r3 = new Record(docCol)
      r3.set('user_id', admin.id)
      r3.set('patient_id', patient.id)
      r3.set('file_name', 'Contrato de Prestação de Serviços')
      r3.set('doc_type', 'contrato')
      r3.set(
        'description',
        'Contrato de prestação de serviços psicológicos assinado na primeira sessão do paciente.',
      )
      r3.set('status', 'visivel_paciente')
      app.save(r3)
    }
  },
  (app) => {
    // Safe down migration handled manually if needed
  },
)
