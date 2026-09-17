import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppState'
import { fmtRange, tripStatus, fmtDate, todayStr } from '../lib/dates'
import { fmtMoney, computeBalance, sumByCategory } from '../lib/money'
import { TRIP_STATUS_LABEL, EXPENSE_CATS, catInfo, PLACE_CATS } from '../lib/constants'
import Lightbox from '../components/Lightbox'
import './ViajeDetailPage.css'

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'itinerario', label: 'Itinerario' },
  { id: 'lugares', label: 'Lugares' },
  { id: 'finanzas', label: 'Finanzas' },
  { id: 'fotos', label: 'Fotos' },
]

export default function ViajeDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { trips, places, expenses, openSheet, toast } = useApp()
  const [tab, setTab] = useState('resumen')
  const [lbIndex, setLbIndex] = useState(null)

  const trip = trips.items.find(t => t.id === id)
  const tripPlaces = useMemo(() => places.items.filter(p => p.tripId === id), [places.items, id])
  const tripExpenses = useMemo(() => expenses.items.filter(e => e.tripId === id), [expenses.items, id])
  const allPhotos = useMemo(() => {
    const list = []
    tripPlaces.forEach(p => (p.photos || []).forEach(ph => list.push({ ...ph, caption: p.name, date: fmtDate(p.visitDate) })))
    return list
  }, [tripPlaces])

  if (!trip) {
    return <div className="page"><div className="empty-state"><div className="big">Este viaje ya no existe</div><button className="btn-text" onClick={() => nav('/viajes')}>← Volver a viajes</button></div></div>
  }

  const status = tripStatus(trip)
  const visitedCount = tripPlaces.filter(p => p.status === 'visitado').length
  const { diff } = computeBalance(tripExpenses)
  const spent = tripExpenses.filter(e => e.type !== 'liquidacion').reduce((s, e) => s + Number(e.amount || 0), 0)

  async function handleDelete() {
    if (!confirm(`¿Eliminar el viaje "${trip.name}"? Los lugares asociados quedarán sin viaje.`)) return
    await trips.remove(trip.id)
    toast('Viaje eliminado.')
    nav('/viajes')
  }

  return (
    <div className="page">
      <button className="btn-text" onClick={() => nav('/viajes')}>← Volver a viajes</button>
      <div className="page-header" style={{ marginTop: 10 }}>
        <div>
          <span className={`trip-status-inline ts-${status}`}>{TRIP_STATUS_LABEL[status]}</span>
          <h1 className="page-title" style={{ marginTop: 6 }}>{trip.name}</h1>
          <p className="page-sub">{trip.destination} · {fmtRange(trip.dateFrom, trip.dateTo)}</p>
        </div>
        <button className="iconBtn" onClick={() => openSheet('trip-form', { trip })}>✏️</button>
      </div>

      <div className="pill-tabs">
        {TABS.map(t => (
          <div key={t.id} className={`pill-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</div>
        ))}
      </div>

      {tab === 'resumen' && (
        <div>
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-num">{tripPlaces.length}</div><div className="stat-lbl">Lugares</div></div>
            <div className="stat-card"><div className="stat-num">{visitedCount}</div><div className="stat-lbl">Visitados</div></div>
            <div className="stat-card"><div className="stat-num">{tripPlaces.length - visitedCount}</div><div className="stat-lbl">Pendientes</div></div>
            <div className="stat-card"><div className="stat-num">{fmtMoney(spent)}</div><div className="stat-lbl">Gastado</div></div>
          </div>
          {trip.budget ? (
            <div className="card" style={{ marginTop: 14 }}>
              <div className="page-sub">Presupuesto</div>
              <div className="budget-row">
                <div className="budget-bar"><div className="budget-fill" style={{ width: `${Math.min(100, (spent / trip.budget) * 100)}%`, background: spent > trip.budget ? 'var(--danger)' : 'var(--primary)' }} /></div>
                <div className="budget-text">{fmtMoney(spent)} de {fmtMoney(trip.budget)}</div>
              </div>
            </div>
          ) : null}
          {trip.people && <div className="card" style={{ marginTop: 14 }}><div className="page-sub">Personas</div><p style={{ marginTop: 6 }}>{trip.people}</p></div>}
          {trip.notes && <div className="card" style={{ marginTop: 14 }}><div className="page-sub">Notas</div><p style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{trip.notes}</p></div>}
          <button className="btn btn-danger btn-block" style={{ marginTop: 22 }} onClick={handleDelete}>Eliminar viaje</button>
        </div>
      )}

      {tab === 'itinerario' && <ItinerarioTab trip={trip} onUpdate={(itinerary) => trips.update(trip.id, { itinerary })} />}

      {tab === 'lugares' && (
        <div>
          {tripPlaces.length === 0 ? (
            <div className="empty-state"><div className="big">Sin lugares todavía</div><div className="hint">Agrega los sitios que quieren visitar en este viaje.</div></div>
          ) : (
            <div className="place-list">
              {tripPlaces.map(p => {
                const c = catInfo(PLACE_CATS, p.category)
                return (
                  <div key={p.id} className="place-row" onClick={() => openSheet('place-form', { place: p })}>
                    {p.photos?.[0] ? <img className="place-thumb" src={p.photos[0].url} /> : <div className="place-thumb place-thumb-empty">{c.icon}</div>}
                    <div className="place-info">
                      <div className="place-name">{p.name}</div>
                      <div className="place-meta">{c.icon} {c.label}{p.city ? ' · ' + p.city : ''}</div>
                    </div>
                    <span className={`place-badge ${p.status}`}>{p.status === 'visitado' ? '✅' : '📌'}</span>
                  </div>
                )
              })}
            </div>
          )}
          <button className="btn btn-ghost btn-block" style={{ marginTop: 14 }} onClick={() => openSheet('place-form', { presetTripId: trip.id })}>+ Agregar lugar a este viaje</button>
        </div>
      )}

      {tab === 'finanzas' && (
        <div>
          <div className="balance-banner">
            <div className="bb-lbl">Balance de este viaje</div>
            <div className="bb-amt">{Math.abs(diff) < 0.5 ? 'Están a mano ✓' : diff > 0 ? 'Marjorie le debe a Andy' : 'Andy le debe a Marjorie'}</div>
            {Math.abs(diff) >= 0.5 && <div className="bb-lbl" style={{ marginTop: 2 }}>{fmtMoney(diff)}</div>}
          </div>
          <CategoryBreakdown expenses={tripExpenses} />
          <div className="exp-list">
            {tripExpenses.length === 0 && <div className="empty-state"><div className="big">Sin gastos en este viaje</div></div>}
            {[...tripExpenses].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(e => (
              <ExpenseRow key={e.id} e={e} onClick={() => e.type !== 'liquidacion' && openSheet('expense-form', { expense: e })} />
            ))}
          </div>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 14 }} onClick={() => openSheet('expense-form', { presetTripId: trip.id })}>+ Agregar gasto</button>
        </div>
      )}

      {tab === 'fotos' && (
        <div>
          {allPhotos.length === 0 ? (
            <div className="empty-state"><div className="big">Sin fotos todavía</div><div className="hint">Las fotos que subas a los lugares de este viaje aparecen aquí automáticamente.</div></div>
          ) : (
            <>
              <button className="btn btn-primary btn-block" style={{ marginBottom: 14 }} onClick={() => nav(`/viajes/${trip.id}/album`)}>📖 Ver álbum y descargar PDF</button>
              <p className="page-sub" style={{ marginBottom: 10 }}>📷 {allPhotos.length} foto{allPhotos.length !== 1 ? 's' : ''}</p>
              <div className="photo-gallery">
                {allPhotos.map((ph, i) => (
                  <img key={i} src={ph.url} onClick={() => setLbIndex(i)} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <Lightbox photos={allPhotos} index={lbIndex} onClose={() => setLbIndex(null)}
        onNav={(d) => setLbIndex(i => (i + d + allPhotos.length) % allPhotos.length)} />
    </div>
  )
}

function ItinerarioTab({ trip, onUpdate }) {
  const items = trip.itinerary || []
  const [date, setDate] = useState(trip.dateFrom || todayStr())
  const [time, setTime] = useState('')
  const [title, setTitle] = useState('')

  const map = {}
  items.forEach((it, idx) => { (map[it.date] ||= []).push({ ...it, idx }) })
  const grouped = Object.entries(map).sort(([a], [b]) => a.localeCompare(b))

  function addItem() {
    if (!title.trim() || !date) return
    const next = [...items, { date, time, title: title.trim() }]
    onUpdate(next)
    setTitle(''); setTime('')
  }
  function removeItem(idx) {
    onUpdate(items.filter((_, i) => i !== idx))
  }

  return (
    <div>
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

function CategoryBreakdown({ expenses }) {
  const byCat = sumByCategory(expenses)
  const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1])
  if (entries.length === 0) return null
  const max = Math.max(...entries.map(e => e[1]))
  return (
    <div className="card" style={{ margin: '14px 0' }}>
      <div className="page-sub" style={{ marginBottom: 10 }}>Gasto por categoría</div>
      {entries.map(([catId, amt]) => {
        const c = catInfo(EXPENSE_CATS, catId)
        return (
          <div key={catId} className="cat-bar-row">
            <span className="cat-bar-lbl">{c.icon} {c.label}</span>
            <div className="cat-bar-track"><div className="cat-bar-fill" style={{ width: `${(amt / max) * 100}%` }} /></div>
            <span className="cat-bar-amt">{fmtMoney(amt)}</span>
          </div>
        )
      })}
    </div>
  )
}

function ExpenseRow({ e, onClick }) {
  return (
    <div className="expense-row" onClick={onClick}>
      <div className="who">{e.paidBy === 'Andy' ? 'A' : 'M'}</div>
      <div className="desc">
        <div className="d">{e.type === 'liquidacion' ? '🤝 ' : ''}{e.description}</div>
        <div className="m">{e.paidBy} pagó · {fmtDate(e.date)}</div>
      </div>
      <div className="amt">{fmtMoney(e.amount)}</div>
    </div>
  )
}
