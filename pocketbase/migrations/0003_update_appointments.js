migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('appointments')

    const timeField = col.fields.getByName('time')
    if (timeField) {
      timeField.required = false
    }

    col.fields.add(new TextField({ name: 'patient_name_text' }))
    col.fields.add(new DateField({ name: 'appointment_date' }))
    col.fields.add(new TextField({ name: 'start_time' }))
    col.fields.add(new TextField({ name: 'end_time' }))
    col.fields.add(
      new SelectField({
        name: 'status',
        values: ['agendada', 'confirmada', 'cancelada', 'concluida'],
        maxSelect: 1,
      }),
    )
    col.fields.add(new TextField({ name: 'observations' }))
    col.fields.add(new TextField({ name: 'link_or_room' }))

    col.addIndex('idx_appointments_date', false, 'appointment_date', '')
    col.addIndex('idx_appointments_status', false, 'status', '')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('appointments')
    const timeField = col.fields.getByName('time')
    if (timeField) {
      timeField.required = true
    }
    col.fields.removeByName('patient_name_text')
    col.fields.removeByName('appointment_date')
    col.fields.removeByName('start_time')
    col.fields.removeByName('end_time')
    col.fields.removeByName('status')
    col.fields.removeByName('observations')
    col.fields.removeByName('link_or_room')
    col.removeIndex('idx_appointments_date')
    col.removeIndex('idx_appointments_status')
    app.save(col)
  },
)
