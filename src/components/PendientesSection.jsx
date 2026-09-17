import { useState, useMemo } from 'react'
import { useApp } from '../state/AppState'
import { fmtDate } from '../lib/dates'
import './PendientesSection.css'

export default function PendientesSection() {
  const { todos, trips, currentUser, openSheet } = useApp()
  const [filter, setFilter] = useState('pendientes')
  const [text, setText] = useState('')

  const list = useMemo(() => {
    let arr = todos.items
    if (filter === 'pendientes') arr = arr.filter(t => !t.done)
    if (filter === 'hechas') arr = arr.filter(t => t.done)
    return [...arr].sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0) || (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [todos.items, filter])

  const pendingCount = todos.items.filter(t => !t.done).length

  async function quickAdd() {
    if (!text.trim()) return
    await todos.add({ text: text.trim(), assignedTo: currentUser || 'Ambos', tripId: null, dueDate: null, done: false, doneAt: null })
    setText('')
  }

  const tripName = (tripId) => trips.items.find(t => t.id === tripId)?.name

  return (
    <div className="pendientes-section">
      <div className="pendientes-header">
        <h3 className="upcoming-title">Pendientes{pendingCount > 0 ? ` (${pendingCount})` : ''}</h3>
      </div>

      <div className="pendientes-quickadd">
        <input type="text" placeholder="Ej. Comprar regalo cumpleaños Marjorie..." value={text}
          onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && quickAdd()} />
        <button onClick={quickAdd}>Agregar</button>
      </div>

      <div className="pill-tabs" style={{ marginBottom: 10 }}>
        {['todas', 'pendientes', 'hechas'].map(f => (
          <div key={f} className={`pill-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'todas' ? 'Todas' : f === 'pendientes' ? 'Pendientes' : 'Hechas'}
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="page-sub" style={{ padding: '6px 2px 4px' }}>
          {filter === 'hechas' ? 'Todavía no han marcado nada como hecho.' : 'Nada pendiente por aquí — ¡buen trabajo!'}
        </p>
      ) : (
        <div className="todo-list">
          {list.map(t => (
            <div key={t.id} className={`todo-row${t.done ? ' done' : ''}`}>
              <div className="todo-box" onClick={() => todos.update(t.id, { done: !t.done, doneAt: !t.done ? new Date().toISOString() : null })}>
                {t.done ? '✓' : ''}
              </div>
              <div className="todo-txt" onClick={() => openSheet('todo-form', { todo: t })}>
                {t.text}
                {(t.tripId || t.dueDate) && (
                  <div className="todo-sub">{[tripName(t.tripId), t.dueDate ? fmtDate(t.dueDate, { day: 'numeric', month: 'short' }) : null].filter(Boolean).join(' · ')}</div>
                )}
              </div>
              <span className="todo-tag">{t.assignedTo || 'Ambos'}</span>
              <button className="todo-del" onClick={() => todos.remove(t.id)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
