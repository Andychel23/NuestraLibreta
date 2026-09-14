import { useState } from 'react'
import { useApp } from '../state/AppState'
import { uploadPhoto, deletePhoto } from '../lib/photos'
import { PLACE_CATS } from '../lib/constants'
import { todayStr } from '../lib/dates'
import PlaceMap from '../components/PlaceMap'

export default function PlaceForm({ place, presetTripId, onDone }) {
  const { places, trips, toast } = useApp()
  const [name, setName] = useState(place?.name || '')
  const [country, setCountry] = useState(place?.country || 'Perú')
  const [city, setCity] = useState(place?.city || '')
  const [category, setCategory] = useState(place?.category || 'naturaleza')
  const [description, setDescription] = useState(place?.description || '')
  const [status, setStatus] = useState(place?.status || 'pendiente')
  const [visitDate, setVisitDate] = useState(place?.visitDate || todayStr())
  const [plannedDate, setPlannedDate] = useState(place?.plannedDate || '')
  const [rating, setRating] = useState(place?.rating || 0)
  const [notes, setNotes] = useState(place?.notes || '')
  const [tripId, setTripId] = useState(place?.tripId || presetTripId || '')
  const [position, setPosition] = useState(place?.lat != null ? [place.lat, place.lng] : null)
  const [photos, setPhotos] = useState(place?.photos || [])
  const [showMap, setShowMap] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handlePhotos(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    const next = [...photos]
    for (const file of files) {
      if (next.length >= 12) break
      try { next.push(await uploadPhoto(file, 'places')) } catch { toast('No se pudo subir una foto.') }
    }
    setPhotos(next)
    setUploading(false)
    e.target.value = ''
  }
  function removePhoto(idx) {
    setPhotos(photos.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    if (!name.trim()) { toast('Ponle un nombre al lugar.'); return }
    setSaving(true)
    const data = {
      name: name.trim(), country: country.trim(), city: city.trim(), category, description: description.trim(),
      status, notes: notes.trim(), tripId: tripId || null, photos,
      lat: position ? position[0] : null, lng: position ? position[1] : null,
    }
    if (status === 'visitado') {
      data.visitDate = visitDate; data.rating = rating; data.plannedDate = null
    } else {
      data.visitDate = null; data.rating = null; data.plannedDate = plannedDate || null
    }
    try {
      if (place) await places.update(place.id, data)
      else await places.add(data)
      toast(status === 'visitado' ? '¡Lugar sellado! 🎉' : 'Lugar guardado.')
      onDone()
    } catch { toast('No se pudo guardar. Intenta de nuevo.') }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${place.name}"?`)) return
    await Promise.all((place.photos || []).map(p => deletePhoto(p.path)))
    await places.remove(place.id)
    toast('Lugar eliminado.')
    onDone()
  }

  return (
    <div>
      <label className="field-label">Nombre del lugar</label>
      <input type="text" placeholder="Ej. Laguna Azul" value={name} onChange={e => setName(e.target.value)} />

      <label className="field-label">País / Ciudad o región</label>
      <div className="two-col">
        <input type="text" value={country} onChange={e => setCountry(e.target.value)} />
        <input type="text" placeholder="Ej. Tarapoto" value={city} onChange={e => setCity(e.target.value)} />
      </div>

      <label className="field-label">Categoría</label>
      <div className="chip-picker">
        {PLACE_CATS.map(c => (
          <button key={c.id} type="button" className={category === c.id ? 'sel' : ''} onClick={() => setCategory(c.id)}>{c.icon} {c.label}</button>
        ))}
      </div>

      <label className="field-label">Viaje asociado (opcional)</label>
      <select value={tripId} onChange={e => setTripId(e.target.value)}>
        <option value="">— Sin viaje asociado —</option>
        {trips.items.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <label className="field-label">Ubicación en el mapa (opcional)</label>
      {position ? (
        <div className="mini-map-preview">
          <button type="button" className="btn-text" onClick={() => setShowMap(s => !s)}>{showMap ? 'Ocultar mapa' : `📍 ${position[0].toFixed(4)}, ${position[1].toFixed(4)} — cambiar`}</button>
        </div>
      ) : (
        <button type="button" className="btn-text" onClick={() => setShowMap(s => !s)}>{showMap ? 'Ocultar mapa' : '+ Marcar en el mapa'}</button>
      )}
      {showMap && (
        <div style={{ marginTop: 8 }}>
          <PlaceMap places={[]} height={220} pickMode pickedPosition={position} onPick={setPosition} />
          <p className="page-sub" style={{ marginTop: 6 }}>Toca el mapa para colocar el marcador.</p>
        </div>
      )}

      <label className="field-label">Estado</label>
      <div className="chip-picker">
        <button type="button" className={status === 'pendiente' ? 'sel' : ''} onClick={() => setStatus('pendiente')}>📌 Por visitar</button>
        <button type="button" className={status === 'visitado' ? 'sel' : ''} onClick={() => setStatus('visitado')}>✅ Ya lo visitamos</button>
      </div>

      {status === 'pendiente' && (
        <>
          <label className="field-label">Fecha planeada (opcional)</label>
          <input type="date" value={plannedDate} onChange={e => setPlannedDate(e.target.value)} />
        </>
      )}

      {status === 'visitado' && (
        <>
          <label className="field-label">Fecha de visita</label>
          <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} />

          <label className="field-label">Calificación</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map(n => (
              <span key={n} className={n <= rating ? 'star on' : 'star'} onClick={() => setRating(n === rating ? 0 : n)}>★</span>
            ))}
          </div>

          <label className="field-label">Fotos del recuerdo</label>
          <div className="photo-grid">
            {photos.map((ph, idx) => (
              <img key={idx} src={ph.url} title="Toca para quitar" onClick={() => removePhoto(idx)} />
            ))}
            {photos.length < 12 && (
              <label className="photo-add">{uploading ? '…' : '+'}<input type="file" accept="image/*" multiple hidden onChange={handlePhotos} disabled={uploading} /></label>
            )}
          </div>
        </>
      )}

      <label className="field-label">Descripción</label>
      <textarea placeholder="Qué es, por qué lo anotaron..." value={description} onChange={e => setDescription(e.target.value)} />

      <label className="field-label">Notas</label>
      <textarea placeholder="Comentarios, recomendaciones..." value={notes} onChange={e => setNotes(e.target.value)} />

      <div className="btn-row" style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploading}>{place ? 'Guardar cambios' : 'Agregar lugar'}</button>
        {place && <button className="btn btn-danger" onClick={handleDelete} style={{ flex: '0 0 auto' }}>Eliminar</button>}
      </div>
    </div>
  )
}
