# Nuestra Libreta v2.0 — Andy & Marjorie

Libreta digital de viajes: **Calendario, Viajes, Lugares y Finanzas**, con datos
en Firebase (Firestore + Storage) para que ambos vean lo mismo en tiempo real
desde sus celulares, y se pueda instalar como una app (PWA) en el iPhone.

Hecho con **React + Vite**, sin backend propio: todo vive en Firebase y se
despliega gratis en GitHub Pages.

---

## 1. Qué contiene el proyecto

```
nuestra-libreta/
├─ src/
│  ├─ firebase.js            # conexión a Firebase (lee variables de entorno)
│  ├─ App.jsx, main.jsx      # enrutador y montaje de la app
│  ├─ state/AppState.jsx     # estado global: colecciones + usuario + toasts
│  ├─ lib/                   # helpers: fechas, dinero, fotos, Firestore, constantes
│  ├─ components/            # Sheet (modal), BottomNav, Fab, Lightbox, mapa, etc.
│  ├─ pages/                 # Calendario, Viajes, ViajeDetalle, Lugares, Finanzas
│  └─ forms/                 # formularios de Viaje, Lugar, Evento, Gasto
├─ firestore.rules           # reglas de acceso a la base de datos
├─ storage.rules             # reglas de acceso a las fotos
├─ firebase.json / .firebaserc
├─ .env.example               # variables de Firebase (copiar a .env)
└─ .github/workflows/deploy.yml   # despliegue automático a GitHub Pages
```

**Decisiones de diseño que ya se tomaron** (para que no haya sorpresas):
- **Sin login.** Se mantiene el selector simple "Andy / Marjorie" (⚙️ arriba a
  la derecha), igual que en la v1. Cualquiera con el link de la app puede
  editar los datos — ver la nota de seguridad en `firestore.rules`.
- **Mapa con Leaflet + OpenStreetMap** (gratis, sin API key).
- El calendario es la **pantalla de inicio**. La navegación inferior tiene
  solo 4 secciones (Calendario, Viajes, Lugares, Finanzas) + el botón "+".

---

## 2. Configurar Firebase (una sola vez)

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) → **Crear proyecto** (puede ser el mismo que ya usaron para la v1, o uno nuevo).
2. **Firestore Database** → Crear base de datos → modo producción → elige una región cercana (ej. `southamerica-east1`).
3. **Storage** → Comenzar → modo producción → misma región.
4. **Configuración del proyecto** (⚙️ arriba a la izquierda) → pestaña **General** → sección "Tus apps" → ícono `</>` (Web) → regístrala con un nombre (ej. "Nuestra Libreta Web"). Firebase te muestra un objeto `firebaseConfig` — esos son los valores que necesitas.
5. En la carpeta del proyecto, copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   y pega ahí los valores de `firebaseConfig` (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).

### Subir las reglas de seguridad

