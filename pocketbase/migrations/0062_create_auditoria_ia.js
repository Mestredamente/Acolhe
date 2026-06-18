migrate(
  (app) => {
    const collection = new Collection({
      name: 'auditoria_ia',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'tipo_operacao',
          type: 'select',
          required: true,
          values: ['evolução', 'diário', 'documento', 'análise de padrões', 'análise preditiva'],
        },
        { name: 'provedor_usado', type: 'text', required: true },
        { name: 'resumo_prompt', type: 'text', required: false },
        { name: 'resumo_resposta', type: 'text', required: false },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['sucesso', 'falha', 'aguardando validação'],
        },
        { name: 'data_hora', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)

    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
      const data = [
        {
          tipo_operacao: 'evolução',
          provedor_usado: 'Claude',
          status: 'sucesso',
          resumo_prompt: 'Gerar resumo evolutivo',
          resumo_resposta: 'O paciente apresentou melhora progressiva...',
        },
        {
          tipo_operacao: 'diário',
          provedor_usado: 'Claude',
          status: 'sucesso',
          resumo_prompt: 'Analisar sentimento do dia',
          resumo_resposta: 'Sentimento predominante: Feliz e engajado.',
        },
        {
          tipo_operacao: 'documento',
          provedor_usado: 'OpenAI',
          status: 'sucesso',
          resumo_prompt: 'Gerar atestado',
          resumo_resposta: 'Atesto para os devidos fins de comparecimento...',
        },
        {
          tipo_operacao: 'análise preditiva',
          provedor_usado: 'Claude',
          status: 'aguardando validação',
          resumo_prompt: 'Prever risco de abandono',
          resumo_resposta: 'Risco baixo de abandono com base no histórico.',
        },
        {
          tipo_operacao: 'documento',
          provedor_usado: 'Claude',
          status: 'falha',
          resumo_prompt: 'Gerar receita médica',
          resumo_resposta: '[BLOQUEADO] Prescrição de Fluoxetina 20mg.',
        },
      ]

      for (const item of data) {
        const rec = new Record(collection)
        rec.set('user_id', admin.id)
        rec.set('tipo_operacao', item.tipo_operacao)
        rec.set('provedor_usado', item.provedor_usado)
        rec.set('status', item.status)
        rec.set('resumo_prompt', item.resumo_prompt)
        rec.set('resumo_resposta', item.resumo_resposta)
        app.save(rec)
      }
    } catch (err) {}
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('auditoria_ia')
      app.delete(collection)
    } catch (err) {}
  },
)
