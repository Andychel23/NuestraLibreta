import { useEffect } from 'react'
import './Lightbox.css'

export default function Lightbox({ photos, index, onClose, onNav }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNav(1)
      if (e.key === 'ArrowLeft') onNav(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, onNav])

  if (index == null) return null
  const ph = photos[index]
  return (
    <div className="lb-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button className="lb-close" onClick={onClose}>×</button>
      {photos.length > 1 && <button className="lb-nav lb-prev" onClick={() => onNav(-1)}>‹</button>}
      <img className="lb-img" src={ph.url} alt="" />
      {photos.length > 1 && <button className="lb-nav lb-next" onClick={() => onNav(1)}>›</button>}
      {(ph.caption || ph.date) && (
        <div className="lb-caption">
          {ph.caption && <div>{ph.caption}</div>}
          {ph.date && <div className="lb-caption-sub">{ph.date}</div>}
        </div>
      )}
    </div>
  )
}
