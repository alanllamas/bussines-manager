# ADR-004 — Agregar Error Boundary y manejo de errores centralizado

**Estado:** Pendiente
**Prioridad:** Alta
**Depende de:** ADR-003 (los tipos de error deben estar definidos antes de tipar el contexto de auth con `authError`)

## Contexto

No hay manejo de errores en:
- `onAuthStateChanged` en `AuthUserContext.tsx` — si Firebase falla, la app queda en estado desconocido
- El fetcher (`src/api/fetcher/index.ts`) no tiene try-catch global
- Los hooks de datos no validan que `url` o `token` existan antes de hacer fetch
- Los errores al usuario se muestran como texto estático sin información útil

## Decisión propuesta

1. Crear `src/components/ErrorBoundary.tsx` (class component de React)
2. Agregar archivo `src/app/error.tsx` para errores a nivel de ruta (Next.js App Router)
3. Envolver `onAuthStateChanged` con try-catch
4. Validar en el fetcher que los parámetros requeridos no estén vacíos

## Consecuencias

- Errores en un módulo no derrumban toda la app
- El usuario ve mensajes útiles en lugar de pantalla en blanco
- Facilita el diagnóstico en producción

## Pasos de implementación

1. Crear `src/components/ErrorBoundary.tsx` como class component con `componentDidCatch` y `getDerivedStateFromError`. El fallback debe mostrar un mensaje amigable con botón para recargar.
2. Crear `src/app/error.tsx` con la firma de Next.js App Router (`'use client'`, props `error` y `reset`). Este archivo actúa como Error Boundary automático para toda la aplicación.
3. Crear `src/app/loading.tsx` si no existe, para mostrar un indicador de carga durante la navegación.
4. En `AuthUserContext.tsx`:
   - Envolver el callback de `onAuthStateChanged` con try-catch.
   - En el catch, guardar el error en un estado `authError` y exponerlo en el contexto.
5. En `src/api/fetcher/index.ts`:
   - Agregar validación al inicio: si `input` está vacío, lanzar un error descriptivo.
   - Verificar que `response.ok` sea `true` antes de parsear; si no, lanzar un `Error` con el status HTTP.
6. En los hooks SWR (`getClients.ts`, `getInvoice.ts`, etc.):
   - Agregar una guarda al inicio: si `url` o `token` están vacíos, retornar `null` (SWR ignora keys `null` y no hace fetch).
7. Reemplazar las pantallas de error estáticas en `page-client.tsx` de cada módulo con los estados de error de SWR o con el componente `ErrorBoundary`.
