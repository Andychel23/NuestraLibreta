import { useState } from 'react'
import { useApp } from '../state/AppState'
import './Fab.css'

const ACTIONS = [
  { key: 'trip', icon: '🧳', label: 'Nuevo viaje' },
  { key: 'place', icon: '📍', label: 'Nuevo lugar' },
  { key: 'event', icon: '📅', label: 'Nuevo evento' },
  { key: 'expense', icon: '💰', label: 'Nuevo gasto' },
]

export default function Fab() {
  const [open, setOpen] = useState(false)
  const { openSheet } = useApp()

  function pick(key) {
    setOpen(false)
    if (key === 'trip') openSheet('trip-form')
    if (key === 'place') openSheet('place-form')
    if (key === 'event') openSheet('event-form')
    if (key === 'expense') openSheet('expense-form')
  }

  return (
    <div className="fab-wrap">
      {open && <div className="fab-scrim" onClick={() => setOpen(false)} />}
      <div className={`fab-menu${open ? ' open' : ''}`}>
        {ACTIONS.map((a, i) => (
          <button key={a.key} className="fab-action" style={{ transitionDelay: `${i * 25}ms` }} onClick={() => pick(a.key)}>
            <span className="fab-action-label">{a.label}</span>
            <span className="fab-action-icon">{a.icon}</span>
          </button>
        ))}
      </div>
      <button className={`fab${open ? ' fab-open' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Crear">
        +
      </button>
    </div>
  )
}
