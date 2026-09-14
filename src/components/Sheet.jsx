import { useEffect } from 'react'
import './Sheet.css'

export default function Sheet({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="sheet-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`sheet-panel${wide ? ' sheet-wide' : ''}`}>
        <div className="sheet-grabber" />
        <button className="sheet-close" onClick={onClose} aria-label="Cerrar">×</button>
        {title && <h2 className="sheet-title">{title}</h2>}
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}
