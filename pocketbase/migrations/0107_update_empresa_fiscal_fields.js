migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('empresa_fiscal')

    if (!col.fields.getByName('timezone')) {
      col.fields.add(
        new SelectField({
          name: 'timezone',
          values: [
            'America/Sao_Paulo',
            'America/Manaus',
            'America/Belem',
            'America/Fortaleza',
            'America/Rio_Branco',
            'America/Boa_Vista',
            'America/Cuiaba',
          ],
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('moeda')) {
      col.fields.add(new TextField({ name: 'moeda' }))
    }
    if (!col.fields.getByName('idioma')) {
      col.fields.add(new TextField({ name: 'idioma' }))
    }
    if (!col.fields.getByName('dominio_personalizado')) {
      col.fields.add(new TextField({ name: 'dominio_personalizado' }))
    }

    app.save(col)

    try {
      const records = app.findRecordsByFilter('empresa_fiscal', '1=1', '', 1, 0)
      if (records.length === 0) {
        const record = new Record(col)
        record.set('razao_social', 'PsicoGestão Software LTDA')
        record.set('cnpj', '00000000000100')
        record.set('nome_aplicativo', 'PsicoGestão')
        record.set('cor_primaria', '#1E3A5F')
        record.set('timezone', 'America/Sao_Paulo')
        record.set('moeda', 'BRL')
        record.set('idioma', 'PT-BR')
        app.save(record)
      }
    } catch (err) {
      console.log('Error seeding empresa_fiscal:', err.message)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('empresa_fiscal')
    col.fields.removeByName('timezone')
    col.fields.removeByName('moeda')
    col.fields.removeByName('idioma')
    col.fields.removeByName('dominio_personalizado')
    app.save(col)
  },
)
