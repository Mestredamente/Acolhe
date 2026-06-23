migrate(
  (app) => {
    const email = 'psicologosylviotutya@gmail.com'
    const password = 'Takayoshi@121061'

    try {
      const user = app.findAuthRecordByEmail('users', email)
      user.setPassword(password)
      user.set('profile', 'psicologo')
      user.set('status', 'ativo')
      app.save(user)
    } catch (_) {
      const collection = app.findCollectionByNameOrId('users')
      const user = new Record(collection)
      user.setEmail(email)
      user.setPassword(password)
      user.set('profile', 'psicologo')
      user.set('status', 'ativo')
      app.save(user)
    }
  },
  (app) => {
    // Revert is intentionally left empty to avoid accidental deletion of the real user account.
  },
)
