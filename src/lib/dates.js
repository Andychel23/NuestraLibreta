export const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
export const WEEKDAY_LABELS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

export function toDate(str) {
  if (!str) return null
  return new Date(str + 'T00:00:00')
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function fmtDate(str, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const d = toDate(str)
  if (!d) return ''
  return d.toLocaleDateString('es-PE', opts)
}

export function fmtRange(from, to) {
  if (!from) return ''
  if (!to || to === from) return fmtDate(from)
  const a = toDate(from), b = toDate(to)
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  const fromOpts = sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'short' }
  return `${a.toLocaleDateString('es-PE', fromOpts)} – ${fmtDate(to)}`
}

export function daysBetween(fromStr, toStr) {
  const a = toDate(fromStr), b = toDate(toStr)
  return Math.round((b - a) / 86400000)
}

export function tripStatus(trip) {
  if (!trip.dateFrom) return 'pendiente'
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const from = toDate(trip.dateFrom)
  const to = trip.dateTo ? toDate(trip.dateTo) : from
  if (now < from) return 'pendiente'
  if (now > to) return 'finalizado'
  return 'en_curso'
}

export function nextOccurrence(dateStr, recurring) {
  const d = toDate(dateStr)
  if (!recurring) return d
  const now = new Date(); now.setHours(0, 0, 0, 0)
  let next = new Date(now.getFullYear(), d.getMonth(), d.getDate())
  if (next < now) next = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate())
  return next
}

export function daysUntil(date) {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return Math.round((date - now) / 86400000)
}

export function ymd(d) {
  return d.toISOString().slice(0, 10)
}

// Genera la matriz de celdas (lunes primero) para el mes dado
export function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7
  const cells = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1
    cells.push(dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null)
  }
  return cells
}

// Devuelve los 7 días (lunes-domingo) de la semana que contiene `date`
export function buildWeekDays(date) {
  const d = new Date(date)
  const offset = (d.getDay() + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - offset)
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    return day
  })
}
