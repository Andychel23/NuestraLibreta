import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconChevronRight, IconDownload, IconPhoto } from '@tabler/icons-react'
import { useApp } from '../state/AppState'
import { buildAlbumPages } from '../lib/album'
import { exportAlbumPdf } from '../lib/albumPdf'
import { fmtDate } from '../lib/dates'
import AlbumPageView from '../components/AlbumPageView'
import Lightbox from '../components/Lightbox'
import './AlbumViewerPage.css'

export default function AlbumViewerPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { trips, places, expenses, toast } = useApp()
  const [index, setIndex] = useState(0)
  const [lbIndex, setLbIndex] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(null)

  const trip = trips.items.find(t => t.id === id)
  const tripPlaces = useMemo(() => places.items.filter(p => p.tripId === id), [places.items, id])
  const tripExpenses = useMemo(() => expenses.items.filter(e => e.tripId === id), [expenses.items, id])
  const pages = useMemo(() => trip ? buildAlbumPages(trip, tripPlaces, tripExpenses) : [], [trip, tripPlaces, tripExpenses])

  const allPhotos = useMemo(() => {
    const list = []
    tripPlaces.forEach(p => (p.photos || []).forEach(ph => list.push({ ...ph, caption: p.name, date: fmtDate(p.visitDate) })))
    return list
  }, [tripPlaces])

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
      <button className="btn-text back-link" onClick={() => nav(`/viajes/${id}`)}><IconChevronLeft size={15} />{trip.name}</button>
      <h1 className="page-title" style={{ marginBottom: 4 }}>Álbum</h1>
      <p className="page-sub" style={{ marginBottom: 18 }}>Todas las fotos, y el álbum listo para imprimir.</p>

      {allPhotos.length === 0 ? (
        <div className="empty-state">
          <div className="icon-wrap"><IconPhoto size={34} stroke={1.5} /></div>
          <div className="big">Sin fotos todavía</div>
          <div className="hint">Las fotos que subas a los lugares de este viaje aparecen aquí.</div>
        </div>
      ) : (
        <>
          <div className="album-section-label">Galería · {allPhotos.length} foto{allPhotos.length !== 1 ? 's' : ''}</div>
          <div className="photo-gallery">
            {allPhotos.map((ph, i) => <img key={i} src={ph.url} onClick={() => setLbIndex(i)} />)}
          </div>

          <div className="album-section-label" style={{ marginTop: 26 }}>Vista previa del álbum en PDF</div>
          <div className="album-viewer">
            <div className="albumPage">
              <AlbumPageView page={pages[safeIndex]} />
            </div>
            <div className="album-nav">
              <button onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={safeIndex === 0}><IconChevronLeft size={16} /></button>
              <span>Página {safeIndex + 1} de {pages.length}</span>
              <button onClick={() => setIndex(i => Math.min(pages.length - 1, i + 1))} disabled={safeIndex === pages.length - 1}><IconChevronRight size={16} /></button>
            </div>
          </div>
          <p className="page-sub album-hint">Tamaño A4, listo para imprimir en papel fotográfico.</p>

          <button className="btn btn-primary btn-block album-download-btn" onClick={handleDownload} disabled={exporting}>
            <IconDownload size={17} />
            {exporting ? `Generando… ${progress ? `${progress.done}/${progress.total}` : ''}` : 'Descargar PDF del álbum'}
          </button>
        </>
      )}

      <Lightbox photos={allPhotos} index={lbIndex} onClose={() => setLbIndex(null)}
        onNav={(d) => setLbIndex(i => (i + d + allPhotos.length) % allPhotos.length)} />
    </div>
  )
}
