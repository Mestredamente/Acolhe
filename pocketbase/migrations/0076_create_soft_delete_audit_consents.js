migrate(
  (app) => {
    // Add deleted_at to all required collections
    const collections = [
      'users',
      'patients',
      'appointments',
      'evolucoes',
      'anamneses',
      'respostas_escala',
      'diario_paciente',
      'financeiro',
      'documentos',
      'clinicas',
      'grupos_terapeuticos',
      'suporte_tickets',
      'assinaturas',
      'metricas_saas',
      'auditoria_ia',
      'supervisao_vinculos',
      'supervisao_feedback',
      'envios_documentos',
      'mensagens',
    ]

    for (const name of collections) {
      const col = app.findCollectionByNameOrId(name)
      col.fields.add(new DateField({ name: 'deleted_at', required: false }))
      app.save(col)
    }

    // Create audit_logs
    const auditLogs = new Collection({
      name: 'audit_logs',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || usuario_id = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || usuario_id = @request.auth.id)",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'usuario_id', type: 'relation', required: true, collectionId: '_pb_users_auth_' },
        {
          name: 'acao',
          type: 'select',
          required: true,
          values: ['leitura', 'escrita', 'exclusao_logica', 'login', 'logout'],
        },
        { name: 'tabela_afetada', type: 'text', required: true },
        { name: 'registro_id', type: 'text', required: false },
        { name: 'descricao', type: 'text', required: false },
        { name: 'ip_origem', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(auditLogs)

    // Create consentimentos
    const consentimentos = new Collection({
      name: 'consentimentos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: null,
      fields: [
        {
          name: 'paciente_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('patients').id,
        },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['lgpd', 'uso_ia', 'telepsicologia', 'menor_de_idade', 'termos_plataforma'],
        },
        { name: 'aceito', type: 'bool', required: false },
        { name: 'data_aceite', type: 'date', required: false },
        { name: 'versao_termo', type: 'text', required: false },
        { name: 'ip_aceite', type: 'text', required: false },
        { name: 'deleted_at', type: 'date', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(consentimentos)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('consentimentos'))
    app.delete(app.findCollectionByNameOrId('audit_logs'))

    const collections = [
      'users',
      'patients',
      'appointments',
      'evolucoes',
      'anamneses',
      'respostas_escala',
      'diario_paciente',
      'financeiro',
      'documentos',
      'clinicas',
      'grupos_terapeuticos',
      'suporte_tickets',
      'assinaturas',
      'metricas_saas',
      'auditoria_ia',
      'supervisao_vinculos',
      'supervisao_feedback',
      'envios_documentos',
      'mensagens',
    ]
    for (const name of collections) {
      const col = app.findCollectionByNameOrId(name)
      col.fields.removeByName('deleted_at')
      app.save(col)
    }
  },
)
