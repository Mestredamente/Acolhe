onRecordAfterUpdateSuccess((e) => {
  const fin = e.record
  const status = fin.getString('status')
  const oldStatus = e.record.original().getString('status')

  if (status === 'atrasado' && oldStatus !== 'atrasado') {
    const user_id = fin.getString('user_id')
    if (!user_id) return e.next()

    try {
      const notif = new Record($app.findCollectionByNameOrId('notificacoes'))
      notif.set('user_id', user_id)
      notif.set('patient_id', fin.getString('patient_id') || null)
      notif.set('type', 'pagamento_atrasado')
      notif.set('title', 'Pagamento Atrasado')
      notif.set('message', `Um pagamento de R$ ${fin.getFloat('amount')} consta como atrasado.`)
      notif.set('status', 'nao_lida')
      notif.set('link', '/financeiro')
      $app.save(notif)
    } catch (err) {}
  }
  return e.next()
}, 'financeiro')
