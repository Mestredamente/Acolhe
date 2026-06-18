migrate(
  (app) => {
    try {
      const p1 = app.findFirstRecordByData('patients', 'email', 'ana.silva@email.com')
      if (p1) {
        p1.set('cep', '01310-100')
        p1.set('logradouro', 'Avenida Paulista')
        p1.set('numero', '1578')
        p1.set('bairro', 'Bela Vista')
        p1.set('cidade', 'São Paulo')
        p1.set('estado', 'SP')
        p1.set('pais', 'Brasil')
        app.save(p1)
      }
    } catch (e) {}
  },
  (app) => {},
)
