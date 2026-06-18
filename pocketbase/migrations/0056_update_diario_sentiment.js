migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('diario_paciente')
    const field = col.fields.getByName('sentiment')
    if (field) {
      field.values = ['muito feliz', 'feliz', 'neutro', 'ansioso', 'triste', 'irritado']
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('diario_paciente')
    const field = col.fields.getByName('sentiment')
    if (field) {
      field.values = ['feliz', 'neutro', 'triste', 'ansioso', 'irritado', 'esperançoso']
      app.save(col)
    }
  },
)
