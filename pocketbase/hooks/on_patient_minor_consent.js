onRecordAfterCreateSuccess((e) => {
  const p = e.record
  const birthStr = p.getString('birth_date')
  if (!birthStr) return e.next()

  const birthDate = new Date(birthStr)
  const age = Math.floor((new Date().getTime() - birthDate.getTime()) / 3.15576e10)

  if (age < 18) {
    const docs = $app.findCollectionByNameOrId('documentos')
    const doc = new Record(docs)
    doc.set('user_id', p.get('user_id'))
    doc.set('patient_id', p.id)
    doc.set('file_name', 'Consentimento do Responsável')
    doc.set('doc_type', 'outro')
    doc.set(
      'description',
      'Declaro que sou responsável legal deste menor e autorizo o tratamento psicológico. Li e aceito os termos de privacidade e o código de ética do CFP.',
    )
    const consentStatus = p.getString('guardian_consent_status')
    doc.set('status', consentStatus === 'assinado' ? 'visivel_paciente' : 'pendente_assinatura')
    $app.save(doc)
  }
  return e.next()
}, 'patients')
