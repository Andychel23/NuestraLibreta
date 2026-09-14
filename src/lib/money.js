export function fmtMoney(n, currency = 'S/') {
  const v = Number(n) || 0
  return `${currency} ${Math.abs(v).toFixed(2)}`
}

// Calcula quién le debe a quién, entre exactamente dos personas: Andy y Marjorie.
export function computeBalance(expenses) {
  let diff = 0 // positivo => Marjorie le debe a Andy; negativo => Andy le debe a Marjorie
  let andyTotal = 0, marjTotal = 0
  expenses.forEach(e => {
    const amt = Number(e.amount) || 0
    if (e.type === 'liquidacion') {
      diff += e.paidBy === 'Andy' ? amt : -amt
      return
    }
    const forWhom = e.forWhom || 'ambos'
    if (forWhom === 'ambos') {
      const signed = e.paidBy === 'Andy' ? amt : -amt
      diff += signed / 2
    } else if (forWhom !== e.paidBy) {
      // e.paidBy pagó algo que era 100% para la otra persona
      diff += e.paidBy === 'Andy' ? amt : -amt
    }
    if (e.paidBy === 'Andy') andyTotal += amt
    else marjTotal += amt
  })
  return { diff, andyTotal, marjTotal }
}

export function sumByCategory(expenses) {
  const map = {}
  expenses.forEach(e => {
    if (e.type === 'liquidacion') return
    const amt = Number(e.amount) || 0
    map[e.category || 'otros'] = (map[e.category || 'otros'] || 0) + amt
  })
  return map
}
