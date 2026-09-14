import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import './PlaceMap.css'

function dotIcon(color) {
  return L.divIcon({
    className: 'place-dot-icon',
    html: `<span style="background:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  })
}
const ICON_VISITADO = dotIcon('#3EBD79')
const ICON_PENDIENTE = dotIcon('#E2653B')

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) { map.setView(points[0], 11); return }
    map.fitBounds(points, { padding: [36, 36] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.length])
  return null
}

export default function PlaceMap({ places, onSelect, height = 420, pickMode, onPick, pickedPosition }) {
  const withCoords = useMemo(() => places.filter(p => p.lat != null && p.lng != null), [places])
  const points = withCoords.map(p => [p.lat, p.lng])
  const center = points[0] || [-9.19, -75.02] // centro aprox. del Perú

  return (
    <div className="place-map-wrap" style={{ height }}>
      <MapContainer center={center} zoom={points.length ? 11 : 5} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!pickMode && points.length > 0 && <FitBounds points={points} />}
        {withCoords.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={p.status === 'visitado' ? ICON_VISITADO : ICON_PENDIENTE}>
            <Popup>
              <div className="map-popup" onClick={() => onSelect && onSelect(p)}>
                {p.photos?.[0] && <img src={p.photos[0].url} />}
                <div className="map-popup-name">{p.name}</div>
                <div className="map-popup-meta">{p.city} · {p.status === 'visitado' ? 'Visitado' : 'Por visitar'}</div>
              </div>
            </Popup>
          </Marker>
        ))}
        {pickMode && <MapClickHandler onPick={onPick} />}
        {pickMode && pickedPosition && <Marker position={pickedPosition} icon={ICON_PENDIENTE} />}
      </MapContainer>
    </div>
  )
}

function MapClickHandler({ onPick }) {
  const map = useMap()
  useEffect(() => {
    const handler = (e) => onPick([e.latlng.lat, e.latlng.lng])
    map.on('click', handler)
    return () => map.off('click', handler)
  }, [map, onPick])
  return null
}
