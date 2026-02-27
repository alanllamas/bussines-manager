# ADR-014 — Mover lógica de negocio al backend (Strapi)

**Estado:** Bloqueado por ADR-015
**Prioridad:** Alta (arquitectural)
**Depende de:** ADR-005 (la capa de servicios es el paso intermedio que facilita esta migración)

## Contexto

Actualmente la lógica fiscal y de negocio corre en el cliente (navegador):

- `generateResume()` en `src/api/services/invoiceService.ts` — agrupa productos de múltiples tickets, aplica impuestos, calcula envíos con IVA según configuración del cliente, y produce el resumen de un corte
- Los totales (`sub_total`, `taxes`, `total`, `shipping`) se calculan en el frontend antes de enviarse a Strapi

Este enfoque tiene varios problemas:
- Los cálculos fiscales pueden diferir si el cliente tiene JavaScript deshabilitado o si se accede a la API directamente
- Cualquier cambio en las reglas fiscales (tasa de IVA, envíos facturables) requiere un deploy de frontend
- Los totales almacenados en Strapi dependen de que el frontend los calcule correctamente antes de guardar
- No es posible recalcular o auditar un corte desde el backend sin replicar la lógica

## Decisión propuesta

Mover la lógica de cálculo a Strapi como endpoints personalizados (`/api/invoices/resume`, `/api/invoices/calculate-totals`) o como lifecycle hooks que calculen automáticamente al crear/editar un corte.

```
Frontend                         Strapi (backend)
──────────────────               ──────────────────────────────
Seleccionar tickets    ──POST──► /api/invoices/preview-resume
                       ◄──────── { resume, totals }

Guardar corte          ──POST──► /api/invoices
                                 ↓ lifecycle hook
                                 calcular totales internamente
                       ◄──────── corte guardado con totales correctos
```

## Alcance

Los siguientes cálculos deben migrar al backend:

| Lógica | Ubicación actual | Destino propuesto |
|---|---|---|
| Agrupación de productos por ticket | `invoiceService.ts` → `generateResume` | Strapi custom route o lifecycle |
| Aplicación de impuestos por producto | `invoiceService.ts` | Strapi lifecycle `beforeCreate`/`beforeUpdate` |
| Cálculo de envíos con IVA según cliente | `invoiceService.ts` | Strapi lifecycle (lee `taxing_info.shipping_invoice`) |
| Cálculo de `sub_total`, `taxes`, `total` del ticket | `ticketList.tsx` (frontend) | Strapi lifecycle en `api::ticket.ticket` |

## Impacto en el frontend

Una vez migrado al backend:

1. `invoiceService.ts` se simplifica o elimina — ya no calcula, solo recibe el resultado del backend
2. `InvoicesForm.tsx` — los `DatePicker` onChange que llaman a `generateResume` + `setTimeout` se reemplazan por una llamada al endpoint de preview
3. Los `setFieldValue` de `shipping`, `total`, `sub_total`, `taxes`, `resume` pasan a ser de solo lectura, populados desde la respuesta del backend
4. `ticketList.tsx` — el cálculo de `total` al cambiar cantidad se mueve al backend

## Consecuencias

- Las reglas fiscales viven en un solo lugar (backend)
- Un cambio de tasa de IVA se aplica desplegando solo el backend
- Los datos en Strapi siempre son consistentes, independientemente del cliente
- El frontend se vuelve una capa de presentación pura
- **Requiere trabajo en Strapi**: implementar rutas custom y/o lifecycle hooks

## Pasos de implementación

1. **En Strapi** — crear endpoint `GET/POST /api/invoices/preview-resume` que reciba `{ ticketIds, clientId }` y retorne `{ resume, totals }`.
2. **En Strapi** — agregar lifecycle hook `beforeCreate` / `beforeUpdate` en `api::invoice.invoice` que calcule y sobreescriba `sub_total`, `taxes`, `total`, `shipping` antes de persistir.
3. **En Next.js** — agregar proxy route `src/app/api/invoices/preview/route.ts` que reenvíe al endpoint de Strapi con el token server-side.
4. **En el frontend** — reemplazar las llamadas a `generateResume` en `InvoicesForm.tsx` por un fetch al nuevo proxy, usando un estado de carga mientras espera la respuesta.
5. **En el frontend** — eliminar `invoiceService.ts` o reducirlo a tipos/utilidades de presentación una vez que el backend sea la fuente de verdad.
6. Verificar que los cortes existentes sigan mostrando los datos correctos (los `resume` guardados como JSON en Strapi se usan para display histórico — no se recalculan).