Con [Firebase CLI](https://firebase.google.com/docs/cli) instalado (`npm install -g firebase-tools`):

```bash
firebase login
# edita .firebaserc y pon tu Project ID real en vez de "TU-PROJECT-ID-AQUI"
firebase deploy --only firestore:rules,storage:rules
```

Esto sube `firestore.rules` y `storage.rules` — sin esto, Firestore y Storage
rechazan todas las lecturas/escrituras por defecto.

---

## 3. Correr el proyecto en tu computadora

```bash
npm install
npm run dev
```

Abre la URL que te muestra (normalmente `http://localhost:5173`). Con el
`.env` ya configurado, los datos que agregues se guardan en Firebase de
verdad — no hace falta nada más para probarlo desde dos celulares distintos
en la misma red o cada uno por su lado (Firestore sincroniza en tiempo real).

Para cargar un viaje de ejemplo (Chachapoyas, con lugares, itinerario y
gastos) y ver la app funcionando con contenido: abre ⚙️ **Ajustes** dentro de
la app → **✨ Cargar datos de ejemplo**.

---

## 4. Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "Nuestra Libreta v2.0"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git push -u origin main
```

`.env` **no se sube** (ya está en `.gitignore`) — las llaves de Firebase van
como *secrets* de GitHub, no en el código.

---

## 5. Desplegar en GitHub Pages (automático)

1. En el repo de GitHub → **Settings → Pages** → en "Build and deployment",
   Source: **GitHub Actions**.
2. **Settings → Secrets and variables → Actions → New repository secret** y
   crea uno por cada variable de `.env`:
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
   `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`,
   `VITE_FIREBASE_APP_ID`, `VITE_LIBRETA_ID`.
3. Abre `vite.config.js` y cambia `REPO_BASE` por `'/<nombre-de-tu-repo>/'`
   (si el repo se llama `nuestra-libreta`, sería `'/nuestra-libreta/'`. Si el
   repo se llama exactamente `<tu-usuario>.github.io`, deja `REPO_BASE = '/'`).
4. Haz `git push` a `main` — el workflow en `.github/workflows/deploy.yml` se
   encarga de compilar (`npm run build`) y publicar en Pages automáticamente.
   Puedes ver el progreso en la pestaña **Actions** del repo.
5. En un par de minutos, la app queda en
   `https://<tu-usuario>.github.io/<tu-repo>/`.

### Alternativa: Firebase Hosting

Si prefieren que todo viva en Firebase (incluyendo el hosting) en vez de
GitHub Pages:
```bash
npm run build
firebase deploy --only hosting
```
(usa la config de `firebase.json`, que ya apunta a la carpeta `dist`). En ese
caso, en `vite.config.js` deja `base: '/'`.

---

## 6. Instalar como app en el iPhone

1. Abre la URL desplegada en **Safari** (tiene que ser Safari, no Chrome, para
   que aparezca la opción).
2. Toca el botón de **Compartir** (el cuadrito con la flecha hacia arriba).
3. **Agregar a pantalla de inicio**.

Queda con su propio ícono, pantalla completa (sin la barra de Safari), y
funciona como cualquier otra app instalada — eso es lo que hace el `manifest`
+ `apple-touch-icon` que ya están configurados en `index.html`.

---

## 7. Modelo de datos en Firestore

Todo vive bajo `libretas/{VITE_LIBRETA_ID}/`:

- **`trips`** — `{ name, destination, dateFrom, dateTo, budget, people, notes, coverPhoto, itinerario[] }`
- **`places`** — `{ name, country, city, category, description, status, visitDate, plannedDate, rating, notes, tripId, lat, lng, photos[] }`
- **`events`** — `{ title, type, date, time, recurring, tripId, placeId, notes }`
- **`expenses`** — `{ description, amount, currency, category, date, paidBy, forWhom, tripId, placeId, note, receipt, type }`

Las fotos se comprimen en el navegador antes de subirse y quedan en Storage
bajo `libretas/{VITE_LIBRETA_ID}/{trips|places|receipts}/...`; en Firestore
solo se guarda la URL, la ruta (`path`, para poder borrarlas) y el `ratio`.

---

## 8. Si algo no carga

- **Pantalla en blanco / "Faltan variables de entorno" en la consola del
  navegador** → revisa que `.env` (local) o los *secrets* (GitHub Actions)
  tengan los 6 valores de Firebase completos.
- **"Missing or insufficient permissions"** → todavía no desplegaste
  `firestore.rules` / `storage.rules` (paso 2).
- **Las fotos no suben** → confirma que activaste **Storage** en la consola
  de Firebase (paso 2.3) y que desplegaste `storage.rules`.
- **El mapa sale gris/vacío** → revisa la consola: Leaflet necesita conexión
  a internet para cargar las teselas de OpenStreetMap la primera vez (luego
  quedan cacheadas para uso offline gracias al Service Worker).
