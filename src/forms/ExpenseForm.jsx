import { useState } from 'react'
import { useApp } from '../state/AppState'
import { uploadPhoto, deletePhoto } from '../lib/photos'
import { EXPENSE_CATS } from '../lib/constants'
import { todayStr } from '../lib/dates'

export default function ExpenseForm({ expense, presetTripId, onDone }) {
  const { expenses, trips, places, currentUser, toast } = useApp()
  const [description, setDescription] = useState(expense?.description || '')
  const [amount, setAmount] = useState(expense?.amount || '')
  const [paidBy, setPaidBy] = useState(expense?.paidBy || (currentUser === 'Marjorie' ? 'Marjorie' : 'Andy'))
  const [forWhom, setForWhom] = useState(expense?.forWhom || 'ambos')
  const [category, setCategory] = useState(expense?.category || 'alimentacion')
  const [date, setDate] = useState(expense?.date || todayStr())
  const [tripId, setTripId] = useState(expense?.tripId || presetTripId || '')
  const [placeId, setPlaceId] = useState(expense?.placeId || '')
  const [note, setNote] = useState(expense?.note || '')
  const [receipt, setReceipt] = useState(expense?.receipt || null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleReceipt(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      if (receipt?.path) await deletePhoto(receipt.path)
      setReceipt(await uploadPhoto(file, 'receipts', { maxDim: 1200, quality: 0.7 }))
    } catch { toast('No se pudo subir el comprobante.') }
    setUploading(false)
    e.target.value = ''
  }

  async function handleSave() {
    const amt = parseFloat(amount)
    if (!description.trim() || !amt || amt <= 0) { toast('Falta la descripción o el monto.'); return }
    setSaving(true)
    const data = {
      description: description.trim(), amount: amt, currency: 'PEN', paidBy, forWhom, category, date,
      tripId: tripId || null, placeId: placeId || null, note: note.trim(), receipt: receipt || null, type: 'gasto',
    }
    try {
      if (expense) await expenses.update(expense.id, data)
      else await expenses.add(data)
      toast('Gasto guardado.')
      onDone()
    } catch { toast('No se pudo guardar. Intenta de nuevo.') }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este gasto?')) return
    if (expense.receipt?.path) await deletePhoto(expense.receipt.path)
    await expenses.remove(expense.id)
    toast('Gasto eliminado.')
    onDone()
  }

  return (
    <div>
      <label className="field-label">Concepto</label>
      <input type="text" placeholder="Ej. Hotel Chachapoyas" value={description} onChange={e => setDescription(e.target.value)} />

      <label className="field-label">Monto (S/)</label>
      <input type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />

      <label className="field-label">¿Quién pagó?</label>
      <div className="chip-picker">
        <button type="button" className={paidBy === 'Andy' ? 'sel' : ''} onClick={() => setPaidBy('Andy')}>Andy</button>
        <button type="button" className={paidBy === 'Marjorie' ? 'sel' : ''} onClick={() => setPaidBy('Marjorie')}>Marjorie</button>
      </div>

      <label className="field-label">¿Para quién fue?</label>
      <div className="chip-picker">
        <button type="button" className={forWhom === 'ambos' ? 'sel' : ''} onClick={() => setForWhom('ambos')}>Ambos (se divide)</button>
        <button type="button" className={forWhom === 'Andy' ? 'sel' : ''} onClick={() => setForWhom('Andy')}>Solo Andy</button>
        <button type="button" className={forWhom === 'Marjorie' ? 'sel' : ''} onClick={() => setForWhom('Marjorie')}>Solo Marjorie</button>
      </div>

      <label className="field-label">Categoría</label>
      <div className="chip-picker">
        {EXPENSE_CATS.map(c => (
          <button key={c.id} type="button" className={category === c.id ? 'sel' : ''} onClick={() => setCategory(c.id)}>{c.icon} {c.label}</button>
        ))}
      </div>

      <label className="field-label">Fecha</label>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />

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

      <label className="field-label">Comprobante (opcional)</label>
      {receipt ? (
        <div className="cover-preview" style={{ maxWidth: 160 }}>
          <img src={receipt.url} style={{ height: 100 }} />
          <label className="cover-change">Cambiar<input type="file" accept="image/*" hidden onChange={handleReceipt} disabled={uploading} /></label>
        </div>
      ) : (
        <label className="cover-empty" style={{ height: 60 }}>{uploading ? 'Subiendo...' : '+ Foto del comprobante'}<input type="file" accept="image/*" hidden onChange={handleReceipt} disabled={uploading} /></label>
      )}

      <label className="field-label">Nota</label>
      <textarea placeholder="Detalles adicionales..." value={note} onChange={e => setNote(e.target.value)} />

      <div className="btn-row" style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploading}>{expense ? 'Guardar cambios' : 'Agregar gasto'}</button>
        {expense && <button className="btn btn-danger" onClick={handleDelete} style={{ flex: '0 0 auto' }}>Eliminar</button>}
      </div>
    </div>
  )
}
