# ADR-001 — Mover token de autenticación a variables de entorno privadas

**Estado:** Completado
**Prioridad:** Crítica
**Depende de:** —

## Contexto

El token de la API se expone con el prefijo `NEXT_PUBLIC_`, lo que lo hace visible en el bundle del cliente. Cualquier usuario puede extraerlo desde las herramientas de desarrollo del navegador.

```typescript
// src/api/hooks/clients/getClients.ts
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`
```

## Decisión propuesta

Mover las llamadas autenticadas a API Routes de Next.js (`src/app/api/`) que actúen como proxy. El token se guarda en variable de entorno sin prefijo `NEXT_PUBLIC_` y solo existe en el servidor.

## Consecuencias

- El token nunca llega al cliente
- Requiere crear rutas intermedias en `/api/`
- Agrega una capa de latencia mínima (servidor Next.js → API externa)

## Pasos de implementación

1. En el archivo `.env.local`, renombrar `NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN` → `BUSINESS_MANAGER_TOKEN` (sin prefijo).
2. Crear las API Routes proxy en `src/app/api/`:
   - `src/app/api/clients/route.ts`
   - `src/app/api/invoices/route.ts`
   - `src/app/api/tickets/route.ts`

   Cada route leerá `process.env.BUSINESS_MANAGER_TOKEN` (server-side) y hará el fetch a la API externa, retornando el resultado.
3. Actualizar cada hook SWR en `src/api/hooks/` para que apunte a las rutas internas (`/api/clients`, `/api/invoices`, etc.) en lugar de a la URL externa.
4. Eliminar todas las referencias a `process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN` del código cliente.
5. Agregar la nueva variable al archivo `.env.example` (sin valor) para documentarla.
6. Verificar en el bundle de producción (`next build`) que el token no aparezca en los archivos generados en `.next/static/`.
