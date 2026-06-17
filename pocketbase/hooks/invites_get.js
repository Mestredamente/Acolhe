routerAdd('GET', '/backend/v1/invites/{token}', (e) => {
  const token = e.request.pathValue('token')
  try {
    const patient = $app.findFirstRecordByData('patients', 'link_convite', token)
    if (patient.getString('status_convite') === 'aceito') {
      return e.badRequestError('Este convite já foi aceito.')
    }
    return e.json(200, {
      id: patient.id,
      name: patient.getString('name'),
      email: patient.getString('email'),
    })
  } catch (err) {
    return e.notFoundError('Convite inválido ou expirado.')
  }
})
