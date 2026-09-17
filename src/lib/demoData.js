// Datos de demostración: un viaje a Chachapoyas con lugares, eventos e itinerario.
// Se agregan solo cuando el usuario lo pide desde Ajustes (no se cargan automáticamente).
export async function seedDemoData({ trips, places, events, expenses, todos }) {
  const tripId = await trips.add({
    name: 'Chachapoyas', destination: 'Amazonas, Perú',
    dateFrom: '2026-10-26', dateTo: '2026-11-03',
    budget: 3500, people: 'Andy & Marjorie',
    notes: 'Primer viaje juntos a la selva alta. Llevar ropa de lluvia.',
    coverPhoto: null,
    itinerary: [
      { date: '2026-10-26', time: '07:00', title: 'Vuelo Lima → Tarapoto' },
      { date: '2026-10-27', time: '08:00', title: 'Laguna Azul' },
      { date: '2026-10-28', time: '10:00', title: 'Catarata de Gocta' },
      { date: '2026-10-29', time: '08:00', title: 'Kuelap' },
    ],
  })

  const placeDefs = [
    { name: 'Laguna Azul', city: 'Tarapoto', category: 'naturaleza', status: 'pendiente', plannedDate: '2026-10-27' },
    { name: 'Catarata de Gocta', city: 'Chachapoyas', category: 'naturaleza', status: 'pendiente', plannedDate: '2026-10-28' },
    { name: 'Kuelap', city: 'Chachapoyas', category: 'cultura', status: 'pendiente', plannedDate: '2026-10-29' },
    { name: 'Tarapoto', city: 'San Martín', category: 'ciudad', status: 'pendiente' },
    { name: 'Chachapoyas (centro)', city: 'Amazonas', category: 'ciudad', status: 'pendiente' },
  ]
  for (const p of placeDefs) {
    await places.add({
      name: p.name, country: 'Perú', city: p.city, category: p.category, description: '',
      status: p.status, notes: '', tripId, photos: [], lat: null, lng: null,
      visitDate: null, rating: null, plannedDate: p.plannedDate || null,
    })
  }

  await events.add({ title: 'Cumpleaños de Marjorie', type: 'cumpleanos', date: '2026-11-08', time: '', recurring: true, tripId: null, placeId: null, notes: '' })
  await events.add({ title: 'Pagar hotel Chachapoyas', type: 'pago', date: '2026-10-20', time: '', recurring: false, tripId, placeId: null, notes: 'Adelanto del 50%' })

  await expenses.add({ description: 'Pasajes Lima–Tarapoto', amount: 480, currency: 'PEN', paidBy: 'Andy', forWhom: 'ambos', category: 'transporte', date: '2026-09-15', tripId, placeId: null, note: '', receipt: null, type: 'gasto' })
  await expenses.add({ description: 'Hotel Chachapoyas (3 noches)', amount: 350, currency: 'PEN', paidBy: 'Andy', forWhom: 'ambos', category: 'alojamiento', date: '2026-10-28', tripId, placeId: null, note: '', receipt: null, type: 'gasto' })
  await expenses.add({ description: 'Tour Kuelap', amount: 180, currency: 'PEN', paidBy: 'Marjorie', forWhom: 'ambos', category: 'tours', date: '2026-10-29', tripId, placeId: null, note: '', receipt: null, type: 'gasto' })

  if (todos) {
    await todos.add({ text: 'Reservar el hotel de Chachapoyas', assignedTo: 'Andy', tripId, dueDate: '2026-10-01', done: true, doneAt: new Date().toISOString() })
    await todos.add({ text: 'Comprar repelente y ropa de lluvia', assignedTo: 'Ambos', tripId, dueDate: '2026-10-20', done: false, doneAt: null })
    await todos.add({ text: 'Comprar regalo cumpleaños Marjorie', assignedTo: 'Andy', tripId: null, dueDate: '2026-11-05', done: false, doneAt: null })
  }
}
