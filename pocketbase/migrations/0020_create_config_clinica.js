migrate(
  (app) => {
    const collection = new Collection({
      name: 'config_clinica',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: null,
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'nome_clinica', type: 'text' },
        { name: 'crp_psicologo', type: 'text' },
        { name: 'documento_identificacao', type: 'text' },
        { name: 'endereco_completo', type: 'text' },
        { name: 'telefone_ddi', type: 'text' },
        { name: 'email_contato', type: 'email' },
        {
          name: 'logo',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'cor_primaria', type: 'text' },
        { name: 'tempo_sessao_minutos', type: 'number' },
        { name: 'valor_consulta_padrao', type: 'number' },
        { name: 'intervalo_consultas_minutos', type: 'number' },
        { name: 'horario_inicio', type: 'text' },
        { name: 'horario_fim', type: 'text' },
        { name: 'dias_atendimento', type: 'json' },
        { name: 'termos_responsabilidade', type: 'text' },
        { name: 'nome_profissional', type: 'text' },
        { name: 'abordagem_principal', type: 'text' },
        { name: 'tempo_formacao', type: 'text' },
        { name: 'texto_apresentacao', type: 'text' },
        { name: 'metodo_pagamento_preferencial', type: 'text' },
        { name: 'texto_recibo_padrao', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_config_clinica_user ON config_clinica (user_id)'],
    })
    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('config_clinica')
      app.delete(collection)
    } catch (_) {}
  },
)
