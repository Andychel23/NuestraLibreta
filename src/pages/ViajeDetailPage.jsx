import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  IconChevronLeft, IconPencil, IconRoute, IconMapPin, IconBook2, IconTrash,
  IconCircleCheck, IconCircleDashed,
} from '@tabler/icons-react'
import { useApp } from '../state/AppState'
import { fmtRange, tripStatus, fmtDate, todayStr } from '../lib/dates'
import { fmtMoney, computeBalance } from '../lib/money'
import { catInfo, PLACE_CATS } from '../lib/constants'
import IconCoin from '../components/icons/IconCoin'
import './ViajeDetailPage.css'

const TILES = [
  { id: 'itinerario', label: 'Itinerario', icon: IconRoute },
  { id: 'lugares', label: 'Lugares', icon: IconMapPin },
  { id: 'finanzas', label: 'Finanzas', icon: IconCoin },
  { id: 'album', label: 'Álbum', icon: IconBook2, gold: true },
]

export default function ViajeDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { trips, places, expenses, openSheet, toast } = useApp()
  const [section, setSection] = useState(null) // null = hub | itinerario | lugares | finanzas

  const trip = trips.items.find(t => t.id === id)
  const tripPlaces = useMemo(() => places.items.filter(p => p.tripId === id), [places.items, id])
  const tripExpenses = useMemo(() => expenses.items.filter(e => e.tripId === id), [expenses.items, id])

  if (!trip) {
    return <div className="page"><div className="empty-state"><div className="big">Este viaje ya no existe</div><button className="btn-text" onClick={() => nav('/viajes')}>← Volver a viajes</button></div></div>
  }

  const status = tripStatus(trip)
  const visitedCount = tripPlaces.filter(p => p.status === 'visitado').length
  const spent = tripExpenses.filter(e => e.type !== 'liquidacion').reduce((s, e) => s + Number(e.amount || 0), 0)

  function pickTile(tid) {
    if (tid === 'album') nav(`/viajes/${trip.id}/album`)
    else setSection(tid)
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar el viaje "${trip.name}"? Los lugares y gastos asociados quedarán sin viaje.`)) return
    await trips.remove(trip.id)
    toast('Viaje eliminado.')
    nav('/viajes')
  }

  return (
    <div className="page">
      {section ? (
        <button className="btn-text back-link" onClick={() => setSection(null)}><IconChevronLeft size={15} />{trip.name}</button>
      ) : (
        <button className="btn-text back-link" onClick={() => nav('/viajes')}><IconChevronLeft size={15} />Volver a viajes</button>
      )}

      {!section && (
        <>
          <div className="trip-hub-header">
            <div>
              <div className="trip-hub-title">{trip.name}</div>
              <div className="trip-hub-sub">{[trip.destination, fmtRange(trip.dateFrom, trip.dateTo)].filter(Boolean).join(' · ')}</div>
            </div>
            <button className="icon-btn header-edit-btn" onClick={() => openSheet('trip-form', { trip })} aria-label="Editar viaje"><IconPencil size={17} /></button>
          </div>

          <div className="tile-grid">
            {TILES.map(t => {
              const Icon = t.icon
              const sub = t.id === 'itinerario' ? `${(trip.itinerary || []).length} actividades`
                : t.id === 'lugares' ? `${visitedCount} de ${tripPlaces.length} visitados`
                : t.id === 'finanzas' ? `${fmtMoney(spent)} gastado`
                : 'Galería + PDF'
              return (
                <div key={t.id} className={`tile${t.gold ? ' tile-gold' : ''}`} onClick={() => pickTile(t.id)}>
                  <Icon size={23} stroke={1.7} />
                  <div className="tile-label">{t.label}</div>
                  <div className="tile-sub">{sub}</div>
                </div>
              )
            })}
          </div>

          {trip.budget ? (
            <div className="card budget-card">
              <div className="budget-top">
                <span>Presupuesto</span>
                <span>{fmtMoney(spent)} de {fmtMoney(trip.budget)}</span>
              </div>
              <div className="budget-bar"><div className="budget-fill" style={{ width: `${Math.min(100, (spent / trip.budget) * 100)}%` }} /></div>
            </div>
          ) : null}

          {(trip.people || trip.notes) && (
            <div className="card" style={{ marginTop: 10 }}>
              {trip.people && <><div className="page-sub">Personas</div><p style={{ marginTop: 3, marginBottom: trip.notes ? 12 : 0, color: 'var(--ink)', fontSize: 15 }}>{trip.people}</p></>}
              {trip.notes && <><div className="page-sub">Notas</div><p style={{ marginTop: 3, whiteSpace: 'pre-wrap', color: 'var(--ink)', fontSize: 15 }}>{trip.notes}</p></>}
            </div>
          )}

          <button className="btn-text" style={{ marginTop: 20, color: 'var(--danger)' }} onClick={handleDelete}><IconTrash size={14} />Eliminar viaje</button>
        </>
      )}

      {section === 'itinerario' && <ItinerarioSection trip={trip} onUpdate={(itinerary) => trips.update(trip.id, { itinerary })} />}
      {section === 'lugares' && <LugaresSection tripId={trip.id} places={tripPlaces} openSheet={openSheet} />}
      {section === 'finanzas' && <FinanzasSection trip={trip} expenses={tripExpenses} openSheet={openSheet} />}
    </div>
  )
}

function ItinerarioSection({ trip, onUpdate }) {
  const items = trip.itinerary || []
  const [date, setDate] = useState(trip.dateFrom || todayStr())
  const [time, setTime] = useState('')
  const [title, setTitle] = useState('')

  const map = {}
  items.forEach((it, idx) => { (map[it.date] ||= []).push({ ...it, idx }) })
  const grouped = Object.entries(map).sort(([a], [b]) => a.localeCompare(b))

  function addItem() {
    if (!title.trim() || !date) return
    onUpdate([...items, { date, time, title: title.trim() }])
    setTitle(''); setTime('')
  }
  function removeItem(idx) { onUpdate(items.filter((_, i) => i !== idx)) }

  return (
    <div>
      <h2 className="section-title">Itinerario</h2>
      <div className="itin-form">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="time" value={time} onChange={e => setTime(e.target.value)} />
        <input type="text" placeholder="Ej. Vuelo Lima → Tarapoto" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} />
        <button className="btn btn-primary" onClick={addItem}>Agregar</button>
      </div>
      {grouped.length === 0 ? (
        <div className="empty-state"><div className="big">Sin actividades todavía</div><div className="hint">Agrega vuelos, tours o planes por fecha y hora.</div></div>
      ) : grouped.map(([d, list]) => (
        <div key={d} className="itin-day">
          <div className="itin-daylabel">{fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
          {list.sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(it => (
            <div key={it.idx} className="itin-row">
              <span className="itin-time">{it.time || '—'}</span>
              <span className="itin-title">{it.title}</span>
              <button className="todo-del" onClick={() => removeItem(it.idx)}>×</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function LugaresSection({ tripId, places, openSheet }) {
  const visited = places.filter(p => p.status === 'visitado').sort((a, b) => (a.visitDate || '').localeCompare(b.visitDate || ''))
  const pending = places.filter(p => p.status !== 'visitado').sort((a, b) => (a.plannedDate || '9999').localeCompare(b.plannedDate || '9999'))

  return (
    <div>
      <h2 className="section-title">Lugares</h2>
      <p className="page-sub" style={{ marginBottom: 12 }}>Ordenados por fecha de visita.</p>
      {places.length === 0 ? (
        <div className="empty-state"><div className="big">Sin lugares todavía</div><div className="hint">Agrega los sitios que quieren visitar en este viaje.</div></div>
      ) : (
        <div className="place-list">
          {visited.map(p => <PlaceRow key={p.id} p={p} onClick={() => openSheet('place-form', { place: p })} />)}
          {visited.length > 0 && pending.length > 0 && <div className="place-divider" />}
          {pending.map(p => <PlaceRow key={p.id} p={p} onClick={() => openSheet('place-form', { place: p })} />)}
        </div>
      )}
      <button className="btn btn-ghost btn-block" style={{ marginTop: 14 }} onClick={() => openSheet('place-form', { presetTripId: tripId })}>+ Agregar lugar</button>
    </div>
  )
}

function PlaceRow({ p, onClick }) {
  const c = catInfo(PLACE_CATS, p.category)
  const Icon = c.icon
  return (
    <div className="place-row" onClick={onClick}>
      {p.photos?.[0] ? <img className="place-thumb" src={p.photos[0].url} /> : <div className="place-thumb place-thumb-empty"><Icon size={18} stroke={1.7} /></div>}
      <div className="place-info">
        <div className="place-name">{p.name}</div>
        <div className="place-meta">{p.city || c.label}</div>
      </div>
      {p.status === 'visitado' ? (
        <div className="place-status">
          <IconCircleCheck size={16} className="place-status-ic-done" />
          <span>{fmtDate(p.visitDate, { day: 'numeric', month: 'short' })}</span>
        </div>
      ) : (
        <div className="place-status">
          <IconCircleDashed size={16} className="place-status-ic-pending" />
          <span>Por visitar</span>
        </div>
      )}
    </div>
  )
}

function FinanzasSection({ trip, expenses, openSheet }) {
  const { diff } = computeBalance(expenses)
  return (
    <div>
      <h2 className="section-title">Finanzas</h2>
      <div className="balance-banner">
        <div className="bb-lbl">Balance de este viaje</div>
        <div className="bb-amt">{Math.abs(diff) < 0.5 ? 'Están a mano ✓' : diff > 0 ? 'Marjorie le debe a Andy' : 'Andy le debe a Marjorie'}</div>
        {Math.abs(diff) >= 0.5 && <div className="bb-lbl" style={{ marginTop: 2 }}>{fmtMoney(diff)}</div>}
      </div>
      <div className="exp-list">
        {expenses.length === 0 && <div className="empty-state"><div className="big">Sin gastos en este viaje</div></div>}
        {[...expenses].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(e => (
          <div key={e.id} className="expense-row" onClick={() => e.type !== 'liquidacion' && openSheet('expense-form', { expense: e })}>
            <div className="who">{e.paidBy === 'Andy' ? 'A' : 'M'}</div>
            <div className="desc">
              <div className="d">{e.description}</div>
              <div className="m">{e.paidBy} pagó · {fmtDate(e.date)}</div>
            </div>
            <div className="amt">{fmtMoney(e.amount)}</div>
          </div>
        ))}
      </div>
      <button className="btn btn-ghost btn-block" style={{ marginTop: 14 }} onClick={() => openSheet('expense-form', { presetTripId: trip.id })}>+ Agregar gasto</button>
    </div>
  )
}
