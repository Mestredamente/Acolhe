migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('config_clinica')
    col.fields.add(new BoolField({ name: 'google_calendar_active' }))
    col.fields.add(new TextField({ name: 'google_calendar_email' }))
    col.fields.add(
      new SelectField({
        name: 'google_calendar_sync_mode',
        values: ['to_google', 'from_google', 'bidirectional'],
        maxSelect: 1,
      }),
    )
    col.fields.add(new TextField({ name: 'google_calendar_name' }))
    col.fields.add(new BoolField({ name: 'zoom_active' }))
    col.fields.add(new BoolField({ name: 'zoom_auto_link' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('config_clinica')
    col.fields.removeByName('google_calendar_active')
    col.fields.removeByName('google_calendar_email')
    col.fields.removeByName('google_calendar_sync_mode')
    col.fields.removeByName('google_calendar_name')
    col.fields.removeByName('zoom_active')
    col.fields.removeByName('zoom_auto_link')
    app.save(col)
  },
)
