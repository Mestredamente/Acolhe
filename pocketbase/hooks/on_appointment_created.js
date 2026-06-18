onRecordAfterCreateSuccess((e) => {
  const apt = e.record
  const user_id = apt.getString('user_id') // Psicologo
  if (!user_id) return e.next()

  const notifCol = $app.findCollectionByNameOrId('notificacoes')

  const dateStr = apt.getString('appointment_date') || apt.getString('time')
  const timeStr = apt.getString('start_time') || ''
  const dataHora = dateStr + (timeStr ? ' às ' + timeStr : '')

  // 1. Notificar o Psicologo
  try {
    const notifPsico = new Record(notifCol)
    notifPsico.set('user_id', user_id)
    notifPsico.set('patient_id', apt.getString('patient_id') || null)
    notifPsico.set('perfil_destino', 'psicologo')
    notifPsico.set('type', 'agenda')
    notifPsico.set('title', 'Nova Consulta Agendada')
    notifPsico.set('message', `Uma nova consulta foi agendada para ${dataHora}.`)
    notifPsico.set('status', 'nao_lida')
    notifPsico.set('is_active', true)
    notifPsico.set('link', '/agenda')
    $app.save(notifPsico)
  } catch (err) {
    $app.logger().error('Failed to create appointment notif for psico', 'error', err.message)
  }

  // 2. Notificar Paciente
  let ptId = apt.getString('patient_id')
  if (ptId) {
    try {
      const pt = $app.findRecordById('patients', ptId)
      const ptEmail = pt.getString('email')
      if (ptEmail) {
        const ptUser = $app.findAuthRecordByEmail('_pb_users_auth_', ptEmail)
        const notifPt = new Record(notifCol)
        notifPt.set('user_id', ptUser.id)
        notifPt.set('patient_id', ptId)
        notifPt.set('perfil_destino', 'paciente')
        notifPt.set('type', 'agenda')
        notifPt.set('title', 'Sua Consulta foi Agendada')
        notifPt.set('message', `Você tem uma nova consulta agendada para ${dataHora}.`)
        notifPt.set('status', 'nao_lida')
        notifPt.set('is_active', true)
        notifPt.set('link', '/portal/atendimentos')
        $app.save(notifPt)
      }
    } catch (err) {}
  }

  // 3. Notificar Clínica (Owner) se aplicavel
  try {
    const psicoUser = $app.findRecordById('users', user_id)
    const id_clinica = psicoUser.getString('id_clinica')
    if (id_clinica) {
      const clinica = $app.findRecordById('clinicas', id_clinica)
      const adminId = clinica.getString('admin_id')
      if (adminId && adminId !== user_id) {
        const notifOwner = new Record(notifCol)
        notifOwner.set('user_id', adminId)
        notifOwner.set('id_clinica', id_clinica)
        notifOwner.set('perfil_destino', 'owner_clinica')
        notifOwner.set('type', 'agenda')
        notifOwner.set('title', 'Nova Consulta na Clínica')
        notifOwner.set(
          'message',
          `Consulta agendada pelo profissional na clínica para ${dataHora}.`,
        )
        notifOwner.set('status', 'nao_lida')
        notifOwner.set('is_active', true)
        notifOwner.set('link', '/agenda')
        $app.save(notifOwner)
      }
    }
  } catch (err) {}

  return e.next()
}, 'appointments')
