import { NavLink } from 'react-router-dom'
import { IconCalendar, IconMapPin, IconChecklist } from '@tabler/icons-react'
import IconCoin from './icons/IconCoin'
import './BottomNav.css'

const TABS = [
  { to: '/', label: 'Calendario', icon: IconCalendar, end: true },
  { to: '/viajes', label: 'Viajes', icon: IconMapPin },
  { to: '/finanzas', label: 'Finanzas', icon: IconCoin },
  { to: '/pendientes', label: 'Pendientes', icon: IconChecklist },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map(t => {
        const Icon = t.icon
        return (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => 'bn-item' + (isActive ? ' active' : '')}>
            <span className="bn-pill">
              <Icon size={22} stroke={1.8} />
              <span className="bn-label">{t.label}</span>
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
