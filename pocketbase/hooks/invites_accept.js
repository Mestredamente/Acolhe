routerAdd('POST', '/backend/v1/invites/{token}/accept', (e) => {
  const token = e.request.pathValue('token')
  const body = e.requestInfo().body
  if (!body.email || !body.password || !body.terms_accepted) {
    return e.badRequestError('Dados incompletos.')
  }

  let patient
  try {
    patient = $app.findFirstRecordByData('patients', 'link_convite', token)
  } catch (err) {
    return e.notFoundError('Convite inválido ou expirado.')
  }

  if (patient.getString('status_convite') === 'aceito') {
    return e.badRequestError('Este convite já foi aceito.')
  }

  const usersCol = $app.findCollectionByNameOrId('users')
  let user
  try {
    user = $app.findAuthRecordByEmail('users', body.email)
    return e.badRequestError('Este e-mail já está em uso por outra conta.')
  } catch (_) {
    user = new Record(usersCol)
    user.set('profile', 'paciente')
    user.set('name', patient.getString('name'))
    user.setEmail(body.email)
    user.setPassword(body.password)
    user.setVerified(true)

    try {
      $app.save(user)
    } catch (err) {
      return e.badRequestError('Falha ao criar usuário. A senha deve ter no mínimo 8 caracteres.')
    }
  }

  patient.set('user_id', user.id)
  patient.set('email', body.email)
  patient.set('status_convite', 'aceito')

  try {
    $app.save(patient)
  } catch (err) {
    return e.internalServerError('Falha ao vincular o paciente.')
  }

  return e.json(200, { success: true })
})
