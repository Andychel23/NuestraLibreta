import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage, LIBRETA_ID } from '../firebase'

// Redimensiona/comprime una imagen en el navegador antes de subirla, para que
// las fotos pesen poco y las cargas sean rápidas en datos móviles.
export function compressImage(file, maxDim = 1280, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        let w = img.width, h = img.height
        const ratio = w / h
        if (w > h && w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim }
        else if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve({ dataUrl: canvas.toDataURL('image/jpeg', quality), ratio })
      }
      img.onerror = reject
      img.src = ev.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Sube una foto comprimida a Firebase Storage bajo libretas/{LIBRETA_ID}/{folder}/
// y devuelve { url, path, ratio } listo para guardar en Firestore.
export async function uploadPhoto(file, folder, { maxDim, quality } = {}) {
  const { dataUrl, ratio } = await compressImage(file, maxDim, quality)
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const path = `libretas/${LIBRETA_ID}/${folder}/${filename}`
  const storageRef = ref(storage, path)
  await uploadString(storageRef, dataUrl, 'data_url')
  const url = await getDownloadURL(storageRef)
  return { url, path, ratio }
}

export async function deletePhoto(path) {
  if (!path) return
  try { await deleteObject(ref(storage, path)) } catch { /* ya no existe, ignorar */ }
}
