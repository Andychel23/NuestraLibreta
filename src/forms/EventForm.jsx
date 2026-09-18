import { useState } from 'react'
import { useApp } from '../state/AppState'
import { EVENT_TYPES } from '../lib/constants'
import { todayStr } from '../lib/dates'

export default function EventForm({ event, date, onDone }) {
  const { events, trips, places, toast } = useApp()
  const [title, setTitle] = useState(event?.title || '')
  const [type, setType] = useState(event?.type || 'actividad')
  const [evDate, setEvDate] = useState(event?.date || date || todayStr())
  const [time, setTime] = useState(event?.time || '')
  const [recurring, setRecurring] = useState(event?.recurring || false)
  const [tripId, setTripId] = useState(event?.tripId || '')
  const [placeId, setPlaceId] = useState(event?.placeId || '')
  const [notes, setNotes] = useState(event?.notes || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!title.trim() || !evDate) { toast('Falta el título o la fecha.'); return }
    setSaving(true)
    const data = {
      title: title.trim(), type, date: evDate, time, recurring,
      tripId: tripId || null, placeId: placeId || null, notes: notes.trim(),
    }
    try {
      if (event) await events.update(event.id, data)
      else await events.add(data)
      toast('Evento guardado.')
      onDone()
    } catch { toast('No se pudo guardar. Intenta de nuevo.') }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${event.title}"?`)) return
    await events.remove(event.id)
    toast('Evento eliminado.')
    onDone()
  }

  return (
    <div>
      <label className="field-label">Título</label>
      <input type="text" placeholder="Ej. Reserva del hotel, vuelo, aniversario..." value={title} onChange={e => setTitle(e.target.value)} />

      <label className="field-label">Tipo de evento</label>
      <div className="chip-picker">
        {EVENT_TYPES.map(t => {
          const Icon = t.icon
          return <button key={t.id} type="button" className={type === t.id ? 'sel' : ''} onClick={() => setType(t.id)}><Icon size={15} stroke={1.8} />{t.label}</button>
        })}
      </div>

      <label className="field-label">Fecha y hora</label>
      <div className="two-col">
        <input type="date" value={evDate} onChange={e => setEvDate(e.target.value)} />
        <input type="time" value={time} onChange={e => setTime(e.target.value)} />
      </div>

      <div className="checkrow">
        <input type="checkbox" id="ev-recurring" checked={recurring} onChange={e => setRecurring(e.target.checked)} />
        <label htmlFor="ev-recurring">Se repite cada año (cumpleaños, aniversario...)</label>
      </div>

      <label className="field-label">Viaje asociado (opcional)</label>
      <select value={tripId} onChange={e => setTripId(e.target.value)}>
        <option value="">— Ninguno —</option>
        {trips.items.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <label className="field-label">Lugar asociado (opcional)</label>
      <select value={placeId} onChange={e => setPlaceId(e.target.value)}>
        <option value="">— Ninguno —</option>
        {places.items.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      <label className="field-label">Notas</label>
      <textarea placeholder="Detalles, recordatorios..." value={notes} onChange={e => setNotes(e.target.value)} />

      <div className="btn-row" style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{event ? 'Guardar cambios' : 'Crear evento'}</button>
        {event && <button className="btn btn-danger" onClick={handleDelete} style={{ flex: '0 0 auto' }}>Eliminar</button>}
      </div>
    </div>
  )
}
