import { useState, useMemo } from 'react'
import { useApp } from '../state/AppState'
import { PLACE_CATS, catInfo } from '../lib/constants'
import { fmtDate } from '../lib/dates'
import PlaceMap from '../components/PlaceMap'
import './LugaresPage.css'

export default function LugaresPage() {
  const { places, trips, openSheet } = useApp()
  const [filter, setFilter] = useState('todos')
  const [catFilter, setCatFilter] = useState('all')
  const [mode, setMode] = useState('lista') // lista | mapa

  const list = useMemo(() => {
    let arr = places.items
    if (filter !== 'todos') arr = arr.filter(p => p.status === filter)
    if (catFilter !== 'all') arr = arr.filter(p => p.category === catFilter)
    return [...arr].sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
  }, [places.items, filter, catFilter])

  const tripName = (tripId) => trips.items.find(t => t.id === tripId)?.name

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lugares</h1>
          <p className="page-sub">Todo lo que quieren conocer, y lo que ya conocieron.</p>
        </div>
        <div className="mode-toggle">
          <button className={mode === 'lista' ? 'active' : ''} onClick={() => setMode('lista')}>☰</button>
          <button className={mode === 'mapa' ? 'active' : ''} onClick={() => setMode('mapa')}>🗺️</button>
        </div>
      </div>

      <div className="pill-tabs">
        {['todos', 'pendiente', 'visitado'].map(f => (
          <div key={f} className={`pill-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'todos' ? 'Todos' : f === 'pendiente' ? 'Por visitar' : 'Visitados'}
          </div>
        ))}
      </div>
      <div className="chip-row">
        <div className={`chip-sm${catFilter === 'all' ? ' active' : ''}`} onClick={() => setCatFilter('all')}>Todas las categorías</div>
        {PLACE_CATS.map(c => (
          <div key={c.id} className={`chip-sm${catFilter === c.id ? ' active' : ''}`} onClick={() => setCatFilter(c.id)}>{c.icon} {c.label}</div>
        ))}
      </div>

      {mode === 'mapa' ? (
        <PlaceMap places={list} onSelect={(p) => openSheet('place-form', { place: p })} />
      ) : list.length === 0 ? (
        <div className="empty-state"><div className="big">Sin lugares aquí</div><div className="hint">Toca "+" para anotar el primero.</div></div>
      ) : (
        <div className="lug-grid">
          {list.map(p => {
            const c = catInfo(PLACE_CATS, p.category)
            return (
              <div key={p.id} className="lug-card" onClick={() => openSheet('place-form', { place: p })}>
                {p.status === 'visitado' && <div className="lug-stamp">✅ Visitado</div>}
                {p.photos?.[0] ? <img className="lug-photo" src={p.photos[0].url} /> : <div className="lug-photo lug-photo-empty">{c.icon}</div>}
                <div className="lug-body">
                  <div className="lug-cat">{c.icon} {c.label}</div>
                  <h3>{p.name}</h3>
                  <div className="lug-city">{p.city}{p.tripId ? ' · ' + (tripName(p.tripId) || '') : ''}</div>
                  {p.status === 'visitado' && p.visitDate && <div className="lug-date">{fmtDate(p.visitDate)}{p.rating ? ' · ' + '★'.repeat(p.rating) : ''}</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
