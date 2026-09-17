import { useState } from 'react'
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
      <div className="header-row">
        <h1 className="header-title">Nuestra Libreta <span className="header-tag">— Andy &amp; Marjorie</span></h1>
        <button className="iconBtn" onClick={() => setOpen(o => !o)} aria-label="Ajustes">⚙️</button>
      </div>
      {open && (
        <div className="settings-panel">
          <div className="settings-row">
            <span>Estoy anotando como:</span>
            <button className={currentUser === 'Andy' ? 'active' : ''} onClick={() => setCurrentUser('Andy')}>Andy</button>
            <button className={currentUser === 'Marjorie' ? 'active' : ''} onClick={() => setCurrentUser('Marjorie')}>Marjorie</button>
          </div>
          <div className="settings-row" style={{ marginTop: 10 }}>
            <button onClick={handleSeed} disabled={seeding}>{seeding ? 'Cargando…' : '✨ Cargar datos de ejemplo'}</button>
          </div>
        </div>
      )}
    </header>
  )
}
