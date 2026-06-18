/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('empresa_fiscal')

    if (!col.fields.getByName('nome_fantasia'))
      col.fields.add(new TextField({ name: 'nome_fantasia' }))
    if (!col.fields.getByName('inscricao_estadual'))
      col.fields.add(new TextField({ name: 'inscricao_estadual' }))
    if (!col.fields.getByName('inscricao_municipal'))
      col.fields.add(new TextField({ name: 'inscricao_municipal' }))
    if (!col.fields.getByName('telefone')) col.fields.add(new TextField({ name: 'telefone' }))
    if (!col.fields.getByName('email_contato'))
      col.fields.add(new EmailField({ name: 'email_contato' }))
    if (!col.fields.getByName('website')) col.fields.add(new URLField({ name: 'website' }))
    if (!col.fields.getByName('cor_primaria'))
      col.fields.add(new TextField({ name: 'cor_primaria' }))
    if (!col.fields.getByName('frase_boas_vindas'))
      col.fields.add(new TextField({ name: 'frase_boas_vindas' }))

    if (!col.fields.getByName('cep')) col.fields.add(new TextField({ name: 'cep' }))
    if (!col.fields.getByName('logradouro')) col.fields.add(new TextField({ name: 'logradouro' }))
    if (!col.fields.getByName('numero')) col.fields.add(new TextField({ name: 'numero' }))
    if (!col.fields.getByName('bairro')) col.fields.add(new TextField({ name: 'bairro' }))
    if (!col.fields.getByName('cidade')) col.fields.add(new TextField({ name: 'cidade' }))
    if (!col.fields.getByName('estado')) col.fields.add(new TextField({ name: 'estado' }))

    app.save(col)

    try {
      const all = app.findRecordsByFilter('empresa_fiscal', '', '', 1, 0)
      if (all.length > 0) {
        const rec = all[0]
        if (!rec.getString('nome_aplicativo')) rec.set('nome_aplicativo', 'PsicoGestão')
        if (!rec.getString('cor_primaria')) rec.set('cor_primaria', '#1E3A5F')
        app.save(rec)
      } else {
        const rec = new Record(col)
        rec.set('cnpj', '00.000.000/0001-00')
        rec.set('razao_social', 'PsicoGestão Tecnologia LTDA')
        rec.set('nome_aplicativo', 'PsicoGestão')
        rec.set('cor_primaria', '#1E3A5F')
        app.save(rec)
      }
    } catch (err) {
      console.log('Error seeding empresa_fiscal: ', err.message)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('empresa_fiscal')
    col.fields.removeByName('nome_fantasia')
    col.fields.removeByName('inscricao_estadual')
    col.fields.removeByName('inscricao_municipal')
    col.fields.removeByName('telefone')
    col.fields.removeByName('email_contato')
    col.fields.removeByName('website')
    col.fields.removeByName('cor_primaria')
    col.fields.removeByName('frase_boas_vindas')
    col.fields.removeByName('cep')
    col.fields.removeByName('logradouro')
    col.fields.removeByName('numero')
    col.fields.removeByName('bairro')
    col.fields.removeByName('cidade')
    col.fields.removeByName('estado')
    app.save(col)
  },
)
