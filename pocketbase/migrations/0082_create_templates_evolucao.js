migrate(
  (app) => {
    const templates = new Collection({
      name: 'templates_evolucao',
      type: 'base',
      listRule: "@request.auth.id != '' && (is_padrao = true || psicologo_id = @request.auth.id)",
      viewRule: "@request.auth.id != '' && (is_padrao = true || psicologo_id = @request.auth.id)",
      createRule: "@request.auth.id != '' && psicologo_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && psicologo_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && psicologo_id = @request.auth.id",
      fields: [
        {
          name: 'psicologo_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'titulo', type: 'text', required: true },
        {
          name: 'abordagem',
          type: 'select',
          required: true,
          values: [
            'TCC',
            'Psicanálise',
            'Gestalt',
            'Humanista',
            'Comportamental',
            'EMDR',
            'Integrativa',
          ],
        },
        { name: 'conteudo', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativo', 'inativo'],
        },
        { name: 'is_padrao', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(templates)

    let adminUserId = ''
    try {
      const admin = app.findFirstRecordByData('users', 'email', 'mestredamente1@gmail.com')
      adminUserId = admin.id
    } catch (_) {
      const allUsers = app.findRecordsByFilter('users', "profile='admin'", '-created', 1, 0)
      if (allUsers && allUsers.length > 0) {
        adminUserId = allUsers[0].id
      }
    }

    if (adminUserId) {
      const t1 = new Record(templates)
      t1.set('psicologo_id', adminUserId)
      t1.set('titulo', 'TCC — Evolução de Sessão')
      t1.set('abordagem', 'TCC')
      t1.set(
        'conteudo',
        'Paciente: [Nome do Paciente]\nData: [Data da Sessão]\n\nQueixa Principal:\n[Queixa Principal]\n\nPensamentos Automáticos:\n\n\nCrenças Centrais:\n\n\nTécnica Utilizada:\n[Técnica Utilizada]\n\nObservações e Tarefa de Casa:\n[Observações]',
      )
      t1.set('status', 'ativo')
      t1.set('is_padrao', true)
      app.save(t1)

      const t2 = new Record(templates)
      t2.set('psicologo_id', adminUserId)
      t2.set('titulo', 'Psicanálise — Nota Processual')
      t2.set('abordagem', 'Psicanálise')
      t2.set(
        'conteudo',
        'Paciente: [Nome do Paciente]\nData: [Data da Sessão]\n\nAssociações Livres:\n\n\nSonhos Relatados:\n\n\nIntervenções/Interpretações:\n[Técnica Utilizada]\n\nObservações Adicionais:\n[Observações]',
      )
      t2.set('status', 'ativo')
      t2.set('is_padrao', true)
      app.save(t2)

      const t3 = new Record(templates)
      t3.set('psicologo_id', adminUserId)
      t3.set('titulo', 'Gestalt — Relato de Experiência')
      t3.set('abordagem', 'Gestalt')
      t3.set(
        'conteudo',
        'Paciente: [Nome do Paciente]\nData: [Data da Sessão]\n\nAqui e Agora (Awareness):\n\n\nExperimentos Realizados:\n[Técnica Utilizada]\n\nFigura/Fundo:\n\n\nObservações:\n[Observações]',
      )
      t3.set('status', 'ativo')
      t3.set('is_padrao', true)
      app.save(t3)

      const t4 = new Record(templates)
      t4.set('psicologo_id', adminUserId)
      t4.set('titulo', 'Comportamental — Registro de Sessão')
      t4.set('abordagem', 'Comportamental')
      t4.set(
        'conteudo',
        'Paciente: [Nome do Paciente]\nData: [Data da Sessão]\n\nAnálise Funcional:\n- Antecedente:\n- Comportamento:\n- Consequência:\n\nIntervenção:\n[Técnica Utilizada]\n\nObservações:\n[Observações]',
      )
      t4.set('status', 'ativo')
      t4.set('is_padrao', true)
      app.save(t4)

      const t5 = new Record(templates)
      t5.set('psicologo_id', adminUserId)
      t5.set('titulo', 'Evolução Padrão (Exemplo)')
      t5.set('abordagem', 'Integrativa')
      t5.set(
        'conteudo',
        'Paciente: [Nome do Paciente]\nData: [Data da Sessão]\n\nResumo da sessão:\n\n\nStatus atual:\n',
      )
      t5.set('status', 'ativo')
      t5.set('is_padrao', false)
      app.save(t5)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('templates_evolucao')
      app.delete(col)
    } catch (_) {}
  },
)
