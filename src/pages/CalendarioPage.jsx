import { useMemo, useState } from 'react'
import { IconChevronLeft, IconChevronRight, IconPlane, IconMapPin } from '@tabler/icons-react'
import { useApp } from '../state/AppState'
import { MONTH_NAMES, WEEKDAY_LABELS, buildMonthGrid, buildWeekDays, nextOccurrence, daysUntil, toDate } from '../lib/dates'
import { EVENT_TYPE_MAP, CAL_LEGEND } from '../lib/constants'
import Sheet from '../components/Sheet'
import './CalendarioPage.css'

function ymdLocal(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

// Junta viajes, eventos e itinerarios en un mapa { 'YYYY-MM-DD': [ev, ev, ...] }
function useAllEvents() {
  const { trips, events, places } = useApp()

  return useMemo(() => {
    const map = {}
    const add = (dateStr, ev) => { if (!map[dateStr]) map[dateStr] = []; map[dateStr].push(ev) }

    trips.items.forEach(t => {
      if (!t.dateFrom) return
      const start = toDate(t.dateFrom)
      const end = t.dateTo ? toDate(t.dateTo) : start
      let cur = new Date(start), guard = 0
      while (cur <= end && guard < 60) {
        add(ymdLocal(cur), { id: `trip-${t.id}-${guard}`, color: 'trip', icon: IconPlane, label: t.name, sub: t.destination, kind: 'trip', refId: t.id })
        cur.setDate(cur.getDate() + 1); guard++
      }
      ;(t.itinerary || []).forEach((it, idx) => {
        if (!it.date) return
        add(it.date, { id: `it-${t.id}-${idx}`, color: 'actividad', icon: EVENT_TYPE_MAP.actividad.icon, label: it.title, sub: t.name, time: it.time, kind: 'itinerario', refId: t.id })
      })
    })

    events.items.forEach(ev => {
      if (!ev.date) return
      const next = nextOccurrence(ev.date, ev.recurring)
      const type = EVENT_TYPE_MAP[ev.type] || EVENT_TYPE_MAP.otro
      add(ymdLocal(next), { id: `ev-${ev.id}`, color: type.color, icon: type.icon, label: ev.title, time: ev.time, kind: 'evento', refId: ev.id, recurring: ev.recurring })
    })

    places.items.forEach(p => {
      if (p.status === 'pendiente' && p.plannedDate) {
        add(p.plannedDate, { id: `pl-${p.id}`, color: 'lugar', icon: IconMapPin, label: p.name, sub: p.city, kind: 'lugar', refId: p.id })
      }
    })

    return map
  }, [trips.items, events.items, places.items])
}

export default function CalendarioPage() {
  const [view, setView] = useState('mes') // mes | semana | agenda
  const [cursor, setCursor] = useState(new Date())
  const [dayModal, setDayModal] = useState(null) // { dateStr, list }
  const evMap = useAllEvents()
  const { openSheet } = useApp()

  const year = cursor.getFullYear(), month = cursor.getMonth()
  const today = new Date()
  const todayStr = ymdLocal(today)

  const actividades = useMemo(() => {
    const now = new Date(); now.setHours(0, 0, 0, 0)
    const rows = []
    Object.entries(evMap).forEach(([dateStr, list]) => {
      const d = toDate(dateStr)
      const days = daysUntil(d)
      if (days >= 0 && days <= 90) list.forEach(ev => rows.push({ ...ev, dateStr, d, days }))
    })
    rows.sort((a, b) => a.d - b.d)
    return rows.slice(0, 10)
  }, [evMap])

  function openDay(dateStr) {
    setDayModal({ dateStr, list: (evMap[dateStr] || []) })
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendario</h1>
          <p className="page-sub">Viajes, actividades y fechas importantes.</p>
        </div>
      </div>

      <div className="pill-tabs">
        {['mes', 'semana', 'agenda'].map(v => (
          <div key={v} className={`pill-tab${view === v ? ' active' : ''}`} onClick={() => setView(v)}>
            {v === 'mes' ? 'Mensual' : v === 'semana' ? 'Semanal' : 'Agenda'}
          </div>
        ))}
      </div>

      <div className="cal-legend">
        {CAL_LEGEND.map(l => {
          const Icon = l.icon
          return <span key={l.color}><Icon size={13} stroke={2} className={`cal-ic cal-ic-${l.color}`} />{l.label}</span>
        })}
      </div>

      {view === 'mes' && (
        <MonthView year={year} month={month} evMap={evMap} todayStr={todayStr}
          onPrev={() => setCursor(new Date(year, month - 1, 1))}
          onNext={() => setCursor(new Date(year, month + 1, 1))}
          onToday={() => setCursor(new Date())}
          onDay={openDay} />
      )}
      {view === 'semana' && (
        <WeekView cursor={cursor} evMap={evMap} todayStr={todayStr}
          onPrev={() => setCursor(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })}
          onNext={() => setCursor(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })}
          onDay={openDay} />
      )}
      {view === 'agenda' && <AgendaView evMap={evMap} onDay={openDay} />}

      <div className="actividades">
        <h3 className="actividades-title">Actividades</h3>
        {actividades.length === 0 && <p className="page-sub">Nada en el horizonte todavía.</p>}
        {actividades.map(ev => {
          const Icon = ev.icon
          return (
            <div key={ev.id} className="actividad-row" onClick={() => openDay(ev.dateStr)}>
              <span className={`actividad-ic cal-ic-${ev.color}`}><Icon size={17} stroke={1.8} /></span>
              <div className="actividad-info">
                <div className="actividad-label">{ev.label}</div>
                <div className="actividad-when">{ev.d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}{ev.time ? ' · ' + ev.time : ''}{ev.sub ? ' · ' + ev.sub : ''}</div>
              </div>
              <div className="actividad-days">{ev.days === 0 ? 'Hoy' : ev.days === 1 ? 'Mañana' : `${ev.days}d`}</div>
            </div>
          )
        })}
      </div>

      <Sheet open={!!dayModal} onClose={() => setDayModal(null)}
        title={dayModal ? toDate(dayModal.dateStr).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}>
        {dayModal && dayModal.list.length === 0 && <p className="page-sub">Sin eventos este día.</p>}
        {dayModal && dayModal.list.map(ev => {
          const Icon = ev.icon
          return (
            <div key={ev.id} className="day-event-row">
              <span className={`actividad-ic cal-ic-${ev.color}`}><Icon size={17} stroke={1.8} /></span>
              <div>
                <div className="actividad-label">{ev.label}</div>
                {(ev.sub || ev.time) && <div className="actividad-when">{ev.time ? ev.time + ' · ' : ''}{ev.sub || ''}</div>}
              </div>
            </div>
          )
        })}
        <button className="btn btn-ghost btn-block" style={{ marginTop: 16 }}
          onClick={() => { openSheet('event-form', { date: dayModal?.dateStr }); setDayModal(null) }}>
          + Agregar actividad este día
        </button>
      </Sheet>
    </div>
  )
}

