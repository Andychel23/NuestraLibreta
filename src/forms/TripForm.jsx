import { useState } from 'react'
import { useApp } from '../state/AppState'
import { uploadPhoto, deletePhoto } from '../lib/photos'

export default function TripForm({ trip, onDone }) {
  const { trips, toast } = useApp()
  const [name, setName] = useState(trip?.name || '')
  const [destination, setDestination] = useState(trip?.destination || '')
  const [dateFrom, setDateFrom] = useState(trip?.dateFrom || '')
  const [dateTo, setDateTo] = useState(trip?.dateTo || '')
  const [budget, setBudget] = useState(trip?.budget || '')
  const [people, setPeople] = useState(trip?.people || 'Andy & Marjorie')
  const [notes, setNotes] = useState(trip?.notes || '')
  const [coverPhoto, setCoverPhoto] = useState(trip?.coverPhoto || null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleCoverPick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      if (coverPhoto?.path) await deletePhoto(coverPhoto.path)
      const ph = await uploadPhoto(file, 'trips', { maxDim: 1000, quality: 0.75 })
      setCoverPhoto(ph)
    } catch { toast('No se pudo subir la foto.') }
    setUploading(false)
    e.target.value = ''
  }

  async function handleSave() {
    if (!name.trim()) { toast('Ponle un nombre al viaje.'); return }
    setSaving(true)
    const data = {
      name: name.trim(), destination: destination.trim(), dateFrom, dateTo: dateTo || dateFrom,
      budget: budget ? Number(budget) : null, people: people.trim(), notes: notes.trim(),
      coverPhoto: coverPhoto || null,
    }
    try {
      if (trip) await trips.update(trip.id, data)
      else await trips.add({ ...data, itinerary: [] })
      toast(trip ? 'Viaje actualizado.' : '¡Viaje creado!')
      onDone()
    } catch { toast('No se pudo guardar. Intenta de nuevo.') }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${trip.name}"? Los lugares y gastos asociados quedarán sin viaje.`)) return
    await trips.remove(trip.id)
    toast('Viaje eliminado.')
    onDone()
  }

  return (
    <div>
      <label className="field-label">Nombre del viaje</label>
      <input type="text" placeholder="Ej. Chachapoyas" value={name} onChange={e => setName(e.target.value)} />

      <label className="field-label">Destino</label>
      <input type="text" placeholder="Ej. Amazonas, Perú" value={destination} onChange={e => setDestination(e.target.value)} />

      <label className="field-label">Fechas</label>
      <div className="two-col">
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
      </div>

      <label className="field-label">Foto de portada</label>
      {coverPhoto ? (
        <div className="cover-preview">
          <img src={coverPhoto.url} />
          <label className="cover-change">{uploading ? 'Subiendo...' : 'Cambiar foto'}<input type="file" accept="image/*" hidden onChange={handleCoverPick} disabled={uploading} /></label>
        </div>
      ) : (
        <label className="cover-empty">{uploading ? 'Subiendo...' : '+ Agregar foto de portada'}<input type="file" accept="image/*" hidden onChange={handleCoverPick} disabled={uploading} /></label>
      )}

      <label className="field-label">Presupuesto (opcional, S/)</label>
      <input type="number" step="0.01" placeholder="0.00" value={budget} onChange={e => setBudget(e.target.value)} />

      <label className="field-label">Personas</label>
      <input type="text" value={people} onChange={e => setPeople(e.target.value)} />

      <label className="field-label">Notas</label>
      <textarea placeholder="Ideas, planes, cosas por no olvidar..." value={notes} onChange={e => setNotes(e.target.value)} />

      <div className="btn-row" style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploading}>{trip ? 'Guardar cambios' : 'Crear viaje'}</button>
        {trip && <button className="btn btn-danger" onClick={handleDelete} style={{ flex: '0 0 auto' }}>Eliminar</button>}
      </div>
    </div>
  )
}
