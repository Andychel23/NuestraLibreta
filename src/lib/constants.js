export const PLACE_CATS = [
  { id: 'naturaleza', label: 'Naturaleza', icon: '🏞️' },
  { id: 'cultura', label: 'Cultura / historia', icon: '🏛️' },
  { id: 'comida', label: 'Comida', icon: '🍽️' },
  { id: 'aventura', label: 'Aventura', icon: '🥾' },
  { id: 'ciudad', label: 'Ciudad', icon: '🧭' },
  { id: 'otro', label: 'Otro', icon: '📍' },
]

export const EVENT_TYPES = [
  { id: 'actividad', label: 'Actividad', icon: '🔵', color: 'actividad' },
  { id: 'fecha', label: 'Fecha importante', icon: '🟠', color: 'fecha' },
  { id: 'cumpleanos', label: 'Cumpleaños', icon: '🟣', color: 'cumple' },
  { id: 'pago', label: 'Pago', icon: '🔴', color: 'pago' },
  { id: 'reserva', label: 'Reserva', icon: '🟡', color: 'reserva' },
  { id: 'otro', label: 'Otro', icon: '⚪', color: 'otro' },
]
export const EVENT_TYPE_MAP = Object.fromEntries(EVENT_TYPES.map(t => [t.id, t]))

// Leyenda completa del calendario (incluye tipos auto-generados: viajes y lugares)
export const CAL_LEGEND = [
  { color: 'trip', icon: '🟢', label: 'Viaje' },
  ...EVENT_TYPES.filter(t => t.id !== 'otro'),
  { color: 'lugar', icon: '📍', label: 'Lugar por visitar' },
]

export const EXPENSE_CATS = [
  { id: 'transporte', label: 'Transporte', icon: '🚌' },
  { id: 'alojamiento', label: 'Alojamiento', icon: '🏠' },
  { id: 'alimentacion', label: 'Alimentación', icon: '🍔' },
  { id: 'tours', label: 'Tours', icon: '🗺️' },
  { id: 'entradas', label: 'Entradas', icon: '🎟️' },
  { id: 'compras', label: 'Compras', icon: '🛍️' },
  { id: 'otros', label: 'Otros', icon: '✨' },
]

export const TRIP_STATUS_LABEL = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  finalizado: 'Finalizado',
}

export function catInfo(list, id) {
  return list.find(c => c.id === id) || list[list.length - 1]
}
