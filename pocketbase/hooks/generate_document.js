routerAdd(
  'POST',
  '/backend/v1/generate-document',
  (e) => {
    const body = e.requestInfo().body || {}
    const { patient_id, doc_type, context, date } = body
    const userId = e.auth?.id

    if (!userId) return e.unauthorizedError('auth required')
    if (!patient_id) return e.badRequestError('patient_id is required')
    if (!doc_type) return e.badRequestError('doc_type is required')

    try {
      const patient = $app.findRecordById('patients', patient_id)

      if (!$app.canAccessRecord(patient, e.requestInfo(), patient.collection().viewRule)) {
        return e.forbiddenError('access denied')
      }

      let configStr = ''
      try {
        const config = $app.findFirstRecordByFilter('config_clinica', `user_id = '${userId}'`)
        configStr = `Clínica: ${config.getString('nome_clinica')}, Profissional: ${config.getString('nome_profissional')}, CRP: ${config.getString('crp_psicologo')}`
      } catch (_) {}

      const evos = $app.findRecordsByFilter(
        'evolucoes',
        `patient_id = '${patient_id}'`,
        '-session_date',
        5,
        0,
      )
      const evoText = evos
        .map(
          (r) =>
            `Data: ${r.getString('session_date').split(' ')[0]}\nConteúdo: ${r.getString('content')}`,
        )
        .join('\n\n')

      let prompt = `Você é um psicólogo auxiliando na redação de um documento clínico.\n`
      prompt += `Paciente: ${patient.getString('name')}\n`
      prompt += `Data: ${date || new Date().toISOString().split('T')[0]}\n`
      if (configStr) prompt += `Dados do Profissional: ${configStr}\n`
      if (context) prompt += `Contexto Adicional (fornecido pelo profissional): ${context}\n`
      prompt += `Últimas Evoluções (Resumo):\n${evoText || 'Nenhuma evolução registrada.'}\n\n`

      prompt += `Com base nestes dados, gere um documento do tipo: ${doc_type}.\n`

      if (doc_type === 'Laudo Psicológico') {
        prompt += `Estrutura obrigatória: Identificação, Motivo do Encaminhamento/Demanda, Resumo da Anamnese, Histórico, Observações Clínicas, Hipótese Diagnóstica (EXPLICITAMENTE SEM CID, apenas descrição clínica), e Conclusão/Recomendações.\n`
      } else if (doc_type === 'Atestado de Comparecimento') {
        prompt += `Estrutura obrigatória: Declaração de comparecimento na data especificada, horário de início e fim, e espaço para assinatura.\n`
      } else if (doc_type === 'Relatório de Evolução') {
        prompt += `Estrutura obrigatória: Resumo cronológico das evoluções, progresso observado e plano de continuidade.\n`
      } else if (doc_type === 'Relatório de Sessão') {
        prompt += `Estrutura obrigatória: Data da sessão, modalidade, resumo e próximos passos.\n`
      } else if (doc_type === 'Encaminhamento') {
        prompt += `Estrutura obrigatória: Identificação do paciente, motivo, breve histórico e recomendação de encaminhamento.\n`
      }

      prompt += `\nRegras:\n- Siga estritamente as resoluções do CFP (Conselho Federal de Psicologia) e a LGPD.\n- Seja objetivo, profissional e ético.\n- O texto deve estar pronto para uso, redigido em português do Brasil.\n- Não inclua comentários informais como 'Aqui está o documento', responda apenas com o texto final que deve constar no documento.`

      const reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente de IA focado em criar documentos clínicos precisos e éticos para psicólogos, conforme exigido pelo CFP.',
          },
          { role: 'user', content: prompt },
        ],
      })

      return e.json(200, { content: reply.choices[0].message.content })
    } catch (err) {
      if (err.name === 'SkipAiError' || err.name === 'SkipAiConfigError') {
        return e.json(503, { error: 'AI temporariamente indisponível. Tente novamente.' })
      }
      return e.badRequestError(err.message)
    }
  },
  $apis.requireAuth(),
)
