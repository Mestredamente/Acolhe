migrate(
  (app) => {
    const termos = app.findCollectionByNameOrId('termos_versionamento')

    try {
      app.findFirstRecordByData('termos_versionamento', 'tipo', 'termos_de_servico')
    } catch (_) {
      const t1 = new Record(termos)
      t1.set('tipo', 'termos_de_servico')
      t1.set('titulo', 'Termos de Serviço')
      t1.set(
        'conteudo',
        'Bem-vindo ao PsicoGestão...\n\nEstes termos regulam o uso da plataforma. Todos os registros são mantidos de acordo com as diretrizes do Conselho Federal de Psicologia (CFP).\n\nReservamo-nos o direito de atualizar estes termos.\n\n\n\n\n\n(fim dos termos)',
      )
      t1.set('versao', 1.0)
      t1.set('data_publicacao', new Date().toISOString())
      t1.set('status', 'ativo')
      t1.set('obrigatorio', true)
      app.save(t1)
    }

    try {
      app.findFirstRecordByData('termos_versionamento', 'tipo', 'politica_privacidade')
    } catch (_) {
      const t2 = new Record(termos)
      t2.set('tipo', 'politica_privacidade')
      t2.set('titulo', 'Política de Privacidade')
      t2.set(
        'conteudo',
        'A sua privacidade é importante para nós. Coletamos apenas os dados estritamente necessários para a prestação dos serviços clínicos, em total conformidade com a LGPD.\n\nSeus dados estão seguros e criptografados.\n\n\n\n\n\n(fim da política)',
      )
      t2.set('versao', 1.0)
      t2.set('data_publicacao', new Date().toISOString())
      t2.set('status', 'ativo')
      t2.set('obrigatorio', true)
      app.save(t2)
    }
  },
  (app) => {},
)
