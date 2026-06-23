migrate(
  (app) => {
    // 1. Identify users to delete
    const users = app.findRecordsByFilter(
      'users',
      "(is_teste = true || email = 'autonomo@psicogestao.com' || email = 'admin_demo_alpha@psicogestao.com' || email = 'demo_auto_beta@psicogestao.com' || email = 'plataforma@psicogestao.com') && email != 'psicologosylviotutya@gmail.com'",
      '',
      10000,
      0,
    )
    const userIds = users.map((u) => u.id)
    const userIdsList =
      userIds.length > 0 ? userIds.map((id) => `'${id}'`).join(',') : "'__dummy__'"
    // 2. Identify patients to delete
    const userIdsFilter =
      userIds.length > 0
        ? userIds.map((id) => `user_id = '${id}'`).join(' || ')
        : "user_id = '__dummy__'"

    const patients = app.findRecordsByFilter(
      'patients',
      `is_teste = true || (${userIdsFilter})`,
      '',
      10000,
      0,
    )
    const patientIds = patients.map((p) => p.id)
    const patientIdsList =
      patientIds.length > 0 ? patientIds.map((id) => `'${id}'`).join(',') : "'__dummy__'"

    // 3. Identify appointments to delete
    const appointments = app.findRecordsByFilter('appointments', 'is_teste = true', '', 10000, 0)
    const appointmentIdsList =
      appointments.length > 0 ? appointments.map((a) => `'${a.id}'`).join(',') : "'__dummy__'"

    // 4. Identify evolucoes to delete
    const evolucoes = app.findRecordsByFilter('evolucoes', 'is_teste = true', '', 10000, 0)
    const evolucaoIdsList =
      evolucoes.length > 0 ? evolucoes.map((e) => `'${e.id}'`).join(',') : "'__dummy__'"

    // 5. Identify clinicas to delete
    const clinicas = app.findRecordsByFilter('clinicas', 'is_demo = true', '', 10000, 0)
    const clinicaIds = clinicas.map((c) => c.id)
    const clinicaIdsList =
      clinicaIds.length > 0 ? clinicaIds.map((id) => `'${id}'`).join(',') : "'__dummy__'"

    const queries = [
      `DELETE FROM mensagens WHERE sender_id IN (${userIdsList}) OR recipient_id IN (${userIdsList})`,
      `DELETE FROM respostas_escala WHERE user_id IN (${userIdsList}) OR patient_id IN (${patientIdsList})`,
      `DELETE FROM documentos WHERE user_id IN (${userIdsList}) OR patient_id IN (${patientIdsList})`,
      `DELETE FROM diario_paciente WHERE user_id IN (${userIdsList}) OR patient_id IN (${patientIdsList})`,
      `DELETE FROM financeiro WHERE user_id IN (${userIdsList}) OR patient_id IN (${patientIdsList})`,
      `DELETE FROM evolucoes WHERE id IN (${evolucaoIdsList}) OR user_id IN (${userIdsList}) OR patient_id IN (${patientIdsList})`,
      `DELETE FROM appointments WHERE id IN (${appointmentIdsList}) OR user_id IN (${userIdsList}) OR patient_id IN (${patientIdsList})`,
      `DELETE FROM config_clinica WHERE user_id IN (${userIdsList})`,
      `DELETE FROM tenants_demo WHERE demo_user_id IN (${userIdsList}) OR nome IN ('Demo Auto Beta', 'Demo Clínica Alpha')`,
      `DELETE FROM saas_assinaturas WHERE user_id IN (${userIdsList}) OR id_clinica IN (SELECT id FROM clinicas WHERE admin_id IN (${userIdsList})) OR id_clinica IN (${clinicaIdsList})`,
      `DELETE FROM clinicas WHERE admin_id IN (${userIdsList}) OR id IN (${clinicaIdsList})`,
      `DELETE FROM assinaturas WHERE user_id IN (${userIdsList}) OR patient_id IN (${patientIdsList})`,
      `DELETE FROM envios_documentos WHERE user_id IN (${userIdsList}) OR patient_id IN (${patientIdsList})`,
      `DELETE FROM auditoria_ia WHERE user_id IN (${userIdsList})`,
      `DELETE FROM supervisao_vinculos WHERE supervisor_id IN (${userIdsList}) OR supervisionado_id IN (${userIdsList})`,
      `DELETE FROM supervisao_feedback WHERE supervisor_id IN (${userIdsList}) OR supervisionado_id IN (${userIdsList}) OR patient_id IN (${patientIdsList})`,
      `DELETE FROM grupos_terapeuticos WHERE user_id IN (${userIdsList})`,
      `DELETE FROM consentimentos WHERE paciente_id IN (${patientIdsList})`,
      `DELETE FROM aceites_termos WHERE usuario_id IN (${userIdsList})`,
      `DELETE FROM templates_evolucao WHERE psicologo_id IN (${userIdsList})`,
      `DELETE FROM log_acessos_sala WHERE usuario_id IN (${userIdsList})`,
      `DELETE FROM suporte_tickets WHERE usuario_id IN (${userIdsList})`,
      `DELETE FROM audit_logs WHERE usuario_id IN (${userIdsList})`,
      `DELETE FROM anamneses WHERE user_id IN (${userIdsList}) OR patient_id IN (${patientIdsList})`,
      `DELETE FROM automacoes_historico WHERE user_id IN (${userIdsList}) OR patient_id IN (${patientIdsList})`,
      `DELETE FROM automacoes WHERE user_id IN (${userIdsList})`,
      `DELETE FROM notificacoes WHERE user_id IN (${userIdsList}) OR patient_id IN (${patientIdsList})`,
      `DELETE FROM patients WHERE id IN (${patientIdsList})`,
      `DELETE FROM users WHERE id IN (${userIdsList})`,
    ]

    app.runInTransaction((txApp) => {
      for (const q of queries) {
        try {
          txApp.db().newQuery(q).execute()
        } catch (e) {
          console.log('Error executing query in purge migration:', q, e)
        }
      }
    })

    console.log(
      `Purged ${userIds.length} mocked users, ${patientIds.length} test patients, and their related clinical data.`,
    )
  },
  (app) => {
    // Data purge is irreversible
  },
)
