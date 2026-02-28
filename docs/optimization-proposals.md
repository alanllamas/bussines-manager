# Optimization Proposals — Business Manager

> Revisión técnica: 2026-02-25
> Rama base analizada: `develop`
> Formato: Architecture Decision Record (ADR)

Los ADRs están ordenados por orden de ejecución recomendado. Dentro de cada nivel de prioridad se respetan las dependencias: un ADR no debe iniciarse hasta que los anteriores del mismo nivel estén completos, ya que sus artefactos (tipos, hooks, componentes) son insumos de los siguientes.

Cada ADR vive en su propio archivo en `docs/adr/`.

---

## Decisiones Arquitecturales

| Orden | ADR | Tema | Prioridad | Estado | Depende de |
|---|---|---|---|---|---|
| 1 | [ADR-001](adr/ADR-001-server-side-token.md) | Tokens en variables privadas | Crítica | ✅ Completado | — |
| 2 | [ADR-002](adr/ADR-002-auth-guard.md) | Hook `useAuthGuard` | Crítica | ✅ Completado | ADR-003 |
| 3 | [ADR-003](adr/ADR-003-typescript-types.md) | Tipos TypeScript globales | Alta | ✅ Completado | — |
| 4 | [ADR-004](adr/ADR-004-error-boundary.md) | Error Boundary y manejo de errores | Alta | ✅ Completado | ADR-003 |
| 5 | [ADR-005](adr/ADR-005-service-layer.md) | Capa de servicios para cálculos | Alta | ✅ Completado | ADR-003 |
| 6 | [ADR-006](adr/ADR-006-paginated-data.md) | Hook `usePaginatedData` | Alta | ✅ Completado | ADR-003 |
| 7 | [ADR-007](adr/ADR-007-ui-components.md) | Componentes UI reutilizables | Alta | ✅ Completado | ADR-003, ADR-006 |
| 8 | [ADR-008](adr/ADR-008-invoice-list-refactor.md) | Refactorizar `InvoiceList` | Alta | ❌ Cancelado | ADR-003, ADR-005, ADR-006, ADR-007 |
| 9 | [ADR-009](adr/ADR-009-firebase-config.md) | Validación de configuración Firebase | Media | ✅ Completado | — |
| 10 | [ADR-010](adr/ADR-010-logging.md) | Logging centralizado | Media | ✅ Completado | — |
| 11 | [ADR-019](adr/ADR-019-documentation-strategy.md) | Estrategia de documentación del proyecto | Media | ✅ Completado | — |
| 12 | [ADR-020](adr/ADR-020-plan-activation-workflow.md) | Workflow de activación de planes | Alta | ✅ Completado | — |
| 13 | [ADR-021](adr/ADR-021-index-sync.md) | Sincronización obligatoria de índices | Alta | ✅ Completado | ADR-019, ADR-020 |

---

## Planes técnicos

Decisiones arquitecturales de gran escala que requieren aprobación. Viven en `.claude/plans/`.

| Plan | Archivo | Estado | Depende de |
|---|---|---|---|
| Auditoría y completado del sistema de diseño | [design-system-audit.md](../.claude/plans/design-system-audit.md) | ✅ Completado | — |
| Paginador fijo en mobile | [mobile-sticky-paginator.md](../.claude/plans/mobile-sticky-paginator.md) | ✅ Completado | — |
| Productos e Insumos — Cards + Modal | [peppy-questing-crab.md](../.claude/plans/peppy-questing-crab.md) | 🟡 Aprobado | — |
| Migrar backend de Strapi a Supabase | [supabase-migration.md](../.claude/plans/supabase-migration.md) | ⏳ Pendiente aprobación | — |
| Mover lógica de negocio al backend | [backend-business-logic.md](../.claude/plans/backend-business-logic.md) | 🔒 Bloqueado | supabase-migration.md |

---

## Módulos de negocio

Especificaciones de features completas. Viven en `docs/modules/`.

| Módulo | Archivo | Prioridad | Estado | Depende de |
|---|---|---|---|---|
| Cotizaciones | [modules/cotizaciones.md](modules/cotizaciones.md) | Alta | ⏳ Pendiente activación | ADR-003 |
| Cobranza (Cuentas por Cobrar) | [modules/cobranza.md](modules/cobranza.md) | Alta | ⏳ Pendiente activación | ADR-003 |
| Por Pagar — Alcance 1: pago único | [modules/por-pagar.md](modules/por-pagar.md) | Alta | ⏳ Pendiente activación | ADR-003 |
| Por Pagar — Alcance 2: pagos parciales | [modules/por-pagar-parcial.md](modules/por-pagar-parcial.md) | Media | ⏳ Pendiente activación | por-pagar.md |

---

## Backlog técnico

Tareas de mantenimiento sin decisión arquitectural. Ver [`docs/backlog.md`](backlog.md).

| Tarea | Prioridad | Depende de |
|---|---|---|
| Memoización en listas | Media | ADR-008 |
| Limpieza de código muerto | Baja | ADR-008 |