function MonthView({ year, month, evMap, todayStr, onPrev, onNext, onToday, onDay }) {
  const cells = buildMonthGrid(year, month)
  const isCurrentMonth = todayStr.slice(0, 7) === `${year}-${String(month + 1).padStart(2, '0')}`
  return (
    <>
      <div className="cal-header">
        <button className="btn-text" onClick={onPrev}><IconChevronLeft size={15} />Anterior</button>
        <div className="cal-title">{MONTH_NAMES[month]} {year}</div>
        <button className="btn-text" onClick={onNext}>Siguiente<IconChevronRight size={15} /></button>
      </div>
      {!isCurrentMonth && <div style={{ textAlign: 'center', marginBottom: 10 }}><button className="pill-tab" onClick={onToday}>Ir a hoy</button></div>}
      <div className="cal-grid cal-grid-head">{WEEKDAY_LABELS.map(w => <div key={w} className="cal-weekday">{w}</div>)}</div>
      <div className="cal-grid">
        {cells.map((dayNum, i) => {
          if (!dayNum) return <div key={i} className="cal-cell cal-cell-empty" />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
          const dayEvents = evMap[dateStr] || []
          const isToday = dateStr === todayStr
          return (
            <div key={i} className={`cal-cell${isToday ? ' cal-today' : ''}${dayEvents.length ? ' has-events' : ''}`}
              onClick={() => dayEvents.length && onDay(dateStr)}>
              <div className="cal-daynum">{dayNum}</div>
              <div className="cal-dots">
                {dayEvents.slice(0, 3).map((ev, idx) => { const Icon = ev.icon; return <Icon key={idx} size={10} stroke={2.2} className={`cal-ic cal-ic-${ev.color}`} /> })}
                {dayEvents.length > 3 && <span className="cal-more">+{dayEvents.length - 3}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function WeekView({ cursor, evMap, todayStr, onPrev, onNext, onDay }) {
  const days = buildWeekDays(cursor)
  return (
    <>
      <div className="cal-header">
        <button className="btn-text" onClick={onPrev}><IconChevronLeft size={15} />Semana</button>
        <div className="cal-title">{days[0].toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} – {days[6].toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</div>
        <button className="btn-text" onClick={onNext}>Semana<IconChevronRight size={15} /></button>
      </div>
      <div className="week-list">
        {days.map((d, i) => {
          const dateStr = ymdLocal(d)
          const dayEvents = evMap[dateStr] || []
          const isToday = dateStr === todayStr
          return (
            <div key={i} className={`week-row${isToday ? ' cal-today' : ''}`} onClick={() => dayEvents.length && onDay(dateStr)}>
              <div className="week-daylabel">
                <span className="week-weekday">{WEEKDAY_LABELS[i]}</span>
                <span className="week-daynum">{d.getDate()}</span>
              </div>
              <div className="week-events">
                {dayEvents.length === 0 && <span className="page-sub">—</span>}
                {dayEvents.map((ev, idx) => { const Icon = ev.icon; return <span key={idx} className="week-chip"><Icon size={14} stroke={2} className={`cal-ic cal-ic-${ev.color}`} />{ev.label}</span> })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function AgendaView({ evMap, onDay }) {
  const rows = useMemo(() => {
    const list = Object.entries(evMap)
      .map(([dateStr, events]) => ({ dateStr, d: toDate(dateStr), events }))
      .filter(r => daysUntil(r.d) >= -1)
      .sort((a, b) => a.d - b.d)
    return list.slice(0, 40)
  }, [evMap])

  if (rows.length === 0) return <div className="empty-state"><div className="big">Sin eventos próximos</div><div className="hint">Todo tranquilo por ahora.</div></div>

  return (
    <div className="agenda-list">
      {rows.map(r => (
        <div key={r.dateStr} className="agenda-group" onClick={() => onDay(r.dateStr)}>
          <div className="agenda-date">
            <div className="agenda-daynum">{r.d.getDate()}</div>
            <div className="agenda-month">{MONTH_NAMES[r.d.getMonth()].slice(0, 3)}</div>
          </div>
          <div className="agenda-events">
            {r.events.map((ev, idx) => { const Icon = ev.icon; return <div key={idx} className="agenda-event"><Icon size={15} stroke={1.8} className={`cal-ic cal-ic-${ev.color}`} />{ev.label}{ev.time ? ` · ${ev.time}` : ''}</div> })}
          </div>
        </div>
      ))}
    </div>
  )
}
