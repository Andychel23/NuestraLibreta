import { useState } from 'react'
import { useApp } from '../state/AppState'

export default function TodoForm({ todo, onDone }) {
  const { todos, currentUser, toast } = useApp()
  const [text, setText] = useState(todo?.text || '')
  const [assignedTo, setAssignedTo] = useState(todo?.assignedTo || currentUser || 'Ambos')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!text.trim()) { toast('Escribe qué hay que hacer.'); return }
    setSaving(true)
    const data = { text: text.trim(), assignedTo }
    try {
      if (todo) await todos.update(todo.id, data)
      else await todos.add({ ...data, done: false, doneAt: null })
      toast('Tarea guardada.')
      onDone()
    } catch { toast('No se pudo guardar. Intenta de nuevo.') }
    setSaving(false)
  }

  async function handleDelete() {
    await todos.remove(todo.id)
    toast('Tarea eliminada.')
    onDone()
  }

  return (
    <div>
      <label className="field-label">¿Qué hay que hacer?</label>
      <input type="text" placeholder="Ej. Arreglar la puerta, cambiar el foco..." value={text} onChange={e => setText(e.target.value)} />

      <label className="field-label">¿Quién se encarga?</label>
      <div className="chip-picker">
        <button type="button" className={assignedTo === 'Ambos' ? 'sel' : ''} onClick={() => setAssignedTo('Ambos')}>Ambos</button>
        <button type="button" className={assignedTo === 'Andy' ? 'sel' : ''} onClick={() => setAssignedTo('Andy')}>Andy</button>
        <button type="button" className={assignedTo === 'Marjorie' ? 'sel' : ''} onClick={() => setAssignedTo('Marjorie')}>Marjorie</button>
      </div>

      <div className="btn-row" style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{todo ? 'Guardar cambios' : 'Agregar tarea'}</button>
        {todo && <button className="btn btn-danger" onClick={handleDelete} style={{ flex: '0 0 auto' }}>Eliminar</button>}
      </div>
    </div>
  )
}
