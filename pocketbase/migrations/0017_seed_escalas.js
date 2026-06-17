migrate(
  (app) => {
    const escalasCol = app.findCollectionByNameOrId('escalas')

    const baiQuestions = [
      'Dormência ou formigamento',
      'Sentir-se com calor',
      'Tremores nas pernas',
      'Incapaz de relaxar',
      'Medo que o pior aconteça',
      'Atordoado ou tonto',
      'Palpitação ou aceleração do coração',
      'Sem equilíbrio',
      'Aterrorizado',
      'Nervoso',
      'Sensação de sufocação',
      'Tremores nas mãos',
      'Trêmulo',
      'Medo de perder o controle',
      'Dificuldade de respirar',
      'Medo de morrer',
      'Assustado',
      'Indigestão ou desconforto no abdômen',
      'Sensação de desmaio',
      'Rosto afogueado',
      'Suor (não devido ao calor)',
    ].map((q, i) => ({
      id: `bai_${i + 1}`,
      text: q,
      options: [
        { text: 'Absolutamente não', value: 0 },
        { text: 'Levemente (Não me incomodou muito)', value: 1 },
        { text: 'Moderadamente (Foi muito desagradável, mas pude suportar)', value: 2 },
        { text: 'Gravemente (Dificilmente pude suportar)', value: 3 },
      ],
    }))

    const bdiQuestions = [
      {
        text: 'Tristeza',
        options: [
          'Não me sinto triste.',
          'Sinto-me triste',
          'Sou triste o tempo todo e não consigo sair disso',
          'Sou tão triste ou infeliz que não consigo suportar',
        ],
      },
      {
        text: 'Pessimismo',
        options: [
          'Não sou particularmente pessimista quanto ao futuro.',
          'Sinto-me desanimado quanto ao futuro.',
          'Acho que não há nada pelo que esperar.',
          'Acho o futuro sem esperança e sinto que as coisas não podem melhorar.',
        ],
      },
      {
        text: 'Fracasso',
        options: [
          'Não me sinto um fracasso.',
          'Acho que fracassei mais que uma pessoa comum.',
          'Quando olho pra trás, vejo um monte de fracassos.',
          'Sinto que sou um fracasso total como pessoa.',
        ],
      },
      {
        text: 'Perda de Prazer',
        options: [
          'Obtenho tanta satisfação das coisas como antes.',
          'Não sinto prazer nas coisas como antes.',
          'Não encontro mais satisfação real em nada.',
          'Estou insatisfeito ou aborrecido com tudo.',
        ],
      },
      {
        text: 'Sentimento de Culpa',
        options: [
          'Não me sinto particularmente culpado.',
          'Sinto-me culpado uma boa parte do tempo.',
          'Sinto-me muito culpado a maior parte do tempo.',
          'Sinto-me culpado o tempo todo.',
        ],
      },
      {
        text: 'Sentimento de Punição',
        options: [
          'Não acho que estou sendo punido.',
          'Sinto que posso ser punido.',
          'Espero ser punido.',
          'Sinto que estou sendo punido.',
        ],
      },
      {
        text: 'Autoaversão',
        options: [
          'Não me sinto decepcionado comigo mesmo.',
          'Estou decepcionado comigo mesmo.',
          'Estou enojado de mim.',
          'Eu me odeio.',
        ],
      },
      {
        text: 'Autoculpa',
        options: [
          'Não me sinto pior que qualquer outra pessoa.',
          'Sou crítico em relação a mim mesmo por minhas fraquezas ou erros.',
          'Eu me culpo o tempo todo por minhas falhas.',
          'Eu me culpo por tudo de ruim que acontece.',
        ],
      },
      {
        text: 'Pensamentos Suicidas',
        options: [
          'Não tenho pensamentos de me matar.',
          'Tenho pensamentos de me matar, mas não os realizaria.',
          'Gostaria de me matar.',
          'Eu me mataria se tivesse chance.',
        ],
      },
      {
        text: 'Choro',
        options: [
          'Não choro mais do que antes.',
          'Choro mais agora do que antes.',
          'Choro o tempo todo agora.',
          'Eu costumava conseguir chorar, mas agora não consigo, mesmo que queira.',
        ],
      },
      {
        text: 'Irritabilidade',
        options: [
          'Não sou mais irritável do que o normal.',
          'Fico ligeiramente mais irritado agora do que o normal.',
          'Fico irritado ou aborrecido uma boa parte do tempo.',
          'Sinto-me irritado o tempo todo.',
        ],
      },
      {
        text: 'Perda de Interesse',
        options: [
          'Não perdi o interesse pelas outras pessoas.',
          'Estou menos interessado pelas outras pessoas do que antes.',
          'Perdi quase todo o interesse pelas outras pessoas.',
          'Perdi todo o interesse pelas outras pessoas.',
        ],
      },
      {
        text: 'Indecisão',
        options: [
          'Tomo decisões tão bem quanto antes.',
          'Adio a tomada de decisões mais do que antes.',
          'Tenho mais dificuldades para tomar decisões do que antes.',
          'Não consigo mais tomar decisões.',
        ],
      },
      {
        text: 'Desvalorização',
        options: [
          'Não acho que pareço pior do que antes.',
          'Estou preocupado que pareço velho ou sem atrativos.',
          'Sinto que há mudanças permanentes na minha aparência que me fazem parecer sem atrativos.',
          'Acredito que sou feio.',
        ],
      },
      {
        text: 'Perda de Energia',
        options: [
          'Consigo trabalhar tão bem quanto antes.',
          'Preciso de um esforço extra para começar a fazer algo.',
          'Tenho que me esforçar muito para fazer qualquer coisa.',
          'Não consigo fazer trabalho algum.',
        ],
      },
      {
        text: 'Alteração do Sono',
        options: [
          'Durmo tão bem quanto o habitual.',
          'Não durmo tão bem quanto antes.',
          'Acordo 1 a 2 horas mais cedo que o normal e tenho dificuldade de voltar a dormir.',
          'Acordo várias horas mais cedo e não consigo voltar a dormir.',
        ],
      },
      {
        text: 'Irritabilidade/Cansaço',
        options: [
          'Não fico mais cansado que o normal.',
          'Fico cansado com mais facilidade que antes.',
          'Quase tudo o que faço me deixa cansado.',
          'Estou cansado demais para fazer qualquer coisa.',
        ],
      },
      {
        text: 'Alteração do Apetite',
        options: [
          'Meu apetite não está pior.',
          'Meu apetite não é tão bom como antes.',
          'Meu apetite está muito pior agora.',
          'Não tenho mais apetite algum.',
        ],
      },
      {
        text: 'Perda de Peso',
        options: [
          'Não perdi muito peso.',
          'Perdi mais de 2 quilos.',
          'Perdi mais de 4 quilos.',
          'Perdi mais de 6 quilos.',
        ],
      },
      {
        text: 'Preocupação Somática',
        options: [
          'Não estou mais preocupado com minha saúde que o normal.',
          'Estou preocupado com problemas físicos.',
          'Estou muito preocupado com problemas físicos e é difícil pensar em outra coisa.',
          'Estou tão preocupado com problemas físicos que não consigo pensar em outra coisa.',
        ],
      },
      {
        text: 'Perda de Libido',
        options: [
          'Não notei qualquer mudança recente em meu interesse por sexo.',
          'Estou menos interessado em sexo do que costumava.',
          'Estou muito menos interessado em sexo agora.',
          'Perdi completamente o interesse em sexo.',
        ],
      },
    ].map((q, i) => ({
      id: `bdi_${i + 1}`,
      text: q.text,
      options: q.options.map((opt, j) => ({ text: opt, value: j })),
    }))

    try {
      app.findFirstRecordByData('escalas', 'name', 'Inventário de Ansiedade de Beck (BAI)')
    } catch (_) {
      const bai = new Record(escalasCol)
      bai.set('name', 'Inventário de Ansiedade de Beck (BAI)')
      bai.set('category', 'Ansiedade')
      bai.set('description', 'Mede a intensidade da ansiedade no paciente.')
      bai.set(
        'application_instructions',
        'Abaixo está uma lista de sintomas comuns de ansiedade. Leia cuidadosamente cada item da lista. Indique o quanto você tem sido incomodado por cada sintoma durante a última semana, incluindo hoje.',
      )
      bai.set('questions', baiQuestions)
      app.save(bai)
    }

    try {
      app.findFirstRecordByData('escalas', 'name', 'Inventário de Depressão de Beck (BDI)')
    } catch (_) {
      const bdi = new Record(escalasCol)
      bdi.set('name', 'Inventário de Depressão de Beck (BDI)')
      bdi.set('category', 'Depressão')
      bdi.set('description', 'Mede a intensidade da depressão.')
      bdi.set(
        'application_instructions',
        'Este questionário consiste em 21 grupos de afirmações. Leia cada um cuidadosamente e escolha uma afirmação em cada grupo que melhor descreva a maneira que você tem se sentido na última semana, incluindo hoje.',
      )
      bdi.set('questions', bdiQuestions)
      app.save(bdi)
    }

    let admin, patient, bai, bdi
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
      patient = app.findFirstRecordByFilter('patients', `user_id = '${admin.id}'`)
      bai = app.findFirstRecordByData('escalas', 'name', 'Inventário de Ansiedade de Beck (BAI)')
      bdi = app.findFirstRecordByData('escalas', 'name', 'Inventário de Depressão de Beck (BDI)')
    } catch (_) {
      return
    }

    const respCol = app.findCollectionByNameOrId('respostas_escala')

    try {
      app.findFirstRecordByFilter(
        'respostas_escala',
        `patient_id = '${patient.id}' && scale_id = '${bai.id}'`,
      )
    } catch (_) {
      const rBai = new Record(respCol)
      rBai.set('user_id', admin.id)
      rBai.set('patient_id', patient.id)
      rBai.set('scale_id', bai.id)
      rBai.set('status', 'pendente')
      app.save(rBai)
    }

    try {
      app.findFirstRecordByFilter(
        'respostas_escala',
        `patient_id = '${patient.id}' && scale_id = '${bdi.id}' && status = 'respondido'`,
      )
    } catch (_) {
      const rBdi = new Record(respCol)
      rBdi.set('user_id', admin.id)
      rBdi.set('patient_id', patient.id)
      rBdi.set('scale_id', bdi.id)
      rBdi.set('status', 'respondido')
      rBdi.set('total_score', 18)
      rBdi.set('response_date', new Date().toISOString())
      const answers = bdiQuestions.map((q) => ({ question_id: q.id, value: 0 }))
      answers[0].value = 2
      answers[1].value = 2
      answers[2].value = 2
      answers[3].value = 2
      answers[4].value = 2
      answers[5].value = 2
      answers[6].value = 2
      answers[7].value = 2
      answers[8].value = 2
      rBdi.set('responses_list', answers)
      rBdi.set(
        'ai_interpretation',
        'Classificação: Leve. O paciente apresenta sinais leves de depressão, com destaque para tristeza, pessimismo e perda de prazer.',
      )
      app.save(rBdi)
    }
  },
  (app) => {
    //
  },
)
