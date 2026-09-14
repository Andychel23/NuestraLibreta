import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './state/AppState'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Fab from './components/Fab'
import Toast from './components/Toast'
import SheetHost from './components/SheetHost'
import CalendarioPage from './pages/CalendarioPage'
import ViajesPage from './pages/ViajesPage'
import ViajeDetailPage from './pages/ViajeDetailPage'
import LugaresPage from './pages/LugaresPage'
import FinanzasPage from './pages/FinanzasPage'

export default function App() {
  return (
    <AppProvider>
      <div className="app-shell">
        <Header />
        <Routes>
          <Route path="/" element={<CalendarioPage />} />
          <Route path="/viajes" element={<ViajesPage />} />
          <Route path="/viajes/:id" element={<ViajeDetailPage />} />
          <Route path="/lugares" element={<LugaresPage />} />
          <Route path="/finanzas" element={<FinanzasPage />} />
        </Routes>
      </div>
      <Fab />
      <BottomNav />
      <Toast />
      <SheetHost />
    </AppProvider>
  )
}
