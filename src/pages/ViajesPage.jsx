import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppState'
import { fmtRange, tripStatus } from '../lib/dates'
import { TRIP_STATUS_LABEL } from '../lib/constants'
import './ViajesPage.css'

export default function ViajesPage() {
  const { trips, places } = useApp()
  const [filter, setFilter] = useState('todos')
  const nav = useNavigate()

  const list = useMemo(() => {
    let arr = trips.items.map(t => ({ ...t, status: tripStatus(t) }))
    if (filter !== 'todos') arr = arr.filter(t => t.status === filter)
    arr.sort((a, b) => (b.dateFrom || '').localeCompare(a.dateFrom || ''))
    return arr
  }, [trips.items, filter])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Viajes</h1>
          <p className="page-sub">Cada viaje junta su itinerario, lugares, fotos y gastos.</p>
        </div>
      </div>

      <div className="pill-tabs">
        {['todos', 'pendiente', 'en_curso', 'finalizado'].map(f => (
          <div key={f} className={`pill-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'todos' ? 'Todos' : TRIP_STATUS_LABEL[f]}
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <div className="big">Todavía no hay viajes</div>
          <div className="hint">Toca el botón "+" para planificar el primero.</div>
        </div>
      ) : (
        <div className="trip-grid">
          {list.map(t => {
            const placeCount = places.items.filter(p => p.tripId === t.id)
            const visited = placeCount.filter(p => p.status === 'visitado').length
            return (
              <div key={t.id} className="trip-card" onClick={() => nav(`/viajes/${t.id}`)}
                style={t.coverPhoto ? { backgroundImage: `linear-gradient(to top, rgba(11,11,13,0.92), rgba(11,11,13,0.15) 60%), url(${t.coverPhoto.url})` } : {}}>
                <span className={`trip-status ts-${t.status}`}>{TRIP_STATUS_LABEL[t.status]}</span>
                <div className="trip-card-body">
                  <h3>{t.name}</h3>
                  <div className="trip-dest">{t.destination}</div>
                  <div className="trip-when">{fmtRange(t.dateFrom, t.dateTo)}</div>
                  {placeCount.length > 0 && <div className="trip-places">📍 {visited}/{placeCount.length} lugares visitados</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
