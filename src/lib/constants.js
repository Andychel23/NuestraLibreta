import {
  IconTree, IconBuildingBank, IconToolsKitchen2, IconMountain, IconBuildingSkyscraper, IconMapPin,
  IconMap, IconStar, IconCake, IconBed, IconDots, IconPlane,
  IconBus, IconHome, IconCompass, IconTicket, IconShoppingBag, IconSparkles,
} from '@tabler/icons-react'
import IconCoin from '../components/icons/IconCoin'

export const PLACE_CATS = [
  { id: 'naturaleza', label: 'Naturaleza', icon: IconTree },
  { id: 'cultura', label: 'Cultura / historia', icon: IconBuildingBank },
  { id: 'comida', label: 'Comida', icon: IconToolsKitchen2 },
  { id: 'aventura', label: 'Aventura', icon: IconMountain },
  { id: 'ciudad', label: 'Ciudad', icon: IconBuildingSkyscraper },
  { id: 'otro', label: 'Otro', icon: IconMapPin },
]

export const EVENT_TYPES = [
  { id: 'actividad', label: 'Actividad', icon: IconMap, color: 'actividad' },
  { id: 'fecha', label: 'Fecha importante', icon: IconStar, color: 'fecha' },
  { id: 'cumpleanos', label: 'Cumpleaños', icon: IconCake, color: 'cumple' },
  { id: 'pago', label: 'Pago', icon: IconCoin, color: 'pago' },
  { id: 'reserva', label: 'Reserva', icon: IconBed, color: 'reserva' },
  { id: 'otro', label: 'Otro', icon: IconDots, color: 'otro' },
]
export const EVENT_TYPE_MAP = Object.fromEntries(EVENT_TYPES.map(t => [t.id, t]))

// Leyenda completa del calendario (incluye tipos auto-generados: viajes y lugares)
export const CAL_LEGEND = [
  { color: 'trip', icon: IconPlane, label: 'Viaje' },
  ...EVENT_TYPES.filter(t => t.id !== 'otro'),
  { color: 'lugar', icon: IconMapPin, label: 'Lugar por visitar' },
]

export const EXPENSE_CATS = [
  { id: 'transporte', label: 'Transporte', icon: IconBus },
  { id: 'alojamiento', label: 'Alojamiento', icon: IconHome },
  { id: 'alimentacion', label: 'Alimentación', icon: IconToolsKitchen2 },
  { id: 'tours', label: 'Tours', icon: IconCompass },
  { id: 'entradas', label: 'Entradas', icon: IconTicket },
  { id: 'compras', label: 'Compras', icon: IconShoppingBag },
  { id: 'otros', label: 'Otros', icon: IconSparkles },
]

export const TRIP_STATUS_LABEL = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  finalizado: 'Finalizado',
}

export function catInfo(list, id) {
  return list.find(c => c.id === id) || list[list.length - 1]
}
