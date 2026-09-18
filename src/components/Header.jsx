import { useState } from 'react'
import { IconSettings, IconPlaneTilt } from '@tabler/icons-react'
import { useApp } from '../state/AppState'
import { seedDemoData } from '../lib/demoData'
import './Header.css'

export default function Header() {
  const [open, setOpen] = useState(false)
  const { currentUser, setCurrentUser, trips, places, events, expenses, todos, toast } = useApp()
  const [seeding, setSeeding] = useState(false)

  async function handleSeed() {
    if (!confirm('Esto agrega un viaje, lugares, eventos y gastos de ejemplo (Chachapoyas). ¿Continuar?')) return
    setSeeding(true)
    try {
      await seedDemoData({ trips, places, events, expenses, todos })
      toast('Datos de ejemplo agregados.')
    } catch { toast('No se pudo cargar el ejemplo.') }
    setSeeding(false)
  }

  return (
    <header className="app-header">
      <div className="header-banner">
        <div className="header-row">
          <div className="header-badge">
            <IconPlaneTilt size={21} stroke={2} style={{ transform: 'rotate(-20deg)' }} />
          </div>
          <div className="header-titles">
            <div className="header-title">Nuestra Libreta</div>
            <div className="header-tag">Nuestros viajes y recuerdos</div>
          </div>
          <button className="header-settings-btn" onClick={() => setOpen(o => !o)} aria-label="Ajustes">
            <IconSettings size={19} />
          </button>
        </div>
      </div>
      {open && (
        <div className="settings-panel">
          <div className="settings-row">
            <span>Estoy anotando como:</span>
            <button className={currentUser === 'Andy' ? 'active' : ''} onClick={() => setCurrentUser('Andy')}>Andy</button>
            <button className={currentUser === 'Marjorie' ? 'active' : ''} onClick={() => setCurrentUser('Marjorie')}>Marjorie</button>
          </div>
          <div className="settings-row" style={{ marginTop: 10 }}>
            <button onClick={handleSeed} disabled={seeding}>{seeding ? 'Cargando…' : 'Cargar datos de ejemplo'}</button>
          </div>
        </div>
      )}
    </header>
  )
}
