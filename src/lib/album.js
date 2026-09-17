import { fmtDate, fmtRange } from './dates'
import { catInfo, PLACE_CATS } from './constants'
import { fmtMoney } from './money'

// Reparte un arreglo de fotos en grupos de máximo `max` (para las páginas de collage).
function chunk(arr, max) {
  const out = []
  for (let i = 0; i < arr.length; i += max) out.push(arr.slice(i, i + max))
  return out
}

// Arma la lista de "páginas" del álbum de un viaje: portada, resumen, y una o
// varias páginas de fotos por cada lugar visitado. Cada página es un
// descriptor liviano (no HTML) — AlbumPageView.jsx se encarga de dibujarla,
// tanto para la vista previa en pantalla como para la captura del PDF.
export function buildAlbumPages(trip, places, expenses = []) {
  const pages = []

  pages.push({ kind: 'cover', trip })

  const visited = places.filter(p => p.status === 'visitado')
  const hasResumenContent = trip.notes || (trip.itinerary || []).length > 0 || visited.length > 0
  if (hasResumenContent) {
    const spent = expenses.filter(e => e.type !== 'liquidacion').reduce((s, e) => s + Number(e.amount || 0), 0)
    pages.push({ kind: 'resumen', trip, visited, spent })
  }

  const withPhotos = places.filter(p => (p.photos || []).length > 0)
  if (withPhotos.length === 0) {
    pages.push({ kind: 'empty' })
  } else {
    withPhotos.forEach(place => {
      const chunks = chunk(place.photos, 6)
      chunks.forEach((photoChunk, idx) => {
        pages.push({ kind: 'photos', place, photos: photoChunk, showHeader: idx === 0 })
      })
    })
  }

  return pages
}

export function placeMeta(place) {
  const c = catInfo(PLACE_CATS, place.category)
  const meta = [place.city, fmtDate(place.visitDate)].filter(Boolean).join(' · ')
  return { c, meta }
}

export function tripSummaryLines(trip, visited, spent) {
  return {
    dateRange: fmtRange(trip.dateFrom, trip.dateTo),
    spentLabel: spent ? fmtMoney(spent) : null,
    visitedCount: visited.length,
  }
}
