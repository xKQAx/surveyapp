# Comandos habituales — SurveyApp

## Paso a paso: cómo encaja todo (mapa mental)

1. **Supabase** almacena tablas (`surveys`, `questions`, `options`, `responses`).
2. **Tu backend** (Express en local o la función serverless en **Vercel**) usa `@supabase/supabase-js` con las variables `SUPABASE_URL` y una clave (`SUPABASE_ANON_KEY` o `SUPABASE_SERVICE_ROLE_KEY`).
3. **El frontend** (React) **no** habla con Supabase directamente: llama a tu API (`/api/...`). El proxy de Vite en desarrollo reenvía `/api` a `http://localhost:3001`.

Por tanto: **ver y editar datos “como hoja de cálculo”** se hace en el **panel de Supabase** (Table Editor). **Manipular desde la app** hoy significa: los usuarios **rellenan encuestas** y el backend **inserta filas** en `responses` (y necesitas filas previas en `surveys` / `questions` / `options`). **Crear encuestas nuevas desde la UI de administración** aún no está implementado contra Supabase (solo hay un POST de demostración en memoria); puedes crearlas en el SQL Editor o ampliando la API después.

---

## Dónde “ver” la base de datos

| Sitio | Para qué sirve |
|--------|----------------|
| **Supabase Dashboard** → **Table Editor** | Ver filas, filtrar, editar a mano (como una tabla). |
| **Supabase** → **SQL Editor** | Ejecutar `schema.sql`, consultas, seeds. |
| **Tu API** `GET /api/surveys` | Lo que el frontend muestra como listado de encuestas (viene de la BD si está conectada). |
| **Tu API** `GET /api/health` | Comprueba si las credenciales llegan y si puede leer `surveys` / `responses`. |

Desde **Cursor** no hace falta un plugin obligatorio: abre el proyecto en el navegador (Supabase) y usa Table Editor. Si quieres, instala la extensión **“Supabase”** en VS Code/Cursor para atajos; no sustituye al dashboard.

---

## Conectar el proyecto local a Supabase (checklist)

1. En Supabase: **Settings → API** → copia **Project URL** y **anon public** (o **service_role** solo para backend).
2. En tu PC, crea o edita **`.env` en la raíz del proyecto `surveyapp/`** o **`surveyapp/server/.env`** (el código carga primero la raíz y luego `server/.env`; esta última gana si hay claves repetidas):

   - `SUPABASE_URL=https://xxxx.supabase.co`
   - `SUPABASE_ANON_KEY=eyJ...`

   Opcional pero recomendable si RLS da errores al insertar: **`SUPABASE_SERVICE_ROLE_KEY`** (solo en servidor / Vercel, nunca en `VITE_*`).

3. Aplica el esquema en Supabase: **SQL Editor** → pega el contenido de **`supabase/schema.sql`** → **Run**.
4. (Opcional) Datos de prueba: ejecuta **`supabase/seed_example.sql`**.
5. Reinicia el backend: `npm run dev`.
6. Prueba: `curl http://localhost:3001/api/health` → deberías ver `"database": { "configured": true, "connected": true, ... }`. Si `connected` es `false`, lee `database.error` en la misma respuesta.
7. Arranca el front en otra terminal: `npm run dev:client` y abre `http://localhost:5173`.

---

## Vercel + Supabase

1. **Project Settings → Environment Variables**: mismas claves que en `.env` (al menos `SUPABASE_URL` y una clave).
2. Redeploy después de cambiar variables.
3. El frontend desplegado llama a `/api` en el **mismo dominio**; no necesitas `VITE_API_URL` salvo que el API esté en otro origen.

---

## Instalación

```bash
# Raíz del proyecto (Express + dependencias compartidas)
npm install

# Cliente React (Vite)
cd client && npm install && cd ..
```

## Desarrollo

| Objetivo | Comando | Notas |
|----------|---------|--------|
| Backend (API) | `npm run dev` | Puerto `3001` por defecto. Variables: raíz `.env` y/o `server/.env`. |
| Solo frontend | `npm run dev:client` | Puerto `5173`. `/api` → proxy a `localhost:3001`. |
| Ambos | Dos terminales: `npm run dev` y `npm run dev:client` | UI en `http://localhost:5173`. |

## Build y vista “tipo producción” del frontend

```bash
npm run build
npm run preview:client
```

## Producción local (Express sirviendo el build)

```powershell
$env:NODE_ENV="production"
npm run build
node server/index.js
```

## Archivos SQL en este repo

| Archivo | Uso |
|---------|-----|
| `supabase/schema.sql` | Tablas, columnas extra, índices y políticas RLS mínimas. Ejecutar primero. |
| `supabase/seed_five_surveys.sql` | **Recomendado:** las 5 encuestas alineadas con la app (borra datos previos en esas tablas). Ejecutar después de `schema.sql` para que envíos y estadísticas funcionen con Supabase. |
| `supabase/seed_example.sql` | Una sola encuesta de demostración (alternativa antigua). |

## Comprobar la API

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/surveys
```

## Emular Vercel en local (opcional)

```bash
npx vercel dev
```

---

## Qué hace falta para “manipular la BD desde la aplicación”

- **Ya implementado:** enviar respuestas de encuesta (`POST /api/surveys/:id/responses`) → inserta en `responses` en Supabase cuando está configurado.
- **Para listar/editar encuestas como administrador desde la app:** haría falta nuevas rutas (por ejemplo `POST /api/surveys` persistiendo en `surveys`/`questions`/`options`) y pantallas de admin; no está en el alcance actual del código.

Si algo falla al guardar, revisa en `GET /api/health` el campo `database.error`, políticas **RLS** en Supabase y que existan **opciones** para preguntas que no son de texto libre.
