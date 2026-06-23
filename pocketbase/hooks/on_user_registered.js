onRecordAfterCreateSuccess((e) => {
  const profile = e.record.getString('profile')
  if (profile === 'psicologo' || profile === 'owner_clinica') {
    try {
      const saasCol = $app.findCollectionByNameOrId('saas_assinaturas')
      const saas = new Record(saasCol)
      saas.set('user_id', e.record.id)
      saas.set('status', 'ativo')
      saas.set('plano', profile === 'psicologo' ? 'profissional' : 'clinica')
      saas.set('data_inicio', new Date().toISOString())
      saas.set('valor_mensal', 0)
      $app.saveNoValidate(saas)
      $app.logger().info('Criada assinatura SaaS para o novo usuario', 'userId', e.record.id)
    } catch (err) {
      $app.logger().error('Falha ao criar saas_assinatura', 'error', err.message)
    }
  }
  e.next()
}, 'users')
