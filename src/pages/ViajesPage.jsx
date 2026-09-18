import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconPlaneTilt, IconPlane } from '@tabler/icons-react'
import { useApp } from '../state/AppState'
import { fmtRange, tripStatus } from '../lib/dates'
import { TRIP_STATUS_LABEL } from '../lib/constants'
import './ViajesPage.css'

export default function ViajesPage() {
  const { trips } = useApp()
  const nav = useNavigate()

  const list = useMemo(() => {
    return [...trips.items]
      .map(t => ({ ...t, status: tripStatus(t) }))
      .sort((a, b) => (b.dateFrom || '').localeCompare(a.dateFrom || ''))
  }, [trips.items])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Viajes</h1>
          <p className="page-sub">Del más reciente al más antiguo.</p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <div className="icon-wrap"><IconPlaneTilt size={34} stroke={1.5} /></div>
          <div className="big">Todavía no hay viajes</div>
          <div className="hint">Toca el botón "+" para planificar el primero.</div>
        </div>
      ) : (
        <div className="trip-list">
          {list.map(t => (
            t.coverPhoto ? (
              <div key={t.id} className="trip-card trip-card-photo" onClick={() => nav(`/viajes/${t.id}`)}
                style={{ backgroundImage: `linear-gradient(to top, rgba(35,69,36,0.88), rgba(35,69,36,0.1) 60%), url(${t.coverPhoto.url})` }}>
                <span className={`trip-status ts-${t.status}`}>{TRIP_STATUS_LABEL[t.status]}</span>
                <div className="trip-card-photo-body">
                  <div className="trip-name">{t.name}</div>
                  <div className="trip-when">{t.destination}{t.destination ? ' · ' : ''}{fmtRange(t.dateFrom, t.dateTo)}</div>
                </div>
              </div>
            ) : (
              <div key={t.id} className="trip-card trip-card-plain" onClick={() => nav(`/viajes/${t.id}`)}>
                <div className="trip-plain-icon"><IconPlane size={20} stroke={1.8} /></div>
                <div className="trip-plain-body">
                  <div className="trip-name">{t.name}</div>
                  <div className="trip-when">{t.destination}{t.destination ? ' · ' : ''}{fmtRange(t.dateFrom, t.dateTo)}</div>
                </div>
                <span className={`trip-status ts-plain ts-${t.status}`}>{TRIP_STATUS_LABEL[t.status]}</span>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}
