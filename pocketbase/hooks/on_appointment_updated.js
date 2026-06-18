onRecordAfterUpdateSuccess((e) => {
  const originalStatus = e.record.original().getString('status')
  const newStatus = e.record.getString('status')

  if (originalStatus !== 'concluida' && newStatus === 'concluida') {
    try {
      const config = $app.findFirstRecordByData(
        'config_clinica',
        'user_id',
        e.record.getString('user_id'),
      )
      const valor = config.getFloat('valor_consulta_padrao') || 0

      const fin = new Record($app.findCollectionByNameOrId('financeiro'))
      fin.set('user_id', e.record.getString('user_id'))
      fin.set('patient_id', e.record.getString('patient_id'))
      fin.set('appointment_id', e.record.id)
      fin.set('amount', valor)

      const dateStr = e.record.getString('appointment_date').substring(0, 10)
      const patientName = e.record.getString('patient_name_text') || 'Paciente'
      fin.set(
        'description',
        'Sessão de ' + dateStr.split('-').reverse().join('/') + ' — ' + patientName,
      )
      fin.set('status', 'pendente')

      const today = new Date().toISOString().substring(0, 10)
      fin.set('due_date', today + ' 12:00:00.000Z')

      $app.save(fin)
    } catch (err) {
      console.log('Error generating financeiro on concluida', err.message)
    }
  }

  // Notificar cancelamento
  if (
    originalStatus !== newStatus &&
    (newStatus === 'cancelada' || newStatus === 'cancelada_pelo_paciente')
  ) {
    const user_id = e.record.getString('user_id')
    try {
      const notif = new Record($app.findCollectionByNameOrId('notificacoes'))
      notif.set('user_id', user_id)
      notif.set('patient_id', e.record.getString('patient_id') || null)
      notif.set('perfil_destino', 'psicologo')
      notif.set('type', 'agenda')
      notif.set('title', 'Consulta Cancelada')
      notif.set(
        'message',
        `A consulta do dia ${e.record.getString('appointment_date')} foi cancelada.`,
      )
      notif.set('status', 'nao_lida')
      notif.set('is_active', true)
      notif.set('link', '/agenda')
      $app.save(notif)
    } catch (err) {}
  }

  e.next()
}, 'appointments')
