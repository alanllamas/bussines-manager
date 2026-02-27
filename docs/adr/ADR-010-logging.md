# ADR-010 — Limpiar `console.log` y crear una utilidad de logging

**Estado:** Pendiente
**Prioridad:** Media
**Depende de:** — (independiente, pero es más limpio hacerlo después de los refactors grandes)

## Contexto

Múltiples `console.log` quedaron en código de producción:
- `src/app/clients/[id]/page.tsx`
- `src/components/forms/ticketsForm.tsx`
- `src/api/hooks/invoices/getInvoice.ts`

## Decisión propuesta

Agregar regla de ESLint `no-console` en nivel `warn` y crear una utilidad:

```typescript
// src/utils/logger.ts
const logger = {
  info: (...args: unknown[]) => process.env.NODE_ENV !== 'production' && console.log(...args),
  error: (...args: unknown[]) => console.error(...args),
};
export default logger;
```

## Consecuencias

- Logs no llegan a consola en producción
- Errores reales siguen siendo visibles
- Regla de ESLint detecta logs nuevos antes del commit

## Pasos de implementación

1. Crear `src/utils/logger.ts` con la implementación mostrada.
2. En `eslint.config.mjs`, agregar la regla `'no-console': 'warn'`.
3. Buscar todas las ocurrencias de `console.log` en el proyecto y reemplazarlas por `logger.info(...)`.
4. Las ocurrencias de `console.error` para errores reales reemplazarlas por `logger.error(...)`.
5. Eliminar las líneas comentadas `// console.log(...)` en todos los archivos.
6. Ejecutar `next build` y confirmar que no aparecen logs en la salida de producción.
