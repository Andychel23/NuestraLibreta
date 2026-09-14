import { useState, useMemo } from 'react'
import { useApp } from '../state/AppState'
import { fmtMoney, computeBalance, sumByCategory } from '../lib/money'
import { EXPENSE_CATS, catInfo } from '../lib/constants'
import { fmtDate } from '../lib/dates'
import './FinanzasPage.css'

export default function FinanzasPage() {
  const { expenses, trips, openSheet, toast } = useApp()
  const [tripFilter, setTripFilter] = useState('all')

  const list = useMemo(() => {
    let arr = expenses.items
    if (tripFilter !== 'all') arr = arr.filter(e => e.tripId === tripFilter)
    return [...arr].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }, [expenses.items, tripFilter])

  const { diff } = computeBalance(list)
  const byCat = sumByCategory(list)
  const catEntries = Object.entries(byCat).sort((a, b) => b[1] - a[1])
  const maxCat = catEntries.length ? Math.max(...catEntries.map(e => e[1])) : 1

  async function liquidar() {
    if (Math.abs(diff) < 0.5) return
    const debtor = diff > 0 ? 'Marjorie' : 'Andy'
    await expenses.add({
      description: 'Liquidación', amount: Math.abs(diff), paidBy: debtor, type: 'liquidacion',
      date: new Date().toISOString().slice(0, 10), tripId: tripFilter !== 'all' ? tripFilter : null,
    })
    toast('Cuentas saldadas.')
  }

  let bannerText = 'Están a mano ✓', bannerSub = 'Nadie le debe nada a nadie'
  if (Math.abs(diff) >= 0.5) {
    bannerText = diff > 0 ? 'Marjorie le debe a Andy' : 'Andy le debe a Marjorie'
    bannerSub = fmtMoney(diff)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Finanzas</h1>
          <p className="page-sub">Quién pagó qué, y quién le debe a quién.</p>
        </div>
      </div>

      <select className="trip-select" value={tripFilter} onChange={e => setTripFilter(e.target.value)}>
        <option value="all">Todos los viajes y gastos</option>
        {trips.items.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <div className="balance-banner">
        <div className="bb-lbl">Balance actual</div>
        <div className="bb-amt">{bannerText}</div>
        {Math.abs(diff) >= 0.5 && <div className="bb-lbl" style={{ marginTop: 2, opacity: 0.9 }}>{bannerSub}</div>}
        {Math.abs(diff) >= 0.5 && <button className="bb-liquidar" onClick={liquidar}>Marcar como saldado</button>}
      </div>

      {catEntries.length > 0 && (
        <div className="card" style={{ margin: '16px 0' }}>
          <div className="page-sub" style={{ marginBottom: 10 }}>Gasto por categoría</div>
          {catEntries.map(([catId, amt]) => {
            const c = catInfo(EXPENSE_CATS, catId)
            return (
              <div key={catId} className="cat-bar-row">
                <span className="cat-bar-lbl">{c.icon} {c.label}</span>
                <div className="cat-bar-track"><div className="cat-bar-fill" style={{ width: `${(amt / maxCat) * 100}%` }} /></div>
                <span className="cat-bar-amt">{fmtMoney(amt)}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="exp-list">
        {list.length === 0 ? (
          <div className="empty-state"><div className="big">Sin gastos registrados</div><div className="hint">Anoten lo que van pagando y aquí se calcula solo quién le debe a quién.</div></div>
        ) : list.map(e => {
          const trip = trips.items.find(t => t.id === e.tripId)
          return (
            <div key={e.id} className="expense-row" onClick={() => e.type !== 'liquidacion' && openSheet('expense-form', { expense: e })}>
              <div className="who">{e.paidBy === 'Andy' ? 'A' : 'M'}</div>
              <div className="desc">
                <div className="d">{e.type === 'liquidacion' ? '🤝 ' : ''}{e.description}</div>
                <div className="m">{e.paidBy} pagó · {fmtDate(e.date)}{trip ? ' · ' + trip.name : ''}</div>
              </div>
              <div className="amt">{fmtMoney(e.amount)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
