# ADR-005 — Mover `generateResume` a una capa de servicios

**Estado:** Completado
**Prioridad:** Alta
**Depende de:** ADR-003 (los tipos `Ticket`, `Client`, `Resume`, `Totals` deben estar definidos)

## Contexto

`generateResume()` en `src/api/hooks/invoices/getInvoice.ts` contenía ~80 líneas de lógica fiscal (cálculo de impuestos, agrupación de productos, totales). Esta lógica vivía dentro de un hook de React, mezclando cómputo puro con gestión de estado, lo que la hacía imposible de testear sin montar componentes.

## Decisión propuesta

Crear `src/api/services/invoiceService.ts` con funciones puras:

```typescript
export function generateResume(ticketIds: string[], tickets: Ticket[], client?: Client): { totals: Totals; results: Resume }
```

## Consecuencias

- Las funciones de cálculo se pueden testear unitariamente
- El hook queda como orquestador, no como contenedor de lógica
- Facilita reutilizar los cálculos desde múltiples puntos
- Paso intermedio necesario antes de ADR-014 (migración al backend)

## Implementación

- `src/api/services/invoiceService.ts` — función `generateResume` + tipos `Resume`, `Totals`, `ResumeData`
- `src/api/services/index.ts` — re-exporta la API pública del servicio
- `src/api/hooks/invoices/getInvoice.ts` — re-exporta desde el servicio para mantener compatibilidad con los 6 callers existentes
