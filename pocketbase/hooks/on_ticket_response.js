onRecordAfterUpdateSuccess((e) => {
  const oldStatus = e.record.original().getString('status')
  const newStatus = e.record.getString('status')
  const oldResposta = e.record.original().getString('resposta')
  const newResposta = e.record.getString('resposta')

  if (
    (newStatus === 'resolvido' && oldStatus !== 'resolvido') ||
    (newResposta && newResposta !== oldResposta)
  ) {
    try {
      const userId = e.record.getString('usuario_id')
      if (userId) {
        const notif = new Record($app.findCollectionByNameOrId('notificacoes'))
        notif.set('user_id', userId)

        const user = $app.findRecordById('users', userId)
        let p = user.getString('profile')
        if (p === 'admin') p = 'gestor_saas'
        notif.set('perfil_destino', p)

        notif.set('type', 'sistema')
        notif.set('title', 'Atualização no Chamado de Suporte')
        notif.set(
          'message',
          `Seu chamado "${e.record.getString('titulo')}" foi atualizado pela equipe.`,
        )
        notif.set('status', 'nao_lida')
        notif.set('is_active', true)
        notif.set('link', p === 'gestor_saas' ? '/admin/dashboard' : '/suporte')
        $app.save(notif)
      }
    } catch (err) {}
  }
  return e.next()
}, 'suporte_tickets')
