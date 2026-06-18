import PocketBase from 'pocketbase'

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL)
pb.autoCancellation(false)

pb.beforeSend = function (url, options) {
  const isDemonstrationMode =
    sessionStorage.getItem('impersonated_user') != null && pb.authStore.record?.profile === 'admin'

  if (isDemonstrationMode) {
    const urlStr = url.toString()
    const sensitiveColls = [
      'patients',
      'appointments',
      'evolucoes',
      'diario_paciente',
      'documentos',
      'anamneses',
      'financeiro',
      'respostas_escala',
    ]
    const isSensitive = sensitiveColls.some((col) =>
      urlStr.includes(`/api/collections/${col}/records`),
    )

    if (isSensitive) {
      if (options.method === 'GET') {
        const dummyPatientId = 'dummypatient123'
        const parts = urlStr.split('?')[0].split('/')
        const idPath = parts[parts.length - 1]

        if (idPath !== 'records' && idPath !== dummyPatientId) {
          window.dispatchEvent(new CustomEvent('demo-mode-blocked'))
          throw new Error('DEMO_MODE_BLOCKED')
        }

        const urlObj = new URL(urlStr)
        const existingFilter = urlObj.searchParams.get('filter')
        const demoFilter = urlStr.includes('patients/records')
          ? `(id='${dummyPatientId}')`
          : `(patient_id='${dummyPatientId}')`
        urlObj.searchParams.set(
          'filter',
          existingFilter ? `(${existingFilter}) && ${demoFilter}` : demoFilter,
        )
        return { url: urlObj.toString(), options }
      } else {
        window.dispatchEvent(new CustomEvent('demo-mode-mutation-blocked'))
        throw new Error('DEMO_MODE_MUTATION_BLOCKED')
      }
    }
  }

  return { url, options }
}

export default pb
