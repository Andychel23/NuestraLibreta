import { useState, useMemo } from 'react'
import { IconChecklist, IconCircleCheck, IconTrash } from '@tabler/icons-react'
import { useApp } from '../state/AppState'
import './PendientesPage.css'

export default function PendientesPage() {
  const { todos, currentUser, openSheet } = useApp()
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
    await todos.add({ text: text.trim(), assignedTo: currentUser || 'Ambos', done: false, doneAt: null })
    setText('')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pendientes</h1>
          <p className="page-sub">Cosas de la casa — sin fecha, solo por hacer.</p>
        </div>
      </div>

      <div className="pendientes-quickadd">
        <input type="text" placeholder="Ej. Arreglar la puerta, cambiar el foco..." value={text}
          onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && quickAdd()} />
        <button onClick={quickAdd}>Agregar</button>
      </div>

      <div className="pill-tabs">
        {['todas', 'pendientes', 'hechas'].map(f => (
          <div key={f} className={`pill-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'todas' ? 'Todas' : f === 'pendientes' ? `Pendientes${pendingCount ? ` (${pendingCount})` : ''}` : 'Hechas'}
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <div className="icon-wrap"><IconChecklist size={34} stroke={1.5} /></div>
          <div className="big">{filter === 'hechas' ? 'Nada marcado como hecho' : 'Nada pendiente — ¡buen trabajo!'}</div>
          <div className="hint">Agrega tareas de la casa arriba.</div>
        </div>
      ) : (
        <div className="todo-list">
          {list.map(t => (
            <div key={t.id} className={`todo-row${t.done ? ' done' : ''}`}>
              <button className="todo-box" onClick={() => todos.update(t.id, { done: !t.done, doneAt: !t.done ? new Date().toISOString() : null })}>
                {t.done && <IconCircleCheck size={16} />}
              </button>
              <div className="todo-txt" onClick={() => openSheet('todo-form', { todo: t })}>{t.text}</div>
              <span className="todo-tag">{t.assignedTo || 'Ambos'}</span>
              <button className="todo-del" onClick={() => todos.remove(t.id)}><IconTrash size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
