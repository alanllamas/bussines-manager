# Optimization Proposals — Business Manager

> Revisión técnica: 2026-02-25
> Rama base analizada: `develop`
> Formato: Architecture Decision Record (ADR)

Los ADRs están ordenados por orden de ejecución recomendado. Dentro de cada nivel de prioridad se respetan las dependencias: un ADR no debe iniciarse hasta que los anteriores del mismo nivel estén completos, ya que sus artefactos (tipos, hooks, componentes) son insumos de los siguientes.

Cada ADR vive en su propio archivo en `docs/adr/`.

---

## Resumen de prioridades y orden de ejecución

| Orden | ADR | Tema | Prioridad | Estado | Depende de |
|---|---|---|---|---|---|
| 1 | [ADR-001](adr/ADR-001-server-side-token.md) | Tokens en variables privadas | Crítica | ✅ Completado | — |
| 2 | [ADR-002](adr/ADR-002-auth-guard.md) | Hook `useAuthGuard` | Crítica | ✅ Completado | ADR-003 |
| 3 | [ADR-003](adr/ADR-003-typescript-types.md) | Tipos TypeScript globales | Alta | ✅ Completado | — |
| 4 | [ADR-004](adr/ADR-004-error-boundary.md) | Error Boundary y manejo de errores | Alta | Pendiente | ADR-003 |
| 5 | [ADR-005](adr/ADR-005-service-layer.md) | Capa de servicios para cálculos | Alta | ✅ Completado | ADR-003 |
| 6 | [ADR-006](adr/ADR-006-paginated-data.md) | Hook `usePaginatedData` | Alta | ✅ Completado | ADR-003 |
| 7 | [ADR-007](adr/ADR-007-ui-components.md) | Componentes UI reutilizables | Alta | ✅ Completado | ADR-003, ADR-006 |
| 8 | [ADR-008](adr/ADR-008-invoice-list-refactor.md) | Refactorizar `InvoiceList` | Alta | Pendiente | ADR-003, ADR-005, ADR-006, ADR-007 |
| 9 | [ADR-009](adr/ADR-009-firebase-config.md) | Validación de configuración Firebase | Media | Pendiente | — |
| 10 | [ADR-010](adr/ADR-010-logging.md) | Logging centralizado | Media | Pendiente | — |
| 11 | [ADR-011](adr/ADR-011-memoization.md) | Memoización en listas | Media | Pendiente | ADR-008 |
| 12 | [ADR-012](adr/ADR-012-dead-code.md) | Limpieza de código muerto | Baja | Pendiente | ADR-008 |
| 13 | [ADR-013](adr/ADR-013-invoice-edit-tickets.md) | Notas en formulario de cortes | Baja | Pendiente | — |
| 14 | [ADR-014](adr/ADR-014-backend-business-logic.md) | Mover lógica de negocio al backend | Alta (arquitectural) | Pendiente aprobación | ADR-005 |
