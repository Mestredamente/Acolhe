routerAdd(
  'POST',
  '/backend/v1/mensagens/send',
  (e) => {
    const body = e.requestInfo().body || {}
    const authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')

    const patientId = body.patient_id
    const content = body.content
    const senderType = body.sender_type

    if (!patientId || !content || !senderType) {
      return e.badRequestError('Missing required fields')
    }

    let patient
    try {
      patient = $app.findRecordById('patients', patientId)
    } catch (_) {
      return e.notFoundError('Patient not found')
    }

    let senderId = authUser.id
    let recipientId = ''

    if (senderType === 'psicologo') {
      const pEmail = patient.getString('email')
      if (!pEmail) {
        return e.badRequestError('Paciente precisa ter um email cadastrado para receber mensagens.')
      }
      try {
        const patientUser = $app.findAuthRecordByEmail('_pb_users_auth_', pEmail)
        recipientId = patientUser.id
      } catch (_) {
        const users = $app.findCollectionByNameOrId('_pb_users_auth_')
        const newUser = new Record(users)
        newUser.setEmail(pEmail)
        newUser.setPassword('Skip@Pass')
        newUser.setVerified(true)
        newUser.set('name', patient.getString('name'))
        $app.save(newUser)
        recipientId = newUser.id
      }
    } else {
      recipientId = patient.getString('user_id')
    }

    const mensagens = $app.findCollectionByNameOrId('mensagens')
    const msg = new Record(mensagens)
    msg.set('sender_id', senderId)
    msg.set('recipient_id', recipientId)
    msg.set('patient_id', patientId)
    msg.set('content', content)
    msg.set('read_status', 'nao_lida')
    msg.set('sender_type', senderType)
    $app.save(msg)

    return e.json(200, msg)
  },
  $apis.requireAuth(),
)
