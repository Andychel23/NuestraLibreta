import { createRoot } from 'react-dom/client'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import AlbumPageView from '../components/AlbumPageView'
import { createElement } from 'react'

function waitImages(el) {
  const imgs = Array.from(el.querySelectorAll('img'))
  return Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res })))
}

// Renderiza cada página del álbum a tamaño completo (1240×1754, ~A4 a 150dpi)
// en un contenedor oculto, la captura como imagen, y arma un PDF descargable
// listo para imprimir en papel fotográfico.
export async function exportAlbumPdf(trip, pages, onProgress) {
  const holder = document.createElement('div')
  holder.style.position = 'fixed'
  holder.style.left = '-99999px'
  holder.style.top = '0'
  document.body.appendChild(holder)

  const pageDiv = document.createElement('div')
  pageDiv.className = 'pdfPage'
  holder.appendChild(pageDiv)
  const root = createRoot(pageDiv)

  const W = 1240, H = 1754
  const pdf = new jsPDF({ unit: 'px', format: [W, H] })

  try {
    for (let i = 0; i < pages.length; i++) {
      onProgress?.(i + 1, pages.length)
      await new Promise(resolve => {
        root.render(createElement(AlbumPageView, { page: pages[i] }))
        // esperar al commit del render antes de seguir
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      })
      await waitImages(pageDiv)
      const canvas = await html2canvas(pageDiv, { width: W, height: H, scale: 1, useCORS: true, backgroundColor: '#0B0B0D' })
      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      if (i > 0) pdf.addPage([W, H])
      pdf.addImage(imgData, 'JPEG', 0, 0, W, H)
    }
    const filename = (trip.name || 'album').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '')
    pdf.save(filename + '-album.pdf')
  } finally {
    root.unmount()
    document.body.removeChild(holder)
  }
}
