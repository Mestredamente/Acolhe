routerAdd(
  'POST',
  '/backend/v1/demo/reset',
  (e) => {
    const body = e.requestInfo().body
    const tenantId = body.tenant_id
    if (!tenantId) return e.badRequestError('Missing tenant_id')

    let tenant
    try {
      tenant = $app.findRecordById('tenants_demo', tenantId)
    } catch (err) {
      return e.notFoundError('Tenant not found')
    }

    const userId = tenant.get('demo_user_id')

    if (userId) {
      try {
        const user = $app.findRecordById('users', userId)
        user.setPassword('Demo@123456')
        $app.save(user)
      } catch (err) {
        console.log('Could not reset user password:', err.message)
      }
    }

    return e.json(200, { success: true, message: 'Demo reset complete.' })
  },
  $apis.requireAuth(),
)
