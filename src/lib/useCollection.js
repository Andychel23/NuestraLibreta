import { useEffect, useState, useCallback } from 'react'
import {
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db, LIBRETA_ID } from '../firebase'

// Suscripción en vivo (onSnapshot) a libretas/{LIBRETA_ID}/{name}, con helpers
// add/update/remove. Esto es lo que mantiene sincronizados en tiempo real los
// celulares de Andy y Marjorie sin que nadie tenga que refrescar nada.
export function useCollection(name, { order = 'createdAt', direction = 'desc' } = {}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const colRef = collection(db, 'libretas', LIBRETA_ID, name)

  useEffect(() => {
    const q = query(colRef, orderBy(order, direction))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => { setError(err); setLoading(false) }
    )
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  const add = useCallback(async (data) => {
    const ref = await addDoc(colRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    return ref.id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  const update = useCallback(async (id, data) => {
    await updateDoc(doc(db, 'libretas', LIBRETA_ID, name, id), { ...data, updatedAt: serverTimestamp() })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  const remove = useCallback(async (id) => {
    await deleteDoc(doc(db, 'libretas', LIBRETA_ID, name, id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  return { items, loading, error, add, update, remove }
}
