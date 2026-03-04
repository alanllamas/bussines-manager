# ADR-021 — Sincronización obligatoria de índices y archivos de seguimiento

**Estado:** Activo
**Prioridad:** Alta
**Depende de:** ADR-019 (estrategia de documentación), ADR-020 (activación de planes)

---

## Contexto

Los archivos de índice y seguimiento del proyecto acumulan desfase respecto a la realidad: planes completados que siguen marcados como "pendiente", planes nuevos que no aparecen en el índice, y estados en MEMORY.md que no reflejan el trabajo hecho. Esto genera confusión al retomar sesiones y hace que los índices sean inútiles como fuente de verdad.

---

## Decisión

**Toda operación que cambie el estado del proyecto debe actualizar los archivos de seguimiento en el mismo commit.**

No existe un "lo actualizo después" — el commit que hace el cambio también actualiza los índices.

---

## Archivos de seguimiento afectados

| Archivo | Qué registra | Cuándo actualizar |
|---|---|---|
| `docs/optimization-proposals.md` | Estado de ADRs, planes técnicos y módulos de negocio | Al crear, aprobar, completar o cancelar cualquier plan o ADR |
| `memory/MEMORY.md` | Estado del sistema para contexto de sesión | Al completar trabajo significativo o cambiar estado de un plan |
| `docs/adr/ADR-NNN.md` (propio) | Estado del ADR | Al completar la implementación del ADR |
| `docs/modules/*.md` (propio) | Estado del módulo | Al activar o completar el módulo |
| `.claude/plans/*.md` (propio) | Estado del plan | Al aprobar, iniciar o completar el plan |

---

## Triggers obligatorios

### Al crear un ADR nuevo
- Añadir fila en `docs/optimization-proposals.md` → sección Decisiones Arquitecturales
- Estado inicial: `⏳ Pendiente`

### Al completar un ADR
- Actualizar su propio `**Estado:**` → `Completado`
- Actualizar fila en `docs/optimization-proposals.md` → `✅ Completado`
- Actualizar `MEMORY.md` si afecta la arquitectura activa

### Al crear un plan técnico (`.claude/plans/`)
- Añadir fila en `docs/optimization-proposals.md` → sección Planes técnicos
- Estado inicial: `⏳ Pendiente aprobación`

### Al aprobar un plan (Estado → Aprobado)
- Actualizar fila en `docs/optimization-proposals.md` → `🟡 Aprobado`
- Actualizar `MEMORY.md` → entrada en lista de planes con estado

### Al completar un plan
- Actualizar su propio `**Estado:**` → `Completado`
- Actualizar fila en `docs/optimization-proposals.md` → `✅ Completado`
- Actualizar `MEMORY.md`

### Al activar un módulo de negocio (`docs/modules/`)
- Actualizar su propio `**Estado:**` → `Aprobado`
- Actualizar fila en `docs/optimization-proposals.md` → `🟡 Aprobado`

### Al completar un módulo
- Actualizar su propio `**Estado:**` → `Completado`
- Actualizar fila en `docs/optimization-proposals.md` → `✅ Completado`

---

## Consecuencias

- `docs/optimization-proposals.md` es siempre fuente de verdad — no hay que leer cada archivo individual para conocer el estado del proyecto
- `MEMORY.md` refleja el estado real al inicio de cada sesión
- El desfase entre realidad y documentación es detectado inmediatamente (en el mismo commit)
- Revisiones de estado ("¿qué tenemos pendiente?") son instantáneas y confiables
