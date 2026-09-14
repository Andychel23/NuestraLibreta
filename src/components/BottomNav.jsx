import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const TABS = [
  { to: '/', label: 'Calendario', icon: '📅', end: true },
  { to: '/viajes', label: 'Viajes', icon: '🧳' },
  { to: '/lugares', label: 'Lugares', icon: '📍' },
  { to: '/finanzas', label: 'Finanzas', icon: '💰' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map(t => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => 'bn-item' + (isActive ? ' active' : '')}>
          <span className="bn-icon">{t.icon}</span>
          <span className="bn-label">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
