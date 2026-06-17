onRecordAfterCreateSuccess((e) => {
  const apt = e.record
  const user_id = apt.getString('user_id')
  if (!user_id) return e.next()

  try {
    const notif = new Record($app.findCollectionByNameOrId('notificacoes'))
    notif.set('user_id', user_id)
    notif.set('patient_id', apt.getString('patient_id') || null)
    notif.set('type', 'consulta_proxima')
    notif.set('title', 'Nova Consulta Agendada')
    notif.set(
      'message',
      `Consulta agendada para ${apt.getString('appointment_date') || apt.getString('time')} às ${apt.getString('start_time') || ''}.`,
    )
    notif.set('status', 'nao_lida')
    notif.set('link', '/agenda')
    $app.save(notif)
  } catch (err) {
    $app.logger().error('Failed to create appointment notif', 'error', err.message)
  }

  try {
    const ptId = apt.getString('patient_id')
    if (ptId) {
      const pt = $app.findRecordById('patients', ptId)
      const ptEmail = pt.getString('email')
      if (ptEmail) {
        const ptUser = $app.findAuthRecordByEmail('_pb_users_auth_', ptEmail)
        const ptNotif = new Record($app.findCollectionByNameOrId('notificacoes'))
        ptNotif.set('user_id', ptUser.id)
        ptNotif.set('patient_id', ptId)
        ptNotif.set('type', 'consulta_confirmada')
        ptNotif.set('title', 'Sua Consulta foi Agendada')
        ptNotif.set(
          'message',
          `Você tem uma nova consulta agendada para ${apt.getString('appointment_date') || apt.getString('time')}.`,
        )
        ptNotif.set('status', 'nao_lida')
        ptNotif.set('link', '/portal')
        $app.save(ptNotif)
      }
    }
  } catch (err) {}

  return e.next()
}, 'appointments')
