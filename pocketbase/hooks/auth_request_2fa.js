routerAdd(
  'POST',
  '/backend/v1/auth/request-2fa',
  (e) => {
    const user = e.auth
    if (!user) return e.unauthorizedError('Auth required')

    if (!user.getBool('dois_fa_ativo')) {
      return e.json(200, { message: '2FA not active' })
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    user.set('codigo_verificacao', code)
    $app.saveNoValidate(user)

    $app.logger().info('Enviando email de 2FA (simulado)', 'email', user.email(), 'code', code)

    return e.json(200, { message: 'Code generated', simulatedCode: code })
  },
  $apis.requireAuth(),
)
