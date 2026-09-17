import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppState'
import { buildAlbumPages } from '../lib/album'
import { exportAlbumPdf } from '../lib/albumPdf'
import AlbumPageView from '../components/AlbumPageView'
import './AlbumViewerPage.css'

export default function AlbumViewerPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { trips, places, expenses, toast } = useApp()
  const [index, setIndex] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(null)

  const trip = trips.items.find(t => t.id === id)
  const tripPlaces = useMemo(() => places.items.filter(p => p.tripId === id), [places.items, id])
  const tripExpenses = useMemo(() => expenses.items.filter(e => e.tripId === id), [expenses.items, id])
  const pages = useMemo(() => trip ? buildAlbumPages(trip, tripPlaces, tripExpenses) : [], [trip, tripPlaces, tripExpenses])

  if (!trip) {
    return <div className="page"><div className="empty-state"><div className="big">Este viaje ya no existe</div><button className="btn-text" onClick={() => nav('/viajes')}>← Volver</button></div></div>
  }

  const safeIndex = Math.min(index, pages.length - 1)

  async function handleDownload() {
    setExporting(true)
    try {
      await exportAlbumPdf(trip, pages, (done, total) => setProgress({ done, total }))
      toast('PDF descargado.')
    } catch {
      toast('No se pudo generar el PDF. Intenta de nuevo.')
    }
    setExporting(false)
    setProgress(null)
  }

  return (
    <div className="page album-viewer-page">
      <div className="album-bar">
        <button className="btn-text" onClick={() => nav(`/viajes/${id}`)}>← Volver al viaje</button>
        <button className="btn btn-primary album-download-btn" onClick={handleDownload} disabled={exporting}>
          {exporting ? `Generando… ${progress ? `${progress.done}/${progress.total}` : ''}` : '⬇ Descargar PDF del álbum'}
        </button>
      </div>

      <div className="album-viewer">
        <div className="albumPage">
          <AlbumPageView page={pages[safeIndex]} />
        </div>
        <div className="album-nav">
          <button onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={safeIndex === 0}>‹</button>
          <span>Página {safeIndex + 1} de {pages.length}</span>
          <button onClick={() => setIndex(i => Math.min(pages.length - 1, i + 1))} disabled={safeIndex === pages.length - 1}>›</button>
        </div>
      </div>
      <p className="page-sub album-hint">Esta es la vista previa de cómo se va a ver cada página impresa. El PDF sale en tamaño A4, listo para imprimir en papel fotográfico.</p>
    </div>
  )
}
