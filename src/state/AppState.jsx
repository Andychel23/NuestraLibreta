import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useCollection } from '../lib/useCollection'

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const trips = useCollection('trips')
  const places = useCollection('places')
  const events = useCollection('events')
  const expenses = useCollection('expenses')

  const [currentUser, setCurrentUserState] = useState(() => localStorage.getItem('nl-user') || '')
  const setCurrentUser = useCallback((name) => {
    setCurrentUserState(name)
    localStorage.setItem('nl-user', name)
  }, [])

  const [toastMsg, setToastMsg] = useState('')
  const [toastShow, setToastShow] = useState(false)
  const toastTimer = useRef(null)
  const toast = useCallback((msg) => {
    setToastMsg(msg)
    setToastShow(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastShow(false), 2200)
  }, [])

  const [sheet, setSheet] = useState(null) // { type, props }
  const openSheet = useCallback((type, props = {}) => setSheet({ type, props }), [])
  const closeSheet = useCallback(() => setSheet(null), [])

  const value = {
    trips, places, events, expenses,
    currentUser, setCurrentUser,
    toast, toastMsg, toastShow,
    sheet, openSheet, closeSheet,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}
