migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('notificacoes')

    if (!col.fields.getByName('perfil_destino')) {
      col.fields.add(
        new SelectField({
          name: 'perfil_destino',
          values: ['gestor_saas', 'owner_clinica', 'psicologo', 'secretaria', 'paciente'],
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('id_clinica')) {
      col.fields.add(
        new RelationField({
          name: 'id_clinica',
          collectionId: app.findCollectionByNameOrId('clinicas').id,
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('tenant_demo_id')) {
      col.fields.add(
        new RelationField({
          name: 'tenant_demo_id',
          collectionId: app.findCollectionByNameOrId('tenants_demo').id,
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('is_active')) {
      col.fields.add(new BoolField({ name: 'is_active' }))
    }

    app.save(col)

    // Data Migration
    app.db().newQuery('UPDATE notificacoes SET is_active = true').execute()

    app
      .db()
      .newQuery(
        "UPDATE notificacoes SET type = 'agenda' WHERE type IN ('consulta_proxima', 'consulta_confirmada')",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE notificacoes SET type = 'financeiro' WHERE type IN ('pagamento_pendente', 'pagamento_atrasado')",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE notificacoes SET type = 'prontuario' WHERE type IN ('escala_pendente', 'diario_novo', 'documento_pendente')",
      )
      .execute()
    app
      .db()
      .newQuery("UPDATE notificacoes SET type = 'mensagem' WHERE type = 'mensagem_nova'")
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE notificacoes SET type = 'sistema' WHERE type NOT IN ('agenda', 'financeiro', 'prontuario', 'mensagem')",
      )
      .execute()

    // SaaS Manager Cleanup
    app
      .db()
      .newQuery(`
    UPDATE notificacoes 
    SET is_active = false 
    WHERE type IN ('agenda', 'prontuario', 'mensagem') 
    AND user_id IN (SELECT id FROM users WHERE profile = 'admin')
  `)
      .execute()

    // Set perfil_destino
    app
      .db()
      .newQuery(`
    UPDATE notificacoes 
    SET perfil_destino = (
      SELECT CASE 
        WHEN profile = 'admin' THEN 'gestor_saas'
        ELSE profile
      END 
      FROM users WHERE users.id = notificacoes.user_id
    )
  `)
      .execute()

    // Enforce types
    col.fields.add(
      new SelectField({
        name: 'type',
        required: true,
        values: ['agenda', 'prontuario', 'financeiro', 'sistema', 'mensagem'],
        maxSelect: 1,
      }),
    )

    col.listRule = "@request.auth.id != '' && user_id = @request.auth.id && is_active = true"
    col.viewRule = "@request.auth.id != '' && user_id = @request.auth.id && is_active = true"

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('notificacoes')
    col.fields.add(
      new SelectField({
        name: 'type',
        required: true,
        values: [
          'consulta_proxima',
          'consulta_confirmada',
          'pagamento_pendente',
          'pagamento_atrasado',
          'escala_pendente',
          'diario_novo',
          'mensagem_nova',
          'documento_pendente',
          'sistema',
        ],
        maxSelect: 1,
      }),
    )
    col.listRule = "@request.auth.id != '' && user_id = @request.auth.id"
    col.viewRule = "@request.auth.id != '' && user_id = @request.auth.id"
    app.save(col)
  },
)
