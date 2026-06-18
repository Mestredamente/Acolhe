migrate(
  (app) => {
    const collection = new Collection({
      name: 'suporte_tickets',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || usuario_id = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || usuario_id = @request.auth.id)",
      createRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      updateRule:
        "@request.auth.id != '' && (@request.auth.profile = 'admin' || usuario_id = @request.auth.id)",
      deleteRule: "@request.auth.profile = 'admin'",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'categoria',
          type: 'select',
          required: true,
          values: ['tecnico', 'financeiro', 'privade', 'sugestao'],
        },
        {
          name: 'prioridade',
          type: 'select',
          required: true,
          values: ['baixa', 'media', 'alta', 'urgente'],
        },
        { name: 'titulo', type: 'text', required: true },
        { name: 'descricao', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: false,
          values: ['aberto', 'em_atendimento', 'resolvido', 'fechado'],
        },
        { name: 'resposta', type: 'text' },
        { name: 'data_resposta', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!users.fields.getByName('avatar_url')) {
      users.fields.add(
        new FileField({
          name: 'avatar_url',
          maxSelect: 1,
          maxSize: 2097152,
          mimeTypes: ['image/jpeg', 'image/png'],
        }),
      )
      app.save(users)
    }

    const config = app.findCollectionByNameOrId('config_clinica')
    if (!config.fields.getByName('logo_url')) {
      config.fields.add(
        new FileField({
          name: 'logo_url',
          maxSelect: 1,
          maxSize: 2097152,
          mimeTypes: ['image/jpeg', 'image/png'],
        }),
      )
      app.save(config)
    }

    try {
      const admin = app.findFirstRecordByData('users', 'email', 'mestredamente1@gmail.com')
      const t1 = new Record(collection)
      t1.set('usuario_id', admin.id)
      t1.set('categoria', 'tecnico')
      t1.set('prioridade', 'baixa')
      t1.set('titulo', 'Problema com login')
      t1.set('descricao', 'Não consigo logar as vezes.')
      t1.set('status', 'resolvido')
      t1.set('resposta', 'Limpe o cache do navegador.')
      app.save(t1)

      const usersList = app.findRecordsByFilter('users', "profile = 'paciente'", '', 2, 0)
      if (usersList.length > 0) {
        const t2 = new Record(collection)
        t2.set('usuario_id', usersList[0].id)
        t2.set('categoria', 'financeiro')
        t2.set('prioridade', 'alta')
        t2.set('titulo', 'Erro no pagamento')
        t2.set('descricao', 'Fui cobrado duas vezes.')
        t2.set('status', 'aberto')
        app.save(t2)
      }
      if (usersList.length > 1) {
        const t3 = new Record(collection)
        t3.set('usuario_id', usersList[1].id)
        t3.set('categoria', 'sugestao')
        t3.set('prioridade', 'media')
        t3.set('titulo', 'Novo recurso')
        t3.set('descricao', 'Seria bom ter um app.')
        t3.set('status', 'em_atendimento')
        app.save(t3)
      }
    } catch (e) {
      console.log('Seed error', e.message)
    }
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('suporte_tickets')
      app.delete(collection)
    } catch (e) {}
  },
)
