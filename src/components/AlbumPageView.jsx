import { placeMeta, tripSummaryLines } from '../lib/album'
import { fmtDate, fmtRange } from '../lib/dates'
import { catInfo, PLACE_CATS } from '../lib/constants'
import './AlbumPageView.css'

export default function AlbumPageView({ page }) {
  if (page.kind === 'cover') return <CoverPage trip={page.trip} />
  if (page.kind === 'resumen') return <ResumenPage trip={page.trip} visited={page.visited} spent={page.spent} />
  if (page.kind === 'photos') return <PhotosPage place={page.place} photos={page.photos} showHeader={page.showHeader} />
  return <EmptyPage />
}

function CoverPage({ trip }) {
  const range = fmtRange(trip.dateFrom, trip.dateTo)
  if (trip.coverPhoto) {
    return (
      <div className="ap-coverPhoto" style={{ backgroundImage: `url(${trip.coverPhoto.url})` }}>
        <div className="ap-coverPhotoOverlay">
          <div className="ap-coverEyebrow">🧳 Nuestra Libreta</div>
          <div className="ap-coverTitle">{trip.name}</div>
          {trip.destination && <div className="ap-coverCity">{trip.destination}</div>}
          {range && <div className="ap-coverDates">{range}</div>}
          <div className="ap-coverMark">Andy &amp; Marjorie</div>
        </div>
      </div>
    )
  }
  return (
    <div className="ap-coverSolid">
      <div className="ap-coverEyebrow">🧳 Nuestra Libreta</div>
      <div className="ap-coverTitle">{trip.name}</div>
      {trip.destination && <div className="ap-coverCity">{trip.destination}</div>}
      {range && <div className="ap-coverDates">{range}</div>}
      {trip.notes && <div className="ap-coverNotes">{trip.notes}</div>}
      <div className="ap-coverMark">Andy &amp; Marjorie</div>
    </div>
  )
}

function ResumenPage({ trip, visited, spent }) {
  const { dateRange, spentLabel } = tripSummaryLines(trip, visited, spent)
  const itinerary = [...(trip.itinerary || [])].sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  return (
    <div className="ap-resumenPage">
      <div className="ap-resumenHeader">
        <div className="ap-resumenEyebrow">Resumen del viaje</div>
        <div className="ap-resumenTitle">{trip.name}</div>
        <div className="ap-resumenMeta">{[trip.destination, dateRange].filter(Boolean).join(' · ')}</div>
      </div>

      <div className="ap-resumenCols">
        <div className="ap-resumenCol">
          {itinerary.length > 0 && (
            <>
              <div className="ap-resumenColTitle">Itinerario</div>
              {itinerary.map((it, i) => (
                <div key={i} className="ap-itinRow">
                  <span className="ap-itinDate">{fmtDate(it.date, { day: 'numeric', month: 'short' })}{it.time ? ` · ${it.time}` : ''}</span>
                  <span className="ap-itinTitle">{it.title}</span>
                </div>
              ))}
            </>
          )}
          {trip.notes && (
            <>
              <div className="ap-resumenColTitle" style={{ marginTop: itinerary.length ? '1.4em' : 0 }}>Notas</div>
              <div className="ap-resumenNotes">{trip.notes}</div>
            </>
          )}
        </div>

        <div className="ap-resumenCol">
          {visited.length > 0 && (
            <>
              <div className="ap-resumenColTitle">Lugares visitados ({visited.length})</div>
              {visited.map(p => {
                const c = catInfo(PLACE_CATS, p.category)
                return (
                  <div key={p.id} className="ap-placeRow">
                    <span className="ap-placeIcon">{c.icon}</span>
                    <span className="ap-placeName">{p.name}{p.rating ? ' ' + '★'.repeat(p.rating) : ''}</span>
                    <span className="ap-placeDate">{fmtDate(p.visitDate, { day: 'numeric', month: 'short' })}</span>
                  </div>
                )
              })}
            </>
          )}
          {spentLabel && (
            <div className="ap-spentBox">
              <div className="ap-resumenColTitle">Gasto total</div>
              <div className="ap-spentAmt">{spentLabel}</div>
            </div>
          )}
        </div>
      </div>
      <div className="ap-resumenMark">Andy &amp; Marjorie</div>
    </div>
  )
}

function PhotosPage({ place, photos, showHeader }) {
  const { c, meta } = placeMeta(place)
  const hero = photos[0]?.url
  return (
    <div className="ap-sitioPage">
      {showHeader && (
        <div className="ap-sitioHeader" style={hero ? { backgroundImage: `url(${hero})` } : {}}>
          <div className="ap-sitioHeaderOverlay">
            <div className="ap-sitioHeaderEyebrow">{c.icon} {c.label}</div>
            <div className="ap-sitioHeaderTitle">{place.name}</div>
            {meta && <div className="ap-sitioHeaderMeta">{meta}</div>}
          </div>
        </div>
      )}
      <div className={`ap-sitioCollage ap-collage-${photos.length}${!showHeader ? ' ap-full' : ''}`}>
        {photos.map((ph, i) => (
          <div key={i} className="ap-cCell"><img src={ph.url} /></div>
        ))}
      </div>
    </div>
  )
}

function EmptyPage() {
  return <div className="ap-emptyPage">Todavía no hay fotos en este viaje.<br />Sube algunas desde la pestaña "Fotos" o "Lugares".</div>
}
