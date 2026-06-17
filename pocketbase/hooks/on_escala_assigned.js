onRecordAfterCreateSuccess((e) => {
  const esc = e.record
  const ptId = esc.getString('patient_id')
  if (!ptId) return e.next()

  try {
    const pt = $app.findRecordById('patients', ptId)
    const ptEmail = pt.getString('email')
    if (ptEmail) {
      const ptUser = $app.findAuthRecordByEmail('_pb_users_auth_', ptEmail)
      const notif = new Record($app.findCollectionByNameOrId('notificacoes'))
      notif.set('user_id', ptUser.id)
      notif.set('patient_id', ptId)
      notif.set('type', 'escala_pendente')
      notif.set('title', 'Nova Escala Pendente')
      notif.set('message', `Seu psicólogo enviou uma nova escala para você responder.`)
      notif.set('status', 'nao_lida')
      notif.set('link', '/portal/tarefas')
      $app.save(notif)
    }
  } catch (err) {}

  return e.next()
}, 'respostas_escala')
